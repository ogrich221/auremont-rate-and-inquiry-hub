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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_applications: {
        Row: {
          account_type: string
          created_at: string
          currency: string
          customer_id: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string
          reference: string
          review_reason: string
          status: string
          updated_at: string
          verification_status: string
        }
        Insert: {
          account_type?: string
          created_at?: string
          currency?: string
          customer_id?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          phone?: string
          reference?: string
          review_reason?: string
          status?: string
          updated_at?: string
          verification_status?: string
        }
        Update: {
          account_type?: string
          created_at?: string
          currency?: string
          customer_id?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          reference?: string
          review_reason?: string
          status?: string
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_applications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "admin_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          new_values: Json | null
          old_values: Json | null
          reason: string
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          reason?: string
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          reason?: string
        }
        Relationships: []
      }
      admin_customers: {
        Row: {
          account_ref: string
          account_type: string
          address: string
          alternative_phone: string
          archived_at: string | null
          country: string
          created_at: string
          currency: string
          customer_ref: string
          date_of_birth: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          middle_name: string
          nationality: string
          notes: string
          opening_date: string
          phone: string
          status: string
          updated_at: string
          verification_status: string
          version: number
        }
        Insert: {
          account_ref?: string
          account_type?: string
          address?: string
          alternative_phone?: string
          archived_at?: string | null
          country?: string
          created_at?: string
          currency?: string
          customer_ref?: string
          date_of_birth?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          middle_name?: string
          nationality?: string
          notes?: string
          opening_date?: string
          phone?: string
          status?: string
          updated_at?: string
          verification_status?: string
          version?: number
        }
        Update: {
          account_ref?: string
          account_type?: string
          address?: string
          alternative_phone?: string
          archived_at?: string | null
          country?: string
          created_at?: string
          currency?: string
          customer_ref?: string
          date_of_birth?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          middle_name?: string
          nationality?: string
          notes?: string
          opening_date?: string
          phone?: string
          status?: string
          updated_at?: string
          verification_status?: string
          version?: number
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          created_at: string
          entity_id: string | null
          id: string
          read_at: string | null
          title: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          id?: string
          read_at?: string | null
          title: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          id?: string
          read_at?: string | null
          title?: string
        }
        Relationships: []
      }
      admin_preferences: {
        Row: {
          display_name: string
          security_notifications: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          display_name?: string
          security_notifications?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          display_name?: string
          security_notifications?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_transactions: {
        Row: {
          amount: number
          currency: string
          customer_id: string
          id: string
          occurred_at: string
          provider_reference: string
          reference: string
          status: string
          transaction_type: string
        }
        Insert: {
          amount: number
          currency: string
          customer_id: string
          id?: string
          occurred_at: string
          provider_reference: string
          reference: string
          status: string
          transaction_type: string
        }
        Update: {
          amount?: number
          currency?: string
          customer_id?: string
          id?: string
          occurred_at?: string
          provider_reference?: string
          reference?: string
          status?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "admin_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      administrator_registration: {
        Row: {
          email: string
          singleton: boolean
        }
        Insert: {
          email: string
          singleton?: boolean
        }
        Update: {
          email?: string
          singleton?: boolean
        }
        Relationships: []
      }
      contact_limits: {
        Row: {
          email_hash: string
          last_sent: string
        }
        Insert: {
          email_hash: string
          last_sent?: string
        }
        Update: {
          email_hash?: string
          last_sent?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          topic: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          topic: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          topic?: string
        }
        Relationships: []
      }
      customer_security_pins: {
        Row: {
          created_at: string
          failed_attempts: number
          locked_until: string | null
          pin_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          failed_attempts?: number
          locked_until?: string | null
          pin_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          failed_attempts?: number
          locked_until?: string | null
          pin_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      primary_administrator: {
        Row: {
          singleton: boolean
          user_id: string
        }
        Insert: {
          singleton?: boolean
          user_id: string
        }
        Update: {
          singleton?: boolean
          user_id?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_change_customer: {
        Args: {
          archive?: boolean
          checks_complete?: boolean
          expected_version?: number
          reason: string
          record_id: string
          target_status: string
        }
        Returns: undefined
      }
      admin_create_application: { Args: { payload: Json }; Returns: string }
      admin_mark_notifications: {
        Args: { record_id?: string }
        Returns: undefined
      }
      admin_record_access: { Args: { event?: string }; Returns: undefined }
      admin_review_application: {
        Args: {
          checks_complete?: boolean
          decision: string
          reason: string
          record_id: string
        }
        Returns: string
      }
      admin_save_customer: {
        Args: { expected_version?: number; payload: Json; record_id?: string }
        Returns: string
      }
      admin_save_preferences: {
        Args: { display_name: string; security_notifications: boolean }
        Returns: undefined
      }
      admin_summary: { Args: never; Returns: Json }
      administrator_registration_allowed: {
        Args: { candidate_email: string; confirmed: boolean }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_security_pin: { Args: never; Returns: boolean }
      is_primary_administrator: { Args: never; Returns: boolean }
      require_primary_administrator: {
        Args: { recent?: boolean }
        Returns: undefined
      }
      set_security_pin: { Args: { _pin: string }; Returns: undefined }
      verify_security_pin: { Args: { _pin: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
