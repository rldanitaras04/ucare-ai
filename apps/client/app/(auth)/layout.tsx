import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Authentication - UCare AI",
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
          <h1 className="text-3xl font-bold leading-tight lg:text-4xl">
            University Integrated Medical &amp; Dental Health Information System
          </h1>
          <p className="text-lg text-white/70">
            A secure, mobile-first platform digitizing university clinic operations.
          </p>
          <div className="grid gap-4 text-sm text-white/60">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span>RA 10173 Compliant</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span>HIPAA-aligned</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <span>Role-based access control</span>
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
