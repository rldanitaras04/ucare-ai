import { updateSession } from "@repo/supabase/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { UserRole } from "@repo/types";
import { sanitizeRole } from "@repo/auth";
import { isRouteAllowed } from "./config/navigation";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/auth", "/api", "/verify"];

const ROLE_DASHBOARDS: Record<UserRole, string> = {
  superadmin: "/dashboard",
  nurse: "/dashboard",
  staff: "/dashboard",
  doctor: "/dashboard",
  dentist: "/dashboard",
  patient: "/dashboard",
};

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  });
}

function redirectWithCookies(url: URL, response: NextResponse): NextResponse {
  const redirectResponse = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
  });
  return redirectResponse;
}

function getRouteSegments(pathname: string): string[] {
  const parts = pathname.split("/").filter(Boolean);
  const segments: string[] = [];
  for (let i = 2; i <= parts.length; i++) {
    segments.push("/" + parts.slice(0, i).join("/"));
  }
  return segments;
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const { user, error: sessionError } = await updateSession(request, response);
  const pathname = request.nextUrl.pathname;

  if (sessionError === "session_expired" && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    url.searchParams.set("reason", "session_expired");
    return redirectWithCookies(url, response);
  }

  if (!isPublicPath(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return redirectWithCookies(url, response);
  }

  if (user && (pathname === "/login" || pathname === "/signup" || pathname === "/")) {
    const role = sanitizeRole(user.user_metadata?.role as string);
    const dashboard = ROLE_DASHBOARDS[role] || "/dashboard";
    const url = request.nextUrl.clone();
    url.pathname = dashboard;
    return redirectWithCookies(url, response);
  }

  if (user && !isPublicPath(pathname)) {
    const role = sanitizeRole(user.user_metadata?.role as string);
    const segments = getRouteSegments(pathname);
    const allowed = segments.some((seg) => isRouteAllowed(seg, role));
    if (segments.length > 0 && !allowed) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return redirectWithCookies(url, response);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
