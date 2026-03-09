import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
    return;
  }

  const role = session.user.role?.toLowerCase();

  switch (role) {
    case "admin":
      redirect("/admin/dashboard");
      break;
    case "supervisor":
      redirect("/supervisor");
      break;
    case "candidate":
      redirect("/candidate");
      break;
    default:
      redirect("/dashboard");
  }
}
