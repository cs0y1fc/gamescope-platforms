import { NextRequest, NextResponse } from 'next/server'
import { runSync } from '@/lib/sync'

// Called daily by Vercel Cron — protected with CRON_SECRET
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const result = await runSync()
  const status = !result.ok ? 500 : 200
  return NextResponse.json(result, { status })
}
