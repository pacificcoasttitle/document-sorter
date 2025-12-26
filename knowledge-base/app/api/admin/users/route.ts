import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken, hashPassword } from '@/lib/auth';

// Helper to check if user is admin
async function checkAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return { error: 'Not authenticated', status: 401 };

  const payload = verifyToken(token);
  if (!payload) return { error: 'Invalid token', status: 401 };

  const userResult = await pool.query('SELECT id, role FROM users WHERE id = $1', [payload.userId]);
  if (userResult.rows.length === 0) return { error: 'User not found', status: 404 };

  const user = userResult.rows[0];
  if (user.role !== 'admin') return { error: 'Admin access required', status: 403 };

  return { userId: user.id };
}

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);
    if ('error' in adminCheck) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const result = await pool.query(`
      SELECT id, email, name, role, department, created_at, updated_at
      FROM users 
      ORDER BY name
    `);

    return NextResponse.json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await checkAdmin(request);
    if ('error' in adminCheck) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { email, name, password, role, department } = await request.json();

    // Validate required fields
    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Email, name, and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Validate role
    const validRoles = ['admin', 'department_head', 'viewer'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert user
    const result = await pool.query(`
      INSERT INTO users (email, password_hash, name, role, department)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, name, role, department, created_at
    `, [email, passwordHash, name, role || 'viewer', department || null]);

    // Log activity
    await pool.query(
      'INSERT INTO activity_log (action, details, user_id) VALUES ($1, $2, $3)',
      ['user_created', JSON.stringify({ user_name: name, user_email: email }), adminCheck.userId]
    );

    return NextResponse.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

