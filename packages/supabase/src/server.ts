import { createServerClient as createSSRClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@repo/types";
import { cookies } from "next/headers";

interface CookieToSet {
  name: string;
  value: string;
  options?: Record<string, unknown>;
}

export type TypedSupabaseClient = SupabaseClient<Database, "public", "public">;

export async function createServerClient(): Promise<TypedSupabaseClient> {
  const cookieStore = await cookies();

  const client = createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from Server Component where cookies are read-only.
            // Can be ignored when using middleware for session refresh.
          }
        },
      },
    }
  );

  return client as unknown as TypedSupabaseClient;
}
