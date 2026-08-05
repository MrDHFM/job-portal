import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required fields: name, email, subject, message." },
        { status: 400 }
      );
    }

    // Input sanitization and simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Insert message into database
    await db.insert(contactMessages).values({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      isRead: false,
      isResolved: false,
    });

    return NextResponse.json({
      success: true,
      message: "Thank you! Your message has been stored. Our team will contact you shortly.",
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/contact:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
