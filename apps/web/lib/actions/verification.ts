"use server";

import { createServerClient } from "@repo/supabase/server";

interface DocumentVerificationRow {
  id: string;
  document_type: string;
  document_id: string;
  verification_code: string;
  is_valid: boolean;
  verified_by: string | null;
  verified_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface VerificationResult {
  document_type: string;
  document_id: string;
  verification_code: string;
  is_valid: boolean;
  verified_at: string | null;
  created_at: string;
  document_title?: string;
  document_number?: string;
  issued_to?: string;
  issued_by?: string;
  issue_date?: string;
  valid_until?: string;
}

export async function verifyDocument(
  verificationCode: string
): Promise<{ data: VerificationResult | null; error: string | null }> {
  const supabase = await createServerClient();

  const trimmed = verificationCode.trim();
  if (!trimmed) {
    return { data: null, error: "Verification code is required" };
  }

  const { data: verification, error: verError } = await supabase
    .from("document_verifications" as never)
    .select("*")
    .eq("verification_code", trimmed)
    .single();

  if (verError || !verification) {
    return { data: null, error: "Invalid verification code" };
  }

  const v = verification as unknown as DocumentVerificationRow;

  const result: VerificationResult = {
    document_type: v.document_type,
    document_id: v.document_id,
    verification_code: v.verification_code,
    is_valid: v.is_valid,
    verified_at: v.verified_at,
    created_at: v.created_at,
  };

  if (v.document_type === "certificate") {
    const { data: cert } = await supabase
      .from("certificates")
      .select("title, certificate_number, status, issue_date, valid_until, issued_by")
      .eq("id", v.document_id)
      .single();

    if (cert) {
      result.document_title = cert.title;
      result.document_number = cert.certificate_number;
      result.issue_date = cert.issue_date ?? undefined;
      result.valid_until = cert.valid_until ?? undefined;
      result.is_valid = cert.status === "issued" && v.is_valid;

      if (cert.issued_by) {
        const { data: issuer } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", cert.issued_by)
          .single();
        result.issued_by = issuer?.full_name ?? "Unknown";
      }
    }
  } else if (v.document_type === "health_clearance") {
    const { data: clearance } = await supabase
      .from("health_clearances")
      .select("clearance_type, clearance_number, status, valid_from, valid_until, assessed_by")
      .eq("id", v.document_id)
      .single();

    if (clearance) {
      result.document_title = `Health Clearance - ${clearance.clearance_type}`;
      result.document_number = clearance.clearance_number;
      result.issue_date = clearance.valid_from ?? undefined;
      result.valid_until = clearance.valid_until ?? undefined;
      result.is_valid = clearance.status === "approved" && v.is_valid;

      if (clearance.assessed_by) {
        const { data: assessor } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", clearance.assessed_by)
          .single();
        result.issued_by = assessor?.full_name ?? "Unknown";
      }
    }
  }

  return { data: result, error: null };
}

export async function createDocumentVerification(
  documentType: string,
  documentId: string,
  verificationCode: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("document_verifications" as never)
    .insert({
      document_type: documentType,
      document_id: documentId,
      verification_code: verificationCode,
      is_valid: true,
    } as never);

  return { success: !error, error: error?.message ?? null };
}
