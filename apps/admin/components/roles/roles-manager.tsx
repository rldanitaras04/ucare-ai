"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Checkbox,
  Alert,
  AlertDescription,
  Loading,
} from "@repo/ui";
import {
  getRoles,
  getPermissions,
  getRolePermissions,
  assignPermissionToRole,
  removePermissionFromRole,
  type Role,
  type Permission,
} from "@/lib/actions/roles";

export function RolesManager() {
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [permissions, setPermissions] = React.useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);
  const [rolePermissionIds, setRolePermissionIds] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadData() {
      const [rolesResult, permissionsResult] = await Promise.all([
        getRoles(),
        getPermissions(),
      ]);

      if (rolesResult.data) setRoles(rolesResult.data);
      if (permissionsResult.data) setPermissions(permissionsResult.data);
      setLoading(false);
    }

    loadData();
  }, []);

  const handleSelectRole = async (role: Role) => {
    setSelectedRole(role);
    setError(null);
    setSuccess(null);

    const { data } = await getRolePermissions(role.id);
    if (data) {
      setRolePermissionIds(data);
    }
  };

  const handleTogglePermission = async (permissionId: string) => {
    if (!selectedRole) return;

    setSaving(true);
    const hasPermission = rolePermissionIds.includes(permissionId);

    const result = hasPermission
      ? await removePermissionFromRole(selectedRole.id, permissionId)
      : await assignPermissionToRole(selectedRole.id, permissionId);

    if (result.success) {
      setRolePermissionIds((prev) =>
        hasPermission
          ? prev.filter((id) => id !== permissionId)
          : [...prev, permissionId]
      );
      setSuccess("Permission updated successfully");
    } else {
      setError(result.error ?? "Failed to update permission");
    }

    setSaving(false);
  };

  const groupedPermissions = React.useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    for (const perm of permissions) {
      if (!groups[perm.resource]) {
        groups[perm.resource] = [];
      }
      groups[perm.resource].push(perm);
    }
    return groups;
  }, [permissions]);

  if (loading) {
    return <Loading text="Loading roles..." />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                  selectedRole?.id === role.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {role.name}
                {role.description && (
                  <span className="block text-xs opacity-70">{role.description}</span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedRole
              ? `Permissions for ${selectedRole.name}`
              : "Select a role to manage permissions"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {selectedRole ? (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([resource, perms]) => (
                <div key={resource}>
                  <h3 className="mb-2 text-sm font-semibold capitalize">{resource}</h3>
                  <div className="space-y-2">
                    {perms.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-center gap-3 rounded-md border p-3"
                      >
                        <Checkbox
                          checked={rolePermissionIds.includes(perm.id)}
                          onChange={() => handleTogglePermission(perm.id)}
                          disabled={saving}
                        />
                        <div>
                          <span className="text-sm font-medium">{perm.name}</span>
                          {perm.description && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              {perm.description}
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a role from the left panel to manage its permissions.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
