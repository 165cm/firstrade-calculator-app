import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false);
      return;
    }

    // 初期セッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // サインアップ
  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabaseが設定されていません');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  // サインイン
  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabaseが設定されていません');
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  // サインアウト
  const signOut = async () => {
    if (!supabase) {
      throw new Error('Supabaseが設定されていません');
    }
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  // パスワードリセット
  const resetPassword = async (email: string) => {
    if (!supabase) {
      throw new Error('Supabaseが設定されていません');
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }
}