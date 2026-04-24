import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('favorite_platforms')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { rawg_id, name, slug } = body

  if (!rawg_id || !name || !slug) {
    return NextResponse.json({ error: 'rawg_id, name and slug are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('favorite_platforms')
    .upsert({ rawg_id, name, slug }, { onConflict: 'rawg_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const rawg_id = searchParams.get('rawg_id')

  if (!rawg_id) {
    return NextResponse.json({ error: 'rawg_id query param required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('favorite_platforms')
    .delete()
    .eq('rawg_id', Number(rawg_id))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
