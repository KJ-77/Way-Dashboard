import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CInputGroup,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CBadge,
  CSpinner,
  CAlert,
  CImage,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilInfo, cilPencil, cilTrash, cilPlus } from '@coreui/icons'
// import { format } from 'date-fns' // Not installed, using native JS instead
import { useAuth } from '../../context/AuthContext'
import BACKEND_URL from '../../config'
import { BASE_URL } from '../../config'

const EventList = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({
    current: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  // Modal states
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Load events
  const loadEvents = async (page = 1, search = '') => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
      })

      const response = await fetch(`${BACKEND_URL}/event?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load events')
      }

      setEvents(data.data || [])
      setPagination(
        data.pagination || {
          current: 1,
          total: 1,
          count: 0,
          totalDocuments: 0,
        },
      )
    } catch (err) {
      setError(err.message || 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  // Handle search
  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      loadEvents(1, searchTerm)
    }
  }

  // Handle pagination
  const handlePageChange = (page) => {
    loadEvents(page, searchTerm)
  }

  // Handle view event
  const handleViewEvent = (event) => {
    setSelectedEvent(event)
    setViewModalVisible(true)
  }

  // Handle edit event
  const handleEditEvent = (event) => {
    navigate(`/event-management/${event.slug}/edit`)
  }

  // Handle delete event
  const handleDeleteEvent = (event) => {
    setSelectedEvent(event)
    setDeleteModalVisible(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('admin_token')

      const response = await fetch(
        `${BACKEND_URL}/event/${selectedEvent.slug}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      setDeleteModalVisible(false)
      setSelectedEvent(null)
      await loadEvents(pagination.current, searchTerm)
    } catch (err) {
      setError(err.message || 'Failed to delete event')
    }
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    })
  }

  // Truncate text
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // Get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    return `${BASE_URL}/${imagePath}`
  }

  // Render empty state
  const renderEmptyState = () => (
    <CRow className="justify-content-center">
      <CCol md={8}>
        <CCard className="text-center">
          <CCardBody className="py-5">
            <CIcon icon={cilPlus} size="3xl" className="text-muted mb-3" />
            <h4 className="text-muted">No Events Found</h4>
            <p className="text-muted mb-4">
              {searchTerm
                ? `No events found matching "${searchTerm}"`
                : 'Get started by creating your first event'}
            </p>
            <CButton
              color="primary"
              onClick={() => navigate('/event-management/new')}
            >
              <CIcon icon={cilPlus} className="me-2" />
              Create Event
            </CButton>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )

  // Render table
  const renderTable = () => (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Event Management</h5>
        <CButton
          color="primary"
          onClick={() => navigate('/event-management/new')}
        >
          <CIcon icon={cilPlus} className="me-2" />
          Add New Event
        </CButton>
      </CCardHeader>
      <CCardBody>
        {/* Search */}
        <CInputGroup className="mb-3">
          <CFormInput
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearch}
          />
          <CButton
            type="button"
            color="primary"
            variant="outline"
            onClick={handleSearch}
          >
            <CIcon icon={cilSearch} />
          </CButton>
        </CInputGroup>

        {/* Table */}
        <CTable hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Image</CTableHeaderCell>
              <CTableHeaderCell>Title</CTableHeaderCell>
              <CTableHeaderCell>Content</CTableHeaderCell>
              <CTableHeaderCell>Created</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {events.map((event) => (
              <CTableRow key={event._id}>
                <CTableDataCell>
                  {event.image ? (
                    <CImage
                      src={getImageUrl(event.image)}
                      alt={event.title}
                      width={50}
                      height={50}
                      className="object-fit-cover rounded"
                    />
                  ) : (
                    <div
                      className="bg-light d-flex align-items-center justify-content-center rounded"
                      style={{ width: 50, height: 50 }}
                    >
                      <CIcon icon={cilInfo} className="text-muted" />
                    </div>
                  )}
                </CTableDataCell>
                <CTableDataCell>
                  <strong>{event.title}</strong>
                </CTableDataCell>
                <CTableDataCell>
                  {truncateText(event.content, 80)}
                </CTableDataCell>
                <CTableDataCell>{formatDate(event.createdAt)}</CTableDataCell>
                <CTableDataCell>
                  <div className="d-flex gap-2">
                    <CButton
                      color="info"
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewEvent(event)}
                    >
                      <CIcon icon={cilInfo} />
                    </CButton>
                    <CButton
                      color="warning"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEvent(event)}
                    >
                      <CIcon icon={cilPencil} />
                    </CButton>
                    <CButton
                      color="danger"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteEvent(event)}
                    >
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </div>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <CPagination className="justify-content-center">
            <CPaginationItem
              disabled={!pagination.hasPrev}
              onClick={() => handlePageChange(pagination.current - 1)}
            >
              Previous
            </CPaginationItem>
            {[...Array(pagination.totalPages)].map((_, index) => (
              <CPaginationItem
                key={index + 1}
                active={pagination.current === index + 1}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </CPaginationItem>
            ))}
            <CPaginationItem
              disabled={!pagination.hasNext}
              onClick={() => handlePageChange(pagination.current + 1)}
            >
              Next
            </CPaginationItem>
          </CPagination>
        )}
      </CCardBody>
    </CCard>
  )

  return (
    <div>
      {/* Error Alert */}
      {error && (
        <CAlert color="danger" dismissible onClose={() => setError(null)}>
          {error}
        </CAlert>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-5">
          <CSpinner color="primary" />
          <p className="mt-2">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        renderEmptyState()
      ) : (
        renderTable()
      )}

      {/* View Modal */}
      <CModal
        visible={viewModalVisible}
        onClose={() => setViewModalVisible(false)}
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>View Event</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedEvent && (
            <div>
              <h5>{selectedEvent.title}</h5>
              {selectedEvent.image && (
                <div className="mb-3">
                  <CImage
                    src={getImageUrl(selectedEvent.image)}
                    alt={selectedEvent.title}
                    className="w-100 mb-3"
                    style={{ maxHeight: '300px', objectFit: 'cover' }}
                  />
                </div>
              )}
              <p>{selectedEvent.content}</p>
              <small className="text-muted">
                Created: {formatDate(selectedEvent.createdAt)}
              </small>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setViewModalVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Delete Modal */}
      <CModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
      >
        <CModalHeader>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedEvent && (
            <div>
              <p>Are you sure you want to delete this event?</p>
              <p>
                <strong>Title:</strong> {selectedEvent.title}
              </p>
              <p className="text-danger">
                <small>This action cannot be undone.</small>
              </p>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setDeleteModalVisible(false)}
          >
            Cancel
          </CButton>
          <CButton color="danger" onClick={confirmDelete}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default EventList
