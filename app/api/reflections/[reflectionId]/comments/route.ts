import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ reflectionId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reflectionId } = await params;

  try {
    const reflection = await prisma.reflection.findUnique({
      where: { id: reflectionId },
      select: { id: true, userId: true },
    });

    if (!reflection) {
      return NextResponse.json({ error: "Reflection not found" }, { status: 404 });
    }

    const role = session.user.role?.toLowerCase();
    if (role !== "admin" && role !== "supervisor" && reflection.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get comments from ReflectionComment model
    const comments = await prisma.reflectionComment.findMany({
      where: { reflectionId },
      include: {
        sender: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Fetch reflection comments error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ reflectionId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reflectionId } = await params;

  try {
    const body = await req.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: "Missing text field" }, { status: 400 });
    }

    // Check reflection exists
    const reflection = await prisma.reflection.findUnique({
      where: { id: reflectionId },
      select: { id: true, userId: true },
    });

    if (!reflection) {
      return NextResponse.json({ error: "Reflection not found" }, { status: 404 });
    }

    // Check authorization - only supervisor/admin or reflection owner can comment
    const role = session.user.role?.toLowerCase();
    if (role !== "admin" && role !== "supervisor" && reflection.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create comment
    const comment = await prisma.reflectionComment.create({
      data: {
        reflectionId,
        senderId: session.user.id,
        text,
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Create reflection comment error:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
