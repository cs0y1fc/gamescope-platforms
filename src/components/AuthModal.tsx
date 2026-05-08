'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { CornerPathFrame, SquareGeometry } from '@/components/ui'

type Props = {
  onClose: () => void
  onAuth: (email: string) => void
  initialError?: string | null
}

export default function AuthModal({ onClose, onAuth, initialError }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [info, setInfo] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const sb = createClient()

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    emailRef.current?.focus()
  }, [])

  const close = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)

    if (mode === 'signup') {
      const { error } = await sb.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      setInfo('CHECK YOUR EMAIL TO CONFIRM ACCOUNT.')
      setLoading(false)
      return
    }

    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    onAuth(data.user.email ?? email)
    close()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: visible ? 'rgba(8,8,8,0.85)' : 'rgba(8,8,8,0)',
        backdropFilter: visible ? 'blur(6px)' : 'blur(0px)',
        transition: 'background 200ms ease, backdrop-filter 200ms ease',
      }}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        className="w-full max-w-md relative overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border-accent)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 200ms cubic-bezier(0.23,1,0.32,1), transform 200ms cubic-bezier(0.23,1,0.32,1)',
          boxShadow: visible ? '0 0 32px var(--color-accent-dim)' : undefined,
        }}
      >
        <SquareGeometry opacity={0.15} />
        <CornerPathFrame size={16} />

        <div className="p-6 relative z-10">
          <div className="flex items-start justify-between mb-1">
            <h2
              className="cursor-blink uppercase tracking-wider"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-accent)',
                fontSize: '0.95rem',
              }}
            >
              &gt; SYSTEM ACCESS REQUEST
            </h2>
            <button
              onClick={close}
              className="text-lg leading-none transition-colors hover:text-[--color-accent]"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
              aria-label="close"
            >
              [X]
            </button>
          </div>

          <p
            className="text-xs mb-6"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            {`// ${mode === 'signin' ? 'ENTER CREDENTIALS TO PROCEED' : 'CREATE NEW ACCESS PROFILE'}`}
          </p>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="btn-retro w-full flex items-center justify-center gap-2 text-xs disabled:opacity-50 mb-4"
          >
            <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#FF6B00" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#FF6B00" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" opacity="0.7"/>
              <path fill="#FF6B00" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" opacity="0.5"/>
              <path fill="#FF6B00" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" opacity="0.85"/>
            </svg>
            [G] CONNECT WITH GOOGLE
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
            <span
              className="text-xs uppercase tracking-wider"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              {'// OR'}
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label
                className="block text-xs uppercase tracking-wider mb-1"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                &gt; EMAIL
              </label>
              <input
                ref={emailRef}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-terminal text-sm"
                placeholder="user@domain.net_"
              />
            </div>

            <div>
              <label
                className="block text-xs uppercase tracking-wider mb-1"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                &gt; PASSWORD
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-terminal text-sm"
                placeholder="••••••_"
              />
            </div>

            {error && (
              <p
                className="text-xs px-3 py-2"
                style={{
                  background: 'rgba(255,59,59,0.1)',
                  border: '1px solid var(--color-danger)',
                  color: 'var(--color-danger)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                ! ERROR :: {error}
              </p>
            )}
            {info && (
              <p
                className="text-xs px-3 py-2"
                style={{
                  background: 'rgba(0,255,159,0.05)',
                  border: '1px solid var(--color-success)',
                  color: 'var(--color-success)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                &gt; {info}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-retro btn-retro-primary w-full text-xs disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: '#000', borderTopColor: 'transparent' }}
                  />
                  PROCESSING...
                </span>
              ) : mode === 'signin' ? '[AUTHENTICATE]' : '[REGISTER]'}
            </button>
          </form>

          <p
            className="text-center text-xs mt-6"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            {mode === 'signin' ? '// NO ACCOUNT?' : '// EXISTING USER?'}{' '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setInfo(null) }}
              className="transition-colors"
              style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}
            >
              [{mode === 'signin' ? 'REGISTER' : 'SIGN IN'}]
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
