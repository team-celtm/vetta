import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }

    const {
      adminEmail,
      adminPassword,
      email,
      password,
      full_name,
      role = 'member',
      org_id,
    } = body;

    // ✅ 1. Verify admin credentials
    if (
      adminEmail !== ADMIN_EMAIL ||
      adminPassword !== ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid admin credentials' },
        { status: 403 }
      );
    }

    // ✅ 2. Validate input
    if (!email || !password || !full_name || !org_id) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const emailClean = email.toLowerCase().trim();

    // ✅ 3. Check duplicate
    const existing = await query(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      [emailClean]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'User already exists.' },
        { status: 409 }
      );
    }

    // ✅ 4. Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // ✅ 5. Insert user
    const result = await query(
      `INSERT INTO users (org_id, email, full_name, role, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role`,
      [org_id, emailClean, full_name, role, password_hash]
    );

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: result[0],
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