import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, '')
  const key = process.env.SUPABASE_SECRET_KEY

  if (!url || !key) {
    return NextResponse.json(
      { error: 'Database is not configured' },
      { status: 503 }
    )
  }

  try {
    const res = await fetch(
      `${url}/rest/v1/phone_edits?id=eq.1&select=data`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to load edits' },
        { status: 502 }
      )
    }

    const rows = await res.json()
    return NextResponse.json({ data: rows[0]?.data ?? {} })
  } catch {
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 502 }
    )
  }
}
