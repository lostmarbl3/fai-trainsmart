import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

export type UserRole = 'trainer' | 'client' | 'solo'

export interface UserProfile {
  id: string
  user_id: string
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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const initializeAuth = async () => {
      console.log('Initializing auth...')
      
      // Set timeout as safety net
      timeoutId = setTimeout(() => {
        console.log('Auth timeout reached, forcing loading to false')
        setLoading(false)
      }, 10000)

      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Initial session:', session ? 'exists' : 'none')
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          console.log('No user session, setting loading to false')
          setLoading(false)
        }
      } catch (error) {
        console.error('Error during auth initialization:', error)
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session ? 'user exists' : 'no user')
      
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Clear any existing timeout
        if (timeoutId) clearTimeout(timeoutId)
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    console.log('fetchProfile called for userId:', userId)
    
    try {
      // First, try to get existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      console.log('Profile fetch result:', { data: existingProfile, error: fetchError })

      if (fetchError) {
        console.error('Error fetching profile:', fetchError)
        setLoading(false)
        return
      }

      if (existingProfile) {
        console.log('Profile found, setting profile')
        setProfile(existingProfile)
        setLoading(false)
        return
      }

      // No profile exists, create one
      console.log('No profile found, creating new profile')
      const { data: userData } = await supabase.auth.getUser()
      
      if (!userData.user) {
        console.error('No user data available for profile creation')
        setLoading(false)
        return
      }

      const newProfile = {
        user_id: userData.user.id,
        email: userData.user.email!,
        role: 'solo' as const,
      }

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .maybeSingle()

      if (createError) {
        console.error('Error creating profile:', createError)
        // If it's a duplicate key error, try fetching the existing profile
        if (createError.code === '23505') {
          console.log('Profile already exists (race condition), fetching existing profile')
          const { data: raceProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle()
          
          if (raceProfile) {
            setProfile(raceProfile)
          }
        }
      } else if (createdProfile) {
        console.log('Profile created successfully')
        setProfile(createdProfile)
      }

    } catch (error) {
      console.error('Unexpected error in fetchProfile:', error)
    } finally {
      console.log('fetchProfile completed, setting loading to false')
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, role: 'trainer' | 'solo' = 'solo') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    // Profile will be created in the auth state change handler
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