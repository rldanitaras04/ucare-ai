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

  const client = createSSRClient<Database>(
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
            // This is expected when middleware handles session refresh.
            // In Server Actions, cookie writes will succeed.
          }
        },
      },
    }
  );

  return client as unknown as TypedSupabaseClient;
}

export async function createServerClientWithSessionRefresh(): Promise<{
  client: TypedSupabaseClient;
  error: string | null;
}> {
  try {
    const client = await createServerClient();
    const { error } = await client.auth.getUser();
    return { client, error: error?.message ?? null };
  } catch (err) {
    return {
      client: null as unknown as TypedSupabaseClient,
      error: err instanceof Error ? err.message : "Failed to create session",
    };
  }
}
