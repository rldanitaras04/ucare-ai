"use client";

import * as React from "react";
import { getUsers, getAllRoles, toggleUserRole, type UserWithProfile } from "@/lib/actions/users";

export default function UsersPage() {
  const [users, setUsers] = React.useState<UserWithProfile[]>([]);
  const [roles, setRoles] = React.useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  React.useEffect(() => {
    const load = async () => {
      const [usersResult, rolesResult] = await Promise.all([getUsers(), getAllRoles()]);
      setUsers(usersResult.data ?? []);
      setRoles(rolesResult.data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const handleToggleRole = async (userId: string, roleName: string) => {
    const result = await toggleUserRole(userId, roleName);
    if (result.error) setMessage({ type: "error", text: result.error });
    else {
      setMessage({ type: "success", text: "Role updated" });
      const updated = await getUsers();
      setUsers(updated.data ?? []);
    }
  };

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User & RBAC Management</h1>
        <p className="text-sm text-slate-500">{users.length} user{users.length !== 1 ? "s" : ""} registered</p>
      </div>

      {message && (
        <div className={`rounded-xl border p-4 text-sm ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="relative">
        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" /></div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Roles</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{user.full_name || "Unnamed"}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length > 0 ? user.roles.map((r) => (
                        <span key={r} className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{r}</span>
                      )) : (
                        <span className="text-xs text-slate-400">No roles</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {roles.map((role) => {
                        const hasRole = user.roles.includes(role.name);
                        return (
                          <button
                            key={role.id}
                            onClick={() => handleToggleRole(user.id, role.name)}
                            className={`rounded-lg px-2 py-1 text-[10px] font-medium transition-colors ${hasRole ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                          >
                            {hasRole ? `Remove ${role.name}` : `Add ${role.name}`}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
