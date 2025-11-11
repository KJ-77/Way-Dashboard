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

const EventForm = () => {
  const navigate = useNavigate()
  const { slug } = useParams()
  const isEditMode = Boolean(slug)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null,
  })

  const [currentImage, setCurrentImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Load event data for edit mode
  useEffect(() => {
    if (isEditMode) {
      loadEventData()
    }
  }, [isEditMode, slug])

  const loadEventData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${BACKEND_URL}/event/${slug}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load event')
      }

      const event = data.data
      setFormData({
        title: event.title || '',
        content: event.content || '',
        image: null,
      })

      if (event.image) {
        setCurrentImage(event.image)
      }
    } catch (err) {
      setError(err.message || 'Failed to load event')
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

    if (!formData.title || !formData.content) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const token = localStorage.getItem('admin_token')

      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('content', formData.content)

      if (formData.image) {
        formDataToSend.append('image', formData.image)
      }

      const url = isEditMode
        ? `${BACKEND_URL}/event/${slug}`
        : `${BACKEND_URL}/event`

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save event')
      }

      setSuccess(
        isEditMode
          ? 'Event updated successfully!'
          : 'Event created successfully!',
      )

      // Navigate back to list after short delay
      setTimeout(() => {
        navigate('/event-management')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to save event')
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
              {isEditMode ? 'Edit Event' : 'Create New Event'}
            </h5>
            <CButton
              color="secondary"
              variant="outline"
              onClick={() => navigate('/event-management')}
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
                  {isEditMode ? 'Updating event...' : 'Creating event...'}
                </p>
              </div>
            )}

            <CForm onSubmit={handleSubmit}>
              {/* Title Field */}
              <TextInputField
                id="title"
                name="title"
                label="Event Title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter event title"
                maxLength={200}
                required
              />

              {/* Content Field */}
              <TextAreaField
                id="content"
                name="content"
                label="Event Content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter event content"
                rows={6}
                required
              />

              {/* Image Upload */}
              <ImageUploadField
                id="imageInput"
                label="Event Image"
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
                  {isEditMode ? 'Update Event' : 'Create Event'}
                </CButton>
                <CButton
                  color="secondary"
                  type="button"
                  onClick={() => navigate('/event-management')}
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
            <h6 className="mb-0">Event Information</h6>
          </CCardHeader>
          <CCardBody>
            <div className="small">
              <p>
                <strong>Event Title:</strong> Brief, descriptive title for your
                event
              </p>
              <p>
                <strong>Event Content:</strong> Detailed description of the
                event
              </p>
              <p>
                <strong>Event Image:</strong> Optional image to represent your
                event
              </p>

              <hr />

              <p className="text-muted mb-2">
                <strong>Tips:</strong>
              </p>
              <ul className="text-muted small">
                <li>Use clear, descriptive titles</li>
                <li>Include relevant details in the content</li>
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

export default EventForm
