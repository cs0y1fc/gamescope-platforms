import { NextRequest, NextResponse } from 'next/server'
import { getSupabase, DbPlatform } from '@/lib/supabase'
import { fetchPlatforms } from '@/lib/rawg'
import { dbPlatformToUnified } from '@/lib/sync'
import { Platform } from '@/lib/types'

export async function GET(request: NextRequest) {
  const sb = getSupabase()

  // Serve from Supabase DB when configured
  if (sb) {
    const { data, error } = await sb
      .from('platforms')
      .select('*')
      .order('games_count', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const results: Platform[] = (data as DbPlatform[]).map(dbPlatformToUnified)
    return NextResponse.json({ results, source: 'database', count: results.length })
  }

  // Fallback: proxy RAWG directly (no caching, Supabase not configured)
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page') ?? '1')
  try {
    const data = await fetchPlatforms(page)
    const results: Platform[] = data.results.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      games_count: p.games_count,
      image_url: p.image_background ?? null,
      year_start: p.year_start,
      year_end: p.year_end,
      source: 'rawg',
    }))
    return NextResponse.json({ results, source: 'rawg', count: data.count })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch platforms' }, { status: 500 })
  }
}
