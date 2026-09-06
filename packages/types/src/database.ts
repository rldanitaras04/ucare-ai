export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Enums: {
      affiliation_type: "student" | "faculty" | "staff";
      duty_status: "available" | "unavailable" | "seminar" | "training" | "official_activity" | "on_leave";
      encounter_status: "in_progress" | "completed";
      encounter_type: "medical" | "nursing" | "dental";
      medication_frequency: "once_daily" | "twice_daily" | "three_times_daily" | "four_times_daily" | "every_4_hours" | "every_6_hours" | "every_8_hours" | "every_12_hours" | "as_needed" | "at_bedtime" | "with_meals" | "other";
      medication_route: "oral" | "topical" | "intravenous" | "intramuscular" | "subcutaneous" | "inhalation" | "rectal" | "ophthalmic" | "otic" | "nasal" | "sublingual" | "transdermal" | "other";
      clearance_type: "admission" | "annual" | "internship" | "sports" | "graduation" | "employee" | "other";
      clearance_status: "pending" | "in_review" | "requires_action" | "approved" | "denied" | "expired" | "cancelled";
      odontogram_condition: "sound" | "caries" | "restored" | "missing" | "crown" | "extraction_indicated";
      odontogram_surface: "mesial" | "distal" | "occlusal" | "buccal" | "lingual" | "whole";
      prescription_status: "draft" | "signed" | "issued" | "dispensed" | "completed" | "cancelled";
      prescription_type: "medical" | "dental";
      priority_level: "emergency" | "urgent" | "priority" | "normal";
      provider_request_status: "pending" | "for_coordination" | "confirmed" | "served" | "cancelled";
      provider_session_status: "planned" | "confirmed" | "active" | "completed" | "cancelled";
      provider_type: "doctor" | "dentist";
      queue_status: "waiting" | "called" | "in_session" | "served" | "skipped";
      request_urgency: "normal" | "urgent" | "emergency";
      service_type: "medical" | "dental" | "nursing" | "clearance";
      session_type: "monthly_visit" | "case_based" | "emergency";
      visit_status: "registered" | "triaged" | "waiting_provider" | "in_consultation" | "completed" | "cancelled";
      nursing_assessment_type: "triage" | "initial" | "ongoing" | "focused" | "emergency";
      administration_route: "oral" | "topical" | "intravenous" | "intramuscular" | "subcutaneous" | "inhalation" | "rectal" | "ophthalmic" | "otic" | "nasal" | "sublingual" | "transdermal" | "other";
      inventory_category: "medicine" | "medical_supply" | "dental_supply" | "other";
      stock_movement_type: "stock_in" | "stock_out" | "dispensing" | "adjustment" | "return" | "expired" | "damaged";
      certificate_type: "medical" | "dental" | "referral" | "treatment_summary" | "other";
      certificate_status: "draft" | "issued" | "cancelled";
      notification_type: "queue_update" | "prescription_ready" | "clearance_status" | "provider_request" | "system_alert" | "break_glass_alert";
    };
    Functions: {
      generate_prescription_number: {
        Args: Record<string, never>;
        Returns: string;
      };
      generate_clearance_number: {
        Args: Record<string, never>;
        Returns: string;
      };
      generate_certificate_number: {
        Args: Record<string, never>;
        Returns: string;
      };
      create_notification: {
        Args: {
          p_user_id: string;
          p_title: string;
          p_message: string;
          p_type?: Database["public"]["Enums"]["notification_type"];
          p_link_url?: string | null;
        };
        Returns: string;
      };
      mark_all_notifications_read: {
        Args: Record<string, never>;
        Returns: void;
      };
      record_break_glass_access: {
        Args: {
          p_patient_id: string;
          p_reason: string;
          p_ip_address?: string | null;
        };
        Returns: string;
      };
      log_audit_event: {
        Args: {
          p_user_id: string | null;
          p_action: string;
          p_resource: string;
          p_resource_id: string | null;
          p_details: string | null;
          p_ip_address: string | null;
        };
        Returns: string;
      };
      user_has_role: {
        Args: {
          target_role: string;
        };
        Returns: boolean;
      };
    };
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          created_at: string;
          details: Json | null;
          id: string;
          ip_address: string | null;
          resource: string;
          resource_id: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          details?: Json | null;
          id?: string;
          ip_address?: string | null;
          resource: string;
          resource_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          details?: Json | null;
          id?: string;
          ip_address?: string | null;
          resource?: string;
          resource_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      patient_profiles: {
        Row: {
          affiliation: Database["public"]["Enums"]["affiliation_type"] | null;
          allergies: string[];
          blood_type: string | null;
          chronic_conditions: string[];
          college_unit: string | null;
          contact_number: string | null;
          created_at: string;
          date_of_birth: string | null;
          emergency_contact_name: string | null;
          emergency_contact_number: string | null;
          first_name: string;
          id: string;
          last_name: string;
          middle_name: string | null;
          sex: string | null;
          student_employee_no: string | null;
          university_id: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          affiliation?: Database["public"]["Enums"]["affiliation_type"] | null;
          allergies?: string[];
          blood_type?: string | null;
          chronic_conditions?: string[];
          college_unit?: string | null;
          contact_number?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_number?: string | null;
          first_name: string;
          id?: string;
          last_name: string;
          middle_name?: string | null;
          sex?: string | null;
          student_employee_no?: string | null;
          university_id: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          affiliation?: Database["public"]["Enums"]["affiliation_type"] | null;
          allergies?: string[];
          blood_type?: string | null;
          chronic_conditions?: string[];
          college_unit?: string | null;
          contact_number?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_number?: string | null;
          first_name?: string;
          id?: string;
          last_name?: string;
          middle_name?: string | null;
          sex?: string | null;
          student_employee_no?: string | null;
          university_id?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "patient_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      permissions: {
        Row: {
          action: string;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          resource: string;
        };
        Insert: {
          action: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          resource: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          resource?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          role: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          role?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      queue_entries: {
        Row: {
          called_at: string | null;
          created_at: string;
          id: string;
          priority: Database["public"]["Enums"]["priority_level"];
          queue_number: string;
          room_station: string | null;
          served_at: string | null;
          service_category: Database["public"]["Enums"]["service_type"];
          status: Database["public"]["Enums"]["queue_status"];
          visit_id: string;
        };
        Insert: {
          called_at?: string | null;
          created_at?: string;
          id?: string;
          priority?: Database["public"]["Enums"]["priority_level"];
          queue_number: string;
          room_station?: string | null;
          served_at?: string | null;
          service_category: Database["public"]["Enums"]["service_type"];
          status?: Database["public"]["Enums"]["queue_status"];
          visit_id: string;
        };
        Update: {
          called_at?: string | null;
          created_at?: string;
          id?: string;
          priority?: Database["public"]["Enums"]["priority_level"];
          queue_number?: string;
          room_station?: string | null;
          served_at?: string | null;
          service_category?: Database["public"]["Enums"]["service_type"];
          status?: Database["public"]["Enums"]["queue_status"];
          visit_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "queue_entries_visit_id_fkey";
            columns: ["visit_id"];
            isOneToOne: false;
            referencedRelation: "walk_in_visits";
            referencedColumns: ["id"];
          },
        ];
      };
      role_permissions: {
        Row: {
          created_at: string;
          permission_id: string;
          role_id: string;
        };
        Insert: {
          created_at?: string;
          permission_id: string;
          role_id: string;
        };
        Update: {
          created_at?: string;
          permission_id?: string;
          role_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
        ];
      };
      roles: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      staff_availability: {
        Row: {
          authorized_by: string | null;
          created_at: string;
          duty_status: Database["public"]["Enums"]["duty_status"];
          end_time: string | null;
          id: string;
          notes: string | null;
          staff_profile_id: string;
          start_time: string | null;
        };
        Insert: {
          authorized_by?: string | null;
          created_at?: string;
          duty_status?: Database["public"]["Enums"]["duty_status"];
          end_time?: string | null;
          id?: string;
          notes?: string | null;
          staff_profile_id: string;
          start_time?: string | null;
        };
        Update: {
          authorized_by?: string | null;
          created_at?: string;
          duty_status?: Database["public"]["Enums"]["duty_status"];
          end_time?: string | null;
          id?: string;
          notes?: string | null;
          staff_profile_id?: string;
          start_time?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "staff_availability_authorized_by_fkey";
            columns: ["authorized_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "staff_availability_staff_profile_id_fkey";
            columns: ["staff_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      triage_records: {
        Row: {
          chief_complaint: string | null;
          created_at: string;
          diastolic_bp: number | null;
          fallback_reason: string | null;
          heart_rate_bpm: number | null;
          id: string;
          is_fallback: boolean;
          pain_score: number | null;
          priority: Database["public"]["Enums"]["priority_level"];
          red_flags: string[];
          resp_rate_cpm: number | null;
          spo2_percent: number | null;
          systolic_bp: number | null;
          temperature_c: number | null;
          triage_notes: string | null;
          triaged_by: string;
          visit_id: string;
        };
        Insert: {
          chief_complaint?: string | null;
          created_at?: string;
          diastolic_bp?: number | null;
          fallback_reason?: string | null;
          heart_rate_bpm?: number | null;
          id?: string;
          is_fallback?: boolean;
          pain_score?: number | null;
          priority?: Database["public"]["Enums"]["priority_level"];
          red_flags?: string[];
          resp_rate_cpm?: number | null;
          spo2_percent?: number | null;
          systolic_bp?: number | null;
          temperature_c?: number | null;
          triage_notes?: string | null;
          triaged_by: string;
          visit_id: string;
        };
        Update: {
          chief_complaint?: string | null;
          created_at?: string;
          diastolic_bp?: number | null;
          fallback_reason?: string | null;
          heart_rate_bpm?: number | null;
          id?: string;
          is_fallback?: boolean;
          pain_score?: number | null;
          priority?: Database["public"]["Enums"]["priority_level"];
          red_flags?: string[];
          resp_rate_cpm?: number | null;
          spo2_percent?: number | null;
          systolic_bp?: number | null;
          temperature_c?: number | null;
          triage_notes?: string | null;
          triaged_by?: string;
          visit_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "triage_records_triaged_by_fkey";
            columns: ["triaged_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "triage_records_visit_id_fkey";
            columns: ["visit_id"];
            isOneToOne: false;
            referencedRelation: "walk_in_visits";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          role_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          role_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          role_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      walk_in_visits: {
        Row: {
          created_at: string;
          id: string;
          patient_id: string;
          reason_for_visit: string | null;
          service_type: Database["public"]["Enums"]["service_type"];
          status: Database["public"]["Enums"]["visit_status"];
          updated_at: string;
          visit_date: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          patient_id: string;
          reason_for_visit?: string | null;
          service_type: Database["public"]["Enums"]["service_type"];
          status?: Database["public"]["Enums"]["visit_status"];
          updated_at?: string;
          visit_date?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          patient_id?: string;
          reason_for_visit?: string | null;
          service_type?: Database["public"]["Enums"]["service_type"];
          status?: Database["public"]["Enums"]["visit_status"];
          updated_at?: string;
          visit_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: "walk_in_visits_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patient_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      provider_sessions: {
        Row: {
          created_at: string;
          end_time: string | null;
          id: string;
          provider_profile_id: string;
          provider_type: Database["public"]["Enums"]["provider_type"];
          session_date: string;
          session_type: Database["public"]["Enums"]["session_type"];
          start_time: string;
          status: Database["public"]["Enums"]["provider_session_status"];
        };
        Insert: {
          created_at?: string;
          end_time?: string | null;
          id?: string;
          provider_profile_id: string;
          provider_type: Database["public"]["Enums"]["provider_type"];
          session_date?: string;
          session_type: Database["public"]["Enums"]["session_type"];
          start_time?: string;
          status?: Database["public"]["Enums"]["provider_session_status"];
        };
        Update: {
          created_at?: string;
          end_time?: string | null;
          id?: string;
          provider_profile_id?: string;
          provider_type?: Database["public"]["Enums"]["provider_type"];
          session_date?: string;
          session_type?: Database["public"]["Enums"]["session_type"];
          start_time?: string;
          status?: Database["public"]["Enums"]["provider_session_status"];
        };
        Relationships: [
          {
            foreignKeyName: "provider_sessions_provider_profile_id_fkey";
            columns: ["provider_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      provider_requests: {
        Row: {
          created_at: string;
          id: string;
          patient_id: string;
          provider_type: Database["public"]["Enums"]["provider_type"];
          reason: string | null;
          requested_by: string;
          status: Database["public"]["Enums"]["provider_request_status"];
          urgency: Database["public"]["Enums"]["request_urgency"];
          visit_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          patient_id: string;
          provider_type: Database["public"]["Enums"]["provider_type"];
          reason?: string | null;
          requested_by: string;
          status?: Database["public"]["Enums"]["provider_request_status"];
          urgency?: Database["public"]["Enums"]["request_urgency"];
          visit_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          patient_id?: string;
          provider_type?: Database["public"]["Enums"]["provider_type"];
          reason?: string | null;
          requested_by?: string;
          status?: Database["public"]["Enums"]["provider_request_status"];
          urgency?: Database["public"]["Enums"]["request_urgency"];
          visit_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "provider_requests_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patient_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "provider_requests_requested_by_fkey";
            columns: ["requested_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "provider_requests_visit_id_fkey";
            columns: ["visit_id"];
            isOneToOne: false;
            referencedRelation: "walk_in_visits";
            referencedColumns: ["id"];
          },
        ];
      };
      clinical_encounters: {
        Row: {
          assessment: string | null;
          completed_at: string | null;
          created_at: string;
          diagnosis_codes: string[];
          encounter_type: Database["public"]["Enums"]["encounter_type"];
          id: string;
          notes: string | null;
          objective: string | null;
          patient_id: string;
          plan: string | null;
          provider_id: string;
          session_id: string | null;
          started_at: string;
          status: Database["public"]["Enums"]["encounter_status"];
          subjective: string | null;
          visit_id: string;
        };
        Insert: {
          assessment?: string | null;
          completed_at?: string | null;
          created_at?: string;
          diagnosis_codes?: string[];
          encounter_type: Database["public"]["Enums"]["encounter_type"];
          id?: string;
          notes?: string | null;
          objective?: string | null;
          patient_id: string;
          plan?: string | null;
          provider_id: string;
          session_id?: string | null;
          started_at?: string;
          status?: Database["public"]["Enums"]["encounter_status"];
          subjective?: string | null;
          visit_id: string;
        };
        Update: {
          assessment?: string | null;
          completed_at?: string | null;
          created_at?: string;
          diagnosis_codes?: string[];
          encounter_type?: Database["public"]["Enums"]["encounter_type"];
          id?: string;
          notes?: string | null;
          objective?: string | null;
          patient_id?: string;
          plan?: string | null;
          provider_id?: string;
          session_id?: string | null;
          started_at?: string;
          status?: Database["public"]["Enums"]["encounter_status"];
          subjective?: string | null;
          visit_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clinical_encounters_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patient_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clinical_encounters_provider_id_fkey";
            columns: ["provider_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clinical_encounters_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "provider_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clinical_encounters_visit_id_fkey";
            columns: ["visit_id"];
            isOneToOne: false;
            referencedRelation: "walk_in_visits";
            referencedColumns: ["id"];
          },
        ];
      };
      dental_encounters: {
        Row: {
          created_at: string;
          diagnosis: string | null;
          dentist_id: string;
          examination_notes: string | null;
          id: string;
          patient_id: string;
          status: Database["public"]["Enums"]["encounter_status"];
          treatment_plan: string | null;
          visit_id: string;
        };
        Insert: {
          created_at?: string;
          diagnosis?: string | null;
          dentist_id: string;
          examination_notes?: string | null;
          id?: string;
          patient_id: string;
          status?: Database["public"]["Enums"]["encounter_status"];
          treatment_plan?: string | null;
          visit_id: string;
        };
        Update: {
          created_at?: string;
          diagnosis?: string | null;
          dentist_id?: string;
          examination_notes?: string | null;
          id?: string;
          patient_id?: string;
          status?: Database["public"]["Enums"]["encounter_status"];
          treatment_plan?: string | null;
          visit_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dental_encounters_dentist_id_fkey";
            columns: ["dentist_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dental_encounters_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patient_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dental_encounters_visit_id_fkey";
            columns: ["visit_id"];
            isOneToOne: false;
            referencedRelation: "walk_in_visits";
            referencedColumns: ["id"];
          },
        ];
      };
      odontogram_entries: {
        Row: {
          condition: Database["public"]["Enums"]["odontogram_condition"];
          created_at: string;
          dental_encounter_id: string;
          id: string;
          notes: string | null;
          patient_id: string;
          procedure_performed: string | null;
          surface: Database["public"]["Enums"]["odontogram_surface"];
          tooth_number: number;
          updated_at: string;
        };
        Insert: {
          condition?: Database["public"]["Enums"]["odontogram_condition"];
          created_at?: string;
          dental_encounter_id: string;
          id?: string;
          notes?: string | null;
          patient_id: string;
          procedure_performed?: string | null;
          surface: Database["public"]["Enums"]["odontogram_surface"];
          tooth_number: number;
          updated_at?: string;
        };
        Update: {
          condition?: Database["public"]["Enums"]["odontogram_condition"];
          created_at?: string;
          dental_encounter_id?: string;
          id?: string;
          notes?: string | null;
          patient_id?: string;
          procedure_performed?: string | null;
          surface?: Database["public"]["Enums"]["odontogram_surface"];
          tooth_number?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "odontogram_entries_dental_encounter_id_fkey";
            columns: ["dental_encounter_id"];
            isOneToOne: false;
            referencedRelation: "dental_encounters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "odontogram_entries_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patient_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      prescriptions: {
        Row: {
          cancellation_reason: string | null;
          created_at: string;
          date_completed: string | null;
          date_dispensed: string | null;
          date_issued: string | null;
          date_prescribed: string;
          dose: string;
          dose_unit: string | null;
          duration_days: number | null;
          encounter_id: string | null;
          frequency: Database["public"]["Enums"]["medication_frequency"];
          frequency_custom: string | null;
          id: string;
          instructions: string | null;
          medication_name: string;
          medication_strength: string | null;
          patient_id: string;
          prescriber_id: string;
          prescription_number: string;
          prescription_type: Database["public"]["Enums"]["prescription_type"];
          quantity: number | null;
          route: Database["public"]["Enums"]["medication_route"];
          signed_at: string | null;
          signed_by: string | null;
          status: Database["public"]["Enums"]["prescription_status"];
          updated_at: string;
        };
        Insert: {
          cancellation_reason?: string | null;
          created_at?: string;
          date_completed?: string | null;
          date_dispensed?: string | null;
          date_issued?: string | null;
          date_prescribed?: string;
          dose: string;
          dose_unit?: string | null;
          duration_days?: number | null;
          encounter_id?: string | null;
          frequency?: Database["public"]["Enums"]["medication_frequency"];
          frequency_custom?: string | null;
          id?: string;
          instructions?: string | null;
          medication_name: string;
          medication_strength?: string | null;
          patient_id: string;
          prescriber_id: string;
          prescription_number: string;
          prescription_type?: Database["public"]["Enums"]["prescription_type"];
          quantity?: number | null;
          route?: Database["public"]["Enums"]["medication_route"];
          signed_at?: string | null;
          signed_by?: string | null;
          status?: Database["public"]["Enums"]["prescription_status"];
          updated_at?: string;
        };
        Update: {
          cancellation_reason?: string | null;
          created_at?: string;
          date_completed?: string | null;
          date_dispensed?: string | null;
          date_issued?: string | null;
          date_prescribed?: string;
          dose?: string;
          dose_unit?: string | null;
          duration_days?: number | null;
          encounter_id?: string | null;
          frequency?: Database["public"]["Enums"]["medication_frequency"];
          frequency_custom?: string | null;
          id?: string;
          instructions?: string | null;
          medication_name?: string;
          medication_strength?: string | null;
          patient_id?: string;
          prescriber_id?: string;
          prescription_number?: string;
          prescription_type?: Database["public"]["Enums"]["prescription_type"];
          quantity?: number | null;
          route?: Database["public"]["Enums"]["medication_route"];
          signed_at?: string | null;
          signed_by?: string | null;
          status?: Database["public"]["Enums"]["prescription_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prescriptions_encounter_id_fkey";
            columns: ["encounter_id"];
            isOneToOne: false;
            referencedRelation: "clinical_encounters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patient_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prescriptions_prescriber_id_fkey";
            columns: ["prescriber_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prescriptions_signed_by_fkey";
            columns: ["signed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      health_clearances: {
        Row: {
          approval_date: string | null;
          approved_by: string | null;
          assessed_by: string | null;
          assessment_notes: string | null;
          clearance_number: string;
          clearance_type: Database["public"]["Enums"]["clearance_type"];
          created_at: string;
          denial_reason: string | null;
          encounter_id: string | null;
          id: string;
          patient_id: string;
          purpose: string | null;
          requirements: Json;
          status: Database["public"]["Enums"]["clearance_status"];
          updated_at: string;
          valid_from: string;
          valid_until: string | null;
        };
        Insert: {
          approval_date?: string | null;
          approved_by?: string | null;
          assessed_by?: string | null;
          assessment_notes?: string | null;
          clearance_number: string;
          clearance_type: Database["public"]["Enums"]["clearance_type"];
          created_at?: string;
          denial_reason?: string | null;
          encounter_id?: string | null;
          id?: string;
          patient_id: string;
          purpose?: string | null;
          requirements?: Json;
          status?: Database["public"]["Enums"]["clearance_status"];
          updated_at?: string;
          valid_from?: string;
          valid_until?: string | null;
        };
        Update: {
          approval_date?: string | null;
          approved_by?: string | null;
          assessed_by?: string | null;
          assessment_notes?: string | null;
          clearance_number?: string;
          clearance_type?: Database["public"]["Enums"]["clearance_type"];
          created_at?: string;
          denial_reason?: string | null;
          encounter_id?: string | null;
          id?: string;
          patient_id?: string;
          purpose?: string | null;
          requirements?: Json;
          status?: Database["public"]["Enums"]["clearance_status"];
          updated_at?: string;
          valid_from?: string;
          valid_until?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "health_clearances_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "health_clearances_assessed_by_fkey";
            columns: ["assessed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "health_clearances_encounter_id_fkey";
            columns: ["encounter_id"];
            isOneToOne: false;
            referencedRelation: "clinical_encounters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "health_clearances_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patient_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      vital_signs: {
        Row: {
          id: string;
          encounter_id: string;
          patient_id: string;
          recorded_by: string;
          temperature_c: number | null;
          systolic_bp: number | null;
          diastolic_bp: number | null;
          heart_rate_bpm: number | null;
          resp_rate_cpm: number | null;
          spo2_percent: number | null;
          pain_score: number | null;
          weight_kg: number | null;
          height_cm: number | null;
          recorded_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          encounter_id: string;
          patient_id: string;
          recorded_by: string;
          temperature_c?: number | null;
          systolic_bp?: number | null;
          diastolic_bp?: number | null;
          heart_rate_bpm?: number | null;
          resp_rate_cpm?: number | null;
          spo2_percent?: number | null;
          pain_score?: number | null;
          weight_kg?: number | null;
          height_cm?: number | null;
          recorded_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          encounter_id?: string;
          patient_id?: string;
          recorded_by?: string;
          temperature_c?: number | null;
          systolic_bp?: number | null;
          diastolic_bp?: number | null;
          heart_rate_bpm?: number | null;
          resp_rate_cpm?: number | null;
          spo2_percent?: number | null;
          pain_score?: number | null;
          weight_kg?: number | null;
          height_cm?: number | null;
          recorded_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      nursing_assessments: {
        Row: {
          id: string;
          encounter_id: string;
          patient_id: string;
          assessed_by: string;
          assessment_type: string;
          chief_complaint: string | null;
          symptoms: string | null;
          duration: string | null;
          relevant_history: string | null;
          allergies: string | null;
          current_meds: string | null;
          observations: string | null;
          red_flags: string[];
          nursing_notes: string | null;
          is_minor_illness: boolean;
          protocol_name: string | null;
          intervention: string | null;
          disposition: string | null;
          priority: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          encounter_id: string;
          patient_id: string;
          assessed_by: string;
          assessment_type?: string;
          chief_complaint?: string | null;
          symptoms?: string | null;
          duration?: string | null;
          relevant_history?: string | null;
          allergies?: string | null;
          current_meds?: string | null;
          observations?: string | null;
          red_flags?: string[];
          nursing_notes?: string | null;
          is_minor_illness?: boolean;
          protocol_name?: string | null;
          intervention?: string | null;
          disposition?: string | null;
          priority?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          encounter_id?: string;
          patient_id?: string;
          assessed_by?: string;
          assessment_type?: string;
          chief_complaint?: string | null;
          symptoms?: string | null;
          duration?: string | null;
          relevant_history?: string | null;
          allergies?: string | null;
          current_meds?: string | null;
          observations?: string | null;
          red_flags?: string[];
          nursing_notes?: string | null;
          is_minor_illness?: boolean;
          protocol_name?: string | null;
          intervention?: string | null;
          disposition?: string | null;
          priority?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      medication_administrations: {
        Row: {
          id: string;
          patient_id: string;
          encounter_id: string | null;
          prescription_id: string | null;
          administered_by: string;
          medication_name: string;
          medication_strength: string | null;
          dose: string;
          route: string;
          administered_at: string;
          source_inventory: string | null;
          batch_number: string | null;
          quantity: number | null;
          unit: string | null;
          notes: string | null;
          adverse_reaction: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          encounter_id?: string | null;
          prescription_id?: string | null;
          administered_by: string;
          medication_name: string;
          medication_strength?: string | null;
          dose: string;
          route?: string;
          administered_at?: string;
          source_inventory?: string | null;
          batch_number?: string | null;
          quantity?: number | null;
          unit?: string | null;
          notes?: string | null;
          adverse_reaction?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          encounter_id?: string | null;
          prescription_id?: string | null;
          administered_by?: string;
          medication_name?: string;
          medication_strength?: string | null;
          dose?: string;
          route?: string;
          administered_at?: string;
          source_inventory?: string | null;
          batch_number?: string | null;
          quantity?: number | null;
          unit?: string | null;
          notes?: string | null;
          adverse_reaction?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      inventory_items: {
        Row: {
          id: string;
          name: string;
          category: string;
          unit: string;
          description: string | null;
          reorder_level: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          unit?: string;
          description?: string | null;
          reorder_level?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          unit?: string;
          description?: string | null;
          reorder_level?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stock_lots: {
        Row: {
          id: string;
          item_id: string;
          batch_number: string;
          quantity: number;
          unit_cost: number | null;
          expiry_date: string | null;
          acquisition_date: string;
          supplier: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          batch_number: string;
          quantity?: number;
          unit_cost?: number | null;
          expiry_date?: string | null;
          acquisition_date: string;
          supplier?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          batch_number?: string;
          quantity?: number;
          unit_cost?: number | null;
          expiry_date?: string | null;
          acquisition_date?: string;
          supplier?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stock_movements: {
        Row: {
          id: string;
          item_id: string;
          lot_id: string | null;
          movement_type: string;
          quantity: number;
          performed_by: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          lot_id?: string | null;
          movement_type: string;
          quantity: number;
          performed_by: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          lot_id?: string | null;
          movement_type?: string;
          quantity?: number;
          performed_by?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      certificates: {
        Row: {
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
          updated_at: string;
        };
        Insert: {
          id?: string;
          certificate_number: string;
          patient_id: string;
          encounter_id?: string | null;
          issued_by: string;
          certificate_type: string;
          status?: string;
          title: string;
          content: string;
          issue_date?: string;
          valid_until?: string | null;
          signed_at?: string | null;
          signed_by?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          certificate_number?: string;
          patient_id?: string;
          encounter_id?: string | null;
          issued_by?: string;
          certificate_type?: string;
          status?: string;
          title?: string;
          content?: string;
          issue_date?: string;
          valid_until?: string | null;
          signed_at?: string | null;
          signed_by?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: Database["public"]["Enums"]["notification_type"];
          is_read: boolean;
          link_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: Database["public"]["Enums"]["notification_type"];
          is_read?: boolean;
          link_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: Database["public"]["Enums"]["notification_type"];
          is_read?: boolean;
          link_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      break_glass_audit_logs: {
        Row: {
          id: string;
          provider_id: string;
          patient_id: string;
          reason: string;
          accessed_at: string;
          ip_address: string | null;
          notified: boolean;
        };
        Insert: {
          id?: string;
          provider_id: string;
          patient_id: string;
          reason: string;
          accessed_at?: string;
          ip_address?: string | null;
          notified?: boolean;
        };
        Update: {
          id?: string;
          provider_id?: string;
          patient_id?: string;
          reason?: string;
          accessed_at?: string;
          ip_address?: string | null;
          notified?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
  };
}
