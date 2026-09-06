import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@repo/ui";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign up - UCare AI",
};

export default function SignupPage() {
  return (
    <>
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create an account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Register to access university clinic services
        </p>
      </div>
      <Card className="border-border shadow-lg">
        <CardContent className="p-8">
          <SignupForm />
        </CardContent>
      </Card>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-md"
        >
          Log in
        </Link>
      </p>
    </>
  );
}
