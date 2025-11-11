import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CButton,
  CRow,
  CCol,
  CAlert,
  CFormText,
  CSpinner,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { BASE_URL } from '../../config'

const AdminForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'read_only',
  })
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Load admin data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchAdmin = async () => {
        try {
          setFetchLoading(true)

          // Get token from localStorage
          const token = localStorage.getItem('admin_token')
          console.log('Admin ID for edit:', id)
          console.log(
            'Token for API call:',
            token ? 'Token exists' : 'No token',
          )

          const response = await fetch(
            `${BASE_URL}/api/admin/users/${id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            },
          )

          console.log('API Response status:', response.status)

          // Get response text first for debugging
          const responseText = await response.text()
          console.log('Raw API response:', responseText)

          if (!response.ok) {
            throw new Error(
              `API error: ${response.status} ${response.statusText}`,
            )
          }

          // Try to parse the response
          let result
          try {
            result = JSON.parse(responseText)
            console.log('Parsed API response:', result)
          } catch (e) {
            console.error('Failed to parse response as JSON:', e)
            throw new Error('Invalid JSON response from server')
          }

          // Check if data exists in the expected structure
          if (!result.data) {
            console.error('Response missing data property:', result)
            throw new Error('Invalid response format: missing data')
          }

          const admin = result.data
          console.log('Admin data for form:', admin)

          // Update form with admin data
          setFormData({
            fullName: admin.fullName || '',
            email: admin.email || '',
            role: admin.role || 'read_only',
            password: '',
            confirmPassword: '',
          })
        } catch (err) {
          console.error('Error fetching admin details:', err)
          setError(`Failed to load admin user data: ${err.message}`)
        } finally {
          setFetchLoading(false)
        }
      }

      fetchAdmin()
    }
  }, [id, isEditMode])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    if (
      !formData.fullName ||
      !formData.email ||
      (!isEditMode && !formData.password)
    ) {
      setError('Please fill in all required fields')
      return
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const emailRegex = /^\S+@\S+\.\S+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!isEditMode && formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    try {
      setLoading(true)

      // Get token from localStorage
      const token = localStorage.getItem('admin_token')

      // Prepare data for API
      const apiData = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
      }

      // Only include password if provided (required for new admins)
      if (formData.password) {
        apiData.password = formData.password
      }

      // Create or update admin
      let response
      if (isEditMode) {
        response = await fetch(`${BASE_URL}/api/admin/users/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(apiData),
        })
      } else {
        response = await fetch(`${BASE_URL}/api/admin/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(apiData),
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error ${response.status}`)
      }

      const data = await response.json()
      console.log('Save admin response:', data)

      setSuccess(
        isEditMode
          ? 'Admin updated successfully!'
          : 'Admin created successfully!',
      )

      // Navigate back to list after brief delay
      setTimeout(() => {
        window.location.href = '/#/admin-management'
      }, 2000)
    } catch (err) {
      console.error('Error saving admin:', err)
      setError(err.message || 'Failed to save admin user')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <CCard className="mb-4">
        <CCardBody className="text-center p-5">
          <CSpinner color="primary" />
        </CCardBody>
      </CCard>
    )
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <h5>{isEditMode ? 'Edit Admin User' : 'Create New Admin User'}</h5>
      </CCardHeader>
      <CCardBody>
        {error && <CAlert color="danger">{error}</CAlert>}
        {success && <CAlert color="success">{success}</CAlert>}

        <CForm onSubmit={handleSubmit}>
          <CRow className="mb-3">
            <CCol>
              <CFormLabel htmlFor="fullName">Full Name *</CFormLabel>
              <CFormInput
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol>
              <CFormLabel htmlFor="email">Email *</CFormLabel>
              <CFormInput
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol>
              <CFormLabel htmlFor="role">Role *</CFormLabel>
              <CFormSelect
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="read_only">Read Only</option>
              </CFormSelect>
              <CFormText>
                <strong>Super Admin:</strong> Full access to all features
                <br />
                <strong>Admin:</strong> Limited access (cannot manage admins or
                payment status)
                <br />
                <strong>Read Only:</strong> View-only access to the dashboard
              </CFormText>
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol>
              <CFormLabel htmlFor="password">
                {isEditMode
                  ? 'Password (leave blank to keep current)'
                  : 'Password *'}
              </CFormLabel>
              <div className="position-relative">
                <CFormInput
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!isEditMode}
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-0 bottom-0 d-flex align-items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'transparent', border: 'none' }}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z" />
                      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" />
                      <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {!isEditMode && (
                <CFormText>
                  Password must be at least 8 characters long
                </CFormText>
              )}
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol>
              <CFormLabel htmlFor="confirmPassword">
                {isEditMode
                  ? 'Confirm Password (if changing)'
                  : 'Confirm Password *'}
              </CFormLabel>
              <div className="position-relative">
                <CFormInput
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={!isEditMode}
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-0 bottom-0 d-flex align-items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ background: 'transparent', border: 'none' }}
                >
                  {showConfirmPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z" />
                      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" />
                      <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </CCol>
          </CRow>

          <CRow className="mt-4">
            <CCol>
              <CButton type="submit" color="primary" disabled={loading}>
                {loading ? (
                  <CSpinner size="sm" />
                ) : isEditMode ? (
                  'Update Admin'
                ) : (
                  'Create Admin'
                )}
              </CButton>
              <CButton
                type="button"
                color="secondary"
                className="ms-2"
                onClick={() => navigate('/admin-management')}
              >
                Cancel
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default AdminForm
