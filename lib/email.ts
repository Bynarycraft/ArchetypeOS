import nodemailer from "nodemailer";

type CandidateDecision = "accept" | "reject" | "pending";

type CandidateEmailInput = {
  to: string;
  name?: string | null;
  decision: CandidateDecision;
};

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

function buildCandidateStatusContent(decision: CandidateDecision, displayName: string) {
  if (decision === "accept") {
    return {
      subject: "ArchetypeOS Application Update: Accepted",
      text: `Hello ${displayName},\n\nCongratulations. Your application has been accepted and your account is now activated as a learner. You can sign in and continue your learning journey.\n\nRegards,\nArchetypeOS Team`,
      html: `<p>Hello ${displayName},</p><p>Congratulations. Your application has been <strong>accepted</strong> and your account is now activated as a learner.</p><p>You can sign in and continue your learning journey.</p><p>Regards,<br/>ArchetypeOS Team</p>`,
    };
  }

  if (decision === "reject") {
    return {
      subject: "ArchetypeOS Application Update: Rejected",
      text: `Hello ${displayName},\n\nThank you for your effort. Your application was reviewed and is marked as rejected at this time.\n\nRegards,\nArchetypeOS Team`,
      html: `<p>Hello ${displayName},</p><p>Thank you for your effort. Your application was reviewed and is marked as <strong>rejected</strong> at this time.</p><p>Regards,<br/>ArchetypeOS Team</p>`,
    };
  }

  return {
    subject: "ArchetypeOS Application Update: Pending",
    text: `Hello ${displayName},\n\nYour application is currently pending review. We will notify you as soon as a final decision is made.\n\nRegards,\nArchetypeOS Team`,
    html: `<p>Hello ${displayName},</p><p>Your application is currently <strong>pending review</strong>. We will notify you as soon as a final decision is made.</p><p>Regards,<br/>ArchetypeOS Team</p>`,
  };
}

export async function sendCandidateStatusEmail({ to, name, decision }: CandidateEmailInput) {
  const from = process.env.SMTP_FROM;
  if (!from) {
    return { sent: false, reason: "SMTP_FROM not configured" as const };
  }

  const transporter = createTransporter();
  if (!transporter) {
    return { sent: false, reason: "SMTP credentials not fully configured" as const };
  }

  const displayName = name?.trim() || "Candidate";
  const content = buildCandidateStatusContent(decision, displayName);

  await transporter.sendMail({
    from,
    to,
    subject: content.subject,
    text: content.text,
    html: content.html,
  });

  return { sent: true as const };
}
