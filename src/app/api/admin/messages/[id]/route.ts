import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contactMessages, adminActivityLogs } from "@/db/schema";
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
    const { isRead, isResolved } = body;

    const updated = await db
      .update(contactMessages)
      .set({
        isRead: isRead !== undefined ? !!isRead : undefined,
        isResolved: isResolved !== undefined ? !!isResolved : undefined,
      })
      .where(eq(contactMessages.id, id))
      .returning();

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/messages/[id]:", error);
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

    await db.delete(contactMessages).where(eq(contactMessages.id, id));

    return NextResponse.json({ success: true, message: "Message deleted successfully." });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/messages/[id]:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
