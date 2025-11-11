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

const BookWithUsList = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })

  useEffect(() => {
    loadItems()
  }, [pagination.currentPage, searchTerm])

  const loadItems = async (page = 1, search = '') => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${BASE_URL}/api/book-with-us`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to load items')
      let filtered = data.data || []
      if (search.trim()) {
        filtered = filtered.filter((item) =>
          item.text.toLowerCase().includes(search.toLowerCase()),
        )
      }
      const itemsPerPage = 10
      const totalItems = filtered.length
      const totalPages = Math.ceil(totalItems / itemsPerPage)
      const startIndex = (page - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginated = filtered.slice(startIndex, endIndex)
      setItems(paginated)
      setPagination({
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      })
    } catch (err) {
      setError(err.message || 'Failed to load items')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }))
  }

  const handleView = (item) => {
    setSelectedItem(item)
    setViewModalVisible(true)
  }

  const handleEdit = (item) => {
    navigate(`/book-with-us-management/${item.slug}/edit`)
  }

  const handleDelete = (item) => {
    setSelectedItem(item)
    setDeleteModalVisible(true)
  }

  const confirmDelete = async () => {
    if (!selectedItem) return
    try {
      setDeleting(true)
      setError(null)
      const token = localStorage.getItem('admin_token')
      const response = await fetch(
        `${BASE_URL}/api/book-with-us/${selectedItem.slug}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to delete')
      await loadItems(pagination.currentPage, searchTerm)
      setDeleteModalVisible(false)
      setSelectedItem(null)
    } catch (err) {
      setError(err.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

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
    } catch {
      return 'Invalid Date'
    }
  }

  const truncateText = (text, maxLength = 100) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    return `${BASE_URL}/${imagePath}`
  }

  return (
    <CRow>
      <CCol xs={12}>
        {error && (
          <CAlert color="danger" dismissible onClose={() => setError(null)}>
            {error}
          </CAlert>
        )}
        {loading ? (
          <div className="text-center py-5">
            <CSpinner color="primary" />
            <p className="mt-2">Loading...</p>
          </div>
        ) : items.length === 0 ? (
          <CCard>
            <CCardBody>
              <div className="text-center mt-3">
                <h5>No Book With Us Items Found</h5>
                <p className="text-muted">
                  {searchTerm
                    ? `No items match your search for "${searchTerm}"`
                    : "You haven't created any items yet."}
                </p>
                <CButton
                  color="primary"
                  onClick={() => navigate('/book-with-us-management/new')}
                >
                  <CIcon icon={cilPlus} className="me-2" />
                  Create Your First Item
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        ) : (
          <CCard>
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Book With Us Management</h5>
              <CButton
                color="primary"
                onClick={() => navigate('/book-with-us-management/new')}
              >
                <CIcon icon={cilPlus} className="me-2" />
                Create New
              </CButton>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilSearch} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </CInputGroup>
                </CCol>
              </CRow>
              <div className="table-responsive">
                <CTable hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Preview</CTableHeaderCell>
                      <CTableHeaderCell>Text</CTableHeaderCell>
                      <CTableHeaderCell>Images</CTableHeaderCell>
                      <CTableHeaderCell>Created</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {items.map((item) => (
                      <CTableRow key={item._id}>
                        <CTableDataCell>
                          {item.images && item.images.length > 0 ? (
                            <CImage
                              src={getImageUrl(item.images[0])}
                              alt="Preview"
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
                            {truncateText(item.text, 80)}
                          </div>
                          <small className="text-muted">
                            Slug: {item.slug}
                          </small>
                        </CTableDataCell>
                        <CTableDataCell>
                          {item.images?.length || 0} image(s)
                        </CTableDataCell>
                        <CTableDataCell>
                          {formatDate(item.createdAt)}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-2">
                            <CButton
                              color="info"
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(item)}
                              title="View"
                            >
                              <CIcon icon={cilInfo} />
                            </CButton>
                            <CButton
                              color="warning"
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(item)}
                              title="Edit"
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton
                              color="danger"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item)}
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
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <CPagination>
                    <CPaginationItem
                      disabled={!pagination.hasPrevPage}
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
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
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                    >
                      Next
                    </CPaginationItem>
                  </CPagination>
                </div>
              )}
            </CCardBody>
          </CCard>
        )}
        {/* View Modal */}
        <CModal
          visible={viewModalVisible}
          onClose={() => setViewModalVisible(false)}
          size="lg"
        >
          <CModalHeader>
            <CModalTitle>Book With Us Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {selectedItem && (
              <div>
                <div className="mb-3">
                  <strong>Text:</strong>
                  <p className="mt-2">{selectedItem.text}</p>
                </div>
                {selectedItem.images && selectedItem.images.length > 0 && (
                  <div className="mb-3">
                    <strong>Images:</strong>
                    <div className="row mt-2">
                      {selectedItem.images.map((img, idx) => (
                        <div key={idx} className="col-md-4 col-sm-6 mb-3">
                          <CImage
                            src={getImageUrl(img)}
                            alt={`Image ${idx + 1}`}
                            className="w-100 rounded"
                            style={{ height: '150px', objectFit: 'cover' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mb-3">
                  <strong>Slug:</strong>
                  <p className="mt-1 text-muted">{selectedItem.slug}</p>
                </div>
                <div className="mb-3">
                  <strong>Created:</strong>
                  <p className="mt-1 text-muted">
                    {formatDate(selectedItem.createdAt)}
                  </p>
                </div>
                <div className="mb-3">
                  <strong>Last Updated:</strong>
                  <p className="mt-1 text-muted">
                    {formatDate(selectedItem.updatedAt)}
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
            {selectedItem && (
              <p>
                Are you sure you want to delete the item{' '}
                <strong>"{truncateText(selectedItem.text, 50)}"</strong>?
              </p>
            )}
            <p className="text-danger small">
              This action cannot be undone. The item and its associated images
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
                'Delete'
              )}
            </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  )
}

export default BookWithUsList
