// Badge shown in search results header to indicate search mode
export default function SearchTypeBadge({ searchType }) {
  if (!searchType || searchType === 'browse') return null

  const config = {
    semantic:               { label: '🧠 Semantic search',  bg: '#E1F5EE', color: '#085041' },
    keyword:                { label: '🔤 Keyword search',   bg: '#E6F1FB', color: '#0C447C' },
    fallback_empty_collection: { label: '🔤 Keyword search (building index...)', bg: '#FAEEDA', color: '#633806' },
  }

  const c = config[searchType] || config.keyword
  return (
    <span
      className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full"
      style={{ background: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  )
}
