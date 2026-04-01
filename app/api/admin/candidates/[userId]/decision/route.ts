import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendCandidateStatusEmail } from "@/lib/email";
import { sendCandidateStatusSms } from "@/lib/sms";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toLowerCase();

  if (!session || (role !== "admin" && role !== "supervisor")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId } = await params;

  try {
    const body = await req.json();
    const { decision, phone } = body || {};

    if (!decision || !["accept", "reject", "pending"].includes(decision)) {
      return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, supervisorId: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (role === "supervisor" && user.supervisorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (user.role !== "candidate") {
      return NextResponse.json({ error: "Only candidates can be reviewed" }, { status: 400 });
    }

    if (decision === "accept") {
      await prisma.user.update({
        where: { id: userId },
        data: { role: "learner" },
      });
    }

    // Create proper notification using Notification model
    await prisma.notification.create({
      data: {
        userId: userId,
        title: "Application Update",
        message:
          decision === "accept"
            ? "Congratulations! You have been accepted as a learner. Your account is now active and you can access all learning features."
            : decision === "reject"
              ? "Your application has been reviewed and marked as rejected at this time."
              : "Your application is currently pending review. We will notify you once a final decision is made.",
        type: decision === "accept" ? "success" : decision === "reject" ? "error" : "info",
        priority: "high",
      },
    });

    let emailSent = false;
    if (user.email) {
      try {
        const result = await sendCandidateStatusEmail({
          to: user.email,
          name: user.name,
          decision,
        });
        emailSent = result.sent;
      } catch (emailError) {
        console.error("Candidate status email error:", emailError);
      }
    }

    let smsSent = false;
    if (typeof phone === "string" && phone.trim().length > 0) {
      try {
        const result = await sendCandidateStatusSms({
          to: phone.trim(),
          name: user.name,
          decision,
        });
        smsSent = result.sent;
      } catch (smsError) {
        console.error("Candidate status sms error:", smsError);
      }
    }

    return NextResponse.json({ success: true, decision, emailSent, smsSent });
  } catch (error) {
    console.error("Candidate decision error:", error);
    return NextResponse.json({ error: "Failed to update candidate" }, { status: 500 });
  }
}
