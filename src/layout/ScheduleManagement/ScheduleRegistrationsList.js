import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  CBadge,
  CAlert,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilArrowLeft,
  cilUser,
  cilEnvelopeClosed,
  cilPhone,
} from '@coreui/icons'
import { BASE_URL } from '../../config'
import { useAuth } from '../../context/AuthContext'

const ScheduleRegistrationsList = () => {
  const { scheduleId } = useParams()
  const navigate = useNavigate()
  const { admin } = useAuth()
  const isTutor = admin?.role === 'tutor'
  const [loading, setLoading] = useState(true)
  const [registrations, setRegistrations] = useState([])
  const [schedule, setSchedule] = useState(null)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        await Promise.all([fetchScheduleDetails(), fetchRegistrations()])
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [scheduleId])

  const fetchScheduleDetails = async () => {
    try {
      const token = localStorage.getItem('admin_token')

      if (!token) {
        throw new Error('No admin token found. Please log in again.')
      }

      // Use the direct scheduleId endpoint instead of slug
      const response = await fetch(
        `${BASE_URL}/api/schedule/id/${scheduleId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        if (response.status === 401) {
          // Token invalid/expired; clear and use router navigate (hash router)
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_info')
          navigate('/login', { replace: true })
          return
        }
        throw new Error(`HTTP error ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setSchedule(data.data)
        return data.data
      } else {
        throw new Error(data.message || 'Failed to load schedule details')
      }
    } catch (err) {
      console.error('Error loading schedule details:', err)
      setError(`Failed to load schedule details: ${err.message}`)
      return null
    }
  }

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem('admin_token')

      if (!token) {
        throw new Error('No admin token found. Please log in again.')
      }

      console.log(
        'Fetching registrations with token:',
        token ? 'Token exists' : 'No token',
      )

      const isTutor = admin?.role === 'tutor'
      const endpoint = isTutor
        ? `${BASE_URL}/api/registrations/tutor/schedule/${scheduleId}`
        : `${BASE_URL}/api/registrations/schedule/${scheduleId}`
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_info')
          navigate('/login', { replace: true })
          return
        }
        throw new Error(`HTTP error ${response.status}`)
      }

      const data = await response.json()
      if (data.status === 'success') {
        setRegistrations(data.data.registrations || [])
        return data.data.registrations || []
      } else {
        throw new Error(data.message || 'Failed to load registrations')
      }
    } catch (err) {
      console.error('Error loading registrations:', err)
      setError(`Failed to load registrations: ${err.message}`)
      setRegistrations([])
      return []
    }
  }

  const handleViewDetails = (registrationId) => {
    navigate(`/schedule-requests/${registrationId}`)
  }

  const handleBack = () => {
    navigate('/schedule-capacity')
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <CBadge color="warning">Pending</CBadge>
      case 'approved':
        return <CBadge color="success">Approved</CBadge>
      case 'rejected':
        return <CBadge color="danger">Rejected</CBadge>
      default:
        return <CBadge color="secondary">{status}</CBadge>
    }
  }

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'unpaid':
        return <CBadge color="danger">Unpaid</CBadge>
      case 'pending':
        return <CBadge color="warning">Pending</CBadge>
      case 'paid':
        return <CBadge color="success">Paid</CBadge>
      default:
        return <CBadge color="secondary">{status}</CBadge>
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  // Filter registrations based on selected status filter
  const filteredRegistrations = registrations.filter((registration) => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'paid') return registration.paymentStatus === 'paid'
    if (statusFilter === 'unpaid')
      return (
        registration.paymentStatus === 'unpaid' &&
        registration.status === 'approved'
      )
    if (statusFilter === 'pending') return registration.status === 'pending'
    return registration.status === statusFilter
  })

  // Calculate statistics
  const stats = {
    total: registrations.length,
    approved: registrations.filter((r) => r.status === 'approved').length,
    pending: registrations.filter((r) => r.status === 'pending').length,
    rejected: registrations.filter((r) => r.status === 'rejected').length,
    paid: registrations.filter((r) => r.paymentStatus === 'paid').length,
    unpaid: registrations.filter(
      (r) => r.status === 'approved' && r.paymentStatus === 'unpaid',
    ).length,
  }

  return (
    <CRow>
      <CCol>
        <CButton
          color="primary"
          variant="outline"
          className="mb-3"
          onClick={handleBack}
        >
          <CIcon icon={cilArrowLeft} className="me-2" />
          Back to Schedule Dashboard
        </CButton>

        <CCard className="mb-4">
          <CCardHeader>
            <CRow>
              <CCol>
                <h5>
                  {schedule ? (
                    <>
                      Registrations for: <strong>{schedule.title}</strong>
                    </>
                  ) : (
                    'Schedule Registrations'
                  )}
                </h5>
              </CCol>
              <CCol xs="auto">
                <CButton color="primary" onClick={fetchRegistrations}>
                  Refresh
                </CButton>
              </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody>
            {error && (
              <CAlert color="danger" dismissible>
                {error}
              </CAlert>
            )}

            {schedule && (
              <CCard className="mb-4 bg-light">
                <CCardBody>
                  <CRow>
                    <CCol md={6}>
                      <h6>Schedule Details</h6>
                      <p className="mb-1">
                        <strong>Title:</strong> {schedule.title}
                      </p>
                      <p className="mb-1">
                        <strong>Dates:</strong> {formatDate(schedule.startDate)}{' '}
                        - {formatDate(schedule.endDate)}
                      </p>
                      <p className="mb-1">
                        <strong>Time:</strong>{' '}
                        {schedule.classTime || 'Not specified'}
                      </p>
                    </CCol>
                    <CCol md={6}>
                      <h6>Registration Statistics</h6>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        <CBadge color="info" className="p-2">
                          Total: {stats.total}
                        </CBadge>
                        <CBadge color="success" className="p-2">
                          Approved: {stats.approved}
                        </CBadge>
                        <CBadge color="warning" className="p-2">
                          Pending: {stats.pending}
                        </CBadge>
                        <CBadge color="danger" className="p-2">
                          Rejected: {stats.rejected}
                        </CBadge>
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        <CBadge color="success" className="p-2">
                          Paid: {stats.paid}
                        </CBadge>
                        <CBadge color="danger" className="p-2">
                          Unpaid: {stats.unpaid}
                        </CBadge>
                      </div>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            )}

            <CRow className="mb-3">
              <CCol md={4}>
                <CDropdown className="w-100">
                  <CDropdownToggle color="primary" className="w-100">
                    {statusFilter === 'all'
                      ? 'All Registrations'
                      : statusFilter === 'paid'
                        ? 'Paid Only'
                        : statusFilter === 'unpaid'
                          ? 'Approved but Unpaid'
                          : statusFilter === 'pending'
                            ? 'Pending Approval'
                            : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Only`}
                  </CDropdownToggle>
                  <CDropdownMenu>
                    <CDropdownItem onClick={() => setStatusFilter('all')}>
                      All Registrations
                    </CDropdownItem>
                    <CDropdownItem onClick={() => setStatusFilter('pending')}>
                      Pending Approval
                    </CDropdownItem>
                    <CDropdownItem onClick={() => setStatusFilter('approved')}>
                      Approved
                    </CDropdownItem>
                    <CDropdownItem onClick={() => setStatusFilter('rejected')}>
                      Rejected
                    </CDropdownItem>
                    <CDropdownItem onClick={() => setStatusFilter('paid')}>
                      Paid Only
                    </CDropdownItem>
                    <CDropdownItem onClick={() => setStatusFilter('unpaid')}>
                      Approved but Unpaid
                    </CDropdownItem>
                  </CDropdownMenu>
                </CDropdown>
              </CCol>
            </CRow>

            {loading ? (
              <div className="text-center my-5">
                <CSpinner color="primary" />
                <div className="mt-2">Loading registrations...</div>
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="text-center py-5">
                <h6>No registrations found</h6>
                <p className="text-muted">
                  {statusFilter !== 'all'
                    ? `No ${statusFilter} registrations found. Try a different filter.`
                    : 'There are no registrations for this schedule yet.'}
                </p>
              </div>
            ) : (
              <CTable hover responsive className="border">
                <CTableHead className="bg-light">
                  <CTableRow>
                    <CTableHeaderCell>Student</CTableHeaderCell>
                    <CTableHeaderCell>Contact</CTableHeaderCell>
                    <CTableHeaderCell>Registration Date</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Payment</CTableHeaderCell>
                    {!isTutor && <CTableHeaderCell>Actions</CTableHeaderCell>}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredRegistrations.map((registration) => (
                    <CTableRow key={registration._id}>
                      <CTableDataCell>
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded-circle p-2 me-2">
                            <CIcon icon={cilUser} size="lg" />
                          </div>
                          <div>
                            <div className="fw-bold">
                              {registration.userId?.fullName || 'N/A'}
                            </div>
                            <div className="small text-muted">
                              ID: {registration.userId?._id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="mb-1">
                          <CIcon
                            icon={cilEnvelopeClosed}
                            className="me-1 text-muted"
                          />
                          {registration.userId?.email || 'N/A'}
                        </div>
                        {registration.userId?.phoneNumber && (
                          <div>
                            <CIcon
                              icon={cilPhone}
                              className="me-1 text-muted"
                            />
                            {registration.userId.phoneNumber}
                          </div>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        {formatDate(registration.createdAt)}
                      </CTableDataCell>
                      <CTableDataCell>
                        {getStatusBadge(registration.status)}
                      </CTableDataCell>
                      <CTableDataCell>
                        <div>
                          {getPaymentStatusBadge(registration.paymentStatus)}
                        </div>
                        {registration.paymentSent && (
                          <small className="text-muted">
                            Payment link sent
                          </small>
                        )}
                      </CTableDataCell>
                      {!isTutor && (
                        <CTableDataCell>
                          <CButton
                            color="primary"
                            size="sm"
                            onClick={() => handleViewDetails(registration._id)}
                          >
                            Manage Registration
                          </CButton>
                        </CTableDataCell>
                      )}
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ScheduleRegistrationsList
