import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

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