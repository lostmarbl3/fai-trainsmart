import { useEffect, useState, useRef, useCallback } from 'react'
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

  // Prevent multiple concurrent profile fetches
  const fetchingRef = useRef(false)

  const fetchProfile = useCallback(async (userId: string) => {
    if (fetchingRef.current) return
    fetchingRef.current = true

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

      if (existingProfile) {
        setProfile(existingProfile)
        return
      }

      // Create profile if it doesn't exist
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const userRole = userData.user.user_metadata?.role || 'solo'
      const firstName = userData.user.user_metadata?.first_name
      const lastName = userData.user.user_metadata?.last_name
      
      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: userData.user.id,
          email: userData.user.email!,
          role: userRole as UserRole,
          first_name: firstName,
          last_name: lastName,
        })
        .select()
        .maybeSingle()

      if (!createError && createdProfile) {
        setProfile(createdProfile)
      }
    } finally {
      fetchingRef.current = false
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true

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
  }, [fetchProfile])

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