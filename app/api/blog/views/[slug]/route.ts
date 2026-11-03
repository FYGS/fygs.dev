import { incrementViewCount } from "@/lib/reading-stats";
import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { isValidBlogSlug } from "@/lib/blog-slug";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const limited = await enforceRateLimit(_request, "blog-view", {
    limit: 30,
    windowSeconds: 60,
  });
  if (limited) return limited;

  const { slug } = await params;
  // The slug becomes a Redis key: a plain blog slug only, or anyone could create keys at will
  if (!isValidBlogSlug(slug)) {
    return NextResponse.json({ success: false, error: "Invalid slug" }, { status: 400 });
  }

  try {
    // Always increment the view count on every request
    const count = await incrementViewCount(slug);

    // Set cache control headers to prevent caching
    return NextResponse.json(
      { success: true, count },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return NextResponse.json(
      { success: false, error: "Failed to increment view count" },
      { status: 500 }
    );
  }
}
