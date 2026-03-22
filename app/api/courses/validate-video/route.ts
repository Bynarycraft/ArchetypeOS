import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getYouTubeWatchUrl, isYouTubeVideoAvailable } from "@/lib/content-url";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toLowerCase();

  if (!session || (role !== "admin" && role !== "supervisor")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const inputUrl = request.nextUrl.searchParams.get("url")?.trim();
  if (!inputUrl) {
    return NextResponse.json(
      { error: "Missing url query parameter." },
      { status: 400 }
    );
  }

  const watchUrl = getYouTubeWatchUrl(inputUrl);
  if (!watchUrl) {
    return NextResponse.json(
      {
        isValidFormat: false,
        isAvailable: false,
        error: "Invalid YouTube URL format.",
      },
      { status: 400 }
    );
  }

  const isAvailable = await isYouTubeVideoAvailable(inputUrl);

  return NextResponse.json({
    isValidFormat: true,
    isAvailable,
    watchUrl,
  });
}
