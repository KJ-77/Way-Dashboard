/**
 * Authentication service for admin login and token management
 */

import { BASE_URL } from '../config'

// Base API URL
const API_BASE_URL = `${BASE_URL}/api`

/**
 * Authenticate admin user
 * @param {string} email Admin email
 * @param {string} password Admin password
 * @returns {Promise<Object>} Authentication result with token and admin data
 */
export const loginAdmin = async (email, password) => {
  try {
    // Make the login request
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    // Get the response data
    const responseText = await response.text()

    // Parse JSON safely
    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse response as JSON:', responseText)
      throw new Error('Invalid response format from server')
    }

    // Check for errors
    if (!response.ok) {
      throw new Error(
        data.message || `Authentication failed (${response.status})`,
      )
    }

    // Extract token and admin info
    const token = data.data?.token
    const admin = data.data?.admin

    // Validate response data
    if (!token || !admin) {
      throw new Error('Invalid response: missing token or admin data')
    }

    // Store auth data
    securelyStoreAuthData(token, admin)

    // Return the authentication result
    return {
      token,
      admin,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    throw error
  }
}

/**
 * Securely store authentication data
 * @param {string} token JWT token
 * @param {Object} admin Admin user data
 */
const securelyStoreAuthData = (token, admin) => {
  // Store token securely
  localStorage.setItem('admin_token', token)

  // Store admin info but sanitize it first
  const sanitizedAdmin = {
    _id: admin._id,
    fullName: sanitizeString(admin.fullName),
    email: sanitizeString(admin.email),
    role: sanitizeString(admin.role),
    permissions: admin.permissions,
    createdAt: admin.createdAt,
  }

  localStorage.setItem('admin_info', JSON.stringify(sanitizedAdmin))
}

/**
 * Verify if admin is currently authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('admin_token')
}

/**
 * Get current admin user info
 * @returns {Object|null} Admin user data or null if not authenticated
 */
export const getCurrentAdmin = () => {
  const adminJson = localStorage.setItem('admin_info')
  if (!adminJson) return null

  try {
    return JSON.parse(adminJson)
  } catch (e) {
    console.error('Error parsing admin data:', e)
    return null
  }
}

/**
 * Logout the current admin user
 */
export const logoutAdmin = async () => {
  try {
    const token = localStorage.getItem('admin_token')

    // Call logout API (optional)
    await fetch(`${API_BASE_URL}/admin/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).catch((err) => console.warn('Logout API error:', err))

    // Always clear local storage
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_info')

    // Redirect to login
    window.location.replace('/#/login')
  } catch (error) {
    console.error('Logout error:', error)
    // Ensure storage is cleared even if API call fails
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_info')
  }
}

/**
 * Basic string sanitization
 * @param {string} str String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (str) => {
  if (!str) return ''
  return String(str)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
