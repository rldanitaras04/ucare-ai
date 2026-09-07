import { NextResponse } from "next/server";
import { createServerClient } from "@repo/supabase/server";

interface DocumentVerificationRow {
  id: string;
  document_type: string;
  document_id: string;
  verification_code: string;
  is_valid: boolean;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code || !code.trim()) {
    return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
  }

  const supabase = await createServerClient();

  const { data: verification, error: verError } = await supabase
    .from("document_verifications" as never)
    .select("*")
    .eq("verification_code", code.trim())
    .single();

  if (verError || !verification) {
    return NextResponse.json({ valid: false, error: "Invalid verification code" }, { status: 404 });
  }

  const v = verification as unknown as DocumentVerificationRow;

  let documentTitle: string | undefined;
  let documentNumber: string | undefined;
  let issuedBy: string | undefined;
  let issueDate: string | undefined;
  let validUntil: string | undefined;

  if (v.document_type === "certificate") {
    const { data: cert } = await supabase
      .from("certificates")
      .select("title, certificate_number, status, issue_date, valid_until, issued_by")
      .eq("id", v.document_id)
      .single();

    if (cert) {
      documentTitle = cert.title;
      documentNumber = cert.certificate_number;
      issueDate = cert.issue_date ?? undefined;
      validUntil = cert.valid_until ?? undefined;
      v.is_valid = cert.status === "issued" && v.is_valid;

      if (cert.issued_by) {
        const { data: issuer } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", cert.issued_by)
          .single();
        issuedBy = issuer?.full_name ?? undefined;
      }
    }
  } else if (v.document_type === "health_clearance") {
    const { data: clearance } = await supabase
      .from("health_clearances")
      .select("clearance_type, clearance_number, status, valid_from, valid_until, assessed_by")
      .eq("id", v.document_id)
      .single();

    if (clearance) {
      documentTitle = `Health Clearance - ${clearance.clearance_type}`;
      documentNumber = clearance.clearance_number;
      issueDate = clearance.valid_from ?? undefined;
      validUntil = clearance.valid_until ?? undefined;
      v.is_valid = clearance.status === "approved" && v.is_valid;

      if (clearance.assessed_by) {
        const { data: assessor } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", clearance.assessed_by)
          .single();
        issuedBy = assessor?.full_name ?? undefined;
      }
    }
  }

  return NextResponse.json({
    valid: v.is_valid,
    document_type: v.document_type,
    document_number: documentNumber,
    document_title: documentTitle,
    issued_by: issuedBy,
    issue_date: issueDate,
    valid_until: validUntil,
    verification_code: v.verification_code,
  });
}
