'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'signin' | 'signup'
  onModeChange: (mode: 'signin' | 'signup') => void
}

export function AuthModal({ isOpen, onClose, mode, onModeChange }: AuthModalProps) {
  const { signIn, signUp, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [showResetPassword, setShowResetPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('パスワードが一致しません')
          return
        }
        if (password.length < 6) {
          setError('パスワードは6文字以上で入力してください')
          return
        }

        const { error } = await signUp(email, password)
        if (error) {
          setError(error.message)
        } else {
          setMessage('確認メールを送信しました。メールをご確認ください。')
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          setError('メールアドレスまたはパスワードが正しくありません')
        } else {
          onClose()
        }
      }
    } catch (err) {
      setError('予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await resetPassword(email)
      if (error) {
        setError(error.message)
      } else {
        setMessage('パスワードリセットメールを送信しました')
        setShowResetPassword(false)
      }
    } catch (err) {
      setError('予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError(null)
    setMessage(null)
    setShowResetPassword(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleModeChange = (newMode: 'signin' | 'signup') => {
    resetForm()
    onModeChange(newMode)
  }

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title={
      showResetPassword ? 'パスワードリセット' : 
      mode === 'signin' ? 'ログイン' : '会員登録'
    }>
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {message}
          </div>
        )}

        {showResetPassword ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit" disabled={loading}>
                {loading ? '送信中...' : 'リセットメール送信'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowResetPassword(false)}
              >
                戻る
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="6文字以上"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード確認
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="パスワードを再入力"
                />
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? '処理中...' : mode === 'signin' ? 'ログイン' : '会員登録'}
            </Button>

            <div className="text-center space-y-2">
              {mode === 'signin' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(true)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    パスワードを忘れた方
                  </button>
                  <div>
                    <span className="text-sm text-gray-600">アカウントをお持ちでない方は </span>
                    <button
                      type="button"
                      onClick={() => handleModeChange('signup')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      会員登録
                    </button>
                  </div>
                </>
              ) : (
                <div>
                  <span className="text-sm text-gray-600">すでにアカウントをお持ちの方は </span>
                  <button
                    type="button"
                    onClick={() => handleModeChange('signin')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    ログイン
                  </button>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </Dialog>
  )
}