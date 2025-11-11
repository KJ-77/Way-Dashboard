import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CSpinner,
  CInputGroup,
  CFormInput,
  CInputGroupText,
  CFormSelect,
  CBadge,
  CPagination,
  CPaginationItem,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilInfo } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import EmptyState from '../../components/common/EmptyState'
import BACKEND_URL, { BASE_URL } from '../../config'

const ProductRequestList = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const navigate = useNavigate()

  // Load product requests
  const loadRequests = async (page = 1, search = '', status = '') => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('admin_token')

      let url = `${BACKEND_URL}/product-requests?page=${page}&limit=10`
      if (search) url += `&search=${search}`
      if (status) url += `&status=${status}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch product requests')
      }

      const data = await response.json()

      if (data.success) {
        setRequests(data.data)
        setPagination(data.pagination)
      } else {
        throw new Error(data.message || 'Failed to fetch product requests')
      }
    } catch (error) {
      console.error('Error loading product requests:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadRequests(pagination.page, searchTerm, statusFilter)
  }, [])

  // Handle search
  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      loadRequests(1, searchTerm, statusFilter)
    }
  }

  // Handle status filter change
  const handleStatusChange = (e) => {
    const status = e.target.value
    setStatusFilter(status)
    loadRequests(1, searchTerm, status)
  }

  // Handle pagination
  const handlePageChange = (page) => {
    loadRequests(page, searchTerm, statusFilter)
  }

  // Navigate to view request details
  const handleViewRequest = (id) => {
    navigate(`/product-requests/${id}/view`)
  }

  // Get status badge
  const getStatusBadge = (status) => {
    if (status === 'pending') {
      return <CBadge color="warning">Pending</CBadge>
    } else if (status === 'approved') {
      return <CBadge color="success">Approved</CBadge>
    } else if (status === 'rejected') {
      return <CBadge color="danger">Rejected</CBadge>
    } else {
      return <CBadge color="secondary">{status}</CBadge>
    }
  }

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  // Render empty state
  const renderEmptyState = () => (
    <EmptyState message="No product requests found" />
  )

  // Render requests table
  const renderRequestsTable = () => (
    <CTable align="middle" responsive striped hover className="mb-3">
      <CTableHead color="light">
        <CTableRow>
          <CTableHeaderCell className="text-center">ID</CTableHeaderCell>
          <CTableHeaderCell>Product</CTableHeaderCell>
          <CTableHeaderCell>Customer</CTableHeaderCell>
          <CTableHeaderCell>Location</CTableHeaderCell>
          <CTableHeaderCell>Status</CTableHeaderCell>
          <CTableHeaderCell>Created</CTableHeaderCell>
          <CTableHeaderCell>Actions</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {requests.map((request) => (
          <CTableRow key={request._id}>
            <CTableDataCell className="text-center">
              <div>{request._id.substring(request._id.length - 8)}</div>
            </CTableDataCell>
            <CTableDataCell>
              <div className="fw-semibold">
                {request.product?.name || 'Unknown Product'}
              </div>
            </CTableDataCell>
            <CTableDataCell>
              <div>{request.name}</div>
              <div className="small text-medium-emphasis">{request.email}</div>
              <div className="small text-medium-emphasis">{request.phone}</div>
            </CTableDataCell>
            <CTableDataCell>
              <div>{request.location}</div>
            </CTableDataCell>
            <CTableDataCell>
              <div>{getStatusBadge(request.status)}</div>
            </CTableDataCell>
            <CTableDataCell>
              <div>{formatDate(request.createdAt)}</div>
            </CTableDataCell>
            <CTableDataCell>
              <CButton
                color="primary"
                size="sm"
                onClick={() => handleViewRequest(request._id)}
              >
                <CIcon icon={cilInfo} size="sm" /> View
              </CButton>
            </CTableDataCell>
          </CTableRow>
        ))}
      </CTableBody>
    </CTable>
  )

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Product Requests</strong>
            <div className="small text-medium-emphasis">
              Manage product inquiries from customers
            </div>
          </CCardHeader>
          <CCardBody>
            {/* Error Alert */}
            {error && (
              <CAlert color="danger" dismissible onClose={() => setError(null)}>
                {error}
              </CAlert>
            )}

            {/* Filters Row */}
            <CRow className="mb-3">
              <CCol sm={5}>
                <CInputGroup>
                  <CFormInput
                    placeholder="Search by name, email, or location"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleSearch}
                  />
                  <CButton type="button" color="primary" onClick={handleSearch}>
                    <CIcon icon={cilSearch} />
                  </CButton>
                </CInputGroup>
              </CCol>
              <CCol sm={3}>
                <CFormSelect
                  value={statusFilter}
                  onChange={handleStatusChange}
                  aria-label="Status filter"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </CFormSelect>
              </CCol>
            </CRow>

            {/* Loading State */}
            {loading && (
              <div className="text-center my-5">
                <CSpinner color="primary" />
                <div className="mt-2">Loading product requests...</div>
              </div>
            )}

            {/* Content */}
            {!loading && requests.length === 0 && renderEmptyState()}
            {!loading && requests.length > 0 && renderRequestsTable()}

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
              <CPagination align="center" aria-label="Page navigation">
                <CPaginationItem
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </CPaginationItem>

                {[...Array(pagination.totalPages).keys()].map((pageNum) => (
                  <CPaginationItem
                    key={pageNum + 1}
                    active={pagination.page === pageNum + 1}
                    onClick={() => handlePageChange(pageNum + 1)}
                  >
                    {pageNum + 1}
                  </CPaginationItem>
                ))}

                <CPaginationItem
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </CPaginationItem>
              </CPagination>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ProductRequestList
