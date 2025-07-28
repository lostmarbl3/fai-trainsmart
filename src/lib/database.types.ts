export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'trainer' | 'client' | 'solo'
          trainer_id: string | null
          subscription_tier: string | null
          subscription_status: string | null
          stripe_customer_id: string | null
          client_limit: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'trainer' | 'client' | 'solo'
          trainer_id?: string | null
          subscription_tier?: string | null
          subscription_status?: string | null
          stripe_customer_id?: string | null
          client_limit?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'trainer' | 'client' | 'solo'
          trainer_id?: string | null
          subscription_tier?: string | null
          subscription_status?: string | null
          stripe_customer_id?: string | null
          client_limit?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          trainer_id: string
          client_id: string
          status: string | null
          billing_schedule: string | null
          billing_amount: number | null
          days_past_due_limit: number | null
          requires_waiver: boolean | null
          waiver_signed_at: string | null
          requires_health_questionnaire: boolean | null
          health_questionnaire_completed_at: string | null
          trainer_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trainer_id: string
          client_id: string
          status?: string | null
          billing_schedule?: string | null
          billing_amount?: number | null
          days_past_due_limit?: number | null
          requires_waiver?: boolean | null
          waiver_signed_at?: string | null
          requires_health_questionnaire?: boolean | null
          health_questionnaire_completed_at?: string | null
          trainer_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trainer_id?: string
          client_id?: string
          status?: string | null
          billing_schedule?: string | null
          billing_amount?: number | null
          days_past_due_limit?: number | null
          requires_waiver?: boolean | null
          waiver_signed_at?: string | null
          requires_health_questionnaire?: boolean | null
          health_questionnaire_completed_at?: string | null
          trainer_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          creator_id: string
          title: string
          description: string | null
          is_template: boolean | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          description?: string | null
          is_template?: boolean | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string | null
          is_template?: boolean | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'trainer' | 'client' | 'solo'
    }
  }
}