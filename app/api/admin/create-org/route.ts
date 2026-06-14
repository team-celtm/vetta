import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify admin token from cookies
    const token = req.cookies.get("vetta_admin_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
    } catch {
      return NextResponse.json({ error: "Invalid admin token" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }

    const { name, domain } = body;

    // 2. Validate input
    if (!name) {
      return NextResponse.json(
        { error: 'Organization name is required.' },
        { status: 400 }
      );
    }

    // 3. Insert org
    const result = await query(
      `INSERT INTO orgs (name, domain)
       VALUES ($1, $2)
       RETURNING id, name, domain`,
      [name, domain || null]
    );

    return NextResponse.json(
      {
        message: 'Organization created successfully',
        org: result[0],
      },
      { status: 201 }
    );

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
