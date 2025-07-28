import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase environment check:', {
  url: supabaseUrl ? 'present' : 'missing',
  key: supabaseAnonKey ? 'present' : 'missing',
  env: import.meta.env
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Available environment variables:', Object.keys(import.meta.env))
  throw new Error(`Missing Supabase environment variables. URL: ${supabaseUrl ? 'OK' : 'MISSING'}, Key: ${supabaseAnonKey ? 'OK' : 'MISSING'}`)
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