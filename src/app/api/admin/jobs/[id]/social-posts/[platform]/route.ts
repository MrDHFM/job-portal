import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobSocialPosts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  props: {
    params: Promise<{
      id: string;
      platform: string;
    }>;
  }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id, platform } = await props.params;

    if (
      platform !== "linkedin" &&
      platform !== "x"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid platform.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    const updated = await db
      .update(jobSocialPosts)
      .set({
        status: "PUBLISHED",
        externalPostUrl:
          body.externalPostUrl || null,
        postedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(
            jobSocialPosts.jobId,
            parseInt(id)
          ),
          eq(
            jobSocialPosts.platform,
            platform
          )
        )
      )
      .returning();

    return NextResponse.json({
      success: true,
      data: updated[0],
    });
  } catch (error) {
    console.error(
      "Failed to update social post status:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update post status.",
      },
      { status: 500 }
    );
  }
}