import { NextResponse } from 'next/server'
import { NEWS } from '@/lib/news-data'

export async function GET() {
  return NextResponse.json(NEWS)
}
