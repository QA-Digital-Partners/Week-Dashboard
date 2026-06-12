const STATUS_STYLES = {
  Active: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  'On Hold': 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
  Delay: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  Completed: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
  Abandoned: 'bg-red-500/15 text-red-400 border border-red-500/30',
}

export default function StatusChip({ status }) {
  const style = STATUS_STYLES[status] || 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {status}
    </span>
  )
}