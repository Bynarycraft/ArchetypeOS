import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/", "/auth", "/auth/signin", "/auth/signup"];

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const pathname = request.nextUrl.pathname;

  // Allow public routes
  if (publicRoutes.includes(pathname) || pathname.startsWith("/auth/")) {
    return NextResponse.next();
  }

  // No token - redirect to signin
  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  let userRole = token.role as string;

  try {
    const roleResponse = await fetch(new URL("/api/auth/current", request.url), {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    if (roleResponse.ok) {
      const currentUser = (await roleResponse.json()) as { role?: string; status?: string };
      if (currentUser.role) {
        userRole = currentUser.role;
      }

      if (currentUser.status && currentUser.status !== "active") {
        return NextResponse.redirect(new URL("/auth/signin?status=inactive", request.url));
      }
    }
  } catch (error) {
    console.error("[proxy] Failed to refresh current role:", error);
  }

  // Role-based route protection
  if (pathname.startsWith("/candidate") && userRole !== "candidate") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/admin") && userRole !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    userRole === "admin" &&
    [
      "/dashboard",
      "/roadmap",
      "/courses",
      "/tests",
      "/tracker",
      "/reflections",
      "/skills",
      "/certificates",
      "/feedback",
      "/notifications",
    ].includes(pathname)
  ) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (pathname.startsWith("/supervisor") && !["supervisor", "admin"].includes(userRole)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (userRole === "candidate") {
    const candidateAllowedPrefixes = ["/candidate", "/courses", "/tests", "/notifications", "/results", "/auth"];
    const isCandidateAllowed = candidateAllowedPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

    if (!isCandidateAllowed && pathname !== "/") {
      return NextResponse.redirect(new URL("/candidate", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
