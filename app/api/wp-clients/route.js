import pool from '@/lib/db'

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM wp_clients ORDER BY COALESCE(company, name) ASC'
    )
    return Response.json(result.rows)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, company, website, phone, email } = body

    const result = await pool.query(
      `INSERT INTO wp_clients (name, company, website, phone, email)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, company, website, phone, email]
    )

    return Response.json(result.rows[0], { status: 201 })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()
    const { name, company, website, phone, email } = body

    const result = await pool.query(
      `UPDATE wp_clients SET name=$1, company=$2, website=$3, phone=$4, email=$5
       WHERE id=$6 RETURNING *`,
      [name, company, website, phone, email, id]
    )

    return Response.json(result.rows[0])
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    await pool.query('DELETE FROM wp_clients WHERE id=$1', [id])
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
