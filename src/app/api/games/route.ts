import { NextRequest, NextResponse } from 'next/server'
import { fetchGames } from '@/lib/rawg'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const platform = searchParams.get('platform')
  const genre = searchParams.get('genre')
  const year = searchParams.get('year')
  const page = searchParams.get('page')
  const ordering = searchParams.get('ordering') ?? '-rating'

  try {
    const data = await fetchGames({
      ...(platform && { platforms: platform }),
      ...(genre && { genres: genre }),
      ...(year && { dates: `${year}-01-01,${year}-12-31` }),
      ...(page && { page: Number(page) }),
      ordering,
    })
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error fetching games' },
      { status: 500 },
    )
  }
}
