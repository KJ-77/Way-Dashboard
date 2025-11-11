import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CSpinner,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilCheck } from '@coreui/icons'
import { BASE_URL } from '../../../config'
import './Login.css'

const Login = () => {
  // State management
  const [formState, setFormState] = useState({
    email: '',
    password: '',
    showPassword: false,
    loading: false,
    error: null,
    success: false,
    role: 'admin',
  })

  const navigate = useNavigate()
  const { login } = useAuth()

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setFormState((prev) => ({
      ...prev,
      showPassword: !prev.showPassword,
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Reset error state
    setFormState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }))

    try {
      // Extract form data
      const { email, password } = formState

      // Client-side validation
      if (!email || !password) {
        throw new Error('Please enter both email and password')
      }

      // Use shared AuthContext login to set token and principal in state + storage
      await login({ email, password, role: formState.role })

      // Handle successful login
      setFormState((prev) => ({
        ...prev,
        loading: false,
        success: true,
        password: '', // Clear sensitive data
      }))

      // Navigate immediately without full reload
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error('Login error:', err)

      // Clear password on error
      setFormState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'Authentication failed',
        password: '',
      }))
    }
  }

  // Destructure state for cleaner JSX
  const { email, password, showPassword, loading, error, success, role } =
    formState

  // Show success state UI
  if (success) {
    return (
      <div className="admin-bg d-flex flex-column align-items-center justify-content-center">
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={6} lg={5} xl={4}>
              <CCard className="professional-card success-card">
                <CCardBody>
                  <div className="success-icon">
                    <CIcon icon={cilCheck} size="xl" />
                  </div>
                  <h3>Authentication Successful</h3>
                  <p className="text-medium-emphasis">
                    You will be redirected to the dashboard momentarily.
                  </p>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CContainer>
      </div>
    )
  }

  // Main login form UI
  return (
    <div className="admin-bg d-flex align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol lg={10} xl={8}>
            <CCard className="professional-card overflow-hidden">
              <CRow className="g-0">
                <CCol lg={5} className="d-none d-lg-block">
                  <div className="side-image h-100">
                    <h2>Admin Portal</h2>
                    <p className="mb-0">
                      Secure access to Safran Du Liban administrative dashboard.
                    </p>
                  </div>
                </CCol>
                <CCol xs={12} lg={7}>
                  <CCardBody className="p-4 p-lg-5">
                    <div className="text-center d-lg-none mb-4">
                      <h2>Admin Portal</h2>
                    </div>

                    <div className="mb-4">
                      <h1 className="login-title">Sign in to your account</h1>
                      <p className="login-subtitle">
                        Enter your credentials to access the dashboard
                      </p>
                    </div>

                    {error && (
                      <CAlert
                        color="danger"
                        className="error-alert mb-4"
                        role="alert"
                      >
                        {error}
                      </CAlert>
                    )}

                    <CForm onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <CFormLabel htmlFor="email">Email Address</CFormLabel>
                        <CFormInput
                          id="email"
                          placeholder="name@company.com"
                          autoComplete="email"
                          name="email"
                          value={email}
                          onChange={handleInputChange}
                          disabled={loading}
                          required
                          aria-label="Email"
                          type="email"
                          className="professional-input"
                        />
                      </div>

                      <div className="mb-4 d-flex gap-2">
                        <div
                          className="btn-group"
                          role="group"
                          aria-label="Role selector"
                        >
                          <button
                            type="button"
                            className={`btn btn-sm ${role === 'admin' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() =>
                              setFormState((p) => ({ ...p, role: 'admin' }))
                            }
                            disabled={loading}
                          >
                            Admin
                          </button>
                          <button
                            type="button"
                            className={`btn btn-sm ${role === 'tutor' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() =>
                              setFormState((p) => ({ ...p, role: 'tutor' }))
                            }
                            disabled={loading}
                          >
                            Tutor
                          </button>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="d-flex justify-content-between">
                          <CFormLabel htmlFor="password">Password</CFormLabel>
                          <span
                            className="form-text cursor-pointer"
                            onClick={togglePasswordVisibility}
                            style={{ cursor: 'pointer' }}
                          >
                            {showPassword ? 'Hide' : 'Show'}
                          </span>
                        </div>
                        <CFormInput
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          name="password"
                          value={password}
                          onChange={handleInputChange}
                          disabled={loading}
                          required
                          aria-label="Password"
                          className="professional-input"
                        />
                      </div>

                      <CButton
                        type="submit"
                        color="primary"
                        className="login-btn w-100"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <CSpinner size="sm" className="me-2" />
                            Authenticating...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </CButton>
                    </CForm>
                  </CCardBody>
                </CCol>
              </CRow>
            </CCard>
            <div className="copyright-text">
              © {new Date().getFullYear()} Dr. Diana Administration System. All
              rights reserved.
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
