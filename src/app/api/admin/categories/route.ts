import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, adminActivityLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

// Helper to make slug
function makeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const allCategories = await db
      .select()
      .from(categories)
      .orderBy(categories.displayOrder, categories.name);

    return NextResponse.json({ success: true, data: allCategories });
  } catch (error: any) {
    console.error("Error in GET /api/admin/categories:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
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
