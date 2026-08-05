import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { companies, jobs, adminActivityLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = parseInt(params.id);
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, logoUrl, description, website, industry, size, foundedYear, headquarters, linkedin, otherSocials, isActive } = body;

    const existing = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: "Company not found." }, { status: 404 });
    }

    const updated = await db
      .update(companies)
      .set({
        name: name !== undefined ? name.trim() : undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        description: description !== undefined ? description : undefined,
        website: website !== undefined ? website : undefined,
        industry: industry !== undefined ? industry : undefined,
        size: size !== undefined ? size : undefined,
        foundedYear: foundedYear !== undefined ? (foundedYear ? parseInt(foundedYear) : null) : undefined,
        headquarters: headquarters !== undefined ? headquarters : undefined,
        linkedin: linkedin !== undefined ? linkedin : undefined,
        otherSocials: otherSocials !== undefined ? otherSocials : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      })
      .where(eq(companies.id, id))
      .returning();

    // Log admin activity
    await db.insert(adminActivityLogs).values({
      adminName: session.name || session.email,
      action: "COMPANY_EDIT",
      entity: "companies",
      entityId: id,
      details: `Edited company: ${updated[0].name}`,
    });

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/companies/[id]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = parseInt(params.id);
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Safety check: verify no jobs exist for this company
    const jobsCount = await db
      .select()
      .from(jobs)
      .where(eq(jobs.companyId, id))
      .limit(1);

    if (jobsCount.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete company with existing job listings. Please delete or reassign the jobs first.",
        },
        { status: 400 }
      );
    }

    const deleted = await db.delete(companies).where(eq(companies.id, id)).returning();

    // Log admin activity
    await db.insert(adminActivityLogs).values({
      adminName: session.name || session.email,
      action: "COMPANY_DELETE",
      entity: "companies",
      entityId: id,
      details: `Deleted company: ${deleted[0]?.name}`,
    });

    return NextResponse.json({ success: true, message: "Company deleted successfully" });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/companies/[id]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
