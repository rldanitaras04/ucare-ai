import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@repo/ui";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in - UCare AI",
};

export default function LoginPage() {
  return (
    <>
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to access your health records and clinic services
        </p>
      </div>
      <Card className="border-border shadow-lg">
        <CardContent className="p-8">
          <LoginForm />
        </CardContent>
      </Card>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-md"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}
