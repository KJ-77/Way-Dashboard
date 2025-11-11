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
  CSpinner,
  CAlert,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilInfo, cilPencil, cilTrash, cilPlus } from '@coreui/icons'
import { useAuth } from '../../context/AuthContext'
import BACKEND_URL from '../../config'
import { BASE_URL } from '../../config'

const HomeList = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [homeContent, setHomeContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modal states
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  // Load home content (single record)
  const loadHomeContent = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('admin_token')

      const response = await fetch(`${BACKEND_URL}/home`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch home content')
      }

      const data = await response.json()

      if (data.success) {
        // Get the first (and only) home record
        const homes = data.data || []
        setHomeContent(homes.length > 0 ? homes[0] : null)
      } else {
        throw new Error(data.message || 'Failed to fetch home content')
      }
    } catch (error) {
      console.error('Error loading home content:', error)
      setError(error.message)
      setHomeContent(null)
    } finally {
      setLoading(false)
    }
  }

  // Effects
  useEffect(() => {
    loadHomeContent()
  }, [])

  // Handlers
  const handleViewHome = () => {
    setViewModalVisible(true)
  }

  const handleEditHome = () => {
    if (homeContent) {
      navigate(`/home-management/${homeContent.slug}/edit`)
    } else {
      navigate('/home-management/new')
    }
  }

  const handleDeleteHome = () => {
    setDeleteModalVisible(true)
  }

  const confirmDelete = async () => {
    if (!homeContent) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${BACKEND_URL}/home/${homeContent.slug}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        setDeleteModalVisible(false)
        setHomeContent(null)
        // Reload to reflect changes
        loadHomeContent()
      } else {
        throw new Error(data.message || 'Failed to delete home content')
      }
    } catch (error) {
      console.error('Error deleting home content:', error)
      setError(error.message)
    }
  }

  // Helper functions
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

  const getVideoUrl = (videoPath) => {
    if (!videoPath) return null
    if (videoPath.startsWith('http')) return videoPath
    return `${BASE_URL}${videoPath}`
  }

  const renderEmptyState = () => (
    <CRow className="justify-content-center">
      <CCol xs={12} className="text-center py-5">
        <h5>No Home Content Found</h5>
        <p className="text-medium-emphasis">
          The home page content has not been created yet.
        </p>
        <CButton
          color="primary"
          onClick={() => navigate('/home-management/new')}
        >
          <CIcon icon={cilPlus} className="me-2" />
          Create Home Content
        </CButton>
      </CCol>
    </CRow>
  )

  const renderHomeContent = () => (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <div>
          <strong>Current Home Content</strong>
          <div className="small text-muted">
            Last updated: {formatDate(homeContent.updatedAt)}
          </div>
        </div>
        <div className="d-flex gap-2">
          <CButton
            color="info"
            variant="outline"
            onClick={handleViewHome}
            title="Preview"
          >
            <CIcon icon={cilInfo} className="me-1" />
            Preview
          </CButton>
          <CButton
            color="warning"
            variant="outline"
            onClick={handleEditHome}
            title="Edit"
          >
            <CIcon icon={cilPencil} className="me-1" />
            Edit
          </CButton>
          <CButton
            color="danger"
            variant="outline"
            onClick={handleDeleteHome}
            title="Delete"
          >
            <CIcon icon={cilTrash} className="me-1" />
            Delete
          </CButton>
        </div>
      </CCardHeader>
      <CCardBody>
        <CRow>
          <CCol md={8}>
            <div className="mb-3">
              <strong>Title:</strong>
              <div className="mt-1">{homeContent.title}</div>
            </div>
            <div className="mb-3">
              <strong>Content:</strong>
              <div className="mt-1" style={{ whiteSpace: 'pre-wrap' }}>
                {truncateText(homeContent.text, 200)}
                {homeContent.text.length > 200 && (
                  <span className="text-muted"> ...read more</span>
                )}
              </div>
            </div>
          </CCol>
          <CCol md={4}>
            {homeContent.video ? (
              <div>
                <strong>Video:</strong>
                <div className="mt-2">
                  <video
                    src={getVideoUrl(homeContent.video)}
                    controls
                    style={{
                      width: '100%',
                      maxHeight: '200px',
                      borderRadius: '4px',
                      border: '1px solid #dee2e6',
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center text-muted py-4">
                <p>No video uploaded</p>
              </div>
            )}
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Home Page Management</strong>
                <div className="small text-muted">
                  Manage your website's home page content
                </div>
              </div>
              {!homeContent && (
                <CButton
                  color="primary"
                  onClick={() => navigate('/home-management/new')}
                >
                  <CIcon icon={cilPlus} className="me-2" />
                  Create Home Content
                </CButton>
              )}
            </CCardHeader>
            <CCardBody>
              {/* Error Alert */}
              {error && (
                <CAlert
                  color="danger"
                  dismissible
                  onClose={() => setError(null)}
                >
                  {error}
                </CAlert>
              )}

              {/* Loading State */}
              {loading && (
                <div className="text-center p-4">
                  <CSpinner color="primary" />
                  <div className="mt-2">Loading home content...</div>
                </div>
              )}

              {/* Content */}
              {!loading && !homeContent && renderEmptyState()}
              {!loading && homeContent && renderHomeContent()}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* View Modal */}
      <CModal
        visible={viewModalVisible}
        onClose={() => setViewModalVisible(false)}
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>Home Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {homeContent && (
            <div>
              <div className="mb-3">
                <strong>Title:</strong>
                <div>{homeContent.title}</div>
              </div>
              <div className="mb-3">
                <strong>Text:</strong>
                <div style={{ whiteSpace: 'pre-wrap' }}>{homeContent.text}</div>
              </div>
              {homeContent.video && (
                <div className="mb-3">
                  <strong>Video:</strong>
                  <div className="mt-2">
                    <video
                      src={getVideoUrl(homeContent.video)}
                      controls
                      style={{ width: '100%', maxHeight: '300px' }}
                    />
                  </div>
                </div>
              )}
              <div className="mb-3">
                <strong>Slug:</strong>
                <div className="text-muted">{homeContent.slug}</div>
              </div>
              <div className="mb-3">
                <strong>Created:</strong>
                <div className="text-muted">
                  {formatDate(homeContent.createdAt)}
                </div>
              </div>
              <div className="mb-3">
                <strong>Last Updated:</strong>
                <div className="text-muted">
                  {formatDate(homeContent.updatedAt)}
                </div>
              </div>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setViewModalVisible(false)}>
            Close
          </CButton>
          {homeContent && (
            <CButton
              color="warning"
              onClick={() => {
                setViewModalVisible(false)
                handleEditHome()
              }}
            >
              <CIcon icon={cilPencil} className="me-2" />
              Edit
            </CButton>
          )}
        </CModalFooter>
      </CModal>

      {/* Delete Confirmation Modal */}
      <CModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
      >
        <CModalHeader>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {homeContent && (
            <div>
              <p>Are you sure you want to delete the home page content?</p>
              <div className="bg-light p-3 rounded">
                <strong>Title:</strong> {homeContent.title}
                <br />
                <strong>Text:</strong> {truncateText(homeContent.text, 100)}
              </div>
              <div className="text-danger mt-2">
                <small>
                  This action cannot be undone. Your home page will be empty.
                </small>
              </div>
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
            <CIcon icon={cilTrash} className="me-2" />
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default HomeList
