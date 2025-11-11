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

const HostList = () => {
  const navigate = useNavigate()
  const [hosts, setHosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [selectedHost, setSelectedHost] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalHosts: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })

  // Load hosts data
  useEffect(() => {
    loadHosts()
  }, [pagination.currentPage, searchTerm])

  const loadHosts = async (page = 1, search = '') => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${BACKEND_URL}/host`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load hosts')
      }

      let filteredHosts = data.data || []

      // Apply search filter
      if (search.trim()) {
        filteredHosts = filteredHosts.filter((host) =>
          host.text.toLowerCase().includes(search.toLowerCase()),
        )
      }

      // Simple pagination simulation
      const itemsPerPage = 10
      const totalHosts = filteredHosts.length
      const totalPages = Math.ceil(totalHosts / itemsPerPage)
      const startIndex = (page - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedHosts = filteredHosts.slice(startIndex, endIndex)

      setHosts(paginatedHosts)
      setPagination({
        currentPage: page,
        totalPages,
        totalHosts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      })
    } catch (err) {
      setError(err.message || 'Failed to load hosts')
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

  // Handle view host
  const handleViewHost = (host) => {
    setSelectedHost(host)
    setViewModalVisible(true)
  }

  // Handle edit host
  const handleEditHost = (host) => {
    navigate(`/host-management/${host.slug}/edit`)
  }

  // Handle delete host
  const handleDeleteHost = (host) => {
    setSelectedHost(host)
    setDeleteModalVisible(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedHost) return

    try {
      setDeleting(true)
      setError(null)

      const token = localStorage.getItem('admin_token')

      const response = await fetch(`${BACKEND_URL}/host/${selectedHost.slug}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete host')
      }

      // Reload hosts
      await loadHosts(pagination.currentPage, searchTerm)

      setDeleteModalVisible(false)
      setSelectedHost(null)
    } catch (err) {
      setError(err.message || 'Failed to delete host')
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

  // Get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    return `${BASE_URL}/${imagePath}`
  }

  // Render empty state
  const renderEmptyState = () => (
    <CCard>
      <CCardBody>
        <EmptyState onAction={() => navigate('/host-management/new')} />
        <div className="text-center mt-3">
          <h5>No Hosts Found</h5>
          <p className="text-muted">
            {searchTerm
              ? `No hosts match your search for "${searchTerm}"`
              : "You haven't created any hosts yet."}
          </p>
          <CButton
            color="primary"
            onClick={() => navigate('/host-management/new')}
          >
            <CIcon icon={cilPlus} className="me-2" />
            Create Your First Host
          </CButton>
        </div>
      </CCardBody>
    </CCard>
  )

  // Render table
  const renderTable = () => (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Host Management</h5>
        <CButton
          color="primary"
          onClick={() => navigate('/host-management/new')}
        >
          <CIcon icon={cilPlus} className="me-2" />
          Create New Host
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
                placeholder="Search hosts..."
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
                <CTableHeaderCell>Image</CTableHeaderCell>
                <CTableHeaderCell>Text</CTableHeaderCell>
                <CTableHeaderCell>Created</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {hosts.map((host) => (
                <CTableRow key={host._id}>
                  <CTableDataCell>
                    {host.image ? (
                      <CImage
                        src={getImageUrl(host.image)}
                        alt="Host image"
                        className="img-fluid rounded"
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        className="bg-light rounded d-flex align-items-center justify-content-center"
                        style={{ width: '60px', height: '60px' }}
                      >
                        <span className="text-muted small">No Image</span>
                      </div>
                    )}
                  </CTableDataCell>
                  <CTableDataCell>
                    <div>
                      <div className="fw-bold">
                        {truncateText(host.text, 50)}
                      </div>
                      <small className="text-muted">Slug: {host.slug}</small>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell>{formatDate(host.createdAt)}</CTableDataCell>
                  <CTableDataCell>
                    <div className="d-flex gap-2">
                      <CButton
                        color="info"
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewHost(host)}
                        title="View"
                      >
                        <CIcon icon={cilInfo} />
                      </CButton>
                      <CButton
                        color="warning"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditHost(host)}
                        title="Edit"
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton
                        color="danger"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteHost(host)}
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
            <p className="mt-2">Loading hosts...</p>
          </div>
        ) : hosts.length === 0 ? (
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
            <CModalTitle>Host Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {selectedHost && (
              <div>
                <div className="mb-3">
                  <strong>Text:</strong>
                  <p className="mt-2">{selectedHost.text}</p>
                </div>
                {selectedHost.image && (
                  <div className="mb-3">
                    <strong>Image:</strong>
                    <div className="mt-2">
                      <CImage
                        src={getImageUrl(selectedHost.image)}
                        alt="Host image"
                        className="img-fluid rounded"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                  </div>
                )}
                <div className="mb-3">
                  <strong>Slug:</strong>
                  <p className="mt-1 text-muted">{selectedHost.slug}</p>
                </div>
                <div className="mb-3">
                  <strong>Created:</strong>
                  <p className="mt-1 text-muted">
                    {formatDate(selectedHost.createdAt)}
                  </p>
                </div>
                <div className="mb-3">
                  <strong>Last Updated:</strong>
                  <p className="mt-1 text-muted">
                    {formatDate(selectedHost.updatedAt)}
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
            {selectedHost && (
              <p>
                Are you sure you want to delete the host{' '}
                <strong>"{truncateText(selectedHost.text, 50)}"</strong>?
              </p>
            )}
            <p className="text-danger small">
              This action cannot be undone. The host and its associated image
              will be permanently deleted.
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
                'Delete Host'
              )}
            </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  )
}

export default HostList
