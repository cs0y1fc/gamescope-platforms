import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json([], { status: 200 })

  const { data } = await sb
    .from('game_likes')
    .select('rawg_id, game_name, liked_at')
    .eq('user_id', user.id)
    .order('liked_at', { ascending: false })

  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { rawg_id, game_name } = await req.json()
  if (!rawg_id || !game_name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data, error } = await sb
    .from('game_likes')
    .insert({ user_id: user.id, rawg_id, game_name })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rawg_id = req.nextUrl.searchParams.get('rawg_id')
  if (!rawg_id) return NextResponse.json({ error: 'Missing rawg_id' }, { status: 400 })

  await sb.from('game_likes').delete().eq('user_id', user.id).eq('rawg_id', Number(rawg_id))
  return NextResponse.json({ ok: true })
}
