import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, Mail, GraduationCap, Building2, Briefcase, 
  Settings, Save, Loader2, CheckCircle2, ShieldCheck, 
  MapPin, Bell, LogOut, ChevronRight, Activity
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { usersApi } from '../api/users'

const ROLES = ['SDE', 'Data Engineer', 'ML Engineer', 'DevOps', 'Data Analyst', 'Product Manager', 'Other']
const POPULAR_COMPANIES = [
  'Amazon', 'Google', 'Microsoft', 'Flipkart', 'JP Morgan', 
  'Infosys', 'TCS', 'Wipro', 'Razorpay', 'Adobe', 'Goldman Sachs'
]

export default function Profile() {
  const { user, logout } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    graduationYear: '',
    targetRole: '',
    targetCompanies: [],
    emailDigest: true
  })

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        graduationYear: user.graduationYear || '',
        targetRole: user.targetRole || '',
        targetCompanies: user.targetCompanies || [],
        emailDigest: user.emailDigest !== false
      })
    }
  }, [user])

  const toggleCompany = (company) => {
    setFormData(prev => {
      const current = prev.targetCompanies
      const next = current.includes(company)
        ? current.filter(c => c !== company)
        : [...current, company]
      return { ...prev, targetCompanies: next }
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSaveSuccess(false)
    
    try {
      const payload = {
        name: formData.name,
        targetRole: formData.targetRole,
        targetCompanies: formData.targetCompanies,
        emailDigest: formData.emailDigest
      }

      if (formData.graduationYear) {
        payload.graduationYear = Number(formData.graduationYear)
      }

      await usersApi.updateProfile(payload)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 font-sans relative z-10">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-gray-100 pb-10"
      >
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-[2rem] bg-gray-900 flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-gray-200">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{user?.name}</h1>
              {user?.role === 'admin' && (
                <span className="bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Admin</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm font-medium">
              <span className="flex items-center gap-1.5"><Mail size={14} className="text-gray-400" /> {user?.email}</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500" /> {user?.isVerified ? 'Verified Account' : 'Unverified'}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={logout}
          className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-red-100 transition-all self-start md:self-auto"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </motion.div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Personal Info */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 space-y-8"
        >
          {/* section: Basic Info */}
          <div className="bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-xl shadow-gray-100/50">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                <Settings size={20} />
              </div>
              <h2 className="text-xl font-black text-gray-900">Personal Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <User size={12} /> Full Name
                </label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-900 transition-all shadow-inner"
                  placeholder="Your Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <GraduationCap size={12} /> Graduation Year
                </label>
                <input 
                  type="number"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({...formData, graduationYear: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-900 transition-all shadow-inner"
                  placeholder="2024"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <MapPin size={12} /> College / University
                </label>
                <div className="w-full bg-gray-100/50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-500 cursor-not-allowed">
                  {user?.college || 'VR Siddhartha Engineering College'}
                </div>
                <p className="text-[10px] text-gray-400 ml-1 font-medium italic">Contact admin to change college affiliation.</p>
              </div>
            </div>
          </div>

          {/* section: Goals & Targets */}
          <div className="bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-xl shadow-gray-100/50">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                <Briefcase size={20} />
              </div>
              <h2 className="text-xl font-black text-gray-900">Career Goals</h2>
            </div>

            <div className="mb-10">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-3 block">Target Role</label>
              <div className="flex flex-wrap gap-2.5">
                {ROLES.map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({...formData, targetRole: role})}
                    className={`px-5 py-2.5 rounded-xl text-[13px] font-bold border transition-all ${
                      formData.targetRole === role 
                        ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200 scale-105'
                        : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300 hover:text-gray-900'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Building2 size={12} /> Target Companies
              </label>
              <div className="flex flex-wrap gap-2.5">
                {POPULAR_COMPANIES.map(company => (
                  <button
                    key={company}
                    type="button"
                    onClick={() => toggleCompany(company)}
                    className={`px-4 py-2 rounded-xl text-[13px] border font-bold transition-all ${
                      formData.targetCompanies.includes(company)
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm'
                        : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-700 hover:bg-white'
                    }`}
                  >
                    {formData.targetCompanies.includes(company) ? '✓ ' : ''}
                    {company}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 ml-1 font-medium">Selecting companies helps the AI dashboard personalize your preparation gaps.</p>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Settings & Save */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Notifications */}
          <div className="bg-gray-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Bell size={16} />
              </div>
              <h3 className="font-black text-sm uppercase tracking-widest">Preferences</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Email Digest</p>
                  <p className="text-[10px] text-white/50 font-medium">Weekly preparation updates</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, emailDigest: !formData.emailDigest})}
                  className={`w-12 h-6 rounded-full transition-colors relative border border-white/10 ${formData.emailDigest ? 'bg-emerald-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.emailDigest ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              
              <div className="pt-4 border-t border-white/10 flex items-center justify-between opacity-50 grayscale pointer-events-none">
                <div>
                  <p className="text-sm font-bold">Public Profile</p>
                  <p className="text-[10px] text-white/50 font-medium">Visible to other students</p>
                </div>
                <div className="w-12 h-6 rounded-full bg-white/10 relative border border-white/10">
                   <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white/50" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Activity</p>
              <Activity size={14} className="text-gray-300" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-gray-900">{user?.contributionCount || 0}</p>
                <p className="text-[10px] font-bold text-gray-500">Experiences shared</p>
              </div>
              <ChevronRight className="text-gray-200" />
              <div className="text-right">
                <p className="text-2xl font-black text-gray-900">{user?.bookmarks?.length || 0}</p>
                <p className="text-[10px] font-bold text-gray-500">Saved items</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 space-y-4">
            {error && (
              <p className="text-red-500 text-xs font-bold bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-2">
                <ShieldCheck size={14} /> {error}
              </p>
            )}
            
            <button
              type="submit"
              disabled={isSaving}
              className={`w-full flex items-center justify-center gap-3 py-5 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] shadow-xl transition-all ${
                saveSuccess 
                  ? 'bg-emerald-500 text-white shadow-emerald-200' 
                  : 'bg-gray-900 text-white hover:bg-black shadow-gray-200 hover:-translate-y-1'
              } disabled:opacity-50`}
            >
              {isSaving ? (
                <><Loader2 size={18} className="animate-spin" /> Saving...</>
              ) : saveSuccess ? (
                <><CheckCircle2 size={18} /> Profile Updated</>
              ) : (
                <><Save size={18} /> Update Profile</>
              )}
            </button>
            
            <p className="text-[10px] text-gray-400 text-center font-medium">Last active: {new Date(user?.lastActive).toLocaleDateString()}</p>
          </div>
        </motion.div>

      </form>
    </div>
  )
}
