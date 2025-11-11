import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CButton,
  CSpinner,
  CFormInput,
  CInputGroup,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CBadge,
  CPagination,
  CPaginationItem,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormTextarea,
  CAlert,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import EmptyState from '../../components/common/EmptyState'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilFilter, cilEnvelopeOpen } from '@coreui/icons'
import { getAllRegistrations } from '../../services/registrationService'
import { useAuth } from '../../context/AuthContext'
import BACKEND_URL from '../../config'

const ScheduleRequests = () => {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [messageModalVisible, setMessageModalVisible] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [message, setMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const navigate = useNavigate()

  const { admin } = useAuth()

  useEffect(() => {
    loadRequests(pagination.page)
  }, [pagination.page, statusFilter, admin?.role])

  const loadRequests = async (page = 1) => {
    setLoading(true)
    setError(null)

    try {
      // If tutor, aggregate registrations of assigned schedules client-side
      if (admin?.role === 'tutor') {
        // First fetch assigned schedules
        const token = localStorage.getItem('admin_token')
        const schedulesRes = await fetch(`${BACKEND_URL}/tutor/me/schedules`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const schedulesData = await schedulesRes.json()
        const schedules = Array.isArray(schedulesData.data)
          ? schedulesData.data
          : []
        const registrations = []
        for (const s of schedules) {
          const res = await fetch(
            `${BACKEND_URL}/registrations/tutor/schedule/${s._id}`,
            { headers: { Authorization: `Bearer ${token}` } },
          )
          if (res.ok) {
            const d = await res.json()
            const list = d.data?.registrations || []
            registrations.push(...list)
          }
        }
        setRequests(registrations)
        setPagination({
          page: 1,
          totalPages: 1,
          totalItems: registrations.length,
        })
        return
      }

      const data = await getAllRegistrations(page, 10, statusFilter)

      if (data && data.data && data.data.registrations) {
        setRequests(data.data.registrations)
        setPagination({
          page: data.page || 1,
          totalPages: data.totalPages || 1,
          totalItems: data.totalItems || 0,
        })
      } else {
        console.error('Invalid response format:', data)
        setRequests([])
      }
    } catch (error) {
      console.error('Error fetching registration requests:', error)
      setError(error.message || 'Failed to load registration requests')
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status)
    setPagination({ ...pagination, page: 1 })
  }

  const handlePageChange = (page) => {
    setPagination({ ...pagination, page })
  }

  const handleViewDetails = (registrationId) => {
    navigate(`/schedule-requests/${registrationId}`)
  }

  const getStatusBadge = (status) => {
    let badge

    if (status === 'pending') {
      badge = <CBadge color="warning">Pending</CBadge>
    } else if (status === 'approved') {
      badge = <CBadge color="success">Approved</CBadge>
    } else if (status === 'rejected') {
      badge = <CBadge color="danger">Rejected</CBadge>
    } else {
      badge = <CBadge color="secondary">{status}</CBadge>
    }

    return badge
  }

  const getPaymentStatusBadge = (status) => {
    let badge

    if (status === 'unpaid') {
      badge = <CBadge color="danger">Unpaid</CBadge>
    } else if (status === 'pending') {
      badge = <CBadge color="warning">Pending</CBadge>
    } else if (status === 'paid') {
      badge = <CBadge color="success">Paid</CBadge>
    } else {
      badge = <CBadge color="secondary">{status}</CBadge>
    }

    return badge
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  const filteredRequests = requests.filter((request) => {
    if (!request || !request.userId) return false

    const searchLower = searchTerm.toLowerCase()
    const fullName = request.userId?.fullName || ''
    const email = request.userId?.email || ''
    const scheduleTitle = request.scheduleId?.title || ''

    return (
      fullName.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower) ||
      scheduleTitle.toLowerCase().includes(searchLower)
    )
  })

  const renderEmptyState = () => (
    <CRow>
      <CCol>
        <EmptyState onAction={() => loadRequests(1)} />
      </CCol>
    </CRow>
  )

  const isTutor = admin?.role === 'tutor'

  const renderRequestsTable = () => (
    <CTable hover responsive>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>Student</CTableHeaderCell>
          <CTableHeaderCell>Schedule</CTableHeaderCell>
          <CTableHeaderCell>Requested On</CTableHeaderCell>
          <CTableHeaderCell>Status</CTableHeaderCell>
          <CTableHeaderCell>Payment Status</CTableHeaderCell>
          {!isTutor && <CTableHeaderCell>Actions</CTableHeaderCell>}
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {filteredRequests.map((request) => (
          <CTableRow key={request._id}>
            <CTableDataCell>
              {request.userId?.fullName || 'N/A'} <br />
              <small className="text-medium-emphasis">
                {request.userId?.email || 'N/A'}
              </small>
            </CTableDataCell>
            <CTableDataCell>
              {request.scheduleId?.title || 'N/A'}
            </CTableDataCell>
            <CTableDataCell>{formatDate(request.createdAt)}</CTableDataCell>
            <CTableDataCell>{getStatusBadge(request.status)}</CTableDataCell>
            <CTableDataCell>
              {getPaymentStatusBadge(request.paymentStatus)}
            </CTableDataCell>
            {!isTutor && (
              <CTableDataCell>
                <CButton
                  color="primary"
                  size="sm"
                  className="me-2"
                  onClick={() => handleViewDetails(request._id)}
                >
                  View Details
                </CButton>
              </CTableDataCell>
            )}
          </CTableRow>
        ))}
      </CTableBody>
    </CTable>
  )

  return (
    <>
      <CRow>
        <CCol>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Schedule Registration Requests</strong>
            </CCardHeader>
            <CCardBody>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <CAlert
                  color="success"
                  dismissible
                  onClose={() => setSuccess(null)}
                >
                  {success}
                </CAlert>
              )}

              <CRow className="mb-3">
                <CCol sm={6} md={4}>
                  <CInputGroup>
                    <CFormInput
                      placeholder="Search by name, email or schedule..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                    <CButton type="button" color="primary" variant="outline">
                      <CIcon icon={cilSearch} />
                    </CButton>
                  </CInputGroup>
                </CCol>
                <CCol sm={6} md={3}>
                  <CDropdown className="w-100">
                    <CDropdownToggle
                      color="secondary"
                      variant="outline"
                      className="w-100"
                    >
                      <CIcon icon={cilFilter} className="me-2" />
                      {statusFilter
                        ? `Status: ${statusFilter}`
                        : 'Filter by Status'}
                    </CDropdownToggle>
                    <CDropdownMenu>
                      <CDropdownItem
                        onClick={() => handleStatusFilterChange('')}
                      >
                        All Statuses
                      </CDropdownItem>
                      <CDropdownItem
                        onClick={() => handleStatusFilterChange('pending')}
                      >
                        Pending
                      </CDropdownItem>
                      <CDropdownItem
                        onClick={() => handleStatusFilterChange('approved')}
                      >
                        Approved
                      </CDropdownItem>
                      <CDropdownItem
                        onClick={() => handleStatusFilterChange('rejected')}
                      >
                        Rejected
                      </CDropdownItem>
                    </CDropdownMenu>
                  </CDropdown>
                </CCol>
                <CCol
                  sm={12}
                  md={5}
                  className="d-flex justify-content-md-end mt-2 mt-md-0"
                >
                  <CButton color="primary" onClick={() => loadRequests(1)}>
                    Refresh
                  </CButton>
                </CCol>
              </CRow>

              {loading ? (
                <div className="text-center my-5">
                  <CSpinner color="primary" />
                </div>
              ) : filteredRequests.length === 0 ? (
                renderEmptyState()
              ) : (
                <>
                  {renderRequestsTable()}

                  {pagination.totalPages > 1 && (
                    <CPagination align="center" className="mt-3">
                      <CPaginationItem
                        disabled={pagination.page === 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                      >
                        Previous
                      </CPaginationItem>

                      {Array.from({ length: pagination.totalPages }).map(
                        (_, i) => (
                          <CPaginationItem
                            key={i + 1}
                            active={i + 1 === pagination.page}
                            onClick={() => handlePageChange(i + 1)}
                          >
                            {i + 1}
                          </CPaginationItem>
                        ),
                      )}

                      <CPaginationItem
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                      >
                        Next
                      </CPaginationItem>
                    </CPagination>
                  )}
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default ScheduleRequests
