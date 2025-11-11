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
  CBadge,
  CForm,
  CFormTextarea,
  CFormInput,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
  CAlert,
  CListGroup,
  CListGroupItem,
  CCallout,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilArrowLeft,
  cilEnvelopeClosed,
  cilCheckCircle,
  cilXCircle,
  cilUser,
  cilCalendar,
  cilDollar,
  cilEnvelopeOpen,
} from '@coreui/icons'
import {
  getRegistrationById,
  updateRegistrationStatus,
  sendPaymentLink,
  updatePaymentStatus,
} from '../../services/registrationService'
import BACKEND_URL from '../../config'

const ScheduleRequestDetail = () => {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [registration, setRegistration] = useState(null)
  const [error, setError] = useState(null)
  const [notes, setNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [success, setSuccess] = useState(null)

  const [paymentLinkModal, setPaymentLinkModal] = useState(false)
  const [paymentLink, setPaymentLink] = useState('https://example.com/payment')
  const [statusUpdateModal, setStatusUpdateModal] = useState({
    visible: false,
    status: null,
  })
  const [paymentStatusModal, setPaymentStatusModal] = useState({
    visible: false,
    status: null,
  })
  const [messageModalVisible, setMessageModalVisible] = useState(false)
  const [message, setMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionSuccess, setActionSuccess] = useState(null)

  useEffect(() => {
    fetchRegistrationDetails()
  }, [requestId])

  // Find the specific session selected by the user
  const selectedSession = React.useMemo(() => {
    const sessions = registration?.scheduleId?.sessions || []
    const targetId =
      registration?.sessionId?.toString?.() || registration?.sessionId
    return sessions.find((s) => (s?._id?.toString?.() || s?._id) === targetId)
  }, [registration])

  const fetchRegistrationDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getRegistrationById(requestId)
      if (data && data.data && data.data.registration) {
        setRegistration(data.data.registration)
        setNotes(data.data.registration.notes || '')
      } else {
        setError('Invalid response format')
      }
    } catch (error) {
      setError(
        error.message ||
          'An error occurred while fetching registration details',
      )
      console.error('Error fetching registration details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendPaymentLink = async () => {
    setActionLoading(true)

    try {
      await sendPaymentLink(requestId, paymentLink)
      setActionSuccess('Payment link sent successfully')
      fetchRegistrationDetails()
      setPaymentLinkModal(false)
    } catch (error) {
      setError(error.message || 'An error occurred while sending payment link')
      console.error('Error sending payment link:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateStatus = async (status) => {
    // Validate rejection reason if rejecting
    if (status === 'rejected' && !rejectionReason.trim()) {
      setError('Rejection reason is required when rejecting a registration')
      return
    }

    setActionLoading(true)

    try {
      // Pass rejectionReason for rejected status, notes for all statuses
      const notesPayload = status === 'rejected'
        ? (notes.trim() ? `${rejectionReason}\n\nAdditional Notes: ${notes}` : rejectionReason)
        : notes

      await updateRegistrationStatus(requestId, status, notesPayload)
      setActionSuccess(`Registration ${status} successfully`)
      setStatusUpdateModal({ visible: false, status: null })
      setNotes('')
      setRejectionReason('')
      fetchRegistrationDetails()
    } catch (error) {
      setError(
        error.message || `An error occurred while updating status to ${status}`,
      )
      console.error('Error updating registration status:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdatePaymentStatus = async (paymentStatus) => {
    setActionLoading(true)

    try {
      await updatePaymentStatus(requestId, paymentStatus)
      setActionSuccess(
        `Payment status updated to ${paymentStatus} successfully`,
      )
      setPaymentStatusModal({ visible: false, status: null })
      fetchRegistrationDetails()
    } catch (error) {
      setError(
        error.message ||
          `An error occurred while updating payment status to ${paymentStatus}`,
      )
      console.error('Error updating payment status:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/schedule-requests')
  }

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
        `${BACKEND_URL}/registrations/${requestId}/send-message`,
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

      // Our backend returns either status: "success" or status: "error"
      if (data.status === 'success' || data.success) {
        setActionSuccess('Message has been sent successfully to the student.')
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

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  // Status Badge component
  const StatusBadge = ({ status }) => {
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

  // Payment Status Badge component
  const PaymentStatusBadge = ({ status }) => {
    if (status === 'unpaid') {
      return <CBadge color="danger">Unpaid</CBadge>
    } else if (status === 'pending') {
      return <CBadge color="warning">Pending</CBadge>
    } else if (status === 'paid') {
      return <CBadge color="success">Paid</CBadge>
    } else if (status === 'free') {
      return <CBadge color="info">Free</CBadge>
    } else {
      return <CBadge color="secondary">{status}</CBadge>
    }
  }

  if (loading) {
    return (
      <div className="text-center my-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  // Only show this error page for critical errors like missing registration
  // Other errors will be shown inline instead
  if (error && !registration) {
    return (
      <CAlert color="danger">
        {error}
        <div className="mt-3">
          <CButton color="primary" onClick={handleBack}>
            Back to Requests
          </CButton>
        </div>
      </CAlert>
    )
  }

  if (!registration) {
    return (
      <CAlert color="warning">
        Registration request not found
        <div className="mt-3">
          <CButton color="primary" onClick={handleBack}>
            Back to Requests
          </CButton>
        </div>
      </CAlert>
    )
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
          Back to Requests
        </CButton>

        {actionSuccess && (
          <CAlert color="success" className="mb-4">
            {actionSuccess}
          </CAlert>
        )}

        <CCard className="mb-4">
          <CCardHeader>
            <h4>Registration Request Details</h4>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol md={6}>
                <CCard>
                  <CCardHeader className="bg-light">
                    <strong>
                      <CIcon icon={cilUser} className="me-2" />
                      Student Information
                    </strong>
                  </CCardHeader>
                  <CCardBody>
                    <CListGroup flush>
                      <CListGroupItem>
                        <div className="fw-bold">Name</div>
                        <div>{registration.userId?.fullName || 'N/A'}</div>
                      </CListGroupItem>
                      <CListGroupItem>
                        <div className="fw-bold">Email</div>
                        <div>{registration.userId?.email || 'N/A'}</div>
                      </CListGroupItem>
                      <CListGroupItem>
                        <div className="fw-bold">Phone</div>
                        <div>{registration.userId?.phoneNumber || 'N/A'}</div>
                      </CListGroupItem>
                      <CListGroupItem>
                        <div className="fw-bold">Verified Account</div>
                        <div>
                          {registration.userId?.verified ? (
                            <CBadge color="success">Verified</CBadge>
                          ) : (
                            <CBadge color="danger">Not Verified</CBadge>
                          )}
                        </div>
                      </CListGroupItem>
                    </CListGroup>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol md={6}>
                <CCard>
                  <CCardHeader className="bg-light">
                    <strong>
                      <CIcon icon={cilCalendar} className="me-2" />
                      Schedule Information
                    </strong>
                  </CCardHeader>
                  <CCardBody>
                    <CListGroup flush>
                      <CListGroupItem>
                        <div className="fw-bold">Title</div>
                        <div>{registration.scheduleId?.title || 'N/A'}</div>
                      </CListGroupItem>
                      <CListGroupItem>
                        <div className="fw-bold">Start Date</div>
                        <div>
                          {selectedSession?.startDate
                            ? formatDate(selectedSession.startDate)
                            : 'N/A'}
                        </div>
                      </CListGroupItem>
                      <CListGroupItem>
                        <div className="fw-bold">End Date</div>
                        <div>
                          {selectedSession?.endDate
                            ? formatDate(selectedSession.endDate)
                            : 'N/A'}
                        </div>
                      </CListGroupItem>
                      <CListGroupItem>
                        <div className="fw-bold">Class Time</div>
                        <div>{selectedSession?.time || 'N/A'}</div>
                      </CListGroupItem>
                    </CListGroup>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>

            <CRow className="mt-4">
              <CCol md={12}>
                <CCard>
                  <CCardHeader className="bg-light">
                    <strong>Registration Status</strong>
                  </CCardHeader>
                  <CCardBody>
                    <CRow>
                      <CCol md={6}>
                        <div className="mb-3">
                          <div className="fw-bold mb-2">Status</div>
                          <div>
                            <StatusBadge status={registration.status} />
                          </div>
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <div className="mb-3">
                          <div className="fw-bold mb-2">Payment Status</div>
                          <div>
                            <PaymentStatusBadge
                              status={registration.paymentStatus}
                            />
                          </div>
                        </div>
                      </CCol>
                    </CRow>

                    <CRow>
                      <CCol md={6}>
                        <div className="mb-3">
                          <div className="fw-bold mb-2">Request Date</div>
                          <div>{formatDate(registration.createdAt)}</div>
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <div className="mb-3">
                          <div className="fw-bold mb-2">Last Updated</div>
                          <div>{formatDate(registration.updatedAt)}</div>
                        </div>
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>

            {/* <CRow className="mt-4">
              <CCol>
                <CCard>
                  <CCardHeader className="bg-light">
                    <strong>Notes</strong>
                  </CCardHeader>
                  <CCardBody>
                    <CFormTextarea
                      id="notes"
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this registration request..."
                    />
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow> */}

            <CRow className="mt-4">
              <CCol className="text-center">
                {registration.status === 'pending' && (
                  <>
                    <CButton
                      color="info"
                      className="me-2"
                      onClick={() => setMessageModalVisible(true)}
                    >
                      <CIcon icon={cilEnvelopeOpen} className="me-2" />
                      Send Message
                    </CButton>

                    <CButton
                      color="success"
                      className="me-2"
                      onClick={() =>
                        setStatusUpdateModal({
                          visible: true,
                          status: 'approved',
                        })
                      }
                    >
                      <CIcon icon={cilCheckCircle} className="me-2" />
                      Approve
                    </CButton>

                    <CButton
                      color="danger"
                      variant="outline"
                      onClick={() =>
                        setStatusUpdateModal({
                          visible: true,
                          status: 'rejected',
                        })
                      }
                    >
                      <CIcon icon={cilXCircle} className="me-2" />
                      Reject
                    </CButton>
                  </>
                )}

                {registration.status === 'approved' &&
                  registration.paymentStatus !== 'paid' &&
                  registration.paymentStatus !== 'free' && (
                    <>
                      <CButton
                        color="success"
                        onClick={() =>
                          setPaymentStatusModal({
                            visible: true,
                            status: 'paid',
                          })
                        }
                        className="me-2"
                      >
                        <CIcon icon={cilDollar} className="me-2" />
                        Mark as Paid
                      </CButton>
                      <CButton
                        color="info"
                        onClick={() =>
                          setPaymentStatusModal({
                            visible: true,
                            status: 'free',
                          })
                        }
                      >
                        <CIcon icon={cilCheckCircle} className="me-2" />
                        Mark as Free
                      </CButton>
                    </>
                  )}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        {/* Payment Link Modal */}
        <CModal
          visible={paymentLinkModal}
          onClose={() => setPaymentLinkModal(false)}
        >
          <CModalHeader onClose={() => setPaymentLinkModal(false)}>
            <CModalTitle>Send Payment Link</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <p>
              Enter the payment link to send to{' '}
              <strong>{registration.userId?.fullName}</strong> for schedule{' '}
              <strong>{registration.scheduleId?.title}</strong>
            </p>
            <CCallout color="info">
              The user will be notified that their registration is waiting for
              payment and that they need to pay using this link to join the
              class.
            </CCallout>
            <CFormInput
              type="text"
              id="paymentLink"
              label="Payment Link"
              value={paymentLink}
              onChange={(e) => setPaymentLink(e.target.value)}
              placeholder="https://payment-gateway.com/link"
            />
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              onClick={() => setPaymentLinkModal(false)}
            >
              Cancel
            </CButton>
            <CButton
              color="primary"
              onClick={handleSendPaymentLink}
              disabled={actionLoading || !paymentLink}
            >
              {actionLoading ? <CSpinner size="sm" /> : 'Send Link'}
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Status Update Modal */}
        <CModal
          visible={statusUpdateModal.visible}
          onClose={() => setStatusUpdateModal({ visible: false, status: null })}
        >
          <CModalHeader
            onClose={() =>
              setStatusUpdateModal({ visible: false, status: null })
            }
          >
            <CModalTitle>
              {statusUpdateModal.status === 'approved'
                ? 'Approve Registration'
                : 'Reject Registration'}
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            <p>
              Are you sure you want to{' '}
              <strong>
                {statusUpdateModal.status === 'approved' ? 'approve' : 'reject'}
              </strong>{' '}
              the registration request from{' '}
              <strong>{registration.userId?.fullName}</strong> for schedule{' '}
              <strong>{registration.scheduleId?.title}</strong>?
            </p>

            {statusUpdateModal.status === 'rejected' && (
              <CFormTextarea
                id="rejectionReason"
                label="Rejection Reason (Required for rejection)"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please explain why this registration is being rejected..."
                className="mb-3"
              />
            )}

            <CFormTextarea
              id="statusNotes"
              label="Additional Notes (Optional)"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes regarding this decision..."
            />
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              onClick={() =>
                setStatusUpdateModal({ visible: false, status: null })
              }
            >
              Cancel
            </CButton>
            <CButton
              color={
                statusUpdateModal.status === 'approved' ? 'success' : 'danger'
              }
              onClick={() => handleUpdateStatus(statusUpdateModal.status)}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <CSpinner size="sm" />
              ) : statusUpdateModal.status === 'approved' ? (
                'Approve'
              ) : (
                'Reject'
              )}
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Payment Status Update Modal */}
        <CModal
          visible={paymentStatusModal.visible}
          onClose={() =>
            setPaymentStatusModal({ visible: false, status: null })
          }
        >
          <CModalHeader
            onClose={() =>
              setPaymentStatusModal({ visible: false, status: null })
            }
          >
            <CModalTitle>Update Payment Status</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <p>
              Are you sure you want to mark the payment status as{' '}
              <strong>{paymentStatusModal.status}</strong> for{' '}
              <strong>{registration.userId?.fullName}</strong>'s registration to{' '}
              <strong>{registration.scheduleId?.title}</strong>?
            </p>
            <CCallout color="info">
              This will finalize the registration process and mark the student's
              registration as approved with payment complete.
            </CCallout>
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              onClick={() =>
                setPaymentStatusModal({ visible: false, status: null })
              }
            >
              Cancel
            </CButton>
            <CButton
              color="success"
              onClick={() =>
                handleUpdatePaymentStatus(paymentStatusModal.status)
              }
              disabled={actionLoading}
            >
              {actionLoading ? <CSpinner size="sm" /> : 'Confirm'}
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Send Message Modal */}
        <CModal
          visible={messageModalVisible}
          onClose={() => setMessageModalVisible(false)}
          alignment="center"
        >
          <CModalHeader closeButton>
            <CModalTitle>Send Message to Student</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {error && (
              <CAlert color="danger" dismissible onClose={() => setError(null)}>
                {error}
              </CAlert>
            )}
            <p className="text-muted mb-3">
              This message will be sent via email to{' '}
              <strong>{registration?.userId?.email}</strong> regarding their
              registration for{' '}
              <strong>
                {registration?.scheduleId?.title || 'the schedule'}
              </strong>
              .
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
      </CCol>
    </CRow>
  )
}

export default ScheduleRequestDetail
