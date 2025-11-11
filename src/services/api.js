import { BASE_URL } from '../config'

const API_BASE_URL = `${BASE_URL}/api`

// Helper function to handle response
const handleResponse = async (response) => {
  if (!response.ok) {
    // Check if it's a 401 Unauthorized error
    if (response.status === 401) {
      // Clear localStorage and redirect to login
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_info')
      window.location.href = '/#/login'
    }

    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Network response was not ok')
  }
  return response.json()
}

// Generic API functions
export const api = {
  // GET request
  get: async (endpoint) => {
    // Use admin_token instead of token
    const token =
      localStorage.getItem('admin_token') || localStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })
      return handleResponse(response)
    } catch (error) {
      throw new Error(`GET request failed: ${error.message}`)
    }
  },

  // POST request
  post: async (endpoint, data) => {
    // Use admin_token instead of token
    const token =
      localStorage.getItem('admin_token') || localStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      })
      return handleResponse(response)
    } catch (error) {
      throw new Error(`POST request failed: ${error.message}`)
    }
  },

  // PUT request
  put: async (endpoint, data) => {
    // Use admin_token instead of token
    const token =
      localStorage.getItem('admin_token') || localStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      })
      return handleResponse(response)
    } catch (error) {
      throw new Error(`PUT request failed: ${error.message}`)
    }
  },

  // PATCH request
  patch: async (endpoint, data) => {
    // Use admin_token instead of token
    const token =
      localStorage.getItem('admin_token') || localStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      })
      return handleResponse(response)
    } catch (error) {
      throw new Error(`PATCH request failed: ${error.message}`)
    }
  },

  // DELETE request
  delete: async (endpoint) => {
    // Use admin_token instead of token
    const token =
      localStorage.getItem('admin_token') || localStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })
      return handleResponse(response)
    } catch (error) {
      throw new Error(`DELETE request failed: ${error.message}`)
    }
  },

  // POST with file upload
  postWithFile: async (endpoint, formData) => {
    // Use admin_token instead of token
    const token =
      localStorage.getItem('admin_token') || localStorage.getItem('token')
    try {
      console.log(
        'Sending POST request with file to:',
        `${API_BASE_URL}${endpoint}`,
      )

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Don't set Content-Type when sending FormData
        },
        body: formData,
      })

      // If response is not ok, try to get error details
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        console.error('Error response:', errorBody)
        // Handle different error response formats
        const errorMessage =
          errorBody.message ||
          errorBody.error ||
          `HTTP error ${response.status}`
        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      console.error('File upload error:', error)
      throw error
    }
  },

  // PUT with file upload
  putWithFile: async (endpoint, formData) => {
    // Use admin_token instead of token
    const token =
      localStorage.getItem('admin_token') || localStorage.getItem('token')
    try {
      console.log(
        'Sending PUT request with file to:',
        `${API_BASE_URL}${endpoint}`,
      )

      // Log formData keys for debugging
      console.log('FormData keys being sent:', [...formData.keys()])

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Do NOT set Content-Type header, let the browser set it with the FormData boundary
        },
        body: formData, // FormData object instead of JSON
      })

      // If response is not ok, try to get more detailed error info
      if (!response.ok) {
        const errorBody = await response.json().catch((err) => {
          console.error('Failed to parse error response:', err)
          return { message: 'Unknown server error' }
        })
        console.error('Error response:', errorBody)
        // Handle different error response formats
        const errorMessage =
          errorBody.message ||
          errorBody.error ||
          `HTTP error ${response.status}`
        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      console.error('PUT with file request failed:', error)
      throw error
    }
  },

  // PATCH with file upload
  patchWithFile: async (endpoint, formData) => {
    // Use admin_token instead of token
    const token =
      localStorage.getItem('admin_token') || localStorage.getItem('token')
    try {
      console.log(
        'Sending PATCH request with file to:',
        `${API_BASE_URL}${endpoint}`,
      )

      // Log formData keys for debugging
      console.log('FormData keys being sent:', [...formData.keys()])

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Do NOT set Content-Type header, let the browser set it with the FormData boundary
        },
        body: formData, // FormData object instead of JSON
      })

      // If response is not ok, try to get more detailed error info
      if (!response.ok) {
        const errorBody = await response.json().catch((err) => {
          console.error('Failed to parse error response:', err)
          return { message: 'Unknown server error' }
        })
        console.error('Error response:', errorBody)
        // Handle different error response formats
        const errorMessage =
          errorBody.message ||
          errorBody.error ||
          `HTTP error ${response.status}`
        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      console.error('PATCH with file request failed:', error)
      throw error
    }
  },
}

// No need for interceptors with fetch-based API client
// Remove these lines that are causing the error
// api.defaults.headers.common['Authorization'] = `Bearer ${token}`
// api.interceptors.response.use(...)
