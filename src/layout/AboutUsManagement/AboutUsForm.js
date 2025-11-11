import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSave,
  cilArrowLeft,
  cilImage,
  cilTrash,
  cilPlus,
} from '@coreui/icons'
import { BASE_URL } from '../../config'
import BACKEND_URL from '../../config'
import {
  TextInputField,
  TextAreaField,
  ImageUploadField,
} from '../../components/common'

const AboutUsForm = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    page_title: '',
    page_description: '',
    coffee_bar_title: '',
    coffee_bar_text: '',
    our_tutors_title: '',
    our_tutors_text: '',
  })

  const [bannerImage, setBannerImage] = useState(null)
  const [bannerImagePreview, setBannerImagePreview] = useState(null)
  const [currentBannerImage, setCurrentBannerImage] = useState(null)

  const [coffeeBarGallery, setCoffeeBarGallery] = useState([])
  const [coffeeBarGalleryPreviews, setCoffeeBarGalleryPreviews] = useState([])
  const [currentCoffeeBarGallery, setCurrentCoffeeBarGallery] = useState([])

  const [ourTutorsGallery, setOurTutorsGallery] = useState([])
  const [ourTutorsGalleryPreviews, setOurTutorsGalleryPreviews] = useState([])
  const [currentOurTutorsGallery, setCurrentOurTutorsGallery] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  // Load about us data on component mount
  useEffect(() => {
    loadAboutUsData()
  }, [])

  const loadAboutUsData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${BACKEND_URL}/about-us`)
      const data = await response.json()

      if (data.success) {
        const aboutUs = data.data
        setFormData({
          page_title: aboutUs.page_title || '',
          page_description: aboutUs.page_description || '',
          coffee_bar_title: aboutUs.coffee_bar?.title || '',
          coffee_bar_text: aboutUs.coffee_bar?.text || '',
          our_tutors_title: aboutUs.our_tutors?.title || '',
          our_tutors_text: aboutUs.our_tutors?.text || '',
        })

        setCurrentBannerImage(aboutUs.banner_image)
        setCurrentCoffeeBarGallery(aboutUs.coffee_bar?.gallery || [])
        setCurrentOurTutorsGallery(aboutUs.our_tutors?.gallery || [])
      } else if (data.status === 404) {
        // About Us doesn't exist yet, that's okay
        console.log('About Us page not found, creating new one')
      } else {
        throw new Error(data.message || 'Failed to load about us data')
      }
    } catch (error) {
      console.error('Error loading about us:', error)
      // Don't show error for 404, it's expected for new about us page
      if (!error.message.includes('404')) {
        setError(error.message)
      }
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

  const handleBannerImageChange = (files, errorMessage = null) => {
    if (errorMessage) {
      setError(errorMessage)
      return
    }

    // Handle both single file and array of files
    const file = Array.isArray(files) ? files[0] : files

    if (file) {
      setBannerImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setBannerImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleBannerImageRemove = () => {
    setBannerImage(null)
    setBannerImagePreview(null)
    setCurrentBannerImage(null)
  }

  const handleCoffeeBarGalleryChange = (files, errorMessage = null) => {
    if (errorMessage) {
      setError(errorMessage)
      return
    }

    if (files && files.length > 0) {
      setCoffeeBarGallery(Array.from(files))

      // Create previews
      const previews = []
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          previews.push(e.target.result)
          if (previews.length === files.length) {
            setCoffeeBarGalleryPreviews(previews)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleCoffeeBarGalleryRemove = () => {
    setCoffeeBarGallery([])
    setCoffeeBarGalleryPreviews([])
    setCurrentCoffeeBarGallery([])
  }

  const handleOurTutorsGalleryChange = (files, errorMessage = null) => {
    if (errorMessage) {
      setError(errorMessage)
      return
    }

    if (files && files.length > 0) {
      setOurTutorsGallery(Array.from(files))

      // Create previews
      const previews = []
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          previews.push(e.target.result)
          if (previews.length === files.length) {
            setOurTutorsGalleryPreviews(previews)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleOurTutorsGalleryRemove = () => {
    setOurTutorsGallery([])
    setOurTutorsGalleryPreviews([])
    setCurrentOurTutorsGallery([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    if (!formData.page_title.trim()) {
      setError('Page title is required')
      return
    }

    if (!formData.page_description.trim()) {
      setError('Page description is required')
      return
    }

    try {
      setLoading(true)
      setIsUploading(true)
      setError(null)
      setSuccess(null)

      const token = localStorage.getItem('admin_token')

      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('page_title', formData.page_title.trim())
      formDataToSend.append(
        'page_description',
        formData.page_description.trim(),
      )
      formDataToSend.append(
        'coffee_bar_title',
        formData.coffee_bar_title.trim(),
      )
      formDataToSend.append('coffee_bar_text', formData.coffee_bar_text.trim())
      formDataToSend.append(
        'our_tutors_title',
        formData.our_tutors_title.trim(),
      )
      formDataToSend.append('our_tutors_text', formData.our_tutors_text.trim())

      // Add banner image if exists
      if (bannerImage) {
        formDataToSend.append('banner_image', bannerImage)
      }

      // Add coffee bar gallery images
      if (coffeeBarGallery.length > 0) {
        coffeeBarGallery.forEach((file) => {
          formDataToSend.append('coffee_bar_gallery', file)
        })
      }

      // Add our tutors gallery images
      if (ourTutorsGallery.length > 0) {
        ourTutorsGallery.forEach((file) => {
          formDataToSend.append('our_tutors_gallery', file)
        })
      }

      setSuccess('Uploading About Us data... Please wait.')

      const response = await fetch(`${BACKEND_URL}/about-us`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`Server error ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Server returned error')
      }

      setSuccess('About Us updated successfully!')

      // Reload data to show updated content
      setTimeout(() => {
        loadAboutUsData()
      }, 1000)
    } catch (error) {
      console.error('About Us submission error:', error)
      setError(error.message || 'An error occurred while saving')
    } finally {
      setLoading(false)
      setIsUploading(false)
    }
  }

  const handleBack = () => navigate('/home-management')

  const getBannerImageUrl = (imagePath) => {
    if (imagePath) {
      return `${BASE_URL}${imagePath}`
    }
    return null
  }

  const getGalleryImageUrl = (imagePath) => {
    if (imagePath) {
      return `${BASE_URL}${imagePath}`
    }
    return null
  }

  if (loading && !formData.page_title) {
    return (
      <div className="d-flex justify-content-center">
        <CSpinner />
      </div>
    )
  }

  return (
    <CCard>
      <CCardHeader>
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">About Us Management</h4>
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            onClick={handleBack}
          >
            <CIcon icon={cilArrowLeft} className="me-1" />
            Back to Home Management
          </CButton>
        </div>
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
            <CCol md={12}>
              <CCard className="mb-4">
                <CCardHeader>
                  <h5 className="mb-0">Page Information</h5>
                </CCardHeader>
                <CCardBody>
                  <CRow>
                    <CCol md={6}>
                      <TextInputField
                        id="page_title"
                        name="page_title"
                        label="Page Title"
                        value={formData.page_title}
                        onChange={handleInputChange}
                        placeholder="Enter page title"
                        maxLength={200}
                        required
                        disabled={loading}
                      />
                    </CCol>
                    <CCol md={6}>
                      <ImageUploadField
                        id="banner_image"
                        label="Banner Image"
                        currentImage={currentBannerImage}
                        imagePreview={bannerImagePreview}
                        onImageChange={handleBannerImageChange}
                        onImageRemove={handleBannerImageRemove}
                        maxSize={15}
                        getImageUrl={getBannerImageUrl}
                        disabled={loading}
                      />
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={12}>
                      <TextAreaField
                        id="page_description"
                        name="page_description"
                        label="Page Description"
                        value={formData.page_description}
                        onChange={handleInputChange}
                        placeholder="Enter page description"
                        rows={4}
                        required
                        disabled={loading}
                      />
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>

              {/* Coffee Bar Section */}
              <CAccordion activeItemKey="1" alwaysOpen className="mb-4">
                <CAccordionItem itemKey="1">
                  <CAccordionHeader>Coffee Bar Section</CAccordionHeader>
                  <CAccordionBody>
                    <CRow>
                      <CCol md={6}>
                        <TextInputField
                          id="coffee_bar_title"
                          name="coffee_bar_title"
                          label="Coffee Bar Title"
                          value={formData.coffee_bar_title}
                          onChange={handleInputChange}
                          placeholder="Enter coffee bar title"
                          maxLength={200}
                          disabled={loading}
                        />
                      </CCol>
                      <CCol md={6}>
                        <ImageUploadField
                          id="coffee_bar_gallery"
                          label="Coffee Bar Gallery"
                          imagePreview={coffeeBarGalleryPreviews}
                          onImageChange={handleCoffeeBarGalleryChange}
                          onImageRemove={handleCoffeeBarGalleryRemove}
                          multiple={true}
                          maxSize={15}
                          disabled={loading}
                          helpText="Upload multiple images for coffee bar gallery"
                        />
                      </CCol>
                    </CRow>

                    <CRow>
                      <CCol md={12}>
                        <TextAreaField
                          id="coffee_bar_text"
                          name="coffee_bar_text"
                          label="Coffee Bar Text"
                          value={formData.coffee_bar_text}
                          onChange={handleInputChange}
                          placeholder="Enter coffee bar description"
                          rows={4}
                          disabled={loading}
                        />
                      </CCol>
                    </CRow>

                    {currentCoffeeBarGallery.length > 0 && (
                      <CRow>
                        <CCol md={12}>
                          <h6>Current Coffee Bar Gallery:</h6>
                          <div className="d-flex flex-wrap gap-2">
                            {currentCoffeeBarGallery.map((imagePath, index) => (
                              <img
                                key={index}
                                src={getGalleryImageUrl(imagePath)}
                                alt={`Coffee bar ${index + 1}`}
                                style={{
                                  width: '100px',
                                  height: '100px',
                                  objectFit: 'cover',
                                }}
                                className="rounded"
                              />
                            ))}
                          </div>
                        </CCol>
                      </CRow>
                    )}
                  </CAccordionBody>
                </CAccordionItem>
              </CAccordion>

              {/* Our Tutors Section */}
              <CAccordion activeItemKey="1" alwaysOpen className="mb-4">
                <CAccordionItem itemKey="1">
                  <CAccordionHeader>Our Tutors Section</CAccordionHeader>
                  <CAccordionBody>
                    <CRow>
                      <CCol md={6}>
                        <TextInputField
                          id="our_tutors_title"
                          name="our_tutors_title"
                          label="Our Tutors Title"
                          value={formData.our_tutors_title}
                          onChange={handleInputChange}
                          placeholder="Enter our tutors title"
                          maxLength={200}
                          disabled={loading}
                        />
                      </CCol>
                      <CCol md={6}>
                        <ImageUploadField
                          id="our_tutors_gallery"
                          label="Our Tutors Gallery"
                          imagePreview={ourTutorsGalleryPreviews}
                          onImageChange={handleOurTutorsGalleryChange}
                          onImageRemove={handleOurTutorsGalleryRemove}
                          multiple={true}
                          maxSize={15}
                          disabled={loading}
                          helpText="Upload multiple images for our tutors gallery"
                        />
                      </CCol>
                    </CRow>

                    <CRow>
                      <CCol md={12}>
                        <TextAreaField
                          id="our_tutors_text"
                          name="our_tutors_text"
                          label="Our Tutors Text"
                          value={formData.our_tutors_text}
                          onChange={handleInputChange}
                          placeholder="Enter our tutors description"
                          rows={4}
                          disabled={loading}
                        />
                      </CCol>
                    </CRow>

                    {currentOurTutorsGallery.length > 0 && (
                      <CRow>
                        <CCol md={12}>
                          <h6>Current Our Tutors Gallery:</h6>
                          <div className="d-flex flex-wrap gap-2">
                            {currentOurTutorsGallery.map((imagePath, index) => (
                              <img
                                key={index}
                                src={getGalleryImageUrl(imagePath)}
                                alt={`Our tutors ${index + 1}`}
                                style={{
                                  width: '100px',
                                  height: '100px',
                                  objectFit: 'cover',
                                }}
                                className="rounded"
                              />
                            ))}
                          </div>
                        </CCol>
                      </CRow>
                    )}
                  </CAccordionBody>
                </CAccordionItem>
              </CAccordion>

              {/* Submit Button */}
              <div className="d-flex justify-content-end gap-2">
                <CButton
                  type="button"
                  color="secondary"
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                >
                  <CIcon icon={cilArrowLeft} className="me-1" />
                  Cancel
                </CButton>

                <CButton
                  type="submit"
                  color="primary"
                  disabled={loading || isUploading}
                >
                  {loading ? (
                    <>
                      <CSpinner size="sm" className="me-1" />
                      {isUploading ? 'Uploading...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <CIcon icon={cilSave} className="me-1" />
                      Save About Us
                    </>
                  )}
                </CButton>
              </div>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default AboutUsForm
