import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, adminActivityLogs } from "@/db/schema";
import {
  eq,
  desc,
  asc,
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
     * Dropdowns can request every category.
     */
    const getAll =
      searchParams.get("all") === "true";

    const search =
      (
        searchParams.get("search") || ""
      ).trim();

    const whereCondition =
      search
        ? ilike(
            categories.name,
            `%${search}%`,
          )
        : undefined;

    if (getAll) {
      const allCategories =
        await db
          .select()
          .from(categories)
          .where(whereCondition)
          .orderBy(
            asc(
              categories.displayOrder,
            ),
            asc(categories.name),
          );

      return NextResponse.json({
        success: true,
        data: allCategories,
        pagination: {
          page: 1,
          limit: allCategories.length,
          total: allCategories.length,
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

    const [
      allCategories,
      countResult,
    ] = await Promise.all([
      db
        .select()
        .from(categories)
        .where(whereCondition)
        .orderBy(
          asc(
            categories.displayOrder,
          ),
          asc(categories.name),
        )
        .limit(limit)
        .offset(offset),

      db
        .select({
          count:
            sql<number>`count(*)::int`,
        })
        .from(categories)
        .where(whereCondition),
    ]);

    const total =
      countResult[0]?.count || 0;

    const totalPages =
      Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: allCategories,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error(
      "Error in GET /api/admin/categories:",
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
    const { name, description, displayOrder, isVisible } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Category name is required." }, { status: 400 });
    }

    // Generate unique slug
    let slug = makeSlug(name);
    let originalSlug = slug;
    let count = 1;
    while (true) {
      const match = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
      if (match.length === 0) break;
      slug = `${originalSlug}-${count++}`;
    }

    const [newCategory] = await db
      .insert(categories)
      .values({
        name: name.trim(),
        slug,
        description: description || null,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
        isVisible: isVisible !== undefined ? isVisible : true,
      })
      .returning();

    // Log admin activity
    await db.insert(adminActivityLogs).values({
      adminName: session.name || session.email,
      action: "CATEGORY_CREATE",
      entity: "categories",
      entityId: newCategory.id,
      details: `Created category: ${newCategory.name}`,
    });

    return NextResponse.json({ success: true, data: newCategory });
  } catch (error: any) {
    console.error("Error in POST /api/admin/categories:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
