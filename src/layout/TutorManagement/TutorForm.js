import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CButton,
  CSpinner,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSave, cilArrowLeft } from '@coreui/icons'
import { BASE_URL } from '../../config'
import BACKEND_URL from '../../config'
import {
  TextInputField,
  TextAreaField,
  ImageUploadField,
} from '../../components/common'

const TutorForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    description: '',
    avatar: null,
  })

  const [currentAvatar, setCurrentAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Load tutor data for edit mode
  useEffect(() => {
    if (isEditMode) {
      loadTutorData()
    }
  }, [isEditMode, id])

  const loadTutorData = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('admin_token')
      if (!token) {
        throw new Error('Authentication token not found')
      }

      const response = await fetch(`${BACKEND_URL}/tutor/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load tutor')
      }

      const tutor = data.data
      setFormData({
        name: tutor.name || '',
        email: tutor.email || '',
        password: '', // Don't load password
        bio: tutor.bio || '',
        description: tutor.description || '',
        avatar: null,
      })

      if (tutor.avatar) {
        setCurrentAvatar(tutor.avatar)
      }
    } catch (err) {
      setError(err.message || 'Failed to load tutor')
    } finally {
      setLoading(false)
    }
  }

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle avatar upload
  const handleAvatarChange = (file, errorMessage = null) => {
    if (errorMessage) {
      setError(errorMessage)
      return
    }

    if (file) {
      setFormData((prev) => ({
        ...prev,
        avatar: file,
      }))

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove avatar
  const handleAvatarRemove = () => {
    setFormData((prev) => ({
      ...prev,
      avatar: null,
    }))
    setAvatarPreview(null)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        throw new Error('Authentication token not found')
      }

      // Create FormData object
      const formDataToSend = new FormData()

      // Add text fields
      formDataToSend.append('name', formData.name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('password', formData.password)
      formDataToSend.append('bio', formData.bio)
      formDataToSend.append('description', formData.description)

      // Add avatar file if selected
      if (formData.avatar instanceof File) {
        formDataToSend.append('avatar', formData.avatar)
      }

      const url = isEditMode
        ? `${BACKEND_URL}/tutor/${id}`
        : `${BACKEND_URL}/tutor`

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData
        },
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error creating/updating tutor')
      }

      setSuccess(
        isEditMode
          ? 'Tutor updated successfully!'
          : 'Tutor created successfully!',
      )

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/tutor-management')
      }, 2000)
    } catch (err) {
      setError(err.message || 'An error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Get avatar URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null
    return `${BASE_URL}/${avatarPath}`
  }

  return (
    <CRow>
      <CCol md={8}>
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              {isEditMode ? 'Edit Tutor' : 'Create New Tutor'}
            </h5>
            <CButton
              color="secondary"
              variant="outline"
              onClick={() => navigate('/tutor-management')}
            >
              <CIcon icon={cilArrowLeft} className="me-2" />
              Back to List
            </CButton>
          </CCardHeader>
          <CCardBody>
            {/* Error Alert */}
            {error && (
              <CAlert color="danger" dismissible onClose={() => setError(null)}>
                {error}
              </CAlert>
            )}

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

            {/* Loading */}
            {loading && !success && (
              <div className="text-center py-3">
                <CSpinner color="primary" />
                <p className="mt-2">
                  {isEditMode ? 'Updating tutor...' : 'Creating tutor...'}
                </p>
              </div>
            )}

            <CForm onSubmit={handleSubmit}>
              {/* Name Field */}
              <TextInputField
                id="name"
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter tutor's name"
                required
              />

              {/* Email Field */}
              <TextInputField
                id="email"
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter tutor's email"
                type="email"
                required
              />

              {/* Password Field - Required for new tutors, optional for edits */}
              <TextInputField
                id="password"
                name="password"
                type="password"
                label={
                  isEditMode
                    ? 'Password (leave blank to keep unchanged)'
                    : 'Password'
                }
                value={formData.password}
                onChange={handleInputChange}
                placeholder={
                  isEditMode
                    ? 'Leave blank to keep current password'
                    : 'Enter password'
                }
                required={!isEditMode}
              />

              {/* Bio Field */}
              <TextAreaField
                id="bio"
                name="bio"
                label="Bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Enter tutor's bio"
                rows={3}
                required
              />

              {/* Description Field */}
              <TextAreaField
                id="description"
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter detailed description"
                rows={5}
                required
              />

              {/* Avatar Upload */}
              <ImageUploadField
                id="avatarInput"
                label="Avatar"
                currentImage={currentAvatar}
                imagePreview={avatarPreview}
                onImageChange={handleAvatarChange}
                onImageRemove={handleAvatarRemove}
                getImageUrl={getAvatarUrl}
                circular={true}
              />

              {/* Submit Button */}
              <div className="d-flex gap-2">
                <CButton color="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <CSpinner size="sm" className="me-2" />
                  ) : (
                    <CIcon icon={cilSave} className="me-2" />
                  )}
                  {isEditMode ? 'Update Tutor' : 'Create Tutor'}
                </CButton>
                <CButton
                  color="secondary"
                  type="button"
                  onClick={() => navigate('/tutor-management')}
                  disabled={loading}
                >
                  Cancel
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Information Sidebar */}
      <CCol md={4}>
        <CCard>
          <CCardHeader>
            <h6 className="mb-0">Tutor Information</h6>
          </CCardHeader>
          <CCardBody>
            <div className="small">
              <p>
                <strong>Name:</strong> The tutor's full name
              </p>
              <p>
                <strong>Email:</strong> Email address used for login
              </p>
              <p>
                <strong>Password:</strong>{' '}
                {isEditMode
                  ? 'Optional. Leave blank to keep current password'
                  : 'Required for new tutors'}
              </p>
              <p>
                <strong>Bio:</strong> Short biography visible to students
              </p>
              <p>
                <strong>Description:</strong> Detailed description of the
                tutor's qualifications
              </p>
              <p>
                <strong>Avatar:</strong> Profile picture (optional)
              </p>

              <hr />

              <p className="text-muted mb-2">
                <strong>Tips:</strong>
              </p>
              <ul className="text-muted small">
                <li>Use a professional email for the tutor</li>
                <li>Keep the bio concise (2-3 sentences)</li>
                <li>Include relevant qualifications in the description</li>
                <li>Square images work best for avatars</li>
              </ul>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default TutorForm
