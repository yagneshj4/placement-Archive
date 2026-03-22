// Reusable empty state component used on Bookmarks, Search results, etc.
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="text-center py-16">
      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
        {icon}
      </div>
      <h3 className="text-gray-800 font-medium text-sm mb-1">{title}</h3>
      {description && <p className="text-gray-400 text-xs mb-5 max-w-xs mx-auto">{description}</p>}
      {action}
    </div>
  )
}
