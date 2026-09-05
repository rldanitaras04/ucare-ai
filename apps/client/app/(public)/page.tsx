import Link from "next/link";
import { Button, Container, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@repo/ui";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              UCare AI
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign up</Button>
              </Link>
            </div>
          </div>
        </Container>
      </header>

      <main className="flex-1">
        <section className="py-20">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                Welcome to UCare AI
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                A modern platform built with Next.js and Supabase.
              </p>
              <div className="mt-10 flex items-center justify-center gap-6">
                <Link href="/signup">
                  <Button size="lg">Get started</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">Log in</Button>
                </Link>
              </div>
            </div>
          </Container>
        </section>

        <section className="border-t py-20">
          <Container>
            <div className="mx-auto max-w-5xl">
              <h2 className="text-center text-3xl font-bold">Features</h2>
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Secure Authentication</CardTitle>
                    <CardDescription>Powered by Supabase Auth with cookie-based sessions.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Enterprise-grade security with role-based access control.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Mobile-First Design</CardTitle>
                    <CardDescription>Responsive from the ground up.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Optimized for mobile, tablet, and desktop experiences.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Real-Time Database</CardTitle>
                    <CardDescription>PostgreSQL with Row Level Security.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Data protected at the database level with RLS policies.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <footer className="border-t py-8">
        <Container>
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} UCare AI. All rights reserved.
          </p>
        </Container>
      </footer>
    </div>
  );
}
