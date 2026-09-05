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
}

export async function updateSession(
  request: NextRequest,
  response: NextResponse
): Promise<SessionResult> {
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
  } = await supabase.auth.getUser();

  return { request, response, user };
}
