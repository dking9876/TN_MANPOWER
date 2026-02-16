export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    __InternalSupabase: {
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            alerts: {
                Row: {
                    alert_message: string
                    alert_type: Database["public"]["Enums"]["alert_type"]
                    assigned_to: string
                    candidate_id: string
                    created_at: string
                    document_type: Database["public"]["Enums"]["document_type"] | null
                    id: string
                    is_acknowledged: boolean
                    is_resolved: boolean
                    resolution_notes: string | null
                    resolved_at: string | null
                }
                Insert: {
                    alert_message: string
                    alert_type: Database["public"]["Enums"]["alert_type"]
                    assigned_to: string
                    candidate_id: string
                    created_at?: string
                    document_type?: Database["public"]["Enums"]["document_type"] | null
                    id?: string
                    is_acknowledged?: boolean
                    is_resolved?: boolean
                    resolution_notes?: string | null
                    resolved_at?: string | null
                }
                Update: {
                    alert_message?: string
                    alert_type?: Database["public"]["Enums"]["alert_type"]
                    assigned_to?: string
                    candidate_id?: string
                    created_at?: string
                    document_type?: Database["public"]["Enums"]["document_type"] | null
                    id?: string
                    is_acknowledged?: boolean
                    is_resolved?: boolean
                    resolution_notes?: string | null
                    resolved_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "alerts_assigned_to_fkey"
                        columns: ["assigned_to"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "alerts_candidate_id_fkey"
                        columns: ["candidate_id"]
                        isOneToOne: false
                        referencedRelation: "candidates"
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
            candidates: {
                Row: {
                    allergies: string | null
                    countries_visited: string[] | null
                    created_at: string
                    created_by: string
                    date_of_birth: string
                    email: string | null
                    emergency_phone: string
                    english_level: Database["public"]["Enums"]["english_level"]
                    first_name: string
                    has_visited_other: boolean
                    height: number | null
                    id: string
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
                    recruitment_status: Database["public"]["Enums"]["recruitment_status"]
                    shoe_size: string | null
                    weight: number | null
                }
                Insert: {
                    allergies?: string | null
                    countries_visited?: string[] | null
                    created_at?: string
                    created_by: string
                    date_of_birth: string
                    email?: string | null
                    emergency_phone: string
                    english_level: Database["public"]["Enums"]["english_level"]
                    first_name: string
                    has_visited_other?: boolean
                    height?: number | null
                    id?: string
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
                    recruitment_status?: Database["public"]["Enums"]["recruitment_status"]
                    shoe_size?: string | null
                    weight?: number | null
                }
                Update: {
                    allergies?: string | null
                    countries_visited?: string[] | null
                    created_at?: string
                    created_by?: string
                    date_of_birth?: string
                    email?: string | null
                    emergency_phone?: string
                    english_level?: Database["public"]["Enums"]["english_level"]
                    first_name?: string
                    has_visited_other?: boolean
                    height?: number | null
                    id?: string
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
                    recruitment_status?: Database["public"]["Enums"]["recruitment_status"]
                    shoe_size?: string | null
                    weight?: number | null
                }
                Relationships: [
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
                ]
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
        }
        Enums: {
            alert_type: "STALENESS" | "DOCUMENT_EXPIRATION"
            audit_action: "CREATE" | "UPDATE" | "DELETE" | "STATUS_CHANGE"
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
            user_role: "ADMIN" | "RECRUITER"
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
