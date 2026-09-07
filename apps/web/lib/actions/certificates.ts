"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@repo/supabase/server";
import { createDocumentVerification } from "./verification";

function generateVerificationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export interface Certificate {
  id: string;
  certificate_number: string;
  patient_id: string;
  encounter_id: string | null;
  issued_by: string;
  certificate_type: string;
  status: string;
  title: string;
  content: string;
  issue_date: string;
  valid_until: string | null;
  signed_at: string | null;
  signed_by: string | null;
  cancellation_reason: string | null;
  created_at: string;
}

export async function getCertificates(): Promise<{
  data: Certificate[];
  error: string | null;
}> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !["superadmin", "nurse", "staff", "doctor", "dentist"].includes(callerRole)) {
    return { data: [], error: "Insufficient permissions" };
  }

  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .order("created_at", { ascending: false });

  return { data: (data as Certificate[]) ?? [], error: error?.message ?? null };
}

export async function createCertificate(cert: {
  patient_id: string;
  encounter_id?: string;
  certificate_type: string;
  title: string;
  content: string;
  valid_until?: string;
}): Promise<{ data: Certificate | null; error: string | null }> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !["superadmin", "nurse", "doctor", "dentist"].includes(callerRole)) {
    return { data: null, error: "Insufficient permissions" };
  }

  const { data: numberData } = await supabase.rpc("generate_certificate_number");
  if (!numberData) return { data: null, error: "Failed to generate certificate number" };

  const { data, error } = await supabase
    .from("certificates")
    .insert({
      certificate_number: numberData as string,
      patient_id: cert.patient_id,
      encounter_id: cert.encounter_id ?? null,
      issued_by: user.id,
      certificate_type: cert.certificate_type,
      title: cert.title,
      content: cert.content,
      valid_until: cert.valid_until ?? null,
    })
    .select()
    .single();

  revalidatePath("/certificates");
  return { data: data as Certificate | null, error: error?.message ?? null };
}

export async function issueCertificate(certificateId: string): Promise<{
  success: boolean;
  error: string | null;
  verification_code?: string;
}> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !["superadmin", "nurse", "doctor", "dentist"].includes(callerRole)) {
    return { success: false, error: "Insufficient permissions" };
  }

  const { error } = await supabase
    .from("certificates")
    .update({
      status: "issued",
      signed_at: new Date().toISOString(),
      signed_by: user.id,
    })
    .eq("id", certificateId)
    .eq("status", "draft");

  if (error) {
    return { success: false, error: error.message };
  }

  const verificationCode = generateVerificationCode();
  const { success: verSuccess } = await createDocumentVerification(
    "certificate",
    certificateId,
    verificationCode
  );

  revalidatePath("/certificates");
  return {
    success: true,
    error: null,
    verification_code: verSuccess ? verificationCode : undefined,
  };
}
