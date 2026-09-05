"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@repo/supabase/client";
import {
  Avatar,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@repo/ui";
import type { User } from "@supabase/supabase-js";

interface AdminShellProps {
  children: React.ReactNode;
  user: User;
}

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Walk-Ins", href: "/walk-ins" },
  { name: "Patients", href: "/patients" },
  { name: "Triage", href: "/triage" },
  { name: "Queue", href: "/queue-management" },
  { name: "Consultations", href: "/consultations" },
  { name: "Dental", href: "/dental" },
  { name: "Prescriptions", href: "/prescriptions" },
  { name: "Clearances", href: "/health-clearances" },
  { name: "Staff", href: "/staff-availability" },
  { name: "Provider Sessions", href: "/provider-sessions" },
  { name: "Users", href: "/users" },
  { name: "Roles", href: "/roles" },
  { name: "Audit Logs", href: "/audit-logs" },
];

export function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
        <div className="flex h-16 items-center px-6">
          <Link
            href="/"
            className="text-xl font-bold text-sidebar-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
          >
            UCare Admin
          </Link>
        </div>
        <nav className="space-y-1 px-3">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[48px] items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                pathname === item.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-sidebar">
            <div className="flex h-16 items-center justify-between px-6">
              <Link
                href="/"
                className="text-xl font-bold text-sidebar-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
              >
                UCare Admin
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex h-12 w-12 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Close menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="space-y-1 px-3">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex min-h-[48px] items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    pathname === item.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-md text-muted-foreground hover:bg-accent lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger className="flex min-h-[48px] items-center gap-2 rounded-md px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Avatar name={user.email ?? ""} size="sm" />
              <span className="hidden text-sm font-medium sm:inline">
                {user.email}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 py-8">{children}</main>
      </div>
    </div>
  );
}
