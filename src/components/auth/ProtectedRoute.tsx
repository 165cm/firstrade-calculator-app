'use client'
import { useAuth } from '@/hooks/useAuth'
import { AuthModal } from './AuthModal'
import { useState } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">読み込み中...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        {fallback || (
          <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md text-center">
            <h2 className="text-xl font-semibold mb-4">ログインが必要です</h2>
            <p className="text-gray-600 mb-6">
              この機能を利用するにはログインまたは会員登録が必要です。
            </p>
            <div className="space-x-4">
              <button
                onClick={() => {
                  setAuthMode('signin')
                  setShowAuthModal(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                ログイン
              </button>
              <button
                onClick={() => {
                  setAuthMode('signup')
                  setShowAuthModal(true)
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                会員登録
              </button>
            </div>
          </div>
        )}

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          onModeChange={setAuthMode}
        />
      </>
    )
  }

  return <>{children}</>
}