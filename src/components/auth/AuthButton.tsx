'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AuthModal } from './AuthModal'
import { useAuth } from '@/hooks/useAuth';
import { isSupabaseConfigured } from '@/lib/supabase';

export function AuthButton() {
  const { user, signOut, loading } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
    )
  }

  // Supabaseが設定されていない場合は何も表示しない
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (user) {
    return (
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-600">
          {user.email}
        </span>
        <Button variant="outline" onClick={handleSignOut}>
          ログアウト
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          onClick={() => {
            setAuthMode('signin')
            setShowModal(true)
          }}
        >
          ログイン
        </Button>
        <Button 
          onClick={() => {
            setAuthMode('signup')
            setShowModal(true)
          }}
        >
          会員登録
        </Button>
      </div>

      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  )
}