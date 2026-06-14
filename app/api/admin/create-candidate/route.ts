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

    const {
      full_name,
      email,
      phone,
      linkedin_url,
      city,
      country,
      remote_ok,
      availability,
      years_exp,
      current_title,
      current_company,
      skills,
      personality_scores,
      work_history,
      certifications,
      is_active,
    } = body;

    // 2. Validate essential input
    if (!full_name || !email) {
      return NextResponse.json(
        { error: 'Full name and email are required.' },
        { status: 400 }
      );
    }

    const emailClean = email.toLowerCase().trim();

    // 3. Check duplicate candidate by email
    const existing = await query(
      `SELECT id FROM candidates WHERE email = $1 LIMIT 1`,
      [emailClean]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Candidate with this email already exists.' },
        { status: 409 }
      );
    }

    // 4. Parse JSON fields if they are strings
    const parseJSON = (field: unknown, defaultVal: unknown) => {
      if (typeof field === 'string' && field.trim() !== '') {
        try {
          return JSON.parse(field);
        } catch {
          return defaultVal;
        }
      }
      return field || defaultVal;
    };

    const parsedSkills = parseJSON(skills, []);
    const parsedPersonality = parseJSON(personality_scores, {});
    const parsedWorkHistory = parseJSON(work_history, []);
    const parsedCertifications = parseJSON(certifications, []);

    // 5. Insert candidate
    const result = await query(
      `INSERT INTO candidates (
        full_name, email, phone, linkedin_url, city, country, 
        remote_ok, availability, years_exp, current_title, current_company, 
        skills, personality_scores, work_history, certifications, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 
        $7, $8, $9, $10, $11, 
        $12, $13, $14, $15, $16
      ) RETURNING id`,
      [
        full_name,
        emailClean,
        phone || null,
        linkedin_url || null,
        city || null,
        country || 'US',
        remote_ok ?? true,
        availability || 'open',
        years_exp ? parseInt(years_exp, 10) : 0,
        current_title || null,
        current_company || null,
        JSON.stringify(parsedSkills),
        JSON.stringify(parsedPersonality),
        JSON.stringify(parsedWorkHistory),
        JSON.stringify(parsedCertifications),
        is_active ?? true,
      ]
    );

    return NextResponse.json(
      {
        message: 'Candidate created successfully',
        candidateId: result[0].id,
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
