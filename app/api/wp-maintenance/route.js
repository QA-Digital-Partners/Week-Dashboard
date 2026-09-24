import pool from '@/lib/db'

// Un registro por cliente + tipo de periodo + periodo.
// period: 'YYYY-MM' para monthly, 'YYYY-Qn' para quarterly.
// tasks: { [taskKey]: { status: 'done' | 'na', date: 'YYYY-MM-DD' } }
let tableReady = null
function ensureTable() {
  if (!tableReady) {
    tableReady = pool
      .query(
        `CREATE TABLE IF NOT EXISTS wp_maintenance_checks (
           id SERIAL PRIMARY KEY,
           client_id INTEGER NOT NULL REFERENCES wp_clients(id) ON DELETE CASCADE,
           period_type TEXT NOT NULL CHECK (period_type IN ('monthly', 'quarterly')),
           period TEXT NOT NULL,
           tasks JSONB NOT NULL DEFAULT '{}'::jsonb,
           notes TEXT NOT NULL DEFAULT '',
           updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
           UNIQUE (client_id, period_type, period)
         )`
      )
      .catch((error) => {
        tableReady = null
        throw error
      })
  }
  return tableReady
}

const PERIOD_FORMAT = {
  monthly: /^\d{4}-(0[1-9]|1[0-2])$/,
  quarterly: /^\d{4}-Q[1-4]$/,
}

// GET /api/wp-maintenance?month=2026-09&quarter=2026-Q3
export async function GET(request) {
  try {
    await ensureTable()
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const quarter = searchParams.get('quarter')

    if (!PERIOD_FORMAT.monthly.test(month || '') || !PERIOD_FORMAT.quarterly.test(quarter || '')) {
      return Response.json({ error: 'month (YYYY-MM) y quarter (YYYY-Qn) son requeridos' }, { status: 400 })
    }

    const result = await pool.query(
      `SELECT * FROM wp_maintenance_checks
       WHERE (period_type='monthly' AND period=$1)
          OR (period_type='quarterly' AND period=$2)`,
      [month, quarter]
    )

    return Response.json({
      monthly: result.rows.filter((r) => r.period_type === 'monthly'),
      quarterly: result.rows.filter((r) => r.period_type === 'quarterly'),
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/wp-maintenance  { clientId, periodType, period, tasks, notes }
export async function PUT(request) {
  try {
    await ensureTable()
    const { clientId, periodType, period, tasks, notes } = await request.json()

    if (!clientId || !PERIOD_FORMAT[periodType]?.test(period || '')) {
      return Response.json({ error: 'Datos de periodo inválidos' }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO wp_maintenance_checks (client_id, period_type, period, tasks, notes)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (client_id, period_type, period)
       DO UPDATE SET tasks=EXCLUDED.tasks, notes=EXCLUDED.notes, updated_at=NOW()
       RETURNING *`,
      [clientId, periodType, period, JSON.stringify(tasks || {}), notes || '']
    )

    return Response.json(result.rows[0])
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
