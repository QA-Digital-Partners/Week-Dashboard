import pool from '@/lib/db'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, start_date, end_date, pm, status, status_responsable, gantt, archived, abandoned } = body

    const result = await pool.query(
      `UPDATE projects
       SET name=$1, start_date=$2, end_date=$3, pm=$4, status=$5,
           status_responsable=$6, gantt=$7, archived=$8, abandoned=$9
       WHERE id=$10
       RETURNING *`,
      [name, start_date, end_date, pm, status, status_responsable, gantt, archived, abandoned, id]
    )

    if (result.rows.length === 0) {
      return Response.json({ error: 'Project not found' }, { status: 404 })
    }

    return Response.json(result.rows[0])
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 RETURNING id',
      [id]
    )

    if (result.rowCount === 0) {
      return Response.json({ error: 'Project not found' }, { status: 404 })
    }

    return Response.json({ success: true, id })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}