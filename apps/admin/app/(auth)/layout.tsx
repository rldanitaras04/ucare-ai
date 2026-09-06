import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Admin Login - UCare AI",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel - Brand */}
      <div className="hidden flex-col justify-between bg-gradient-to-br from-brand-navy via-brand-navy to-brand-blue p-10 text-white lg:flex lg:w-1/2">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xl font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy rounded-lg"
          >
            <Image
              src="/clinic_logo.png"
              alt="UCare AI Clinic Logo"
              width={36}
              height={36}
              className="rounded-lg"
              priority
            />
            UCare AI
          </Link>
        </div>
        <div className="space-y-8">
          <h1 className="text-3xl font-bold leading-tight text-white lg:text-4xl">
            Clinic Administration Panel
          </h1>
          <p className="text-lg text-white/70">
            Manage patient encounters, clinical documentation, staff operations, and clinic analytics.
          </p>
          <div className="grid gap-4 text-sm text-white/60">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Walk-in registration &amp; queue management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Triage &amp; clinical EMR documentation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Staff availability &amp; provider session tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Prescriptions &amp; health clearances</span>
            </div>
          </div>
        </div>
        <div className="text-sm text-white/40">
          &copy; {new Date().getFullYear()} UCare AI. All rights reserved.
        </div>
      </div>

      {/* Right panel - Auth form */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xl font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
            >
              <Image
                src="/clinic_logo.png"
                alt="UCare AI Clinic Logo"
                width={36}
                height={36}
                className="rounded-lg"
                priority
              />
              UCare AI
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
