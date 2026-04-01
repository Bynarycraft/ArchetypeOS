import twilio from "twilio";

type CandidateDecision = "accept" | "reject" | "pending";

type CandidateSmsInput = {
  to: string;
  name?: string | null;
  decision: CandidateDecision;
};

function getDecisionMessage(decision: CandidateDecision, displayName: string) {
  if (decision === "accept") {
    return `ArchetypeOS: Hi ${displayName}, your application has been ACCEPTED. Your learner account is now active.`;
  }

  if (decision === "reject") {
    return `ArchetypeOS: Hi ${displayName}, your application has been reviewed and marked as REJECTED at this time.`;
  }

  return `ArchetypeOS: Hi ${displayName}, your application is currently PENDING review. We will update you soon.`;
}

export async function sendCandidateStatusSms({ to, name, decision }: CandidateSmsInput) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    return { sent: false, reason: "Twilio credentials not fully configured" as const };
  }

  const displayName = name?.trim() || "Candidate";
  const body = getDecisionMessage(decision, displayName);

  const client = twilio(accountSid, authToken);
  await client.messages.create({
    from,
    to,
    body,
  });

  return { sent: true as const };
}
