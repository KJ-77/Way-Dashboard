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
import { TextAreaField, ImageUploadField } from '../../components/common'

const HostForm = () => {
  const navigate = useNavigate()
  const { slug } = useParams()
  const isEditMode = Boolean(slug)

  const [formData, setFormData] = useState({
    text: '',
    image: null,
  })

  const [currentImage, setCurrentImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Load host data for edit mode
  useEffect(() => {
    if (isEditMode) {
      loadHostData()
    }
  }, [isEditMode, slug])

  const loadHostData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${BACKEND_URL}/host/${slug}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load host')
      }

      const host = data.data
      setFormData({
        text: host.text || '',
        image: null,
      })

      if (host.image) {
        setCurrentImage(host.image)
      }
    } catch (err) {
      setError(err.message || 'Failed to load host')
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

  // Handle image upload for reusable component
  const handleImageChange = (file, errorMessage = null) => {
    if (errorMessage) {
      setError(errorMessage)
      return
    }

    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }))

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove image for reusable component
  const handleImageRemove = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
    }))
    setImagePreview(null)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.text) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const token = localStorage.getItem('admin_token')

      const formDataToSend = new FormData()
      formDataToSend.append('text', formData.text)

      if (formData.image) {
        formDataToSend.append('image', formData.image)
      }

      const url = isEditMode
        ? `${BACKEND_URL}/host/${slug}`
        : `${BACKEND_URL}/host`

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save host')
      }

      setSuccess(
        isEditMode
          ? 'Host updated successfully!'
          : 'Host created successfully!',
      )

      // Navigate back to list after short delay
      setTimeout(() => {
        navigate('/host-management')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to save host')
    } finally {
      setLoading(false)
    }
  }

  // Get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    return `${BASE_URL}/${imagePath}`
  }

  return (
    <CRow>
      <CCol md={8}>
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              {isEditMode ? 'Edit Host' : 'Create New Host'}
            </h5>
            <CButton
              color="secondary"
              variant="outline"
              onClick={() => navigate('/host-management')}
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
                  {isEditMode ? 'Updating host...' : 'Creating host...'}
                </p>
              </div>
            )}

            <CForm onSubmit={handleSubmit}>
              {/* Text Field */}
              <TextAreaField
                id="text"
                name="text"
                label="Host Text"
                value={formData.text}
                onChange={handleInputChange}
                placeholder="Enter host description or text..."
                rows={6}
                required
              />

              {/* Image Upload */}
              <ImageUploadField
                id="imageInput"
                label="Host Image"
                currentImage={currentImage}
                imagePreview={imagePreview}
                onImageChange={handleImageChange}
                onImageRemove={handleImageRemove}
                getImageUrl={getImageUrl}
              />

              {/* Submit Button */}
              <div className="d-flex gap-2">
                <CButton color="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <CSpinner size="sm" className="me-2" />
                  ) : (
                    <CIcon icon={cilSave} className="me-2" />
                  )}
                  {isEditMode ? 'Update Host' : 'Create Host'}
                </CButton>
                <CButton
                  color="secondary"
                  type="button"
                  onClick={() => navigate('/host-management')}
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
            <h6 className="mb-0">Host Information</h6>
          </CCardHeader>
          <CCardBody>
            <div className="small">
              <p>
                <strong>Host Text:</strong> Descriptive text or content for the
                host
              </p>
              <p>
                <strong>Host Image:</strong> Optional image to represent the
                host
              </p>

              <hr />

              <p className="text-muted mb-2">
                <strong>Tips:</strong>
              </p>
              <ul className="text-muted small">
                <li>Use clear, descriptive text</li>
                <li>Include relevant details about the host</li>
                <li>High-quality images work best</li>
                <li>Keep image files under 15MB</li>
              </ul>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default HostForm
