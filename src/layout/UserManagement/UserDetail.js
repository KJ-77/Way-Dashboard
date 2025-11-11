import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CButton,
  CSpinner,
  CBadge,
  CListGroup,
  CListGroupItem,
  CCardImage,
} from '@coreui/react'
import { api } from 'src/services/api'

const UserDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load user details
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/admin/regular-users/${id}`)
        setUser(response.data)
        setError(null)
      } catch (err) {
        console.error('Error loading user details:', err)
        setError(`Failed to load user details: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [id])

  // Handle back button
  const handleBack = () => {
    navigate('/users')
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  if (error) {
    return (
      <CCard className="mb-4">
        <CCardHeader>
          <h5>User Details</h5>
        </CCardHeader>
        <CCardBody>
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
          <CButton color="primary" onClick={handleBack}>
            Back to Users
          </CButton>
        </CCardBody>
      </CCard>
    )
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <CRow>
          <CCol>
            <h5>User Details</h5>
          </CCol>
          <CCol xs="auto">
            <CButton color="primary" onClick={handleBack}>
              Back to Users
            </CButton>
          </CCol>
        </CRow>
      </CCardHeader>
      <CCardBody>
        {user && (
          <>
            {/* User Information */}
            <CRow className="mb-4">
              <CCol md={6}>
                <h6 className="mb-3">Personal Information</h6>
                <CListGroup>
                  <CListGroupItem>
                    <strong>Name:</strong> {user.fullName}
                  </CListGroupItem>
                  <CListGroupItem>
                    <strong>Email:</strong> {user.email}
                  </CListGroupItem>
                  <CListGroupItem>
                    <strong>Phone:</strong> {user.phoneNumber}
                  </CListGroupItem>
                  <CListGroupItem>
                    <strong>Created:</strong>{' '}
                    {new Date(user.createdAt).toLocaleString()}
                  </CListGroupItem>
                </CListGroup>
              </CCol>
              <CCol md={6}>
                <h6 className="mb-3">Account Status</h6>
                <CListGroup>
                  <CListGroupItem>
                    <strong>Verification Status:</strong>{' '}
                    <CBadge color={user.verified ? 'success' : 'warning'}>
                      {user.verified ? 'Verified' : 'Not Verified'}
                    </CBadge>
                  </CListGroupItem>
                  <CListGroupItem>
                    <strong>Payment Status:</strong>{' '}
                    <CBadge color={user.isPaid ? 'success' : 'danger'}>
                      {user.isPaid ? 'Paid' : 'Not Paid'}
                    </CBadge>
                  </CListGroupItem>
                  <CListGroupItem>
                    <strong>Total Purchased Items:</strong>{' '}
                    {(user.purchasedItems?.books?.length || 0) +
                      (user.purchasedItems?.courses?.length || 0)}
                  </CListGroupItem>
                </CListGroup>
              </CCol>
            </CRow>

            {/* Purchased Books */}
            {user.purchasedItems?.books?.length > 0 && (
              <div className="mb-4">
                <h6 className="mb-3">Purchased Books</h6>
                <CRow>
                  {user.purchasedItems.books.map((book) => (
                    <CCol key={book._id} md={4} className="mb-3">
                      <CCard>
                        {book.cover && (
                          <CCardImage
                            orientation="top"
                            src={book.cover}
                            alt={book.title}
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                        )}
                        <CCardBody>
                          <h6>{book.title}</h6>
                          <p className="mb-0">
                            <strong>Price:</strong> ${book.price}
                          </p>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  ))}
                </CRow>
              </div>
            )}

            {/* Purchased Courses */}
            {user.purchasedItems?.courses?.length > 0 && (
              <div>
                <h6 className="mb-3">Purchased Courses</h6>
                <CRow>
                  {user.purchasedItems.courses.map((course) => (
                    <CCol key={course._id} md={4} className="mb-3">
                      <CCard>
                        {course.thumbnail && (
                          <CCardImage
                            orientation="top"
                            src={course.thumbnail}
                            alt={course.title}
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                        )}
                        <CCardBody>
                          <h6>{course.title}</h6>
                          <p className="mb-0">
                            <strong>Price:</strong> ${course.price}
                          </p>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  ))}
                </CRow>
              </div>
            )}

            {/* No Items Message */}
            {user.purchasedItems?.books?.length === 0 &&
            user.purchasedItems?.courses?.length === 0 ? (
              <div className="alert alert-info">
                This user has not purchased any items yet.
              </div>
            ) : null}

            {!user.purchasedItems ? (
              <div className="alert alert-warning">
                Could not retrieve purchased items data. It may be unavailable.
              </div>
            ) : null}
          </>
        )}
      </CCardBody>
    </CCard>
  )
}

export default UserDetail
