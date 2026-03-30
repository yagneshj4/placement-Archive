// Badge shown in search results header to indicate search mode
export default function SearchTypeBadge({ searchType }) {
  if (!searchType || searchType === 'browse') return null

  const config = {
    semantic:               { label: '🧠 Semantic search',    bg: '#ffffff', color: '#111827', border: '#e5e7eb' },
    keyword:                { label: '🔤 Keyword search',     bg: '#ffffff', color: '#111827', border: '#e5e7eb' },
    fallback_empty_collection: { label: '🔤 Keyword search (building index...)', bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  }

  const c = config[searchType] || config.keyword
  return (
    <span
      className="inline-flex items-center text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm transition-all"
      style={{ background: c.bg, color: c.color, borderColor: c.border }}
    >
      {c.label}
    </span>
  )
}
