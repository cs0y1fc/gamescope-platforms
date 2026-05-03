'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'

type Props = {
  onClose: () => void
  onAuth: (email: string) => void
}

export default function AuthModal({ onClose, onAuth }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const sb = createClient()

  // Animate in — start from scale(0.96)+opacity:0
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    emailRef.current?.focus()
  }, [])

  const close = () => {
    setVisible(false)
    setTimeout(onClose, 200)
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
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: visible ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(8px)' : 'blur(0px)',
        transition: 'background 200ms ease, backdrop-filter 200ms ease',
      }}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      {/* Panel — scale(0.96)+opacity:0 → scale(1)+opacity:1 */}
      <div
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f0f1a] shadow-2xl shadow-black/50"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(8px)',
          transition: 'opacity 200ms cubic-bezier(0.23,1,0.32,1), transform 200ms cubic-bezier(0.23,1,0.32,1)',
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
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-[transform,background-color,opacity] duration-150 active:scale-[0.98]"
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
