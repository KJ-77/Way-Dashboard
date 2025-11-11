import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CAlert,
  CSpinner,
  CImage,
  CCloseButton,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { BASE_URL } from '../../config'
import { cilArrowLeft, cilSave } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { TextAreaField, ImageUploadField } from '../../components/common'

const ProductionForm = () => {
  const navigate = useNavigate()
  const { slug } = useParams()
  const isEditMode = Boolean(slug)

  // Form state
  const [formData, setFormData] = useState({ text: '' })
  const [selectedImages, setSelectedImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Load production data for edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchItem = async () => {
        try {
          setFetchLoading(true)
          const token = localStorage.getItem('admin_token')
          const response = await fetch(`${BASE_URL}/api/production/${slug}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          })
          if (!response.ok) throw new Error(`HTTP error ${response.status}`)

          const data = await response.json()
          if (data.success) {
            const item = data.data
            setFormData({ text: item.text || '' })
            setExistingImages(item.images || [])
          } else {
            throw new Error(data.message || 'Failed to load item')
          }
        } catch (err) {
          setError(`Failed to load item: ${err.message}`)
        } finally {
          setFetchLoading(false)
        }
      }
      fetchItem()
    }
  }, [slug, isEditMode])

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle image upload
  const handleImageChange = (files, errorMessage = null) => {
    if (errorMessage) {
      setError(errorMessage)
      return
    }
    if (files && files.length > 0) {
      setSelectedImages((prev) => [...prev, ...files])
    }
  }

  // Remove all selected images
  const handleImageRemove = () => setSelectedImages([])

  // Remove a specific image from selection
  const removeSelectedImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Basic validation
    if (!formData.text.trim()) {
      setError('Text is required')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      const formDataToSend = new FormData()

      // Append form data
      formDataToSend.append('text', formData.text)
      selectedImages.forEach((image) => {
        formDataToSend.append('images', image)
      })

      // Determine if it's create or update
      let response
      if (isEditMode) {
        response = await fetch(`${BASE_URL}/api/production/${slug}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formDataToSend,
        })
      } else {
        // For new items, we need a slug
        const generatedSlug = formData.text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
        formDataToSend.append('slug', generatedSlug)

        response = await fetch(`${BASE_URL}/api/production`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formDataToSend,
        })
      }

      if (!response.ok) throw new Error(`HTTP error ${response.status}`)

      const data = await response.json()
      if (data.success) {
        setSuccess(
          isEditMode ? 'Updated successfully!' : 'Created successfully!',
        )
        if (!isEditMode) {
          setFormData({ text: '' })
          setSelectedImages([])
        }
        setTimeout(() => {
          navigate('/production-management')
        }, 1500)
      } else {
        throw new Error(data.message || 'Failed to save')
      }
    } catch (err) {
      setError(`Failed to save: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Navigate back to list
  const handleBack = () => navigate('/production-management')

  // Show loading spinner when fetching data
  if (fetchLoading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <div className="mt-2">Loading...</div>
      </div>
    )
  }

  return (
    <CCard>
      <CCardHeader>
        <CRow>
          <CCol>
            <h5>{isEditMode ? 'Edit Production' : 'Create New Production'}</h5>
          </CCol>
          <CCol xs="auto">
            <CButton color="light" variant="outline" onClick={handleBack}>
              <CIcon icon={cilArrowLeft} className="me-2" />
              Back to List
            </CButton>
          </CCol>
        </CRow>
      </CCardHeader>
      <CCardBody>
        {error && (
          <CAlert color="danger" dismissible onClose={() => setError(null)}>
            {error}
          </CAlert>
        )}
        {success && (
          <CAlert color="success" dismissible onClose={() => setSuccess(null)}>
            {success}
          </CAlert>
        )}
        <CForm onSubmit={handleSubmit}>
          <CRow>
            <CCol md={8}>
              <TextAreaField
                id="text"
                name="text"
                label="Text"
                value={formData.text}
                onChange={handleInputChange}
                placeholder="Enter content..."
                rows={6}
                required
              />
              <ImageUploadField
                id="images"
                label="Upload Images (Optional)"
                imagePreview={null}
                onImageChange={handleImageChange}
                onImageRemove={handleImageRemove}
                multiple={true}
                helpText="You can select multiple images. Supported formats: JPG, PNG, GIF, WebP (Max 15MB each)"
              />

              {/* Display existing images in edit mode */}
              {isEditMode && existingImages.length > 0 && (
                <div className="mb-3">
                  <CFormLabel>Current Images</CFormLabel>
                  <div className="row">
                    {existingImages.map((image, index) => (
                      <div key={index} className="col-md-3 col-sm-6 mb-3">
                        <CImage
                          src={`${BASE_URL}${image}`}
                          alt={`Current image ${index + 1}`}
                          className="w-100 rounded"
                          style={{ height: '150px', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                  <small className="form-text text-muted">
                    Note: Uploading new images will replace all existing images
                  </small>
                </div>
              )}

              {/* Display selected images */}
              {selectedImages.length > 0 && (
                <div className="mb-3">
                  <CFormLabel>Selected Images</CFormLabel>
                  <div className="row">
                    {selectedImages.map((image, index) => (
                      <div
                        key={index}
                        className="col-md-3 col-sm-6 mb-3 position-relative"
                      >
                        <CImage
                          src={URL.createObjectURL(image)}
                          alt={`Selected image ${index + 1}`}
                          className="w-100 rounded"
                          style={{ height: '150px', objectFit: 'cover' }}
                        />
                        <CCloseButton
                          className="position-absolute"
                          style={{ top: '5px', right: '5px' }}
                          onClick={() => removeSelectedImage(index)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CCol>

            <CCol md={4}>
              <div className="bg-light p-3 rounded">
                <h6 className="mb-3">Information</h6>
                <div className="mb-2">
                  <strong>Status:</strong>{' '}
                  {isEditMode ? 'Editing' : 'Creating New'}
                </div>
                {isEditMode && (
                  <div className="mb-2">
                    <strong>Slug:</strong> {slug}
                  </div>
                )}
                <div className="mb-2">
                  <strong>Content Length:</strong> {formData.text.length}{' '}
                  characters
                </div>
                <div className="mb-2">
                  <strong>Images:</strong> {selectedImages.length} selected
                  {isEditMode && existingImages.length > 0 && (
                    <span className="text-muted">
                      {' '}
                      (+ {existingImages.length} current)
                    </span>
                  )}
                </div>
              </div>
            </CCol>
          </CRow>

          <CRow className="mt-4">
            <CCol>
              <div className="d-flex gap-2">
                <CButton type="submit" color="primary" disabled={loading}>
                  {loading ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CIcon icon={cilSave} className="me-2" />
                      {isEditMode ? 'Update' : 'Create'}
                    </>
                  )}
                </CButton>
                <CButton
                  type="button"
                  color="secondary"
                  onClick={handleBack}
                  disabled={loading}
                >
                  Cancel
                </CButton>
              </div>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default ProductionForm
