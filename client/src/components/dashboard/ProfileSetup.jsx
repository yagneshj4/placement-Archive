import { useMemo, useState } from 'react'

const POPULAR_COMPANIES = [
  'Amazon',
  'Google',
  'Microsoft',
  'Flipkart',
  'JP Morgan',
  'Infosys',
  'TCS',
  'Wipro',
  'Razorpay',
  'Adobe',
  'Goldman Sachs',
  'Uber',
  'Swiggy',
  'PhonePe',
  'Atlassian',
]

const ROLES = ['SDE', 'Data Engineer', 'ML Engineer', 'DevOps', 'Data Analyst', 'Product Manager', 'Other']

export default function ProfileSetup({ onSave, isSaving, initialCompanies = [], initialRole = '' }) {
  const [selected, setSelected] = useState(new Set(initialCompanies))
  const [customInput, setCustomInput] = useState('')
  const [role, setRole] = useState(initialRole)

  const selectedCount = useMemo(() => selected.size, [selected])

  const toggleCompany = (company) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(company)) next.delete(company)
      else next.add(company)
      return next
    })
  }

  const addCustom = () => {
    const trimmed = customInput.trim()
    if (trimmed && !selected.has(trimmed)) {
      setSelected((prev) => new Set([...prev, trimmed]))
    }
    setCustomInput('')
  }

  const handleSave = () => {
    onSave({ targetCompanies: [...selected], targetRole: role })
  }

  return (
    <div className="bg-white rounded-[1.5rem] border border-gray-200 p-8 max-w-2xl shadow-xl">
      <h2 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Set your target companies</h2>
      <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
        Select the companies you are preparing for. The ML dashboard will prioritize analyzing topics that matter most for these specific technical interviews.
      </p>

      <div className="flex flex-wrap gap-2.5 mb-6">
        {POPULAR_COMPANIES.map((company) => (
          <button
            key={company}
            onClick={() => toggleCompany(company)}
            className={`px-4 py-2 rounded-xl text-[13px] border font-bold transition-all shadow-sm hover:-translate-y-0.5 ${
              selected.has(company)
                ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
            }`}
          >
            {selected.has(company) ? '✓ ' : ''}
            {company}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mb-8">
        <input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addCustom()
          }}
          placeholder="Add another company..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors shadow-sm"
        />
        <button
          onClick={addCustom}
          className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 shadow-sm hover:border-gray-300 hover:text-gray-900 hover:-translate-y-0.5 transition-all"
        >
          Add
        </button>
      </div>

      <div className="mb-8 p-6 bg-gray-50 rounded-[1.25rem] border border-gray-100">
        <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-3">Target role</p>
        <div className="flex flex-wrap gap-2.5">
          {ROLES.map((option) => (
            <button
              key={option}
              onClick={() => setRole(option)}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold border transition-all hover:-translate-y-0.5 ${
                role === option
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm hover:text-gray-900'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving || selectedCount === 0}
        className="w-full sm:w-auto px-10 py-4 bg-gray-900 text-white rounded-xl text-sm font-black tracking-widest uppercase hover:bg-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isSaving ? 'Saving parameters...' : `Analyze gaps for ${selectedCount} compan${selectedCount === 1 ? 'y' : 'ies'}`}
      </button>
    </div>
  )
}
