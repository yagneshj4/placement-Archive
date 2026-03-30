import Navbar from './Navbar'

export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans relative overflow-x-hidden">
      {/* Universal Light Grid Background */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
      />
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      </div>
    </div>
  )
}
