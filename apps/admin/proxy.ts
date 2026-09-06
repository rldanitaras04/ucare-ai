import { updateSession } from "@repo/supabase/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTHORIZED_ROLES = [
  "super_admin",
  "admin",
];

const PUBLIC_PATHS = ["/login", "/queue-board"];

function isAuthorizedRole(role: string | undefined): boolean {
  return AUTHORIZED_ROLES.includes(role ?? "");
}

function redirectWithCookies(url: URL, response: NextResponse): NextResponse {
  const redirectResponse = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
  });
  return redirectResponse;
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const { user } = await updateSession(request, response);
  const pathname = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return redirectWithCookies(url, response);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return redirectWithCookies(url, response);
  }

  if (user && !isPublicPath) {
    const userRole = user.user_metadata?.role as string | undefined;
    if (!isAuthorizedRole(userRole)) {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return redirectWithCookies(url, response);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|unauthorized|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
