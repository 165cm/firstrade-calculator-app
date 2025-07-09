import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Supabaseが設定されていない場合のフォールバック
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// 認証状態の型定義
export type AuthUser = {
  id: string
  email: string
  created_at: string
  email_confirmed_at?: string
}