import { useRef } from 'react'

export default function SearchBar({ value, onChange, placeholder, isLoading }) {
  const inputRef = useRef(null)

  return (
    <div className="relative">
      {/* Search icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Search experiences, questions, companies...'}
        className="w-full pl-11 pr-20 py-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
      />

      {/* Right side: clear button + loading spinner */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {isLoading && (
          <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
        )}
        {value && (
          <button
            onClick={() => { onChange(''); inputRef.current?.focus() }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
