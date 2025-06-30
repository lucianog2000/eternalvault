import { User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
}

export interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>
}

// Helper to convert Supabase user to our User type
export const mapSupabaseUser = (supabaseUser: SupabaseUser, profile?: any): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email!,
  name: profile?.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.email!.split('@')[0],
  avatar_url: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url,
  created_at: profile?.created_at || supabaseUser.created_at,
  updated_at: profile?.updated_at || supabaseUser.updated_at || supabaseUser.created_at
})