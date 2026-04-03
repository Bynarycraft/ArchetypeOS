import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get notifications from the Notification model
    let notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Return last 50 notifications
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        priority: true,
        actionUrl: true,
        isRead: true,
        createdAt: true,
        readAt: true,
      },
    });

    // Keep candidate onboarding UX from starting with a permanently empty inbox.
    if (notifications.length === 0 && session.user.role?.toLowerCase() === "candidate") {
      const welcome = await prisma.notification.create({
        data: {
          userId: session.user.id,
          title: "Onboarding track unlocked",
          message: "Welcome aboard. Complete your onboarding course and assessment to become a learner.",
          type: "info",
          priority: "normal",
          actionUrl: "/courses",
        },
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          priority: true,
          actionUrl: true,
          isRead: true,
          createdAt: true,
          readAt: true,
        },
      });

      notifications = [welcome];
    }

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // Only admins and supervisors can create notifications for others
  if (!session || !["admin", "supervisor"].includes(session.user?.role?.toLowerCase() || "")) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  try {
    const body = (await req.json()) as {
      userId: string;
      title: string;
      message: string;
      type?: string;
      priority?: string;
      actionUrl?: string;
    };

    const { userId, title, message, type = "info", priority = "normal", actionUrl } = body;

    // Validate required fields
    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields: userId, title, message" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        priority,
        actionUrl: actionUrl || null,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      notificationId: string;
      isRead?: boolean;
    };

    const { notificationId, isRead } = body;

    if (!notificationId) {
      return NextResponse.json({ error: "Missing notificationId" }, { status: 400 });
    }

    // Check that user owns this notification
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Notification not found or unauthorized" }, { status: 404 });
    }

    // Update notification
    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: isRead !== undefined ? isRead : true,
        readAt: isRead !== false ? new Date() : null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update notification error:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
