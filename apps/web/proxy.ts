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

/**
 * Get the user's authoritative role from the user_roles DB table.
 * Falls back to JWT metadata if DB query fails (graceful degradation).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getUserRole(
  supabaseClient: any,
  userId: string,
  fallbackRole?: string
): Promise<UserRole> {
  try {
    const { data, error } = await supabaseClient
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data && typeof data === "object" && "roles" in data) {
      const rolesObj = data as { roles: { name: string } | null };
      if (rolesObj.roles?.name) {
        return sanitizeRole(rolesObj.roles.name) as UserRole;
      }
    }
  } catch {
    // DB query failed, fall through to metadata
  }

  return sanitizeRole(fallbackRole ?? "patient") as UserRole;
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
    // Use DB role for authorization, not JWT metadata
    const { createServerClient } = await import("@repo/supabase/server");
    const supabase = await createServerClient();
    const role = await getUserRole(
      supabase,
      user.id,
      user.user_metadata?.role as string | undefined
    );
    const dashboard = ROLE_DASHBOARDS[role] || "/dashboard";
    const url = request.nextUrl.clone();
    url.pathname = dashboard;
    return redirectWithCookies(url, response);
  }

  if (user && !isPublicPath(pathname)) {
    // Use DB role for route access control, not JWT metadata
    const { createServerClient } = await import("@repo/supabase/server");
    const supabase = await createServerClient();
    const role = await getUserRole(
      supabase,
      user.id,
      user.user_metadata?.role as string | undefined
    );
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
