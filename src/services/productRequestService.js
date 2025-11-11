import { api } from './api'

// Get all product requests with pagination and filtering
export const getAllProductRequests = async (
  page = 1,
  limit = 10,
  search = '',
  status = '',
) => {
  try {
    let url = `/product-requests?page=${page}&limit=${limit}`

    if (search) {
      url += `&search=${search}`
    }

    if (status) {
      url += `&status=${status}`
    }

    return await api.get(url)
  } catch (error) {
    throw error
  }
}

// Get a product request by ID
export const getProductRequestById = async (requestId) => {
  try {
    return await api.get(`/product-requests/${requestId}`)
  } catch (error) {
    throw error
  }
}

// Update a product request status
export const updateProductRequestStatus = async (
  requestId,
  status,
  notes = '',
) => {
  try {
    return await api.patch(`/product-requests/${requestId}/status`, {
      status,
      notes,
    })
  } catch (error) {
    throw error
  }
}
