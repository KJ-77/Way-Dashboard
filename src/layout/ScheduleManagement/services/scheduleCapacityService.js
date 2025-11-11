import { BASE_URL } from '../../../config'

class ScheduleCapacityService {
  constructor() {
    this.baseURL = BASE_URL
  }

  getAuthHeaders() {
    const token = localStorage.getItem('admin_token')
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }

  async fetchSchedulesWithCapacity() {
    try {
      // Fetch schedules using the same endpoint as frontend
      // This endpoint already includes enrolledStudents calculation
      const response = await fetch(`${this.baseURL}/api/schedule?limit=100`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_info')
          // Do not hard redirect; let caller handle navigation
          return []
        }
        throw new Error(`HTTP error ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to load schedules')
      }

      // The backend already provides enrolledStudents and isFull
      // No need for manual calculation
      return data.data || []
    } catch (error) {
      console.error('Error fetching schedules with capacity:', error)
      throw error
    }
  }

  async fetchRegistrationsForSchedule(scheduleId) {
    try {
      const token = localStorage.getItem('admin_token')

      if (!token) {
        throw new Error('No admin token found. Please log in again.')
      }

      const response = await fetch(
        `${this.baseURL}/api/registrations/schedule/${scheduleId}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        },
      )

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_info')
          return []
        }
        throw new Error(`HTTP error ${response.status}`)
      }

      const data = await response.json()

      if (data.status !== 'success') {
        throw new Error(data.message || 'Failed to load registrations')
      }

      return data.data?.registrations || []
    } catch (error) {
      console.error('Error fetching registrations:', error)
      throw error
    }
  }
}

export default new ScheduleCapacityService()
