import { NextResponse } from 'next/server'
import { getNewsById } from '@/lib/news-data'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = getNewsById(Number(id))
  if (!item) return NextResponse.json({ error: 'News not found' }, { status: 404 })
  return NextResponse.json(item)
}
