import { NextRequest, NextResponse } from 'next/server'
import { fetchPlatforms } from '@/lib/rawg'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page') ?? '1')

  try {
    const data = await fetchPlatforms(page)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch platforms from RAWG' },
      { status: 500 }
    )
  }
}
