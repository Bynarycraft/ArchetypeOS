import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role?.toLowerCase();
    const feedback = await prisma.feedback.findMany({
      where: role === "admin" ? {} : { receiverId: session.user.id },
      include: {
        receiver: {
          select: { id: true, name: true, email: true },
        },
        sender: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Get feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role?.toLowerCase();
    if (role !== "supervisor" && role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { receiverId, text, rating, courseId, type } = await request.json();
    if (!receiverId || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        senderId: session.user.id,
        receiverId,
        text,
        courseId: courseId || null,
        rating: Number.isFinite(Number(rating)) ? Number(rating) : null,
        type: type || "comment",
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("Create feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
