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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchProfile = async (userId: string) => {
      try {
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()

        if (fetchError) {
          console.error('Error fetching profile:', fetchError)
          return
        }

        if (existingProfile && mounted) {
          setProfile(existingProfile)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!mounted) return
      
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      
      setUser(session?.user ?? null)
      
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
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
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          user_id: data.user.id,
          email: data.user.email,
          first_name: firstName || '',
          last_name: lastName || '',
          role: role
        })
      
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