import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerClient } from "@repo/supabase/server";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "UCare AI - Clinic Management System",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <AppShell user={user}>{children}</AppShell>;
}
