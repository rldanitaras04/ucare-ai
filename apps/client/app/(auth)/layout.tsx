import type { Metadata } from "next";
import { Container } from "@repo/ui";

export const metadata: Metadata = {
  title: "Authentication - UCare AI",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <Container size="sm">
        {children}
      </Container>
    </div>
  );
}
