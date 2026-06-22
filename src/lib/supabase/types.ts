export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_message: string
          alert_type: Database["public"]["Enums"]["alert_type"]
          candidate_id: string
          company_id: string
          created_at: string
          document_type: Database["public"]["Enums"]["document_type"] | null
          id: string
          is_acknowledged: boolean
          is_resolved: boolean
          resolution_notes: string | null
          resolved_at: string | null
          target_user_id: string | null
        }
        Insert: {
          alert_message: string
          alert_type: Database["public"]["Enums"]["alert_type"]
          candidate_id: string
          company_id: string
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_type"] | null
          id?: string
          is_acknowledged?: boolean
          is_resolved?: boolean
          resolution_notes?: string | null
          resolved_at?: string | null
          target_user_id?: string | null
        }
        Update: {
          alert_message?: string
          alert_type?: Database["public"]["Enums"]["alert_type"]
          candidate_id?: string
          company_id?: string
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_type"] | null
          id?: string
          is_acknowledged?: boolean
          is_resolved?: boolean
          resolution_notes?: string | null
          resolved_at?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          candidate_id: string | null
          changed_fields: Json | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          timestamp: string
          user_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          candidate_id?: string | null
          changed_fields?: Json | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          timestamp?: string
          user_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          candidate_id?: string | null
          changed_fields?: Json | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      blacklisted_countries: {
        Row: {
          country_code: string
          country_name: string
          is_blacklisted: boolean
          updated_at: string
        }
        Insert: {
          country_code: string
          country_name: string
          is_blacklisted?: boolean
          updated_at?: string
        }
        Update: {
          country_code?: string
          country_name?: string
          is_blacklisted?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      candidate_documents: {
        Row: {
          candidate_id: string
          country: string | null
          created_at: string
          expiration_date: string | null
          file_name: string | null
          file_path: string | null
          file_type: string | null
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["candidate_document_status"]
          type: Database["public"]["Enums"]["candidate_document_type"]
          updated_at: string
        }
        Insert: {
          candidate_id: string
          country?: string | null
          created_at?: string
          expiration_date?: string | null
          file_name?: string | null
          file_path?: string | null
          file_type?: string | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["candidate_document_status"]
          type: Database["public"]["Enums"]["candidate_document_type"]
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          country?: string | null
          created_at?: string
          expiration_date?: string | null
          file_name?: string | null
          file_path?: string | null
          file_type?: string | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["candidate_document_status"]
          type?: Database["public"]["Enums"]["candidate_document_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_documents_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_media: {
        Row: {
          candidate_id: string
          created_at: string
          file_size: number
          file_type: string
          id: string
          original_name: string
          storage_path: string
          title: string | null
          uploaded_by: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string
          file_size: number
          file_type: string
          id?: string
          original_name: string
          storage_path: string
          title?: string | null
          uploaded_by?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string
          file_size?: number
          file_type?: string
          id?: string
          original_name?: string
          storage_path?: string
          title?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_media_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_status_history: {
        Row: {
          candidate_id: string
          changed_at: string
          changed_by: string
          id: string
          new_status: string
          old_status: string | null
        }
        Insert: {
          candidate_id: string
          changed_at?: string
          changed_by: string
          id?: string
          new_status: string
          old_status?: string | null
        }
        Update: {
          candidate_id?: string
          changed_at?: string
          changed_by?: string
          id?: string
          new_status?: string
          old_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_status_history_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          allergies: string | null
          arrival_date: string | null
          company_id: string | null
          connection_flight_date: string | null
          connection_flight_hour: string | null
          connection_flight_number: string | null
          countries_visited: string[] | null
          created_at: string
          created_by: string
          date_of_birth: string
          email: string | null
          emergency_phone: string
          english_level: Database["public"]["Enums"]["english_level"]
          first_name: string
          flight_date: string | null
          flight_hour: string | null
          flight_number: string | null
          has_visited_other: boolean
          height: number | null
          id: string
          insurance_purchase_date: string | null
          insurance_purchased: boolean | null
          interview_date: string | null
          is_blacklisted: boolean
          last_name: string
          last_updated_at: string
          last_updated_by: string
          national_id: string
          pants_size: string | null
          passport_number: string
          primary_industry: Database["public"]["Enums"]["industry"]
          primary_phone: string
          profession: string
          recruitment_status: string
          referrer_got_paid: boolean | null
          referrer_id: string | null
          shoe_size: string | null
          shirt_size: string | null
          visa_expiry_date: string | null
          visa_number: string | null
          weight: number | null
        }
        Insert: {
          allergies?: string | null
          arrival_date?: string | null
          company_id?: string | null
          connection_flight_date?: string | null
          connection_flight_hour?: string | null
          connection_flight_number?: string | null
          countries_visited?: string[] | null
          created_at?: string
          created_by: string
          date_of_birth: string
          email?: string | null
          emergency_phone: string
          english_level: Database["public"]["Enums"]["english_level"]
          first_name: string
          flight_date?: string | null
          flight_hour?: string | null
          flight_number?: string | null
          has_visited_other?: boolean
          height?: number | null
          id?: string
          insurance_purchase_date?: string | null
          insurance_purchased?: boolean | null
          interview_date?: string | null
          is_blacklisted?: boolean
          last_name: string
          last_updated_at?: string
          last_updated_by: string
          national_id: string
          pants_size?: string | null
          passport_number: string
          primary_industry: Database["public"]["Enums"]["industry"]
          primary_phone: string
          profession: string
          recruitment_status?: string
          referrer_got_paid?: boolean | null
          referrer_id?: string | null
          shoe_size?: string | null
          shirt_size?: string | null
          visa_expiry_date?: string | null
          visa_number?: string | null
          weight?: number | null
        }
        Update: {
          allergies?: string | null
          arrival_date?: string | null
          company_id?: string | null
          connection_flight_date?: string | null
          connection_flight_hour?: string | null
          connection_flight_number?: string | null
          countries_visited?: string[] | null
          created_at?: string
          created_by?: string
          date_of_birth?: string
          email?: string | null
          emergency_phone?: string
          english_level?: Database["public"]["Enums"]["english_level"]
          first_name?: string
          flight_date?: string | null
          flight_hour?: string | null
          flight_number?: string | null
          has_visited_other?: boolean
          height?: number | null
          id?: string
          insurance_purchase_date?: string | null
          insurance_purchased?: boolean | null
          interview_date?: string | null
          is_blacklisted?: boolean
          last_name?: string
          last_updated_at?: string
          last_updated_by?: string
          national_id?: string
          pants_size?: string | null
          passport_number?: string
          primary_industry?: Database["public"]["Enums"]["industry"]
          primary_phone?: string
          profession?: string
          recruitment_status?: string
          referrer_got_paid?: boolean | null
          referrer_id?: string | null
          shoe_size?: string | null
          shirt_size?: string | null
          visa_expiry_date?: string | null
          visa_number?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_recruitment_status_fkey"
            columns: ["recruitment_status"]
            isOneToOne: false
            referencedRelation: "recruitment_statuses"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "candidates_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          candidate_id: string
          document_type: Database["public"]["Enums"]["document_type"]
          expiration_date: string | null
          id: string
          is_received: boolean
          notes: string | null
          received_date: string | null
        }
        Insert: {
          candidate_id: string
          document_type: Database["public"]["Enums"]["document_type"]
          expiration_date?: string | null
          id?: string
          is_received?: boolean
          notes?: string | null
          received_date?: string | null
        }
        Update: {
          candidate_id?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          expiration_date?: string | null
          id?: string
          is_received?: boolean
          notes?: string | null
          received_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_professions: {
        Row: {
          id: string
          industry: Database["public"]["Enums"]["industry"]
          profession: string
        }
        Insert: {
          id?: string
          industry: Database["public"]["Enums"]["industry"]
          profession: string
        }
        Update: {
          id?: string
          industry?: Database["public"]["Enums"]["industry"]
          profession?: string
        }
        Relationships: []
      }
      recruiter_companies: {
        Row: {
          company_id: string
          created_at: string
          recruiter_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          recruiter_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          recruiter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruiter_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruiter_companies_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recruitment_statuses: {
        Row: {
          color: string
          created_at: string
          display_order: number
          id: string
          is_default: boolean
          label: string
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          display_order?: number
          id?: string
          is_default?: boolean
          label: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          display_order?: number
          id?: string
          is_default?: boolean
          label?: string
          name?: string
        }
        Relationships: []
      }
      system_config: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_config_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          failed_login_attempts: number
          full_name: string
          id: string
          is_active: boolean
          last_login: string | null
          locked_until: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          failed_login_attempts?: number
          full_name: string
          id: string
          is_active?: boolean
          last_login?: string | null
          locked_until?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          failed_login_attempts?: number
          full_name?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          locked_until?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_active_user: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_referrer: { Args: never; Returns: boolean }
    }
    Enums: {
      alert_type: "STALENESS" | "DOCUMENT_EXPIRATION" | "REFERRER_BONUS"
      audit_action: "CREATE" | "UPDATE" | "DELETE" | "STATUS_CHANGE"
      candidate_document_status: "PENDING" | "SUBMITTED" | "EXPIRED"
      candidate_document_type:
        | "PASSPORT_COPIES"
        | "IMMIGRATION_LETTER_COPIES"
        | "ORIGINAL_IMMIGRATION_LETTER"
        | "RED_RIBBON_DOCUMENT"
        | "VISA_APPLICATION_FORM"
        | "MEDICAL_REPORT"
        | "POLICE_REPORT"
        | "BIRTH_CERTIFICATE"
        | "GS_CERTIFICATE"
        | "PERSONAL_AFFIDAVIT"
        | "NIC_COPY_APPLICANT_AND_SPOUSE"
        | "ENGLISH_AGREEMENT"
        | "LETTER_FROM_TRANSLATOR"
        | "SINHALA_AGREEMENT"
        | "PASSPORT_COPY"
        | "IMMIGRATION_LETTER_COPY"
        | "NIC_APPLICANT_AND_CANDIDATE"
      document_type:
        | "PASSPORT"
        | "POLICE_CLEARANCE"
        | "HEALTH_DECLARATION"
        | "VISA"
      english_level: "NONE" | "BASIC" | "GOOD" | "EXCELLENT"
      industry:
        | "NURSING"
        | "CONSTRUCTION"
        | "INDUSTRY"
        | "AGRICULTURE"
        | "COMMERCE"
        | "HOSPITALITY"
        | "SERVICES"
      recruitment_status:
        | "POTENTIAL_CANDIDATE"
        | "RECRUITMENT_STARTED"
        | "DOCUMENTS_RECEIVED"
        | "SENT_TO_IVS"
        | "AWAITING_INTERVIEW"
        | "VISA_APPROVED"
        | "HEALTH_INSURANCE_PURCHASED"
        | "FLIGHT_TICKET_PURCHASED"
        | "ARRIVED_IN_ISRAEL"
        | "CANDIDATE_REJECTED"
      user_role: "ADMIN" | "RECRUITER" | "REFERRER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_type: ["STALENESS", "DOCUMENT_EXPIRATION", "REFERRER_BONUS"],
      audit_action: ["CREATE", "UPDATE", "DELETE", "STATUS_CHANGE"],
      candidate_document_status: ["PENDING", "SUBMITTED", "EXPIRED"],
      candidate_document_type: [
        "PASSPORT_COPIES",
        "IMMIGRATION_LETTER_COPIES",
        "ORIGINAL_IMMIGRATION_LETTER",
        "RED_RIBBON_DOCUMENT",
        "VISA_APPLICATION_FORM",
        "MEDICAL_REPORT",
        "POLICE_REPORT",
        "BIRTH_CERTIFICATE",
        "GS_CERTIFICATE",
        "PERSONAL_AFFIDAVIT",
        "NIC_COPY_APPLICANT_AND_SPOUSE",
        "ENGLISH_AGREEMENT",
        "LETTER_FROM_TRANSLATOR",
        "SINHALA_AGREEMENT",
        "PASSPORT_COPY",
        "IMMIGRATION_LETTER_COPY",
        "NIC_APPLICANT_AND_CANDIDATE",
      ],
      document_type: [
        "PASSPORT",
        "POLICE_CLEARANCE",
        "HEALTH_DECLARATION",
        "VISA",
      ],
      english_level: ["NONE", "BASIC", "GOOD", "EXCELLENT"],
      industry: [
        "NURSING",
        "CONSTRUCTION",
        "INDUSTRY",
        "AGRICULTURE",
        "COMMERCE",
        "HOSPITALITY",
        "SERVICES",
      ],
      recruitment_status: [
        "POTENTIAL_CANDIDATE",
        "RECRUITMENT_STARTED",
        "DOCUMENTS_RECEIVED",
        "SENT_TO_IVS",
        "AWAITING_INTERVIEW",
        "VISA_APPROVED",
        "HEALTH_INSURANCE_PURCHASED",
        "FLIGHT_TICKET_PURCHASED",
        "ARRIVED_IN_ISRAEL",
        "CANDIDATE_REJECTED",
      ],
      user_role: ["ADMIN", "RECRUITER", "REFERRER"],
    },
  },
} as const
