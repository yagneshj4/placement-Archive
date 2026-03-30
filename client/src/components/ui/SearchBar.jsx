import { useRef } from 'react'

export default function SearchBar({ value, onChange, placeholder, isLoading }) {
  const inputRef = useRef(null)

  return (
    <div className="relative">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-900 pointer-events-none drop-shadow-sm">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <input
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Search experiences, questions, companies...'}
        className="w-full pl-14 pr-20 py-4 border border-gray-200 rounded-2xl text-[15px] font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white shadow-sm transition-all"
      />

      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
        {isLoading && (
          <div className="w-5 h-5 border-[3px] border-gray-900 border-t-white rounded-full animate-spin" />
        )}
        {value && (
          <button
            onClick={() => { onChange(''); inputRef.current?.focus() }}
            className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
