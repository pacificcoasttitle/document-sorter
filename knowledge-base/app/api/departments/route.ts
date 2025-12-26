import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');

    let query = 'SELECT * FROM departments';
    const params: number[] = [];

    if (workspaceId) {
      params.push(parseInt(workspaceId));
      query += ' WHERE workspace_id = $1';
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);
    
    return NextResponse.json({ departments: result.rows });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user to check role
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [payload.userId]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { workspace_id, name } = await request.json();

    if (!workspace_id || !name) {
      return NextResponse.json({ error: 'workspace_id and name are required' }, { status: 400 });
    }

    // Check if department already exists
    const existingResult = await pool.query(
      'SELECT id FROM departments WHERE workspace_id = $1 AND LOWER(name) = LOWER($2)',
      [workspace_id, name]
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json({ error: 'Department already exists in this workspace' }, { status: 400 });
    }

    // Insert department
    const result = await pool.query(
      'INSERT INTO departments (workspace_id, name) VALUES ($1, $2) RETURNING *',
      [workspace_id, name]
    );

    // Log activity
    await pool.query(
      'INSERT INTO activity_log (action, details, user_id, workspace_id) VALUES ($1, $2, $3, $4)',
      ['department_created', JSON.stringify({ department_name: name }), payload.userId, workspace_id]
    );

    return NextResponse.json({ department: result.rows[0] });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user to check role
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [payload.userId]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Department id is required' }, { status: 400 });
    }

    // Get department info before deleting
    const deptResult = await pool.query('SELECT * FROM departments WHERE id = $1', [id]);
    if (deptResult.rows.length === 0) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    const department = deptResult.rows[0];

    // Check if any SOPs are using this department
    const sopsResult = await pool.query(
      'SELECT COUNT(*) as count FROM sops WHERE department_id = $1',
      [id]
    );

    const sopCount = parseInt(sopsResult.rows[0].count);
    if (sopCount > 0) {
      return NextResponse.json({ 
        error: `Cannot delete - ${sopCount} SOP${sopCount === 1 ? ' is' : 's are'} assigned to this department` 
      }, { status: 400 });
    }

    // Delete department
    await pool.query('DELETE FROM departments WHERE id = $1', [id]);

    // Log activity
    await pool.query(
      'INSERT INTO activity_log (action, details, user_id, workspace_id) VALUES ($1, $2, $3, $4)',
      ['department_deleted', JSON.stringify({ department_name: department.name }), payload.userId, department.workspace_id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  }
}
