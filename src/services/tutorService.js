import BACKEND_URL from '../config'

// Helper function to get the auth token
const getToken = () => {
  const adminInfo = localStorage.getItem('admin_info')
  return adminInfo ? JSON.parse(adminInfo).token : null
}

// Helper for making API requests with auth token
const fetchWithAuth = async (url, options = {}) => {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers,
  }

  const response = await fetch(`${BACKEND_URL}${url}`, config)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'API request failed')
  }

  return data
}

// Tutor API service
const tutorService = {
  // Get all tutors
  getAllTutors: async () => {
    try {
      return await fetchWithAuth('/tutor')
    } catch (error) {
      throw error
    }
  },

  // Get tutor by ID
  getTutorById: async (id) => {
    try {
      return await fetchWithAuth(`/tutor/${id}`)
    } catch (error) {
      throw error
    }
  },

  // Create new tutor
  createTutor: async (tutorData) => {
    try {
      // Handle FormData separately if it contains files
      if (tutorData instanceof FormData) {
        const token = getToken()
        const options = {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: tutorData,
        }

        const response = await fetch(`${BACKEND_URL}/tutor`, options)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'API request failed')
        }

        return data
      } else {
        // Regular JSON data
        return await fetchWithAuth('/tutor', {
          method: 'POST',
          body: JSON.stringify(tutorData),
        })
      }
    } catch (error) {
      throw error
    }
  },

  // Update tutor
  updateTutor: async (id, tutorData) => {
    try {
      // Handle FormData separately if it contains files
      if (tutorData instanceof FormData) {
        const token = getToken()
        const options = {
          method: 'PUT',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: tutorData,
        }

        const response = await fetch(`${BACKEND_URL}/tutor/${id}`, options)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'API request failed')
        }

        return data
      } else {
        // Regular JSON data
        return await fetchWithAuth(`/tutor/${id}`, {
          method: 'PUT',
          body: JSON.stringify(tutorData),
        })
      }
    } catch (error) {
      throw error
    }
  },

  // Delete tutor
  deleteTutor: async (id) => {
    try {
      return await fetchWithAuth(`/tutor/${id}`, {
        method: 'DELETE',
      })
    } catch (error) {
      throw error
    }
  },

  // Get schedules for tutor
  getTutorSchedules: async (id) => {
    try {
      return await fetchWithAuth(`/tutor/${id}/schedules`)
    } catch (error) {
      throw error
    }
  },

  // Assign tutor to schedule
  assignTutorToSchedule: async (tutorId, scheduleId) => {
    try {
      return await fetchWithAuth('/tutor/assign-schedule', {
        method: 'POST',
        body: JSON.stringify({
          tutorId,
          scheduleId,
        }),
      })
    } catch (error) {
      throw error
    }
  },

  // Remove tutor from schedule
  removeTutorFromSchedule: async (tutorId, scheduleId) => {
    try {
      return await fetchWithAuth('/tutor/remove-schedule', {
        method: 'POST',
        body: JSON.stringify({
          tutorId,
          scheduleId,
        }),
      })
    } catch (error) {
      throw error
    }
  },
}

export default tutorService
