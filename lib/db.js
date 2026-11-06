import { Pool, types } from 'pg'

// Columnas DATE como texto 'YYYY-MM-DD' (sin hora ni zona horaria)
types.setTypeParser(1082, (value) => value)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

export default pool