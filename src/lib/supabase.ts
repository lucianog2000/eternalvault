import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables exist and are not placeholder values
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Validate that the URL is actually a valid URL and not a placeholder
if (supabaseUrl.includes('your_supabase_project_url') || supabaseUrl.includes('your-project-ref')) {
  throw new Error('Please replace the placeholder Supabase URL in your .env file with your actual Supabase project URL.')
}

// Validate that the anon key is not a placeholder
if (supabaseAnonKey.includes('your_supabase_anon_key') || supabaseAnonKey.includes('your-anon-key-here')) {
  throw new Error('Please replace the placeholder Supabase anon key in your .env file with your actual Supabase anon key.')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}. Please check your .env file.`)
}

// Custom storage key
const STORAGE_KEY = 'eternalvault-auth-token'

// Utility function to clear corrupted auth data
export const clearAuthStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    // Also clear any old Supabase tokens that might be causing conflicts
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.includes('supabase') || key.includes('auth-token')) {
        localStorage.removeItem(key)
      }
    })
    console.log('🧹 Cleared corrupted auth storage')
  } catch (error) {
    console.warn('Failed to clear auth storage:', error)
  }
}

// Check if auth token exists and is valid JSON
export const validateAuthStorage = (): boolean => {
  try {
    const token = localStorage.getItem(STORAGE_KEY)
    if (!token) return false
    
    const parsed = JSON.parse(token)
    return parsed && typeof parsed === 'object' && parsed.access_token
  } catch (error) {
    console.warn('Auth token is corrupted, clearing...', error)
    clearAuthStorage()
    return false
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Use a custom storage key to avoid conflicts
    storageKey: STORAGE_KEY,
    // Better storage handling for localStorage issues
    storage: {
      getItem: (key: string) => {
        try {
          const item = localStorage.getItem(key)
          // Validate the token before returning it
          if (key === STORAGE_KEY && item) {
            try {
              JSON.parse(item)
            } catch {
              console.warn('Corrupted auth token detected, clearing...')
              localStorage.removeItem(key)
              return null
            }
          }
          return item
        } catch (error) {
          console.warn('Failed to read from localStorage:', error)
          return null
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value)
        } catch (error) {
          console.warn('Failed to write to localStorage:', error)
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key)
        } catch (error) {
          console.warn('Failed to remove from localStorage:', error)
        }
      }
    }
  },
  // Add timeout to prevent hanging requests
  global: {
    headers: {
      'cache-control': 'no-cache'
    }
  }
})

// Types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
    }
  }
}