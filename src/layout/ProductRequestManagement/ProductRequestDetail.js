import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CSpinner,
  CAlert,
  CForm,
  CFormTextarea,
  CBadge,
  CListGroup,
  CListGroupItem,
  CImage,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilArrowLeft,
  cilCheckCircle,
  cilXCircle,
  cilEnvelopeOpen,
} from '@coreui/icons'

import { useAuth } from '../../context/AuthContext'
import BACKEND_URL, { BASE_URL } from '../../config'

const ProductRequestDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [success, setSuccess] = useState(null)
  const [notes, setNotes] = useState('')
  const [messageModalVisible, setMessageModalVisible] = useState(false)
  const [message, setMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  // Fetch request details
  useEffect(() => {
    const fetchRequestDetails = async () => {
      setLoading(true)
      setError(null)

      try {
        const token = localStorage.getItem('admin_token')
        const response = await fetch(`${BACKEND_URL}/product-requests/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch request details')
        }

        const data = await response.json()

        if (data.success) {
          setRequest(data.data)
          if (data.data.notes) {
            setNotes(data.data.notes)
          }
        } else {
          throw new Error(data.message || 'Failed to fetch request details')
        }
      } catch (error) {
        console.error('Error loading request details:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRequestDetails()
  }, [id])

  // Handle status update
  const handleUpdateStatus = async (status) => {
    setUpdating(true)
    setError(null)
    setSuccess(null)

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(
        `${BACKEND_URL}/product-requests/${id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, notes }),
        },
      )

      if (!response.ok) {
        throw new Error('Failed to update request status')
      }

      const data = await response.json()

      if (data.success) {
        setRequest(data.data)
        setSuccess(
          `Request has been ${status} successfully. Email notification has been sent to the customer.`,
        )
      } else {
        throw new Error(data.message || 'Failed to update request status')
      }
    } catch (error) {
      console.error('Error updating request status:', error)
      setError(error.message)
    } finally {
      setUpdating(false)
    }
  }

  // Handle sending a message to the customer
  const handleSendMessage = async () => {
    if (!message.trim()) {
      setError('Message cannot be empty')
      return
    }

    setSendingMessage(true)
    setError(null)
    setSuccess(null)

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(
        `${BACKEND_URL}/product-requests/${id}/send-message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message }),
        },
      )

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      if (data.success) {
        setSuccess('Message has been sent successfully to the customer.')
        setMessageModalVisible(false)
        setMessage('')
      } else {
        throw new Error(data.message || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setError(error.message)
    } finally {
      setSendingMessage(false)
    }
  }

  // Handle back button
  const handleBack = () => {
    navigate('/product-requests')
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
    } catch {
      return 'Invalid Date'
    }
  }

  // Get status badge
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

  // Get image URL for product
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    if (imagePath.startsWith('http')) return imagePath
    return `${BASE_URL}/uploads/${imagePath}`
  }

  if (loading) {
    return (
      <div className="text-center my-5">
        <CSpinner color="primary" />
        <div className="mt-2">Loading request details...</div>
      </div>
    )
  }

  if (error) {
    return (
      <CAlert color="danger">
        {error}
        <div className="mt-3">
          <CButton color="secondary" onClick={handleBack}>
            Back to Product Requests
          </CButton>
        </div>
      </CAlert>
    )
  }

  if (!request) {
    return (
      <CAlert color="warning">
        Request not found
        <div className="mt-3">
          <CButton color="secondary" onClick={handleBack}>
            Back to Product Requests
          </CButton>
        </div>
      </CAlert>
    )
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between">
              <div>
                <strong>Product Request Details</strong>
                <div className="small text-medium-emphasis">
                  ID: {request._id}
                </div>
              </div>
              <CButton color="secondary" variant="outline" onClick={handleBack}>
                <CIcon icon={cilArrowLeft} className="me-2" />
                Back to List
              </CButton>
            </CCardHeader>
            <CCardBody>
              {/* Success Alert */}
              {success && (
                <CAlert
                  color="success"
                  dismissible
                  onClose={() => setSuccess(null)}
                >
                  {success}
                </CAlert>
              )}

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

              <CRow>
                {/* Product Information */}
                <CCol md={4}>
                  <CCard className="mb-4">
                    <CCardHeader>
                      <strong>Product Information</strong>
                    </CCardHeader>
                    <CCardBody>
                      {request.product ? (
                        <>
                          {request.product.image && (
                            <div className="mb-3 text-center">
                              <CImage
                                src={getImageUrl(request.product.image)}
                                width={150}
                                className="img-fluid rounded"
                                alt={request.product.name}
                              />
                            </div>
                          )}
                          <h4 className="mb-3">{request.product.name}</h4>
                          <p className="text-muted mb-3">
                            {request.product.description}
                          </p>
                          <div className="h5 mb-0">
                            Price: $
                            {parseFloat(request.product.price).toFixed(2)}
                          </div>
                        </>
                      ) : (
                        <p className="text-muted">
                          Product not found or deleted
                        </p>
                      )}
                    </CCardBody>
                  </CCard>
                </CCol>

                {/* Customer Information */}
                <CCol md={4}>
                  <CCard className="mb-4">
                    <CCardHeader>
                      <strong>Customer Information</strong>
                    </CCardHeader>
                    <CCardBody>
                      <CListGroup flush>
                        <CListGroupItem>
                          <strong>Name:</strong> {request.name}
                        </CListGroupItem>
                        <CListGroupItem>
                          <strong>Email:</strong> {request.email}
                        </CListGroupItem>
                        <CListGroupItem>
                          <strong>Phone:</strong> {request.phone}
                        </CListGroupItem>
                        <CListGroupItem>
                          <strong>Location:</strong> {request.location}
                        </CListGroupItem>
                        <CListGroupItem>
                          <strong>Submitted:</strong>{' '}
                          {formatDate(request.createdAt)}
                        </CListGroupItem>
                        <CListGroupItem>
                          <strong>Status:</strong>{' '}
                          {getStatusBadge(request.status)}
                        </CListGroupItem>
                      </CListGroup>
                    </CCardBody>
                  </CCard>
                </CCol>

                {/* Message and Actions */}
                <CCol md={4}>
                  <CCard className="mb-4">
                    <CCardHeader>
                      <strong>Customer Message</strong>
                    </CCardHeader>
                    <CCardBody>
                      <p className="mb-0">
                        {request.message || 'No message provided'}
                      </p>
                    </CCardBody>
                  </CCard>

                  <CCard className="mb-4">
                    <CCardHeader>
                      <strong>Actions</strong>
                    </CCardHeader>
                    <CCardBody>
                      <CForm>
                        <CRow className="mb-3">
                          <CCol xs={12}>
                            <CButton
                              color="info"
                              className="w-100 mb-3"
                              onClick={() => setMessageModalVisible(true)}
                            >
                              <CIcon icon={cilEnvelopeOpen} className="me-2" />
                              Send Message to Customer
                            </CButton>
                          </CCol>
                        </CRow>

                        <CRow>
                          <CCol>
                            <CButton
                              color="success"
                              className="w-100 mb-2"
                              onClick={() => handleUpdateStatus('approved')}
                              disabled={
                                request.status !== 'pending' || updating
                              }
                            >
                              {updating ? (
                                <CSpinner size="sm" className="me-2" />
                              ) : (
                                <CIcon icon={cilCheckCircle} className="me-2" />
                              )}
                              Approve Request
                            </CButton>
                          </CCol>
                          <CCol>
                            <CButton
                              color="danger"
                              className="w-100 mb-2"
                              onClick={() => handleUpdateStatus('rejected')}
                              disabled={
                                request.status !== 'pending' || updating
                              }
                            >
                              {updating ? (
                                <CSpinner size="sm" className="me-2" />
                              ) : (
                                <CIcon icon={cilXCircle} className="me-2" />
                              )}
                              Reject Request
                            </CButton>
                          </CCol>
                        </CRow>
                      </CForm>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Message Modal */}
      <CModal
        visible={messageModalVisible}
        onClose={() => setMessageModalVisible(false)}
        alignment="center"
      >
        <CModalHeader closeButton>
          <CModalTitle>Send Message to Customer</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {error && (
            <CAlert color="danger" dismissible onClose={() => setError(null)}>
              {error}
            </CAlert>
          )}
          <p className="text-muted mb-3">
            This message will be sent via email to{' '}
            <strong>{request?.email}</strong>
          </p>
          <CFormTextarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            disabled={sendingMessage}
            label="Message"
          />
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setMessageModalVisible(false)}
            disabled={sendingMessage}
          >
            Cancel
          </CButton>
          <CButton
            color="primary"
            onClick={handleSendMessage}
            disabled={sendingMessage}
          >
            {sendingMessage ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Sending...
              </>
            ) : (
              'Send Message'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ProductRequestDetail
