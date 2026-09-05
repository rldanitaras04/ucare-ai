import Link from "next/link";
import { Button, Container } from "@repo/ui";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-md"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              UCare AI
            </Link>
            <nav className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="min-h-[48px] px-4">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button className="min-h-[48px] px-6">Sign up</Button>
              </Link>
            </nav>
          </div>
        </Container>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b bg-gradient-to-b from-accent to-background">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
          <Container>
            <div className="relative py-20 sm:py-32">
              <div className="mx-auto max-w-3xl text-center">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  University Healthcare Platform
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                  Integrated Medical &amp; Dental{" "}
                  <span className="text-primary">Health Information System</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
                  A secure, mobile-first platform digitizing university clinic operations
                  — from walk-in registration to clinical documentation.
                </p>
                <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <Link href="/signup">
                    <Button size="lg" className="min-h-[48px] w-full sm:w-auto px-8 text-base">
                      Get Started
                      <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="min-h-[48px] w-full sm:w-auto px-8 text-base">
                      Log in
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Features Section */}
        <section className="py-20 sm:py-28">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Built for University Clinics
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Comprehensive healthcare management designed for the unique needs of academic institutions.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Walk-In Management</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Digital queue management with real-time status tracking, priority-based ordering, and RA 10173 compliant public displays.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Clinical Triage</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Rapid-entry vitals assessment with automated priority classification, red-flag detection, and fallback triage protocols.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Electronic Medical Records</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Structured SOAP notes, diagnosis coding, and comprehensive encounter documentation for medical and dental consultations.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Dental Odontogram</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Interactive FDI tooth chart with 5-surface mapping, condition tracking, and procedure documentation for dental clinics.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Prescriptions</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Digital prescription management with lifecycle tracking, medication documentation, and dispensing records.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Health Clearances</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Digital clearance certificates with requirements checklists, approval workflows, and verification for university registrars.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* Stats Section */}
        <section className="border-y bg-muted/30 py-16 sm:py-20">
          <Container>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary sm:text-4xl">18</div>
                <div className="mt-2 text-sm text-muted-foreground">Database Tables</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary sm:text-4xl">14</div>
                <div className="mt-2 text-sm text-muted-foreground">Clinic Roles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary sm:text-4xl">30+</div>
                <div className="mt-2 text-sm text-muted-foreground">Granular Permissions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary sm:text-4xl">RA 10173</div>
                <div className="mt-2 text-sm text-muted-foreground">Privacy Compliant</div>
              </div>
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-28">
          <Container>
            <div className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-8 text-center sm:p-12">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Ready to modernize your clinic?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Join universities already using UCare AI to streamline their healthcare operations.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/signup">
                  <Button size="lg" className="min-h-[48px] w-full sm:w-auto px-8">
                    Create Account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="min-h-[48px] w-full sm:w-auto px-8">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <Container>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              &copy; {new Date().getFullYear()} UCare AI. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>University Integrated Medical &amp; Dental Health Information System</span>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
