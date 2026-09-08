"use server";

import { getAuthContext, hasRole } from "@/lib/auth";
import { jsPDF } from "jspdf";

interface ClearanceData {
  clearance_number: string;
  clearance_type: string;
  status: string;
  purpose: string | null;
  valid_from: string;
  valid_until: string | null;
  patient_name: string;
  patient_university_id: string;
  assessed_by_name: string;
  approval_date: string | null;
  requirements: Array<{ name: string; completed: boolean; date: string | null }> | null;
  verification_code?: string;
}

export async function generateClearancePDF(
  clearanceId: string
): Promise<{ data: Uint8Array | null; error: string | null; filename: string }> {
  const auth = await getAuthContext();
  if (!hasRole(auth, ["superadmin", "nurse", "staff", "doctor", "dentist"])) {
    return { data: null, error: "Insufficient permissions", filename: "" };
  }
  const supabase = auth.supabase;

  const { data: clearance, error: clrError } = await supabase
    .from("health_clearances")
    .select("*")
    .eq("id", clearanceId)
    .single();

  if (clrError || !clearance) {
    return { data: null, error: clrError?.message ?? "Clearance not found", filename: "" };
  }

  const { data: assessor } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", clearance.assessed_by ?? "")
    .maybeSingle();

  const { data: patient } = await supabase
    .from("patient_profiles")
    .select("first_name, last_name, university_id")
    .eq("id", clearance.patient_id)
    .single();

  const { data: verification } = await supabase
    .from("document_verifications" as never)
    .select("verification_code")
    .eq("document_id", clearanceId)
    .eq("document_type", "health_clearance")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const clrData: ClearanceData = {
    clearance_number: clearance.clearance_number,
    clearance_type: clearance.clearance_type,
    status: clearance.status,
    purpose: clearance.purpose,
    valid_from: clearance.valid_from,
    valid_until: clearance.valid_until,
    patient_name: patient ? `${patient.first_name} ${patient.last_name}` : "Unknown",
    patient_university_id: patient?.university_id ?? "N/A",
    assessed_by_name: assessor?.full_name ?? "Unknown",
    approval_date: clearance.approval_date,
    requirements: clearance.requirements as ClearanceData["requirements"],
    verification_code: (verification as { verification_code: string } | null)?.verification_code,
  };

  const pdf = generatePDF(clrData);
  const filename = `${clearance.clearance_number}.pdf`;

  return { data: pdf, error: null, filename };
}

function generatePDF(clr: ClearanceData): Uint8Array {
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

  doc.setDrawColor(34, 197, 94);
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
  doc.text("HEALTH CLEARANCE", pageWidth / 2, y, { align: "center" });

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Clearance No: ${clr.clearance_number}`, pageWidth / 2, y, { align: "center" });

  y += 15;

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);

  doc.setFont("helvetica", "bold");
  doc.text("Type:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(clr.clearance_type.replace(/_/g, " ").toUpperCase(), margin + 25, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.text("Status:", margin, y);
  doc.setFont("helvetica", "normal");
  const statusArr: [number, number, number] = clr.status === "approved" ? [34, 197, 94] : clr.status === "denied" ? [239, 68, 68] : [234, 179, 8];
  doc.setTextColor(statusArr[0], statusArr[1], statusArr[2]);
  doc.text(clr.status.toUpperCase(), margin + 25, y);
  doc.setTextColor(30, 41, 59);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.text("Patient:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(clr.patient_name, margin + 25, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.text("University ID:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(clr.patient_university_id, margin + 25, y);
  y += 7;

  if (clr.purpose) {
    doc.setFont("helvetica", "bold");
    doc.text("Purpose:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(clr.purpose, margin + 25, y);
    y += 7;
  }

  doc.setFont("helvetica", "bold");
  doc.text("Valid From:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(clr.valid_from).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), margin + 25, y);
  y += 7;

  if (clr.valid_until) {
    doc.setFont("helvetica", "bold");
    doc.text("Valid Until:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(clr.valid_until).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), margin + 25, y);
    y += 7;
  }

  if (clr.requirements && clr.requirements.length > 0) {
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Requirements", margin, y);
    y += 7;

    doc.setFontSize(9);
    for (const req of clr.requirements) {
      const checkbox = req.completed ? "[x]" : "[ ]";
      doc.setFont("helvetica", "normal");
      doc.text(`${checkbox} ${req.name}`, margin + 5, y);
      if (req.completed && req.date) {
        doc.setTextColor(100, 116, 139);
        doc.text(`(${new Date(req.date).toLocaleDateString()})`, margin + 80, y);
        doc.setTextColor(30, 41, 59);
      }
      y += 6;
    }
  }

  y += 15;

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + 60, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(clr.assessed_by_name, margin, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Assessed By", margin, y + 10);

  if (clr.approval_date) {
    doc.text(`Approved: ${new Date(clr.approval_date).toLocaleDateString()}`, margin, y + 15);
  }

  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  if (clr.verification_code) {
    doc.text(`Verification Code: ${clr.verification_code}`, margin, footerY);
    doc.text("Verify at: /verify", pageWidth - margin, footerY, { align: "right" });
  }
  doc.text("This is a system-generated document.", pageWidth / 2, footerY + 5, { align: "center" });

  return new Uint8Array(doc.output("arraybuffer"));
}
