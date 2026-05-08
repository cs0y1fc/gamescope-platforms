'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { TopLine } from '@/components/ui'

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <>
      <TopLine fixed />
      <header
        className="sticky top-0 z-40 backdrop-blur-sm"
        style={{
          background: 'rgba(8, 8, 8, 0.85)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="shrink-0 flex items-center gap-4">
              <Link
                href="/"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-2 group"
              >
                <span
                  className="text-lg"
                  style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}
                >
                  &gt;_
                </span>
                <h1
                  className="text-xl tracking-widest uppercase"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    color: 'var(--color-text)',
                  }}
                >
                  GAMESCOPE
                </h1>
              </Link>
              <span
                className="hidden lg:inline text-xs"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                {'// RETRONOVA EDITION'}
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-5 text-xs uppercase tracking-wider">
              <Link
                href="/"
                className="transition-colors hover:text-[--color-accent]"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}
              >
                [GAMES]
              </Link>
              <Link
                href="/platforms"
                className="transition-colors hover:text-[--color-accent]"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}
              >
                [PLATFORMS]
              </Link>
              <Link
                href="/news"
                className="transition-colors hover:text-[--color-accent]"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}
              >
                [TRANSMISSIONS]
              </Link>
            </nav>

            <div className="flex items-center gap-3 shrink-0">
              {userEmail ? (
                <>
                  {likes.length > 0 && (
                    <span
                      className="hidden sm:inline-flex items-center gap-1.5 text-xs px-3 py-1.5"
                      style={{
                        color: 'var(--color-accent)',
                        border: '1px solid var(--color-accent)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      [ ♥ {String(likes.length).padStart(2, '0')} ]
                    </span>
                  )}
                  <span
                    className="hidden md:block max-w-[180px] truncate text-xs"
                    style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                  >
                    {userEmail}
                  </span>
                  <button onClick={handleSignOut} className="btn-retro text-xs">
                    [SIGN OUT]
                  </button>
                </>
              ) : (
                <a href="/auth/callback?provider=google" className="btn-retro btn-retro-primary text-xs">
                  [SIGN IN]
                </a>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
