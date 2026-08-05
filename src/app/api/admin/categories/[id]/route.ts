import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, jobs, adminActivityLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
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
    const { name, description, displayOrder, isVisible } = body;

    const existing = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: "Category not found." }, { status: 404 });
    }

    const updated = await db
      .update(categories)
      .set({
        name: name !== undefined ? name.trim() : undefined,
        description: description !== undefined ? description : undefined,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : undefined,
        isVisible: isVisible !== undefined ? isVisible : undefined,
      })
      .where(eq(categories.id, id))
      .returning();

    // Log admin activity
    await db.insert(adminActivityLogs).values({
      adminName: session.name || session.email,
      action: "CATEGORY_EDIT",
      entity: "categories",
      entityId: id,
      details: `Edited category: ${updated[0].name}`,
    });

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/categories/[id]:", error);
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

    // Verify safety: block if any jobs use this category
    const jobsCount = await db
      .select()
      .from(jobs)
      .where(eq(jobs.categoryId, id))
      .limit(1);

    if (jobsCount.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete category with active job listings. Please delete or reassign its jobs first.",
        },
        { status: 400 }
      );
    }

    const deleted = await db.delete(categories).where(eq(categories.id, id)).returning();

    // Log admin activity
    await db.insert(adminActivityLogs).values({
      adminName: session.name || session.email,
      action: "CATEGORY_DELETE",
      entity: "categories",
      entityId: id,
      details: `Deleted category: ${deleted[0]?.name}`,
    });

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/categories/[id]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
