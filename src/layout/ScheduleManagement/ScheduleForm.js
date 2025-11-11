import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormLabel,
  CFormInput,
  CButton,
  CRow,
  CCol,
  CAlert,
  CSpinner,
  CImage,
  CCloseButton,
  CFormCheck,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { BASE_URL } from '../../config'
import { cilArrowLeft, cilSave } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { TextAreaField, ImageUploadField } from '../../components/common'
import { api } from '../../services/api'

const ScheduleForm = () => {
  const navigate = useNavigate()
  const { slug } = useParams()
  const isEditMode = Boolean(slug)

  // Custom styles for dropdown
  const dropdownStyles = {
    maxHeight: '250px',
    overflowY: 'auto',
  }

  const [formData, setFormData] = useState({
    title: '',
    text: '',
    price: 0,
    status: 'draft',
    sessions: [], // [{ startDate, endDate, time, period, capacity, tutor }]
  })
  const [selectedImages, setSelectedImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [availableTutors, setAvailableTutors] = useState([])
  const [loadingTutors, setLoadingTutors] = useState(false)

  // Fetch available tutors
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoadingTutors(true)
        const token = localStorage.getItem('admin_token')

        const response = await fetch(`${BASE_URL}/api/tutor`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`)
        }

        const data = await response.json()

        if (data.status === 'success') {
          setAvailableTutors(data.data)
        } else {
          console.warn('Tutors not loaded properly')
        }
      } catch (err) {
        console.error('Error fetching tutors:', err)
      } finally {
        setLoadingTutors(false)
      }
    }

    fetchTutors()
  }, [])

  // Load schedule data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchSchedule = async () => {
        try {
          setFetchLoading(true)
          const token = localStorage.getItem('admin_token')

          const response = await fetch(`${BASE_URL}/api/schedule/${slug}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          })

          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`)
          }

          const data = await response.json()

          if (data.success) {
            const schedule = data.data
            // Format dates for date input fields (YYYY-MM-DD format)
            const formatDateForInput = (dateString) => {
              if (!dateString) return ''
              const date = new Date(dateString)
              if (Number.isNaN(date.getTime())) return ''
              return date.toISOString().split('T')[0]
            }

            setFormData({
              title: schedule.title || '',
              text: schedule.text || '',
              price: schedule.price || 0,
              status: schedule.status || 'draft',
              sessions:
                (schedule.sessions || []).map((s) => ({
                  _id: s._id,
                  startDate: s.startDate
                    ? new Date(s.startDate).toISOString().split('T')[0]
                    : '', // yyyy-MM-dd
                  endDate: s.endDate
                    ? new Date(s.endDate).toISOString().split('T')[0]
                    : '', // yyyy-MM-dd
                  time: s.time || '', // HH:mm
                  period: s.period || '2hours', // Default to 2hours if not provided
                  capacity: s.capacity || 1,
                  tutor: typeof s.tutor === 'object' ? s.tutor?._id : s.tutor,
                })) || [],
            })
            setExistingImages(schedule.images || [])
          } else {
            throw new Error(data.message || 'Failed to load schedule')
          }
        } catch (err) {
          console.error('Error fetching schedule:', err)
          setError(`Failed to load schedule: ${err.message}`)
        } finally {
          setFetchLoading(false)
        }
      }

      fetchSchedule()
    }
  }, [slug, isEditMode])

  // Helper function to parse period value (e.g., "2hours" to 2)
  const parsePeriodValue = (periodString) => {
    if (!periodString) return 2 // Default to 2 if not provided
    const match = periodString.match(/^(\d+)hours?$/)
    return match ? parseInt(match[1]) : 2
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Session management helpers
  const addSession = () => {
    setFormData((prev) => ({
      ...prev,
      sessions: [
        ...prev.sessions,
        {
          startDate: '',
          endDate: '',
          time: '',
          period: '2hours',
          capacity: 1,
          tutor: '',
        },
      ],
    }))
  }

  const updateSession = (index, field, value) => {
    setFormData((prev) => {
      const next = [...prev.sessions]
      next[index] = { ...next[index], [field]: value }
      return { ...prev, sessions: next }
    })
  }

  const removeSession = (index) => {
    setFormData((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((_, i) => i !== index),
    }))
  }

  // Toggle dropdown open/close state
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Search filter for tutors
  const [tutorSearch, setTutorSearch] = useState('')

  // Filtered tutors based on search
  const filteredTutors = (availableTutors || []).filter((tutor) => {
    const name = (tutor && tutor.name) || ''
    return name.toLowerCase().includes((tutorSearch || '').toLowerCase())
  })

  // Derived: overall period across sessions for sidebar summary
  const overallPeriod = 'Not set'

  // Check if schedule content is too similar to existing schedules
  const [checkingDuplicate, setCheckingDuplicate] = useState(false)

  const checkForDuplicateContent = async () => {
    try {
      setCheckingDuplicate(true)
      const token = localStorage.getItem('admin_token')

      // Use a lightweight request to check if the content would create a duplicate slug
      const response = await fetch(`${BASE_URL}/api/schedule/check-duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: formData.text,
          currentSlug: isEditMode ? slug : null, // If editing, exclude current schedule
        }),
      })

      const data = await response.json()
      return data.isDuplicate
    } catch (err) {
      console.error('Error checking for duplicates:', err)
      // If check fails, allow submission to continue
      return false
    } finally {
      setCheckingDuplicate(false)
    }
  } // Handle image selection for reusable component
  const handleImageChange = (files, errorMessage = null) => {
    if (errorMessage) {
      setError(errorMessage)
      return
    }

    if (files && files.length > 0) {
      setSelectedImages((prev) => [...prev, ...files])
    }
  }

  // Remove all selected images for reusable component
  const handleImageRemove = () => {
    setSelectedImages([])
  }

  // Remove selected image (keep for individual image removal)
  const removeSelectedImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation for all required fields
    if (!formData.title.trim()) {
      setError('Schedule title is required')
      return
    }
    if (!formData.text.trim()) {
      setError('Schedule text is required')
      return
    }
    if (!formData.sessions || formData.sessions.length === 0) {
      setError('At least one session is required')
      return
    }
    const invalid = formData.sessions.some(
      (s) =>
        !s.startDate ||
        !s.endDate ||
        !s.time ||
        !s.period ||
        !s.capacity ||
        s.capacity < 1 ||
        !s.tutor,
    )
    if (invalid) {
      setError(
        'Each session requires start date, end date, time, period, capacity (>=1), and tutor',
      )
      return
    }

    try {
      setLoading(true)

      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('text', formData.text)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('status', formData.status)
      formDataToSend.append('sessions', JSON.stringify(formData.sessions))

      // Add images
      selectedImages.forEach((image, index) => {
        formDataToSend.append('images', image)
      })

      let data
      // Create or update schedule using the api service
      try {
        if (isEditMode) {
          data = await api.putWithFile(`/schedule/${slug}`, formDataToSend)
        } else {
          data = await api.postWithFile('/schedule', formDataToSend)
        }
      } catch (apiError) {
        // Handle specific error cases
        if (apiError.message && apiError.message.includes('409')) {
          throw new Error(
            'A schedule with similar content already exists. Please modify the text content to make it unique.',
          )
        }
        throw apiError
      }

      if (data.success) {
        setSuccess(
          isEditMode
            ? 'Schedule updated successfully!'
            : 'Schedule created successfully!',
        )

        // Reset form if creating new
        if (!isEditMode) {
          setFormData({ title: '', text: '', price: 0, status: 'draft', sessions: [] })
          setSelectedImages([])
          setExistingImages([])
        }

        // Navigate back to list after a short delay
        setTimeout(() => {
          navigate('/schedule-management')
        }, 1500)
      } else {
        throw new Error(data.message || 'Failed to save schedule')
      }
    } catch (err) {
      console.error('Error saving schedule:', err)
      setError(`Failed to save schedule: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle back navigation
  const handleBack = () => {
    navigate('/schedule-management')
  }

  // NEW: Debug function to inspect data
  const debugData = (data, label) => {
    console.group(`DEBUG: ${label}`)
    console.log('Data:', data)
    if (data && typeof data === 'object') {
      console.log('Type:', Array.isArray(data) ? 'Array' : 'Object')
      console.log('JSON:', JSON.stringify(data))

      if (Array.isArray(data)) {
        data.forEach((item, index) => {
          console.log(`Item ${index}:`, item, typeof item)
        })
      }
    }
    console.groupEnd()
  }

  if (fetchLoading) {
    return null
  }

  return (
    <React.Fragment>
      <CCard>
        <CCardHeader>
          <CRow>
            <CCol>
              <h5>{isEditMode ? 'Edit Schedule' : 'Create New Schedule'}</h5>
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
            <CAlert
              color="success"
              dismissible
              onClose={() => setSuccess(null)}
            >
              {success}
            </CAlert>
          )}

          <CForm onSubmit={handleSubmit}>
            <CRow>
              <CCol md={8}>
                {/* Title Field */}
                <div className="mb-3">
                  <CFormLabel htmlFor="title">Schedule Title</CFormLabel>
                  <CFormInput
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter the schedule title"
                    required
                  />
                </div>

                {/* Text Content Field */}
                <div className="mb-3">
                  <TextAreaField
                    id="text"
                    name="text"
                    label="Schedule Content"
                    value={formData.text}
                    onChange={handleInputChange}
                    placeholder="Enter the schedule content..."
                    rows={4}
                    required
                  />
                  <small className="form-text text-muted">
                    This content is used to generate a unique identifier for the
                    schedule. If you receive a conflict error, try making this
                    content more unique.
                  </small>
                </div>

                {/* Price and Status Row */}
                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="price">Price</CFormLabel>
                    <CFormInput
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      required
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="status">Status</CFormLabel>
                    <select
                      id="status"
                      name="status"
                      className="form-select"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                    <small className="form-text text-muted">
                      Only published schedules are visible to users
                    </small>
                  </CCol>
                </CRow>

                {/* Date Fields Row */}
                {/* Removed schedule-level start/end dates */}

                {/* Sessions Editor */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <CFormLabel className="m-0">Sessions</CFormLabel>
                    <CButton size="sm" color="primary" onClick={addSession}>
                      + Add Session
                    </CButton>
                  </div>
                  {(formData.sessions?.length ?? 0) === 0 ? (
                    <div className="text-muted small">
                      No sessions added yet.
                    </div>
                  ) : (
                    (formData.sessions || []).map((session, idx) => (
                      <div key={idx} className="border rounded p-3 mb-2">
                        <div className="session-container">
                          {/* Row 1: Start Date, End Date, Time */}
                          <CRow className="g-3 mb-2">
                            <CCol xs={12} md={4}>
                              <CFormLabel>Start Date</CFormLabel>
                              <CFormInput
                                type="date"
                                value={session.startDate || ''}
                                onChange={(e) =>
                                  updateSession(
                                    idx,
                                    'startDate',
                                    e.target.value,
                                  )
                                }
                                required
                              />
                            </CCol>
                            <CCol xs={12} md={4}>
                              <CFormLabel>End Date</CFormLabel>
                              <CFormInput
                                type="date"
                                value={session.endDate || ''}
                                onChange={(e) =>
                                  updateSession(idx, 'endDate', e.target.value)
                                }
                                required
                              />
                            </CCol>
                            <CCol xs={12} md={4}>
                              <CFormLabel>Time</CFormLabel>
                              <CFormInput
                                type="time"
                                value={session.time || ''}
                                onChange={(e) =>
                                  updateSession(idx, 'time', e.target.value)
                                }
                                required
                              />
                            </CCol>
                          </CRow>

                          {/* Row 2: Period, Capacity, Tutor */}
                          <CRow className="g-3 mb-2">
                            <CCol xs={12} md={4}>
                              <CFormLabel>Period</CFormLabel>
                              <div className="input-group">
                                <CFormInput
                                  type="number"
                                  min="1"
                                  max="12"
                                  value={parsePeriodValue(session.period)}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value)
                                    if (value && value > 0) {
                                      updateSession(
                                        idx,
                                        'period',
                                        `${value}hours`,
                                      )
                                    }
                                  }}
                                  required
                                />
                                <span className="input-group-text">hours</span>
                              </div>
                            </CCol>
                            <CCol xs={12} md={4}>
                              <CFormLabel>Capacity</CFormLabel>
                              <CFormInput
                                type="number"
                                min="1"
                                value={session.capacity || 1}
                                onChange={(e) =>
                                  updateSession(
                                    idx,
                                    'capacity',
                                    Number(e.target.value),
                                  )
                                }
                                required
                              />
                            </CCol>
                            <CCol xs={12} md={4}>
                              <CFormLabel>Tutor</CFormLabel>
                              <select
                                className="form-select"
                                value={session.tutor || ''}
                                onChange={(e) =>
                                  updateSession(idx, 'tutor', e.target.value)
                                }
                                required
                              >
                                <option value="" disabled>
                                  Select tutor
                                </option>
                                {availableTutors.map((t) => (
                                  <option key={t._id} value={t._id}>
                                    {t.name}
                                  </option>
                                ))}
                              </select>
                            </CCol>
                          </CRow>

                          {/* Row 3: Remove button */}
                          <CRow className="mt-3">
                            <CCol xs={12} className="text-end">
                              <CButton
                                color="danger"
                                variant="outline"
                                size="sm"
                                onClick={() => removeSession(idx)}
                              >
                                Remove Session
                              </CButton>
                            </CCol>
                          </CRow>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <ImageUploadField
                  id="images"
                  label="Upload Images (Optional)"
                  imagePreview={null}
                  onImageChange={handleImageChange}
                  onImageRemove={handleImageRemove}
                  multiple={true}
                  helpText="You can select multiple images. Supported formats: JPG, PNG, GIF, WebP (Max 15MB each)"
                />

                {/* Show existing images in edit mode */}
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
                      Note: Uploading new images will replace all existing
                      images
                    </small>
                  </div>
                )}

                {/* Show selected images */}
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
                  <h6 className="mb-3">Schedule Information</h6>
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
                    <strong>Title:</strong> {formData.title || 'Not set'}
                  </div>
                  <div className="mb-2">
                    <strong>Content Length:</strong>{' '}
                    {(formData.text || '').length} characters
                  </div>
                  <div className="mb-2">
                    <strong>Overall Period:</strong> {overallPeriod}
                  </div>
                  <div className="mb-2">
                    <strong>Sessions:</strong> {formData.sessions?.length ?? 0}
                    {(formData.sessions?.length ?? 0) > 0 && (
                      <div className="mt-1 ps-2 border-start small text-muted">
                        Total capacity:{' '}
                        {(formData.sessions || []).reduce(
                          (sum, s) => sum + (Number(s.capacity) || 0),
                          0,
                        )}
                      </div>
                    )}
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
                        {isEditMode ? 'Update Schedule' : 'Create Schedule'}
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
    </React.Fragment>
  )
}

export default ScheduleForm
