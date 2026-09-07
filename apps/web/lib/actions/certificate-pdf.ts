"use server";

import { createServerClient } from "@repo/supabase/server";
import { jsPDF } from "jspdf";

interface CertificateData {
  certificate_number: string;
  title: string;
  content: string;
  certificate_type: string;
  issue_date: string;
  valid_until: string | null;
  signed_at: string | null;
  issued_by_name: string;
  patient_name: string;
  patient_university_id: string;
  verification_code?: string;
}

export async function generateCertificatePDF(
  certificateId: string
): Promise<{ data: Uint8Array | null; error: string | null; filename: string }> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated", filename: "" };

  const callerRole = user.user_metadata?.role as string | undefined;
  if (!callerRole || !["superadmin", "nurse", "doctor", "dentist", "staff"].includes(callerRole)) {
    return { data: null, error: "Insufficient permissions", filename: "" };
  }

  const { data: cert, error: certError } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", certificateId)
    .single();

  if (certError || !cert) {
    return { data: null, error: certError?.message ?? "Certificate not found", filename: "" };
  }

  const { data: issuer } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", cert.issued_by)
    .single();

  const { data: patient } = await supabase
    .from("patient_profiles")
    .select("first_name, last_name, university_id")
    .eq("id", cert.patient_id)
    .single();

  const { data: verification } = await supabase
    .from("document_verifications" as never)
    .select("verification_code")
    .eq("document_id", certificateId)
    .eq("document_type", "certificate")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const certData: CertificateData = {
    certificate_number: cert.certificate_number,
    title: cert.title,
    content: cert.content,
    certificate_type: cert.certificate_type,
    issue_date: cert.issue_date,
    valid_until: cert.valid_until,
    signed_at: cert.signed_at,
    issued_by_name: issuer?.full_name ?? "Unknown",
    patient_name: patient ? `${patient.first_name} ${patient.last_name}` : "Unknown",
    patient_university_id: patient?.university_id ?? "N/A",
    verification_code: (verification as { verification_code: string } | null)?.verification_code,
  };

  const pdf = generatePDF(certData);
  const filename = `${cert.certificate_number}.pdf`;

  return { data: pdf, error: null, filename };
}

function generatePDF(cert: CertificateData): Uint8Array {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 25;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");

  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.rect(margin - 5, margin - 5, contentWidth + 10, 15, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text("UNIVERSITY CLINIC", pageWidth / 2, y + 4, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Integrated Medical & Dental Health Information System", pageWidth / 2, y + 10, { align: "center" });

  y += 25;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(cert.title.toUpperCase(), pageWidth / 2, y, { align: "center" });

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Certificate No: ${cert.certificate_number}`, pageWidth / 2, y, { align: "center" });

  y += 15;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);

  const contentLines = doc.splitTextToSize(cert.content, contentWidth);
  doc.text(contentLines, margin, y);
  y += contentLines.length * 6;

  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Issued to: ${cert.patient_name}`, margin, y);
  y += 6;
  doc.text(`University ID: ${cert.patient_university_id}`, margin, y);
  y += 6;
  doc.text(`Issue Date: ${new Date(cert.issue_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, margin, y);
  y += 6;
  if (cert.valid_until) {
    doc.text(`Valid Until: ${new Date(cert.valid_until).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, margin, y);
    y += 6;
  }

  y += 15;

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + 60, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(cert.issued_by_name, margin, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Authorized Signatory", margin, y + 10);

  if (cert.signed_at) {
    doc.text(`Signed: ${new Date(cert.signed_at).toLocaleDateString()}`, margin, y + 15);
  }

  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  if (cert.verification_code) {
    doc.text(`Verification Code: ${cert.verification_code}`, margin, footerY);
    doc.text(`Verify at: /verify`, pageWidth - margin, footerY, { align: "right" });
  }
  doc.text("This is a system-generated document.", pageWidth / 2, footerY + 5, { align: "center" });

  return new Uint8Array(doc.output("arraybuffer"));
}
