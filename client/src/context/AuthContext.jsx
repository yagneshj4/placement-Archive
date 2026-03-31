import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { authApi } from '../api/auth.js'
import { setAccessToken } from '../api/axios.js'
import { auth, googleProvider } from '../firebase.js'
import { signInWithPopup } from 'firebase/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const didRestoreRef = useRef(false)

	// On app load - try to restore session via refresh token cookie
	useEffect(() => {
		if (didRestoreRef.current) return
		didRestoreRef.current = true

		const restoreSession = async () => {
			try {
				const { data } = await authApi.refresh()
				setAccessToken(data.data.accessToken)
				setUser(data.data.user)
			} catch {
				// No valid session - user needs to login
				setUser(null)
			} finally {
				setLoading(false)
			}
		}
		restoreSession()
	}, [])

	// Listen for forced logout (token refresh failed)
	useEffect(() => {
		const handleLogout = () => {
			setUser(null)
			setAccessToken(null)
		}
		window.addEventListener('auth:logout', handleLogout)
		return () => window.removeEventListener('auth:logout', handleLogout)
	}, [])

	// Auth actions
	const register = useCallback(async (formData) => {
		const { data } = await authApi.register(formData)
		setAccessToken(data.data.accessToken)
		setUser(data.data.user)
		return data.data.user
	}, [])

	const login = useCallback(async (formData) => {
		const { data } = await authApi.login(formData)
		setAccessToken(data.data.accessToken)
		setUser(data.data.user)
		return data.data.user
	}, [])

	const loginWithGoogle = useCallback(async () => {
		const result = await signInWithPopup(auth, googleProvider)
		const idToken = await result.user.getIdToken()
		const { data } = await authApi.google({ idToken })
		setAccessToken(data.data.accessToken)
		setUser(data.data.user)
		return data.data.user
	}, [])

	const logout = useCallback(async () => {
		try {
			await authApi.logout()
		} catch {}
		setAccessToken(null)
		setUser(null)
	}, [])

	const value = {
		user,
		loading,
		isAuthenticated: !!user,
		isAdmin: user?.role === 'admin',
		register,
		login,
		loginWithGoogle,
		logout,
	}

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
	return ctx
}
