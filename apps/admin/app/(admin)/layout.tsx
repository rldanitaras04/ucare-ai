import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerClient } from "@repo/supabase/server";
import { parseUserRole } from "@repo/auth";
import { canAccessAdminPanel } from "@repo/auth";
import { AdminShell } from "@/components/layout/admin-shell";

export const metadata: Metadata = {
  title: "Admin Dashboard - UCare AI",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userRole = parseUserRole(user.user_metadata?.role ?? "user");

  if (!canAccessAdminPanel(userRole)) {
    redirect("/unauthorized");
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
