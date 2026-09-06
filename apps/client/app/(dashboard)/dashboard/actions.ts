"use server";

import { createServerClient } from "@repo/supabase/server";

export interface ClientDashboardData {
  fullName: string | null;
  email: string | null;
  hasProfile: boolean;
  totalVisits: number;
  recentVisits: Array<{
    id: string;
    service_type: string;
    status: string;
    visit_date: string;
  }>;
}

export async function getClientDashboardData(): Promise<{
  data: ClientDashboardData | null;
  error: string | null;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("patient_profiles")
    .select("id, first_name, last_name")
    .eq("user_id", user.id)
    .maybeSingle();

  let totalVisits = 0;
  let recentVisits: ClientDashboardData["recentVisits"] = [];

  if (profile) {
    const { count } = await supabase
      .from("walk_in_visits")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", profile.id);

    totalVisits = count ?? 0;

    const { data: visits } = await supabase
      .from("walk_in_visits")
      .select("id, service_type, status, visit_date")
      .eq("patient_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(5);

    recentVisits = visits ?? [];
  }

  return {
    data: {
      fullName: profile ? `${profile.first_name} ${profile.last_name}` : null,
      email: user.email ?? null,
      hasProfile: !!profile,
      totalVisits,
      recentVisits,
    },
    error: null,
  };
}
