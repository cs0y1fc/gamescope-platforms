import { NextRequest, NextResponse } from 'next/server'
import { fetchGameById, fetchGameBySlug } from '@/lib/rawg'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const isNumeric = /^\d+$/.test(id)
    
    const data = isNumeric
      ? await fetchGameById(Number(id))
      : await fetchGameBySlug(id)
    
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error fetching game details' },
      { status: 500 }
    )
  }
}