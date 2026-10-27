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

    return NextResponse.json({
      data: rows[0]?.data ?? {},
    })
  } catch {
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 502 }
    )
  }
}

export async function POST(request: NextRequest) {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, '')
  const key = process.env.SUPABASE_SECRET_KEY
  const password = process.env.PHONE_ADMIN_PASSWORD

  if (!url || !key || !password) {
    return NextResponse.json(
      { error: 'Server is not configured' },
      { status: 503 }
    )
  }

  let body: {
    password?: string
    data?: Record<string, unknown>
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }

  if (body.password !== password) {
    return NextResponse.json(
      { error: 'Incorrect owner password' },
      { status: 401 }
    )
  }

  if (
    !body.data ||
    typeof body.data !== 'object' ||
    Array.isArray(body.data)
  ) {
    return NextResponse.json(
      { error: 'Invalid data' },
      { status: 400 }
    )
  }

  try {
    const res = await fetch(
      `${url}/rest/v1/phone_edits?id=eq.1`,
      {
        method: 'PATCH',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          data: body.data,
          updated_at: new Date().toISOString(),
        }),
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to save edits' },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 502 }
    )
  }
}