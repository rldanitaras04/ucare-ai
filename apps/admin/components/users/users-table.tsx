"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Input,
  Loading,
  EmptyState,
} from "@repo/ui";
import { toggleUserRole, searchUsers, getAllRoles, type UserWithProfile } from "@/lib/actions/users";

interface UsersTableProps {
  users: UserWithProfile[];
}

const roleColors: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "info"> = {
  super_admin: "destructive",
  admin: "warning",
  clinic_admin: "warning",
  nurse: "info",
  doctor: "info",
  dentist: "info",
  staff: "info",
  clinic_staff: "info",
  user: "secondary",
  patient: "secondary",
};

interface RoleDef {
  id: string;
  name: string;
  description: string | null;
}

export function UsersTable({ users: initialUsers }: UsersTableProps) {
  const router = useRouter();
  const [users, setUsers] = React.useState(initialUsers);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [allRoles, setAllRoles] = React.useState<RoleDef[]>([]);
  const [editingUser, setEditingUser] = React.useState<string | null>(null);

  React.useEffect(() => {
    getAllRoles().then(({ data }) => {
      if (data) setAllRoles(data);
    });
  }, []);

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (!query.trim()) {
      setUsers(initialUsers);
      return;
    }

    setLoading(true);
    const { data } = await searchUsers(query);
    if (data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const handleToggleRole = async (userId: string, roleName: string) => {
    const { success } = await toggleUserRole(userId, roleName);
    if (success) {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          const hasRole = u.roles.includes(roleName);
          return {
            ...u,
            roles: hasRole ? u.roles.filter((r) => r !== roleName) : [...u.roles, roleName],
          };
        })
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <Loading text="Searching..." />
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          description={search ? "Try a different search term." : "No users have been registered yet."}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-600">
                        {user.full_name
                          ? user.full_name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
                          : user.email?.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{user.full_name || "—"}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[200px]">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role} variant={roleColors[role] ?? "secondary"}>
                          {role.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
                    >
                      {editingUser === user.id ? "Close" : "Roles"}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {editingUser && (
            <div className="border-t border-slate-100 px-6 py-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Toggle roles for {users.find((u) => u.id === editingUser)?.full_name || users.find((u) => u.id === editingUser)?.email}
              </p>
              <div className="flex flex-wrap gap-2">
                {allRoles.map((role) => {
                  const user = users.find((u) => u.id === editingUser);
                  const hasRole = user?.roles.includes(role.name) ?? false;
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleToggleRole(editingUser, role.name)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                        hasRole
                          ? "border-slate-300 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {hasRole && (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {role.name.replace(/_/g, " ")}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
