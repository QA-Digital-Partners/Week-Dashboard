import pool from '@/lib/db'

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM projects ORDER BY start_date ASC'
    )
    return Response.json(result.rows)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, start_date, end_date, pm, status, status_responsable, gantt } = body

    const result = await pool.query(
      `INSERT INTO projects (name, start_date, end_date, pm, status, status_responsable, gantt)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, start_date, end_date, pm, status || 'Active', status_responsable, gantt]
    )

    return Response.json(result.rows[0], { status: 201 })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}