import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@repo/ui";
import { AdminLoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Admin Login - UCare AI",
};

export default function AdminLoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Admin Login</CardTitle>
        <CardDescription>Sign in to the administration panel</CardDescription>
      </CardHeader>
      <CardContent>
        <AdminLoginForm />
      </CardContent>
    </Card>
  );
}
