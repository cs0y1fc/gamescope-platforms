import { createClient } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const oauthError = searchParams.get('error')
  const oauthErrorDesc = searchParams.get('error_description')

  if (oauthError) {
    const msg = oauthErrorDesc || oauthError
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(msg)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/?auth_error=missing_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(error.message)}`)
  }

  return NextResponse.redirect(origin)
}
