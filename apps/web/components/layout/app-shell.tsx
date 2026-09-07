"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@repo/supabase/client";
import { Avatar, CarinaChatWidget } from "@repo/ui";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { getGroupedNavigation } from "@/config/navigation";
import type { User } from "@supabase/supabase-js";
import type { UserRole, PatientPersona } from "@repo/types";
import { sanitizeRole } from "@repo/auth";

interface AppShellProps {
  children: React.ReactNode;
  user: User;
}

function NavIcon({ path }: { path: string }) {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function UserDropdown({ user, onLogout, role, persona }: {
  user: User;
  onLogout: () => void;
  role: UserRole;
  persona?: PatientPersona;
}) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [profile, setProfile] = React.useState<{
    full_name: string | null;
    avatar_url: string | null;
  }>({
    full_name: (user.user_metadata?.full_name as string) ?? null,
    avatar_url: (user.user_metadata?.avatar_url as string) ?? null,
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();
      if (data) {
        const d = data as { full_name: string | null; avatar_url: string | null };
        setProfile({ full_name: d.full_name, avatar_url: d.avatar_url });
      }
    };
    fetchProfile();
  }, [user.id]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const displayName = profile.full_name || user.email?.split("@")[0] || "User";
  const roleLabel = role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const personaLabel = persona
    ? ` (${persona.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())})`
    : "";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
      >
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
          <Avatar key={profile.avatar_url || "none"} src={profile.avatar_url} name={user.email ?? ""} size="sm" />
        </div>
        <svg className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-[60] mt-2 w-72 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
            <div className="border-b border-slate-100 p-4">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                  <Avatar key={profile.avatar_url || "none"} src={profile.avatar_url} name={user.email ?? ""} size="md" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                  <p className="truncate text-xs text-slate-400">{user.email}</p>
                  <span className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    {roleLabel}{personaLabel}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-2">
              <button
                onClick={() => { router.push("/profile"); setOpen(false); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </button>
            </div>
            <div className="border-t border-slate-100 p-2">
              <button
                onClick={() => { onLogout(); setOpen(false); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [userRole, setUserRole] = React.useState<UserRole>(
    sanitizeRole(user.user_metadata?.role as string)
  );
  const [userPersona] = React.useState<PatientPersona | undefined>(
    (user.user_metadata?.persona as PatientPersona) ?? undefined
  );

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient();

        const { data: roleData } = await supabase
          .from("user_roles" as never)
          .select("roles(name)")
          .eq("user_id" as never, user.id)
          .limit(1);

        if (roleData && Array.isArray(roleData) && roleData.length > 0) {
          const roleRecord = roleData[0] as unknown as { roles: { name: string } | null };
          if (roleRecord.roles?.name) {
            setUserRole(sanitizeRole(roleRecord.roles.name));
          }
        } else {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
          if (profileData && (profileData as { role: string }).role) {
            setUserRole(sanitizeRole((profileData as { role: string }).role));
          }
        }
      } catch {
        // Keep user_metadata role as fallback
      }
    };
    fetchProfile();
  }, [user.id]);

  const navGroups = React.useMemo(() => {
    return getGroupedNavigation(userRole);
  }, [userRole]);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut({ scope: "global" });
    } catch {
      // Sign-out failed but we still redirect
    }
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center border-b border-slate-200/70 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex h-full w-full items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 lg:hidden"
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/dashboard" className="flex items-center gap-3">
              <Image src="/clinic_logo.png" alt="UCare AI" width={32} height={32} className="rounded-xl" priority />
              <div>
                <span className="text-base font-bold text-slate-900">UCare AI</span>
                <p className="text-[10px] text-slate-400 font-medium">Clinic Management</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <NotificationCenter />
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <UserDropdown user={user} onLogout={handleLogout} role={userRole} persona={userPersona} />
          </div>
        </div>
      </header>

      <aside className="fixed top-16 left-0 bottom-0 z-40 hidden w-[260px] overflow-y-auto border-r border-slate-200/70 bg-white lg:block">
        <nav className="p-4 space-y-4">
          {navGroups.map((group) => (
            <div key={group.section}>
              {group.label && (
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-150 ${
                      isActive(item.href)
                        ? "bg-slate-100 text-slate-900 font-semibold"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                  >
                    <NavIcon path={item.icon} />
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-[280px] bg-white border-r border-slate-200/70">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
              <div className="flex items-center gap-3">
                <Image src="/clinic_logo.png" alt="UCare AI" width={28} height={28} className="rounded-lg" priority />
                <span className="text-sm font-bold text-slate-900">UCare AI</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100" aria-label="Close menu">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="p-4 space-y-4">
              {navGroups.map((group) => (
                <div key={group.section}>
                  {group.label && (
                    <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      {group.label}
                    </p>
                  )}
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-150 ${
                          isActive(item.href)
                            ? "bg-slate-100 text-slate-900 font-semibold"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        }`}
                      >
                        <NavIcon path={item.icon} />
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      <main className="pt-16 lg:pl-[260px]">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

      <CarinaChatWidget
        role={["patient"].includes(userRole) ? "client" : "admin"}
        avatarUrl="/carina.png"
      />
    </div>
  );
}
