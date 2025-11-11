import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CSpinner,
  CRow,
  CCol,
  CFormInput,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CImage,
  CAlert,
} from '@coreui/react'
import { Link, useNavigate } from 'react-router-dom'
import { BASE_URL } from '../../config'
import { useAuth } from '../../context/AuthContext'
import { cilPlus, cilPencil, cilTrash, cilInfo } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const ScheduleList = () => {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [deleting, setDeleting] = useState(false)

  const { admin } = useAuth()
  const navigate = useNavigate()

  // Load schedules
  const loadSchedules = async (page = 1) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')

      // If tutor, fetch assigned schedules; else fetch all
      const isTutor = admin?.role === 'tutor'
      const url = isTutor
        ? `${BASE_URL}/api/tutor/me/schedules`
        : `${BASE_URL}/api/schedule?page=${page}&limit=5`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }

      const data = await response.json()

      if (admin?.role === 'tutor') {
        if (data.status === 'success') {
          const list = Array.isArray(data.data) ? data.data : []
          setSchedules(list)
          setTotalPages(1)
          setCurrentPage(1)
        } else {
          throw new Error(data.message || 'Failed to load schedules')
        }
      } else if (data.success) {
        setSchedules(data.data || [])
        setTotalPages(data.pagination?.total || 0)
        setCurrentPage(data.pagination?.current || 1)
      } else {
        throw new Error(data.message || 'Failed to load schedules')
      }

      setError(null)
    } catch (err) {
      console.error('Error loading schedules:', err)
      setError(`Failed to load schedules: ${err.message}`)
      setSchedules([])
    } finally {
      setLoading(false)
    }
  }

  // Delete schedule
  const handleDeleteSchedule = async (forceDelete = false) => {
    if (!selectedSchedule) return

    try {
      setDeleting(true)
      const token = localStorage.getItem('admin_token')

      const url = forceDelete
        ? `${BASE_URL}/api/schedule/${selectedSchedule.slug}?forceDelete=true`
        : `${BASE_URL}/api/schedule/${selectedSchedule.slug}`

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        // Check if error is due to existing registrations
        if (response.status === 400 && data.message?.includes('registrations')) {
          // Ask user if they want to force delete
          if (window.confirm(
            'This schedule has existing registrations. Force delete will notify all registered users and remove their registrations. Do you want to proceed?'
          )) {
            // Retry with force delete
            return handleDeleteSchedule(true)
          } else {
            setDeleting(false)
            setDeleteModalVisible(false)
            return
          }
        }
        throw new Error(data.message || `HTTP error ${response.status}`)
      }

      if (data.success) {
        setDeleteModalVisible(false)
        setSelectedSchedule(null)
        if (data.data?.notifiedUsers > 0) {
          alert(`Schedule deleted. ${data.data.notifiedUsers} users were notified.`)
        }
        await loadSchedules(currentPage)
      } else {
        throw new Error(data.message || 'Failed to delete schedule')
      }
    } catch (err) {
      console.error('Error deleting schedule:', err)
      setError(err.message || 'Failed to delete schedule. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  // View schedule details
  const handleViewSchedule = (schedule) => {
    setSelectedSchedule(schedule)
    setViewModalVisible(true)
  }

  // Navigate to edit form
  const handleEditSchedule = (schedule) => {
    navigate(`/schedule-management/${schedule.slug}/edit`)
  }

  // Initialize the component
  useEffect(() => {
    loadSchedules()
  }, [admin?.role])

  // Filter schedules based on search term
  const filteredSchedules = schedules.filter(
    (schedule) =>
      schedule.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.slug?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Truncate text
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <CRow>
            <CCol>
              <h5>Schedule Management</h5>
            </CCol>
            {admin?.role !== 'tutor' && (
              <CCol xs="auto">
                <Link to="/schedule-management/new">
                  <CButton color="primary">
                    <CIcon icon={cilPlus} className="me-2" />
                    Add New Schedule
                  </CButton>
                </Link>
              </CCol>
            )}
          </CRow>
        </CCardHeader>
        <CCardBody>
          {error && (
            <CAlert color="danger" dismissible onClose={() => setError(null)}>
              {error}
            </CAlert>
          )}

          {!loading && schedules.length === 0 && !searchTerm ? (
            <div className="text-center py-5">
              <h6>No schedules found</h6>
              <p className="text-muted">
                {admin?.role === 'tutor'
                  ? 'You have no assigned schedules yet.'
                  : 'Create your first schedule to get started'}
              </p>
              {admin?.role !== 'tutor' && (
                <Link to="/schedule-management/new">
                  <CButton color="primary">
                    <CIcon icon={cilPlus} className="me-2" />
                    Create Schedule
                  </CButton>
                </Link>
              )}
            </div>
          ) : (
            <>
              <CRow className="mb-3">
                <CCol>
                  <CFormInput
                    type="text"
                    placeholder="Search schedules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </CCol>
              </CRow>

              {loading ? (
                <div className="text-center py-4">
                  <CSpinner color="primary" />
                  <div className="mt-2">Loading schedules...</div>
                </div>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Preview</CTableHeaderCell>
                      <CTableHeaderCell>Content</CTableHeaderCell>
                      <CTableHeaderCell>Images</CTableHeaderCell>
                      <CTableHeaderCell>Created Date</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredSchedules.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan="5" className="text-center">
                          {searchTerm
                            ? 'No schedules found matching your search'
                            : 'No schedules found'}
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      filteredSchedules.map((schedule) => (
                        <CTableRow key={schedule._id}>
                          <CTableDataCell>
                            {schedule.images && schedule.images.length > 0 ? (
                              <CImage
                                src={`${BASE_URL}${schedule.images[0]}`}
                                alt="Schedule preview"
                                width={60}
                                height={60}
                                className="rounded"
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <div
                                className="d-flex align-items-center justify-content-center bg-light rounded"
                                style={{ width: 60, height: 60 }}
                              >
                                <span className="text-muted">No image</span>
                              </div>
                            )}
                          </CTableDataCell>
                          <CTableDataCell>
                            <div className="fw-semibold">
                              {truncateText(schedule.text, 80)}
                            </div>
                            <small className="text-muted">
                              Slug: {schedule.slug}
                            </small>
                          </CTableDataCell>
                          <CTableDataCell>
                            {schedule.images?.length || 0} image(s)
                          </CTableDataCell>
                          <CTableDataCell>
                            {formatDate(schedule.createdAt)}
                          </CTableDataCell>
                          <CTableDataCell>
                            <div className="d-flex gap-2">
                              <CButton
                                color="info"
                                size="sm"
                                onClick={() => handleViewSchedule(schedule)}
                              >
                                <CIcon icon={cilInfo} />
                              </CButton>
                              {admin?.role !== 'tutor' && (
                                <>
                                  <CButton
                                    color="warning"
                                    size="sm"
                                    onClick={() => handleEditSchedule(schedule)}
                                  >
                                    <CIcon icon={cilPencil} />
                                  </CButton>
                                  <CButton
                                    color="danger"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedSchedule(schedule)
                                      setDeleteModalVisible(true)
                                    }}
                                  >
                                    <CIcon icon={cilTrash} />
                                  </CButton>
                                </>
                              )}
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    )}
                  </CTableBody>
                </CTable>
              )}

              {/* Pagination Controls */}
              {!loading && schedules.length > 0 && totalPages > 1 && (
                <CRow className="mt-3">
                  <CCol className="d-flex justify-content-between align-items-center">
                    <CButton
                      color="primary"
                      disabled={currentPage === 1}
                      onClick={() => loadSchedules(currentPage - 1)}
                    >
                      Previous
                    </CButton>
                    <span className="text-muted">
                      Page {currentPage} of {totalPages}
                    </span>
                    <CButton
                      color="primary"
                      disabled={currentPage >= totalPages}
                      onClick={() => loadSchedules(currentPage + 1)}
                    >
                      Next
                    </CButton>
                  </CCol>
                </CRow>
              )}
            </>
          )}
        </CCardBody>
      </CCard>

      {/* Delete Confirmation Modal */}
      <CModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
      >
        <CModalHeader>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete this schedule? This action cannot be
          undone.
          {selectedSchedule && (
            <div className="mt-3">
              <strong>Content:</strong>{' '}
              {truncateText(selectedSchedule.text, 100)}
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setDeleteModalVisible(false)}
            disabled={deleting}
          >
            Cancel
          </CButton>
          <CButton
            color="danger"
            onClick={handleDeleteSchedule}
            disabled={deleting}
          >
            {deleting ? <CSpinner size="sm" /> : 'Delete'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* View Schedule Modal */}
      <CModal
        visible={viewModalVisible}
        onClose={() => setViewModalVisible(false)}
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>View Schedule</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedSchedule && (
            <div>
              <div className="mb-3">
                <strong>Content:</strong>
                <p className="mt-2">{selectedSchedule.text}</p>
              </div>
              <div className="mb-3">
                <strong>Slug:</strong>
                <p className="mt-1 text-muted">{selectedSchedule.slug}</p>
              </div>
              {selectedSchedule.images &&
                selectedSchedule.images.length > 0 && (
                  <div className="mb-3">
                    <strong>Images:</strong>
                    <div className="row mt-2">
                      {selectedSchedule.images.map((image, index) => (
                        <div key={index} className="col-md-4 col-sm-6 mb-3">
                          <CImage
                            src={`${BASE_URL}${image}`}
                            alt={`Schedule image ${index + 1}`}
                            className="w-100 rounded"
                            style={{ height: '150px', objectFit: 'cover' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              <div className="row">
                <div className="col-md-6">
                  <strong>Created:</strong>
                  <p className="mt-1 text-muted">
                    {formatDate(selectedSchedule.createdAt)}
                  </p>
                </div>
                <div className="col-md-6">
                  <strong>Updated:</strong>
                  <p className="mt-1 text-muted">
                    {formatDate(selectedSchedule.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setViewModalVisible(false)}>
            Close
          </CButton>
          {selectedSchedule && (
            <CButton
              color="warning"
              onClick={() => {
                setViewModalVisible(false)
                handleEditSchedule(selectedSchedule)
              }}
            >
              <CIcon icon={cilPencil} className="me-2" />
              Edit
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ScheduleList
