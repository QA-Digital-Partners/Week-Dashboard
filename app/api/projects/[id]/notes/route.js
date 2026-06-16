import pool from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const result = await pool.query(
      'SELECT * FROM project_notes WHERE project_id = $1 ORDER BY created_at DESC',
      [id]
    )

    return Response.json(result.rows)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { note, created_by } = body

    const result = await pool.query(
      `INSERT INTO project_notes (project_id, note, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, note, created_by || 'Team']
    )

    return Response.json(result.rows[0], { status: 201 })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('noteId')

    if (!noteId) {
      return Response.json({ error: 'Missing noteId' }, { status: 400 })
    }

    await pool.query(
      'DELETE FROM project_notes WHERE id = $1 AND project_id = $2',
      [noteId, id]
    )

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}