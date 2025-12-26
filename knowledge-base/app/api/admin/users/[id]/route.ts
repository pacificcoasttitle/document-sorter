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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkAdmin(request);
    if ('error' in adminCheck) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { id } = await params;

    const result = await pool.query(`
      SELECT id, email, name, role, department, created_at, updated_at
      FROM users 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkAdmin(request);
    if ('error' in adminCheck) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { id } = await params;
    const { name, role, department, password } = await request.json();

    // Get existing user
    const existingResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate role
    const validRoles = ['admin', 'department_head', 'viewer'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Build update query
    let updateQuery = 'UPDATE users SET name = $1, role = $2, department = $3, updated_at = NOW()';
    const queryParams: (string | number | null)[] = [name, role, department || null];

    // If password is provided, hash and include it
    if (password && password.length > 0) {
      if (password.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
      }
      const passwordHash = await hashPassword(password);
      updateQuery += ', password_hash = $4 WHERE id = $5';
      queryParams.push(passwordHash, id);
    } else {
      updateQuery += ' WHERE id = $4';
      queryParams.push(id);
    }

    updateQuery += ' RETURNING id, email, name, role, department, created_at, updated_at';

    const result = await pool.query(updateQuery, queryParams);

    // Log activity
    await pool.query(
      'INSERT INTO activity_log (action, details, user_id) VALUES ($1, $2, $3)',
      ['user_updated', JSON.stringify({ updated_user_id: id, updated_user_name: name }), adminCheck.userId]
    );

    return NextResponse.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await checkAdmin(request);
    if ('error' in adminCheck) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { id } = await params;
    const userIdNum = parseInt(id);

    // Cannot delete yourself
    if (userIdNum === adminCheck.userId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Get user info before deleting
    const userResult = await pool.query('SELECT name, email FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userToDelete = userResult.rows[0];

    // Check if user has SOPs assigned
    const sopsResult = await pool.query('SELECT COUNT(*) as count FROM sops WHERE owner_id = $1', [id]);
    const sopCount = parseInt(sopsResult.rows[0].count);
    if (sopCount > 0) {
      return NextResponse.json({ 
        error: `Cannot delete - user owns ${sopCount} SOP${sopCount === 1 ? '' : 's'}` 
      }, { status: 400 });
    }

    // Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    // Log activity
    await pool.query(
      'INSERT INTO activity_log (action, details, user_id) VALUES ($1, $2, $3)',
      ['user_deleted', JSON.stringify({ deleted_user_name: userToDelete.name, deleted_user_email: userToDelete.email }), adminCheck.userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

