-- Tabla principal de proyectos
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  start_date DATE,
  end_date DATE,
  pm VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Active',
  status_responsable VARCHAR(100),
  gantt VARCHAR(500),
  archived BOOLEAN DEFAULT FALSE,
  abandoned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de notas con tracking por fecha
CREATE TABLE IF NOT EXISTS project_notes (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);