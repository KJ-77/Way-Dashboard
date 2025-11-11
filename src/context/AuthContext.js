import React, { createContext, useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { BASE_URL } from '../config'

// Create context
const AuthContext = createContext()

// API Base URL
const API_BASE_URL = `${BASE_URL}/api`

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Check if user is logged in on page load
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('admin_token')
      const storedAdmin = localStorage.getItem('admin_info')

      if (storedToken && storedAdmin) {
        try {
          // Try to parse admin info first
          let adminData
          try {
            adminData = JSON.parse(storedAdmin)
          } catch (e) {
            throw new Error('Invalid admin data format')
          }

          // Set token and admin without verification first
          setToken(storedToken)
          setAdmin(adminData)

          // Then verify in the background - don't redirect if it fails
          fetch(`${API_BASE_URL}/admin/verify`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${storedToken}`,
            },
          }).catch((err) => {
            console.warn(
              'Token verification failed, will retry on next page load:',
              err,
            )
            // Don't clear the token or navigate here - just log the error
          })
        } catch (err) {
          // Only clear storage for parsing errors
          console.error('Auth data error:', err)
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_info')
          // Don't navigate here - let ProtectedRoute handle it
        }
      }

      // Always set loading to false at the end
      setLoading(false)
    }

    checkAuth()
  }, []) // Remove navigate from dependencies

  // Login function
  const login = async (credentials) => {
    try {
      // If role is provided, route accordingly; default to admin
      const role = credentials.role || 'admin'
      const endpoint =
        role === 'tutor'
          ? `${BASE_URL}/api/auth/tutor/login`
          : `${API_BASE_URL}/admin/login`
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Login failed')
      }

      const data = await response.json()

      // Normalize response for admin vs tutor
      const responseToken = data.data?.token || data.token
      let principal
      if (role === 'tutor') {
        const d = data.data || {}
        principal = {
          id: d.id,
          name: d.name,
          email: d.email,
          role: 'tutor',
          permissions: { schedule: { read: true, write: false } },
        }
      } else {
        principal = data.data?.admin || data.admin
      }

      if (!responseToken || !principal) {
        throw new Error('Invalid response format')
      }

      // Save to localStorage
      localStorage.setItem('admin_token', responseToken)
      localStorage.setItem('admin_info', JSON.stringify(principal))

      // Set in state
      setToken(responseToken)
      setAdmin(principal)

      return true
    } catch (err) {
      throw err
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // Call logout API
      await fetch(`${API_BASE_URL}/admin/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear storage and state regardless of API success
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_info')
      setToken(null)
      setAdmin(null)

      // Navigate to login
      navigate('/login')
    }
  }

  // Check if user has permission to perform an action on a resource
  const hasPermission = (resource, action) => {
    if (!admin || !admin.permissions) return false

    // Super admin has all permissions
    if (admin.role === 'super_admin') return true

    // Check specific permissions
    return (
      admin.permissions[resource] &&
      admin.permissions[resource][action] === true
    )
  }

  // Context value
  const value = {
    admin,
    token,
    isAuthenticated: !!token,
    isAdmin: admin?.role === 'admin' || admin?.role === 'super_admin',
    isSuperAdmin: admin?.role === 'super_admin',
    isReadOnly: admin?.role === 'read_only',
    // Permission helpers
    hasPermission,
    // Common permission checks
    canRead: (resource) => hasPermission(resource, 'read'),
    canWrite: (resource) => hasPermission(resource, 'write'),
    loading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext)
}
