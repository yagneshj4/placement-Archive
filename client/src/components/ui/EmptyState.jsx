// Reusable empty state component used on Bookmarks, Search results, etc.
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="text-center py-20 bg-white border border-gray-100 rounded-[2rem] max-w-3xl mx-auto shadow-sm mt-8">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-100 text-gray-300">
        {icon}
      </div>
      <h3 className="text-gray-900 font-black tracking-tight text-xl mb-2">{title}</h3>
      {description && <p className="text-gray-500 font-medium text-sm mb-6 max-w-sm mx-auto leading-relaxed">{description}</p>}
      {action}
    </div>
  )
}
