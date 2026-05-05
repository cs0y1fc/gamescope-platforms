'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

type LikeRow = { rawg_id: number; game_name: string }

export default function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [likes, setLikes] = useState<LikeRow[]>([])
  const sb = createClient()

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null))
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null)
      if (!session) setLikes([])
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!userEmail) return
    fetch('/api/likes').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setLikes(data)
    })
  }, [userEmail])

  const handleSignOut = async () => {
    await sb.auth.signOut()
    setUserEmail(null)
    setLikes([])
  }

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-4 sm:py-5">
          {/* Brand */}
          <div className="shrink-0 flex items-center gap-3">
            <Link href="/" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="group flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
              <h1 className="font-display font-black text-2xl tracking-widest uppercase">
                <span className="text-gradient">Game</span>Scope
              </h1>
            </Link>
            <Link href="/" className="hidden sm:flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors ml-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7m0 0l7 7m0 0l-2 2m0 0l-7 7m0 0l-7-7" />
              </svg>
              Inicio
            </Link>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3 shrink-0">
            {userEmail ? (
              <>
                {likes.length > 0 && (
                  <span className="hidden sm:flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-full px-3 py-1.5 font-medium shadow-sm">
                    <span className="animate-pulse">♥</span> {likes.length}
                  </span>
                )}
                <span className="text-sm text-slate-500 hidden md:block max-w-[140px] truncate">{userEmail}</span>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-slate-600 hover:text-slate-900 px-4 py-2 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 active:scale-95"
                >
                  Salir
                </button>
              </>
            ) : (
              <a
                href="/auth/callback?provider=google"
                className="text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2 rounded-full shadow-lg shadow-indigo-600/20 transition-all duration-300 active:scale-95"
              >
                Iniciar sesión
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}