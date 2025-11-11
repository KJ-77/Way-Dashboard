import { api } from './api'

// Get all registration requests with pagination
export const getAllRegistrations = async (
  page = 1,
  limit = 10,
  status = '',
) => {
  const statusQuery = status ? `&status=${status}` : ''
  try {
    // If current principal is a tutor, this endpoint is not applicable (use schedule-specific)
    const info = localStorage.getItem('admin_info')
    if (info) {
      try {
        const principal = JSON.parse(info)
        if (principal.role === 'tutor') {
          return {
            page: 1,
            totalPages: 1,
            totalItems: 0,
            data: { registrations: [] },
          }
        }
      } catch {}
    }
    return await api.get(
      `/registrations/all?page=${page}&limit=${limit}${statusQuery}`,
    )
  } catch (error) {
    throw error
  }
}

// Get registration by ID
export const getRegistrationById = async (registrationId) => {
  try {
    return await api.get(`/registrations/${registrationId}`)
  } catch (error) {
    throw error
  }
}

// Update registration status
export const updateRegistrationStatus = async (
  registrationId,
  status,
  notes = '',
) => {
  try {
    return await api.patch(`/registrations/${registrationId}/status`, {
      status,
      notes,
    })
  } catch (error) {
    throw error
  }
}

// Send payment link
export const sendPaymentLink = async (registrationId, paymentLink) => {
  try {
    return await api.post(`/registrations/${registrationId}/payment-link`, {
      paymentLink,
    })
  } catch (error) {
    throw error
  }
}

// Check schedule capacity
export const checkScheduleCapacity = async (scheduleId) => {
  try {
    return await api.get(`/registrations/schedule/${scheduleId}/capacity`)
  } catch (error) {
    throw error
  }
}

// Update payment status
export const updatePaymentStatus = async (registrationId, paymentStatus) => {
  try {
    return await api.patch(`/registrations/${registrationId}/payment-status`, {
      paymentStatus,
    })
  } catch (error) {
    throw error
  }
}
