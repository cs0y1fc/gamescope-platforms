import { NextResponse } from 'next/server'
import { fetchGenres } from '@/lib/rawg'

export async function GET() {
  try {
    const genres = await fetchGenres()
    return NextResponse.json(genres)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error fetching genres' },
      { status: 500 },
    )
  }
}
