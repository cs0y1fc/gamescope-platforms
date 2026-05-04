'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'

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
      setInfo('Revisa tu email para confirmar la cuenta.')
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
        background: visible ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(12px)' : 'blur(0px)',
        transition: 'background 200ms ease, backdrop-filter 200ms ease',
      }}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        className="w-full max-w-sm rounded-2xl glass-panel shadow-2xl shadow-black/60"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(8px)',
          transition: 'opacity 200ms cubic-bezier(0.23,1,0.32,1), transform 200ms cubic-bezier(0.23,1,0.32,1)',
          boxShadow: visible ? '0 0 0 1px rgba(99,102,241,0.12), 0 32px 64px rgba(0,0,0,0.7)' : undefined,
        }}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-white font-bold text-lg">
                {mode === 'signin' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
              </h2>
              <p className="text-white/40 text-sm mt-0.5">
                {mode === 'signin' ? 'Inicia sesión para guardar tus likes' : 'Empieza a coleccionar juegos'}
              </p>
            </div>
            <button
              onClick={close}
              className="text-white/30 hover:text-white/60 transition-colors duration-150 active:scale-95 text-xl leading-none mt-1"
              style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
            >
              ×
            </button>
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-2.5 rounded-xl text-sm transition-[transform,background-color,opacity] duration-150 active:scale-[0.98] disabled:opacity-50 mb-4"
            style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continuar con Google
          </button>

          {/* Separator */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-white/25 text-xs">o</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-white/50">Email</label>
              <input
                ref={emailRef}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-[border-color,background] duration-150"
                placeholder="tu@email.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-white/50">Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-[border-color,background] duration-150"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            {error && (
              <p className="text-red-400/90 text-xs bg-red-500/8 border border-red-500/15 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {info && (
              <p className="text-emerald-400/90 text-xs bg-emerald-500/8 border border-emerald-500/15 rounded-lg px-3 py-2">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition-[transform,background-color,opacity,box-shadow] duration-150 active:scale-[0.98]"
              style={{ transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Cargando…
                </span>
              ) : mode === 'signin' ? 'Entrar' : 'Registrarse'}
            </button>
          </form>

          <p className="text-center text-xs text-white/30 mt-5">
            {mode === 'signin' ? '¿Sin cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setInfo(null) }}
              className="text-indigo-400 hover:text-indigo-300 transition-colors duration-150"
            >
              {mode === 'signin' ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
