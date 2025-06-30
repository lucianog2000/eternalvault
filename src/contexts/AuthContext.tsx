import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, validateAuthStorage, clearAuthStorage } from '../lib/supabase'
import { AuthContextType, AuthState, User, mapSupabaseUser } from '../types/auth'
import { lifeVerificationService } from '../services/lifeVerificationService'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    initialized: false
  })

  useEffect(() => {
    let mounted = true
    let initializationTimeout: NodeJS.Timeout

    // Force initialization after 5 seconds if nothing happens
    initializationTimeout = setTimeout(() => {
      if (mounted && !state.initialized) {
        console.warn('Authentication initialization timed out after 5s, forcing initialization')
        setState(prev => ({ ...prev, loading: false, initialized: true }))
      }
    }, 5000)

    const initializeAuth = async () => {
      console.log('🔐 Starting auth initialization...')
      
      // First, validate localStorage to detect corrupted tokens
      console.log('🔍 Validating auth storage...')
      const isStorageValid = validateAuthStorage()
      
      if (!isStorageValid) {
        console.log('❌ Invalid auth storage detected, skipping session check')
        if (mounted) {
          setState({ user: null, loading: false, initialized: true })
          clearTimeout(initializationTimeout)
        }
        return
      }
      
      try {
        // Try to get session from localStorage (faster, no network call)
        console.log('📋 Checking localStorage for existing session...')
        const { data: { session }, error: sessionError } = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session check timeout')), 3000)
          )
        ]) as any

        if (sessionError) {
          console.warn('❌ Session check error:', sessionError.message)
          // If session retrieval fails, clear potentially corrupted storage
          clearAuthStorage()
          if (mounted) {
            setState({ user: null, loading: false, initialized: true })
            clearTimeout(initializationTimeout)
          }
          return
        }

        if (session?.user) {
          console.log('✅ Found existing session for user:', session.user.id)
          
          // Check if session is still valid (not expired)
          const currentTime = Math.floor(Date.now() / 1000)
          if (session.expires_at && session.expires_at < currentTime) {
            console.warn('⚠️ Session expired, clearing...')
            await supabase.auth.signOut()
            if (mounted) {
              setState({ user: null, loading: false, initialized: true })
              clearTimeout(initializationTimeout)
            }
            return
          }

          try {
            const user = await getUserProfile(session.user)
            if (mounted) {
              console.log('✅ User profile loaded successfully')
              setState({ user, loading: false, initialized: true })
              clearTimeout(initializationTimeout)
              lifeVerificationService.confirmAlive()
            }
          } catch (profileError) {
            console.warn('⚠️ Profile loading failed, using basic user data:', profileError)
            if (mounted) {
              const basicUser = mapSupabaseUser(session.user)
              setState({ user: basicUser, loading: false, initialized: true })
              clearTimeout(initializationTimeout)
            }
          }
        } else {
          console.log('ℹ️ No existing session found')
          if (mounted) {
            setState({ user: null, loading: false, initialized: true })
            clearTimeout(initializationTimeout)
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        // Clear storage in case of persistent errors
        clearAuthStorage()
        if (mounted) {
          setState({ user: null, loading: false, initialized: true })
          clearTimeout(initializationTimeout)
        }
      }
    }

    // Start initialization immediately
    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.id || 'no-user')
        
        // Clear any pending timeouts since we have a state change
        if (initializationTimeout) clearTimeout(initializationTimeout)
        
        if (session?.user) {
          try {
            const user = await getUserProfile(session.user)
            if (mounted) {
              setState({ user, loading: false, initialized: true })
              if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                lifeVerificationService.confirmAlive()
              }
            }
          } catch (profileError) {
            console.warn('⚠️ Profile loading failed on auth change:', profileError)
            if (mounted) {
              const basicUser = mapSupabaseUser(session.user)
              setState({ user: basicUser, loading: false, initialized: true })
            }
          }
        } else {
          if (mounted) {
            setState({ user: null, loading: false, initialized: true })
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
      if (initializationTimeout) clearTimeout(initializationTimeout)
    }
  }, [])

  const getUserProfile = async (supabaseUser: any): Promise<User> => {
    try {
      // Quick timeout for profile fetching to prevent hanging
      const { data: profile, error } = await Promise.race([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 2000)
        )
      ]) as any

      if (error && error.code !== 'PGRST116') {
        console.warn('Profile fetch error (non-fatal):', error.message)
      }

      return mapSupabaseUser(supabaseUser, profile)
    } catch (error) {
      console.warn('Profile fetch failed, using auth data only:', error)
      return mapSupabaseUser(supabaseUser)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }))

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) {
        setState(prev => ({ ...prev, loading: false }))
        return { success: false, error: error.message }
      }

      if (data.user) {
        lifeVerificationService.confirmAlive()
      }

      setState(prev => ({ ...prev, loading: false }))
      return { success: true }
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }))
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }))

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setState(prev => ({ ...prev, loading: false }))
        return { success: false, error: error.message }
      }

      if (data.user) {
        lifeVerificationService.confirmAlive()
      }

      setState(prev => ({ ...prev, loading: false }))
      return { success: true }
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }))
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }
    }
  }

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error signing out:', error)
      }
      
      // Clear any residual storage after sign out
      clearAuthStorage()
      setState({ user: null, loading: false, initialized: true })
    } catch (error) {
      console.error('Error in signOut:', error)
      clearAuthStorage()
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!state.user) {
        return { success: false, error: 'No user logged in' }
      }

      setState(prev => ({ ...prev, loading: true }))

      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: updates.name,
          avatar_url: updates.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', state.user.id)

      if (profileError) {
        setState(prev => ({ ...prev, loading: false }))
        return { success: false, error: profileError.message }
      }

      // Update local state
      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...updates } : null,
        loading: false
      }))

      return { success: true }
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }))
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }
    }
  }

  const value: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}