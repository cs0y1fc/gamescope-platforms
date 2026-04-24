import { NextResponse } from 'next/server'
import { getSyncStatus, runSync } from '@/lib/sync'

export async function GET() {
  const status = await getSyncStatus()
  return NextResponse.json(status)
}

export async function POST() {
  const result = await runSync()
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.error === 'Supabase not configured' ? 503 : 500 })
  return NextResponse.json(result)
}
