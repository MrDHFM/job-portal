import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { companies, adminActivityLogs } from "@/db/schema";
import {
  eq,
  desc,
  ilike,
  sql,
} from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

// Helper to make slug
function makeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function GET(
  req: NextRequest,
) {
  try {
    const session =
      await getAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const { searchParams } =
      new URL(req.url);

    /*
     * ?all=true is used by dropdowns/forms
     * that need every company.
     */
    const getAll =
      searchParams.get("all") === "true";

    const search =
      (
        searchParams.get("search") || ""
      ).trim();

    if (getAll) {
      const allCompanies =
        await db
          .select()
          .from(companies)
          .where(
            search
              ? ilike(
                  companies.name,
                  `%${search}%`,
                )
              : undefined,
          )
          .orderBy(
            desc(companies.createdAt),
          );

      return NextResponse.json({
        success: true,
        data: allCompanies,
        pagination: {
          page: 1,
          limit: allCompanies.length,
          total: allCompanies.length,
          totalPages: 1,
        },
      });
    }

    const page = Math.max(
      1,
      Number(
        searchParams.get("page") || "1",
      ),
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number(
          searchParams.get("limit") || "25",
        ),
      ),
    );

    const offset =
      (page - 1) * limit;

    const whereCondition =
      search
        ? ilike(
            companies.name,
            `%${search}%`,
          )
        : undefined;

    const [
      allCompanies,
      countResult,
    ] = await Promise.all([
      db
        .select()
        .from(companies)
        .where(whereCondition)
        .orderBy(
          desc(companies.createdAt),
        )
        .limit(limit)
        .offset(offset),

      db
        .select({
          count:
            sql<number>`count(*)::int`,
        })
        .from(companies)
        .where(whereCondition),
    ]);

    const total =
      countResult[0]?.count || 0;

    const totalPages =
      Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: allCompanies,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error(
      "Error in GET /api/admin/companies:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, logoUrl, description, website, industry, size, foundedYear, headquarters, linkedin, otherSocials } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Company name is required." }, { status: 400 });
    }

    // Generate unique slug
    let slug = makeSlug(name);
    let originalSlug = slug;
    let count = 1;
    while (true) {
      const match = await db.select().from(companies).where(eq(companies.slug, slug)).limit(1);
      if (match.length === 0) break;
      slug = `${originalSlug}-${count++}`;
    }

    const [newCompany] = await db
      .insert(companies)
      .values({
        name: name.trim(),
        slug,
        logoUrl: logoUrl || null,
        description: description || null,
        website: website || null,
        industry: industry || null,
        size: size || null,
        foundedYear: foundedYear ? parseInt(foundedYear) : null,
        headquarters: headquarters || null,
        linkedin: linkedin || null,
        otherSocials: otherSocials || null,
        isActive: true,
      })
      .returning();

    // Log admin activity
    await db.insert(adminActivityLogs).values({
      adminName: session.name || session.email,
      action: "COMPANY_CREATE",
      entity: "companies",
      entityId: newCompany.id,
      details: `Created company: ${newCompany.name}`,
    });

    return NextResponse.json({ success: true, data: newCompany });
  } catch (error: any) {
    console.error("Error in POST /api/admin/companies:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
