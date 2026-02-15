import React, { createContext, useContext, useState, useCallback } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = sessionStorage.getItem('attendance_user')
      return s ? JSON.parse(s) : null
    } catch {
      return null
    }
  })

  const login = useCallback(async (account, password) => {
    if (api.useBackend) {
      try {
        const data = await api.login(account, password)
        const u = data.user
        api.setToken(data.token)
        setUser(u)
        sessionStorage.setItem('attendance_user', JSON.stringify(u))
        return { ok: true, role: u.role }
      } catch (err) {
        return { ok: false, error: err.message }
      }
    }
    const u = window.__mockAuth?.(account, password)
    if (u) {
      setUser(u)
      sessionStorage.setItem('attendance_user', JSON.stringify(u))
      return { ok: true, role: u.role }
    }
    return { ok: false }
  }, [])

  const logout = useCallback(() => {
    api.setToken(null)
    setUser(null)
    sessionStorage.removeItem('attendance_user')
  }, [])

  const updateCurrentUser = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...updates }
      sessionStorage.setItem('attendance_user', JSON.stringify(next))
      return next
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
