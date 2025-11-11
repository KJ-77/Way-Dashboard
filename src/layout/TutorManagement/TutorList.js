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
  CAlert,
  CSpinner,
  CImage,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilSearch, cilPencil, cilTrash, cilInfo } from '@coreui/icons'
import { BASE_URL } from '../../config'
import BACKEND_URL from '../../config'
import { EmptyState } from '../../components/common'

const TutorList = () => {
  const navigate = useNavigate()
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [selectedTutor, setSelectedTutor] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTutors: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })

  // Load tutors data
  useEffect(() => {
    loadTutors()
  }, [pagination.currentPage, searchTerm])

  const loadTutors = async (page = 1, search = '') => {
    try {
      setLoading(true)
      setError(null)

      // Get admin token for authorization
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${BACKEND_URL}/tutor`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load tutors')
      }

      let filteredTutors = data.data || []

      // Apply search filter
      if (search.trim()) {
        filteredTutors = filteredTutors.filter(
          (tutor) =>
            tutor.name.toLowerCase().includes(search.toLowerCase()) ||
            tutor.email.toLowerCase().includes(search.toLowerCase()),
        )
      }

      // Simple pagination simulation
      const itemsPerPage = 10
      const totalTutors = filteredTutors.length
      const totalPages = Math.ceil(totalTutors / itemsPerPage)
      const startIndex = (page - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedTutors = filteredTutors.slice(startIndex, endIndex)

      setTutors(paginatedTutors)
      setPagination({
        currentPage: page,
        totalPages,
        totalTutors,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      })
    } catch (err) {
      setError(err.message || 'Failed to load tutors')
    } finally {
      setLoading(false)
    }
  }

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  // Handle page change
  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }))
  }

  // Handle view tutor
  const handleViewTutor = (tutor) => {
    setSelectedTutor(tutor)
    setViewModalVisible(true)
  }

  // Handle edit tutor
  const handleEditTutor = (tutor) => {
    navigate(`/tutor-management/${tutor._id}/edit`)
  }

  // Handle delete tutor
  const handleDeleteTutor = (tutor) => {
    setSelectedTutor(tutor)
    setDeleteModalVisible(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedTutor) return

    try {
      setDeleting(true)
      setError(null)

      const token = localStorage.getItem('admin_token')

      const response = await fetch(
        `${BACKEND_URL}/tutor/${selectedTutor._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete tutor')
      }

      // Reload tutors
      await loadTutors(pagination.currentPage, searchTerm)

      setDeleteModalVisible(false)
      setSelectedTutor(null)
    } catch (err) {
      setError(err.message || 'Failed to delete tutor')
    } finally {
      setDeleting(false)
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

  // Truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  // Get avatar URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null
    return `${BASE_URL}/${avatarPath}`
  }

  // Render empty state
  const renderEmptyState = () => (
    <CCard>
      <CCardBody>
        <EmptyState onAction={() => navigate('/tutor-management/new')} />
        <div className="text-center mt-3">
          <h5>No Tutors Found</h5>
          <p className="text-muted">
            {searchTerm
              ? `No tutors match your search for "${searchTerm}"`
              : "You haven't created any tutors yet."}
          </p>
          <CButton
            color="primary"
            onClick={() => navigate('/tutor-management/new')}
          >
            <CIcon icon={cilPlus} className="me-2" />
            Create Your First Tutor
          </CButton>
        </div>
      </CCardBody>
    </CCard>
  )

  // Render table
  const renderTable = () => (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Tutor Management</h5>
        <CButton
          color="primary"
          onClick={() => navigate('/tutor-management/new')}
        >
          <CIcon icon={cilPlus} className="me-2" />
          Create New Tutor
        </CButton>
      </CCardHeader>
      <CCardBody>
        {/* Search */}
        <CRow className="mb-3">
          <CCol md={6}>
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilSearch} />
              </CInputGroupText>
              <CFormInput
                placeholder="Search tutors by name or email..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </CInputGroup>
          </CCol>
        </CRow>

        {/* Table */}
        <div className="table-responsive">
          <CTable hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Avatar</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Created</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {tutors.map((tutor) => (
                <CTableRow key={tutor._id}>
                  <CTableDataCell>
                    {tutor.avatar ? (
                      <CImage
                        src={getAvatarUrl(tutor.avatar)}
                        alt="Tutor avatar"
                        className="img-fluid rounded-circle"
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        className="bg-light rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '50px', height: '50px' }}
                      >
                        <span className="text-muted">
                          {tutor.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </CTableDataCell>
                  <CTableDataCell>
                    <div className="fw-bold">{tutor.name}</div>
                  </CTableDataCell>
                  <CTableDataCell>{tutor.email}</CTableDataCell>
                  <CTableDataCell>{formatDate(tutor.createdAt)}</CTableDataCell>
                  <CTableDataCell>
                    <div className="d-flex gap-2">
                      <CButton
                        color="info"
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewTutor(tutor)}
                        title="View"
                      >
                        <CIcon icon={cilInfo} />
                      </CButton>
                      <CButton
                        color="warning"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTutor(tutor)}
                        title="Edit"
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton
                        color="danger"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTutor(tutor)}
                        title="Delete"
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="d-flex justify-content-center mt-3">
            <CPagination>
              <CPaginationItem
                disabled={!pagination.hasPrevPage}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                Previous
              </CPaginationItem>
              {[...Array(pagination.totalPages)].map((_, index) => (
                <CPaginationItem
                  key={index + 1}
                  active={pagination.currentPage === index + 1}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </CPaginationItem>
              ))}
              <CPaginationItem
                disabled={!pagination.hasNextPage}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                Next
              </CPaginationItem>
            </CPagination>
          </div>
        )}
      </CCardBody>
    </CCard>
  )

  return (
    <CRow>
      <CCol xs={12}>
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
            <p className="mt-2">Loading tutors...</p>
          </div>
        ) : tutors.length === 0 ? (
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
            <CModalTitle>Tutor Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {selectedTutor && (
              <div>
                <div className="d-flex align-items-center mb-3">
                  {selectedTutor.avatar ? (
                    <CImage
                      src={getAvatarUrl(selectedTutor.avatar)}
                      alt="Tutor avatar"
                      className="rounded-circle me-3"
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ width: '80px', height: '80px' }}
                    >
                      <span className="h3 mb-0">
                        {selectedTutor.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h4 className="mb-0">{selectedTutor.name}</h4>
                    <p className="text-muted mb-0">{selectedTutor.email}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <h6>Bio</h6>
                  <p>{selectedTutor.bio || 'No bio provided.'}</p>
                </div>

                <div className="mb-3">
                  <h6>Description</h6>
                  <p>
                    {selectedTutor.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mb-3">
                  <h6>Created</h6>
                  <p className="text-muted">
                    {formatDate(selectedTutor.createdAt)}
                  </p>
                </div>

                <div>
                  <h6>Last Updated</h6>
                  <p className="text-muted">
                    {formatDate(selectedTutor.updatedAt)}
                  </p>
                </div>
              </div>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              onClick={() => setViewModalVisible(false)}
            >
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
            {selectedTutor && (
              <p>
                Are you sure you want to delete the tutor{' '}
                <strong>"{selectedTutor.name}"</strong>?
              </p>
            )}
            <p className="text-danger small">
              This action cannot be undone. All associated data will be
              permanently deleted.
            </p>
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              onClick={() => setDeleteModalVisible(false)}
              disabled={deleting}
            >
              Cancel
            </CButton>
            <CButton color="danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  Deleting...
                </>
              ) : (
                'Delete Tutor'
              )}
            </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  )
}

export default TutorList
