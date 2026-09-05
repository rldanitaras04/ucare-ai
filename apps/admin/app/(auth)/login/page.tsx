import type { Metadata } from "next";
import { Card, CardContent } from "@repo/ui";
import { AdminLoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Admin Login - UCare AI",
};

export default function AdminLoginPage() {
  return (
    <>
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Admin Login
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to the clinic administration panel
        </p>
      </div>
      <Card className="border-border shadow-lg">
        <CardContent className="pt-6">
          <AdminLoginForm />
        </CardContent>
      </Card>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Authorized personnel only. All access is logged and audited.
      </p>
    </>
  );
}
