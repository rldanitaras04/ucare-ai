import { createServerClient } from "@supabase/ssr";
import type { Database } from "@repo/types";
import type { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

interface CookieToSet {
  name: string;
  value: string;
  options?: Record<string, unknown>;
}

export interface SessionResult {
  request: NextRequest;
  response: NextResponse;
  user: User | null;
  error: string | null;
}

export async function updateSession(
  request: NextRequest,
  response: NextResponse
): Promise<SessionResult> {
  try {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: CookieToSet[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set({ name, value, ...options });
              response.cookies.set({ name, value, ...options });
            });
          },
        },
      }
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      const authError = error.message.toLowerCase();
      if (
        authError.includes("invalid refresh token") ||
        authError.includes("refresh token_not_found") ||
        authError.includes("jwt expired")
      ) {
        return { request, response, user: null, error: "session_expired" };
      }
      return { request, response, user: null, error: error.message };
    }

    return { request, response, user, error: null };
  } catch (err) {
    return {
      request,
      response,
      user: null,
      error: err instanceof Error ? err.message : "Session validation failed",
    };
  }
}
