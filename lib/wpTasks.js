// Catálogo de tareas de mantenimiento WordPress.
// Cada item es una tarea verificable; el progreso se calcula sobre todos los items.
// `optional: true` permite marcar la tarea como "N/A" cuando no aplica al sitio.

export const MONTHLY_GROUPS = [
  {
    id: 'updates',
    label: 'Actualizaciones',
    items: [
      { key: 'wp_core', label: 'Actualizar WordPress Core' },
      { key: 'plugins', label: 'Actualizar plugins' },
      { key: 'theme', label: 'Actualizar tema activo' },
    ],
  },
  {
    id: 'site',
    label: 'Revisión del sitio',
    items: [
      { key: 'home', label: 'La Home carga correctamente' },
      { key: 'responsive', label: 'Revisión en desktop y mobile' },
      { key: 'contact_form', label: 'Probar formulario de contacto y confirmar que llegue el correo' },
      { key: 'broken_links', label: 'Páginas importantes sin errores 404 ni enlaces rotos' },
    ],
  },
  {
    id: 'gsc',
    label: 'Google Search Console',
    items: [
      { key: 'gsc_indexing', label: 'Problemas de indexación' },
      { key: 'gsc_errors', label: 'Errores importantes' },
      { key: 'gsc_traffic', label: 'Caídas anormales de tráfico' },
    ],
  },
  {
    id: 'server',
    label: 'Servidor y accesos',
    items: [
      { key: 'hosting_space', label: 'Espacio disponible en hosting/servidor' },
      { key: 'admin_users', label: 'Sin usuarios administradores desconocidos' },
    ],
  },
  {
    id: 'log',
    label: 'Registro',
    items: [
      { key: 'maintenance_log', label: 'Registrar fecha del mantenimiento y problemas encontrados' },
    ],
  },
]

export const QUARTERLY_GROUPS = [
  {
    id: 'plugins_themes',
    label: 'Plugins y temas',
    items: [
      { key: 'plugins_audit', label: 'Revisión profunda de todos los plugins instalados' },
      { key: 'remove_plugins', label: 'Eliminar plugins que ya no se utilizan' },
      { key: 'remove_themes', label: 'Eliminar temas innecesarios' },
    ],
  },
  {
    id: 'platform',
    label: 'Plataforma y base de datos',
    items: [
      { key: 'php_version', label: 'Versión de PHP y compatibilidad del sitio' },
      { key: 'db_optimize', label: 'Optimizar y limpiar la base de datos' },
    ],
  },
  {
    id: 'storage',
    label: 'Limpieza de almacenamiento',
    items: [
      { key: 'old_backups', label: 'Backups antiguos' },
      { key: 'temp_files', label: 'Archivos temporales' },
      { key: 'large_logs', label: 'Logs muy grandes' },
      { key: 'unused_staging', label: 'Staging sites que ya no se usan', optional: true },
    ],
  },
  {
    id: 'security',
    label: 'Seguridad',
    items: [
      { key: 'users_audit', label: 'Revisar usuarios de WordPress y eliminar accesos antiguos' },
      { key: 'security_config', label: 'Configuración general de seguridad' },
    ],
  },
  {
    id: 'performance',
    label: 'Rendimiento y SEO',
    items: [
      { key: 'core_web_vitals', label: 'Core Web Vitals y rendimiento' },
      { key: 'recurring_indexing', label: 'Páginas con errores de indexación recurrentes' },
    ],
  },
  {
    id: 'email',
    label: 'Correo',
    items: [
      { key: 'email_config', label: 'Configuración de correo: SMTP, SPF, DKIM y entregabilidad', optional: true },
    ],
  },
]

export const PERIODS = {
  monthly: { label: 'Mensual', groups: MONTHLY_GROUPS },
  quarterly: { label: 'Trimestral', groups: QUARTERLY_GROUPS },
}

const flatten = (groups) => groups.flatMap((g) => g.items)
export const MONTHLY_ITEMS = flatten(MONTHLY_GROUPS)
export const QUARTERLY_ITEMS = flatten(QUARTERLY_GROUPS)

export function itemsFor(periodType) {
  return periodType === 'quarterly' ? QUARTERLY_ITEMS : MONTHLY_ITEMS
}

// tasks: { [key]: { status: 'done' | 'na', date: 'YYYY-MM-DD' } }
export function computeProgress(periodType, tasks = {}) {
  const items = itemsFor(periodType)
  const done = items.filter((i) => tasks[i.key]?.status === 'done').length
  const na = items.filter((i) => tasks[i.key]?.status === 'na').length
  const total = items.length
  const resolved = done + na
  return {
    done,
    na,
    total,
    resolved,
    pending: total - resolved,
    percentage: total ? Math.round((resolved / total) * 100) : 0,
  }
}

// ---- Periodos ----

export function monthKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function quarterOf(month) {
  const [y, m] = month.split('-').map(Number)
  return `${y}-Q${Math.ceil(m / 3)}`
}

export function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number)
  return monthKey(new Date(y, m - 1 + delta, 1))
}

export function monthLabel(month) {
  const [y, m] = month.split('-').map(Number)
  const label = new Date(y, m - 1, 1).toLocaleString('es-CO', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function quarterLabel(quarter) {
  const [y, q] = quarter.split('-Q').map(Number)
  const names = ['Ene – Mar', 'Abr – Jun', 'Jul – Sep', 'Oct – Dic']
  return `Q${q} ${y} · ${names[q - 1]}`
}

// Posición del mes dentro de su trimestre (1, 2 o 3)
export function monthInQuarter(month) {
  const m = Number(month.split('-')[1])
  return ((m - 1) % 3) + 1
}

export function progressTone(percentage) {
  if (percentage === 100) return { bar: 'bg-emerald-500', text: 'text-emerald-400', ring: '#10b981' }
  if (percentage >= 50) return { bar: 'bg-indigo-500', text: 'text-indigo-400', ring: '#6366f1' }
  if (percentage > 0) return { bar: 'bg-amber-500', text: 'text-amber-400', ring: '#f59e0b' }
  return { bar: 'bg-slate-600', text: 'text-slate-500', ring: '#475569' }
}
