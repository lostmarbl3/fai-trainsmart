export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      exercises: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          equipment: string | null
          id: string
          instructions: string | null
          is_default: boolean | null
          muscle_groups: string[] | null
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          equipment?: string | null
          id?: string
          instructions?: string | null
          is_default?: boolean | null
          muscle_groups?: string[] | null
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          equipment?: string | null
          id?: string
          instructions?: string | null
          is_default?: boolean | null
          muscle_groups?: string[] | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          client_limit: number | null
          created_at: string
          email: string
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          stripe_customer_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          trainer_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_limit?: number | null
          created_at?: string
          email: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trainer_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_limit?: number | null
          created_at?: string
          email?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trainer_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          created_at: string | null
          creator_id: string | null
          description: string | null
          duration_weeks: number | null
          id: string
          is_template: boolean | null
          program_data: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          duration_weeks?: number | null
          id?: string
          is_template?: boolean | null
          program_data?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          duration_weeks?: number | null
          id?: string
          is_template?: boolean | null
          program_data?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_clients: {
        Row: {
          billing_amount: number | null
          billing_schedule: string | null
          client_id: string | null
          created_at: string | null
          days_past_due_limit: number | null
          health_questionnaire_completed_at: string | null
          id: string
          requires_health_questionnaire: boolean | null
          requires_waiver: boolean | null
          status: string | null
          trainer_id: string | null
          trainer_notes: string | null
          updated_at: string | null
          waiver_signed_at: string | null
        }
        Insert: {
          billing_amount?: number | null
          billing_schedule?: string | null
          client_id?: string | null
          created_at?: string | null
          days_past_due_limit?: number | null
          health_questionnaire_completed_at?: string | null
          id?: string
          requires_health_questionnaire?: boolean | null
          requires_waiver?: boolean | null
          status?: string | null
          trainer_id?: string | null
          trainer_notes?: string | null
          updated_at?: string | null
          waiver_signed_at?: string | null
        }
        Update: {
          billing_amount?: number | null
          billing_schedule?: string | null
          client_id?: string | null
          created_at?: string | null
          days_past_due_limit?: number | null
          health_questionnaire_completed_at?: string | null
          id?: string
          requires_health_questionnaire?: boolean | null
          requires_waiver?: boolean | null
          status?: string | null
          trainer_id?: string | null
          trainer_notes?: string | null
          updated_at?: string | null
          waiver_signed_at?: string | null
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          feedback: string | null
          id: string
          session_data: Json | null
          user_id: string | null
          workout_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          session_data?: Json | null
          user_id?: string | null
          workout_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          session_data?: Json | null
          user_id?: string | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          feedback: string | null
          id: string
          scheduled_date: string | null
          status: string | null
          title: string
          updated_at: string | null
          workout_data: Json | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          feedback?: string | null
          id?: string
          scheduled_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          workout_data?: Json | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          feedback?: string | null
          id?: string
          scheduled_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          workout_data?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "trainer" | "client" | "solo"
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
      user_role: ["trainer", "client", "solo"],
    },
  },
} as const
