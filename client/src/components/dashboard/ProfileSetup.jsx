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
    <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-2xl">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Set your target companies</h2>
      <p className="text-sm text-gray-500 mb-5">
        Select the companies you are preparing for. The dashboard will prioritize topics that matter most for those interviews.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {POPULAR_COMPANIES.map((company) => (
          <button
            key={company}
            onClick={() => toggleCompany(company)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
              selected.has(company)
                ? 'bg-violet-700 text-white border-violet-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {selected.has(company) ? 'Selected: ' : ''}
            {company}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-5">
        <input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addCustom()
          }}
          placeholder="Add another company"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          onClick={addCustom}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          Add
        </button>
      </div>

      <div className="mb-5">
        <p className="text-sm font-medium text-gray-700 mb-2">Target role</p>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((option) => (
            <button
              key={option}
              onClick={() => setRole(option)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                role === option
                  ? 'bg-violet-700 text-white border-violet-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
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
        className="px-6 py-2.5 bg-violet-700 text-white rounded-lg text-sm font-medium hover:bg-violet-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSaving ? 'Saving...' : `Analyze gaps for ${selectedCount} compan${selectedCount === 1 ? 'y' : 'ies'}`}
      </button>
    </div>
  )
}
