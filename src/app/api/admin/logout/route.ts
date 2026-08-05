import { NextRequest, NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await clearAdminSession();
  return NextResponse.json({ success: true, message: "Logged out successfully" });
}
