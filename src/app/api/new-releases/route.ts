import { NextResponse } from 'next/server'
import { fetchGames } from '@/lib/rawg'

export async function GET() {
  try {
    const today = new Date()
    const from = new Date(today)
    from.setDate(from.getDate() - 90)
    const fmt = (d: Date) => d.toISOString().split('T')[0]

    const data = await fetchGames({
      dates: `${fmt(from)},${fmt(today)}`,
      ordering: '-released',
      page_size: 12,
    })
    return NextResponse.json(data.results ?? [], {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error' },
      { status: 500 },
    )
  }
}
