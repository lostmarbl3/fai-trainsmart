export { supabase } from '@/integrations/supabase/client'
export type { Database } from '@/integrations/supabase/types'

export type UserRole = 'trainer' | 'client' | 'solo'

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  role: UserRole
  trainer_id?: string
  subscription_tier?: string
  subscription_status?: string
  stripe_customer_id?: string
  client_limit?: number
  created_at: string
  updated_at: string
}