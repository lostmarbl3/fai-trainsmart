import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

export type UserRole = 'trainer' | 'client' | 'solo'

export interface UserProfile {
  id: string
  user_id: string
  email: string
  first_name?: string
  last_name?: string
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

// Mock user data for development - using valid UUIDs
const mockUser = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'test@trainer.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} as User

const mockProfile: UserProfile = {
  id: '00000000-0000-4000-8000-000000000002',
  user_id: '00000000-0000-4000-8000-000000000001',
  email: 'test@trainer.com',
  first_name: 'Test',
  last_name: 'Trainer',
  full_name: 'Test Trainer',
  role: 'trainer',
  client_limit: 10,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(mockUser)
  const [profile, setProfile] = useState<UserProfile | null>(mockProfile)
  const [loading, setLoading] = useState(false)

  // Mock data - no actual auth for now
  useEffect(() => {
    // Simulate loading time
    setTimeout(() => setLoading(false), 100)
  }, [])

  const signUp = async (email: string, password: string, role: UserRole = 'solo', firstName?: string, lastName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          role: role,
          first_name: firstName,
          last_name: lastName
        }
      }
    })

    if (error) throw error

    // Create profile record manually after successful auth signup
    if (data.user && !error) {
      console.log('Auth signup result:', data);
      console.log('User ID:', data.user?.id);
      console.log('Attempting profile insert...');

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,  // This should match auth.uid()
          email: email,
          role: role,
          first_name: firstName || '',
          last_name: lastName || ''
        })

      console.log('Profile insert result:', profileData);
      console.log('Profile insert error:', profileError);
      
      if (profileError) {
        console.error('Profile creation error:', profileError)
        throw new Error(`Profile creation failed: ${profileError.message}`)
      }
    }

    return data
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in')

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    setProfile(data)
    return data
  }

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }
}