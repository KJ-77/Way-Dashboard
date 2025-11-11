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
  CFormInput,
  CFormLabel,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSave, cilArrowLeft } from '@coreui/icons'
import { BASE_URL } from '../../config'
import BACKEND_URL from '../../config'
import { TextInputField, TextAreaField } from '../../components/common'

const HomeForm = () => {
  const navigate = useNavigate()
  const { slug } = useParams()
  const isEditMode = Boolean(slug)

  const [formData, setFormData] = useState({
    title: '',
    text: '',
    video: null,
  })

  const [currentVideo, setCurrentVideo] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Load home data for edit mode
  useEffect(() => {
    if (isEditMode) {
      loadHomeData()
    }
  }, [isEditMode, slug])

  const loadHomeData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${BACKEND_URL}/home/${slug}`)
      const data = await response.json()

      if (data.success) {
        const home = data.data
        setFormData({
          title: home.title || '',
          text: home.text || '',
          video: null, // Don't set file object for existing video
        })
        setCurrentVideo(home.video)
      } else {
        throw new Error(data.message || 'Failed to load home data')
      }
    } catch (error) {
      console.error('Error loading home:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleVideoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = [
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/mov',
        'video/avi',
      ]
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid video file (MP4, WebM, OGG, MOV, AVI)')
        return
      }

      // Validate file size (50MB limit - reduced for better upload performance)
      const maxSize = 50 * 1024 * 1024 // 50MB in bytes
      if (file.size > maxSize) {
        setError(
          'Video file size must be less than 50MB for optimal upload performance',
        )
        return
      }

      // Show file size info to user
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      console.log(`Selected video: ${file.name} (${fileSizeMB}MB)`)

      setFormData((prev) => ({
        ...prev,
        video: file,
      }))

      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setVideoPreview(previewUrl)
      setError(null)
      setSuccess(`Video selected: ${file.name} (${fileSizeMB}MB)`)
    }
  }

  const handleVideoRemove = () => {
    setFormData((prev) => ({
      ...prev,
      video: null,
    }))
    setVideoPreview(null)
    setCurrentVideo(null)

    // Clear file input
    const fileInput = document.getElementById('video-input')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    if (!formData.text.trim()) {
      setError('Text is required')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const token = localStorage.getItem('admin_token')

      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title.trim())
      formDataToSend.append('text', formData.text.trim())

      // Add main video if exists
      if (formData.video) {
        formDataToSend.append('video', formData.video)
        setIsUploading(true)
        const fileSizeMB = (formData.video.size / (1024 * 1024)).toFixed(2)
        setSuccess(`Starting upload of ${fileSizeMB}MB video...`)
        console.log(
          'Starting video upload:',
          formData.video.name,
          fileSizeMB + 'MB',
        )
      } else {
        setSuccess('Saving home content...')
      }

      const url = isEditMode
        ? `${BACKEND_URL}/home/${slug}`
        : `${BACKEND_URL}/home`

      console.log('Uploading to:', url)
      console.log('Token exists:', !!token)

      // Add timeout and better error handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        console.log('Upload timed out after 2 minutes')
      }, 120000) // 2 minutes timeout

      setSuccess(
        formData.video ? 'Uploading video... Please wait.' : 'Saving...',
      )

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`Server error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('Response data:', data)

      if (!data.success) {
        throw new Error(data.message || 'Server returned error')
      }

      setSuccess(
        isEditMode
          ? 'Home updated successfully!'
          : 'Home created successfully!',
      )

      // Navigate back to list after short delay
      setTimeout(() => {
        navigate('/home-management')
      }, 1500)
    } catch (err) {
      console.error('Upload error details:', err)

      if (err.name === 'AbortError') {
        setError(
          'Upload timed out after 2 minutes. Please try with a smaller video file.',
        )
      } else if (err.message.includes('Failed to fetch')) {
        setError('Network error. Please check your connection and try again.')
      } else {
        setError(`Upload failed: ${err.message}`)
      }
    } finally {
      setLoading(false)
      setIsUploading(false)
    }
  }

  const getVideoUrl = (videoPath) => {
    if (!videoPath) return null
    if (videoPath.startsWith('http')) return videoPath
    return `${BASE_URL}${videoPath}`
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <strong>{isEditMode ? 'Edit Home' : 'Add New Home'}</strong>
              <div className="small text-muted">
                {isEditMode ? 'Update home content' : 'Create new home content'}
              </div>
            </div>
            <CButton
              color="secondary"
              variant="outline"
              onClick={() => navigate('/home-management')}
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
                dismissible={!isUploading}
                onClose={() => !isUploading && setSuccess(null)}
              >
                {success}
              </CAlert>
            )}

            {/* Upload Status */}
            {isUploading && (
              <div className="mb-3">
                <div className="d-flex align-items-center">
                  <CSpinner size="sm" className="me-2" />
                  <span>Uploading video...</span>
                </div>
                <div className="small text-muted mt-1">
                  Video upload in progress. This may take up to 2 minutes
                  depending on file size.
                  <br />
                  <strong>
                    Please do not close this tab or navigate away.
                  </strong>
                </div>
              </div>
            )}

            <CForm onSubmit={handleSubmit}>
              <CRow>
                <CCol md={8}>
                  {/* Title Field */}
                  <TextInputField
                    id="title"
                    name="title"
                    label="Title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter home title"
                    required
                    maxLength={200}
                    helpText="A descriptive title for this home content"
                    disabled={loading}
                  />

                  {/* Text Field */}
                  <TextAreaField
                    id="text"
                    name="text"
                    label="Text Content"
                    value={formData.text}
                    onChange={handleInputChange}
                    placeholder="Enter home text content"
                    required
                    rows={8}
                    helpText="The main text content for the home section"
                    disabled={loading}
                  />

                  {/* Video Upload Field */}
                  <div className="mb-3">
                    <CFormLabel htmlFor="video-input">Video</CFormLabel>
                    <CFormInput
                      type="file"
                      id="video-input"
                      accept="video/*"
                      onChange={handleVideoChange}
                      disabled={loading || isUploading}
                    />
                    <div className="form-text">
                      Upload a video file (MP4, WebM, OGG, MOV, AVI). Maximum
                      size: 50MB.
                      <br />
                      <strong>Tip:</strong> Larger files may take several
                      minutes to upload. Please be patient.
                    </div>

                    {/* Current Video Preview */}
                    {(currentVideo || videoPreview) && (
                      <div className="mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong>
                            {videoPreview
                              ? 'New Video Preview:'
                              : 'Current Video:'}
                          </strong>
                          <CButton
                            color="danger"
                            variant="outline"
                            size="sm"
                            onClick={handleVideoRemove}
                          >
                            Remove Video
                          </CButton>
                        </div>
                        <video
                          src={videoPreview || getVideoUrl(currentVideo)}
                          controls
                          style={{
                            width: '100%',
                            maxHeight: '300px',
                            borderRadius: '4px',
                            border: '1px solid #dee2e6',
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="d-flex gap-2 mt-4">
                    <CButton
                      type="submit"
                      color="primary"
                      disabled={loading || isUploading}
                    >
                      {loading || isUploading ? (
                        <>
                          <CSpinner size="sm" className="me-2" />
                          {isUploading
                            ? 'Uploading Files...'
                            : isEditMode
                              ? 'Updating...'
                              : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <CIcon icon={cilSave} className="me-2" />
                          {isEditMode ? 'Update Home' : 'Create Home'}
                        </>
                      )}
                    </CButton>
                    <CButton
                      type="button"
                      color="secondary"
                      variant="outline"
                      onClick={() => navigate('/home-management')}
                      disabled={loading || isUploading}
                    >
                      Cancel
                    </CButton>
                  </div>
                </CCol>

                {/* Sidebar with Guidelines */}
                <CCol md={4}>
                  <CCard className="h-100">
                    <CCardHeader>
                      <strong>Guidelines</strong>
                    </CCardHeader>
                    <CCardBody>
                      <div className="small">
                        <div className="mb-3">
                          <strong>Title:</strong>
                          <ul className="mt-1 mb-2">
                            <li>Keep it concise and descriptive</li>
                            <li>Maximum 200 characters</li>
                            <li>Will be used to generate URL slug</li>
                          </ul>
                        </div>

                        <div className="mb-3">
                          <strong>Text Content:</strong>
                          <ul className="mt-1 mb-2">
                            <li>Provide engaging and informative content</li>
                            <li>Use proper formatting and grammar</li>
                            <li>Consider your target audience</li>
                          </ul>
                        </div>

                        <div className="mb-3">
                          <strong>Video:</strong>
                          <ul className="mt-1 mb-2">
                            <li>Supported formats: MP4, WebM, OGG, MOV, AVI</li>
                            <li>Maximum file size: 50MB</li>
                            <li>Optimal resolution: 1920x1080 or lower</li>
                            <li>
                              Upload time depends on file size and connection
                            </li>
                            <li>Optional but recommended for engagement</li>
                          </ul>
                        </div>
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default HomeForm
