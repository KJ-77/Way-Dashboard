import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormSelect,
  CRow,
  CSpinner,
  CAlert,
  CFormFeedback,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import TextInputField from '../../components/common/TextInputField'
import TextAreaField from '../../components/common/TextAreaField'
import ImageUploadField from '../../components/common/ImageUploadField'
import BACKEND_URL, { BASE_URL } from '../../config'

const ProductForm = () => {
  const { slug } = useParams()
  const isEditMode = !!slug

  // State variables
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  })
  const [categories, setCategories] = useState([])
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  const navigate = useNavigate()
  const { getAuthHeaders } = useAuth()

  // Load categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('admin_token')
        const response = await fetch(
          `${BACKEND_URL}/product-categories?limit=100`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }

        const data = await response.json()
        setCategories(data.data || [])
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Failed to load categories. Please reload the page.')
      }
    }

    fetchCategories()
  }, [getAuthHeaders])

  // Load product data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const loadProductData = async () => {
        setLoading(true)
        try {
          const token = localStorage.getItem('admin_token')
          const response = await fetch(`${BACKEND_URL}/products/${slug}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          })

          if (!response.ok) {
            throw new Error('Failed to fetch product')
          }

          const data = await response.json()
          if (data.success && data.data) {
            const product = data.data
            setFormData({
              name: product.name,
              description: product.description,
              price: product.price.toString(),
              category: product.category?._id || '',
            })

            if (product.image) {
              setImagePreview(`${BASE_URL}/uploads/${product.image}`)
            }
          } else {
            throw new Error(data.message || 'Invalid product data')
          }
        } catch (err) {
          console.error('Error fetching product:', err)
          setError(err.message || 'Error loading product data')
        } finally {
          setLoading(false)
        }
      }

      loadProductData()
    }
  }, [slug, isEditMode, getAuthHeaders])

  // Handle text/number input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  // Handle image change
  const handleImageChange = (files, errorMessage = null) => {
    if (errorMessage) {
      setValidationErrors((prev) => ({ ...prev, image: errorMessage }))
      return
    }

    if (files && files.length > 0) {
      const file = files[0]
      setSelectedImage(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)

      // Clear validation error if exists
      if (validationErrors.image) {
        setValidationErrors((prev) => ({ ...prev, image: null }))
      }
    }
  }

  // Handle image removal
  const handleImageRemove = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  // Form validation
  const validateForm = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = 'Product name is required'
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters'
    }

    if (!formData.description.trim()) {
      errors.description = 'Product description is required'
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters'
    }

    if (!formData.price) {
      errors.price = 'Price is required'
    } else if (
      isNaN(parseFloat(formData.price)) ||
      parseFloat(formData.price) < 0
    ) {
      errors.price = 'Price must be a valid non-negative number'
    }

    if (!formData.category) {
      errors.category = 'Please select a category'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(false)

    const url = isEditMode
      ? `${BACKEND_URL}/products/${slug}`
      : `${BACKEND_URL}/products`

    const method = isEditMode ? 'PATCH' : 'POST'

    try {
      // Create form data for multipart submission
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name.trim())
      formDataToSend.append('description', formData.description.trim())
      formDataToSend.append('price', parseFloat(formData.price))
      formDataToSend.append('category', formData.category)

      if (selectedImage) {
        formDataToSend.append('image', selectedImage)
      }

      const token = localStorage.getItem('admin_token')
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific errors from API
        if (response.status === 409) {
          setValidationErrors({
            name: 'A product with this name already exists',
          })
          throw new Error('A product with this name already exists')
        }
        throw new Error(data.message || 'Failed to save product')
      }

      setSuccess(true)

      // If creating new product, redirect after short delay
      if (!isEditMode) {
        setTimeout(() => {
          navigate('/products')
        }, 1500)
      }
    } catch (err) {
      console.error('Error saving product:', err)
      setError(err.message || 'Error saving product')
    } finally {
      setSubmitting(false)
    }
  }

  // Navigate back to products list
  const handleBack = () => {
    navigate('/products')
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <h5>{isEditMode ? 'Edit Product' : 'Create Product'}</h5>
      </CCardHeader>
      <CCardBody>
        {loading ? (
          <div className="text-center py-5">
            <CSpinner />
          </div>
        ) : (
          <CForm onSubmit={handleSubmit}>
            {error && (
              <CAlert color="danger" className="mb-4">
                {error}
              </CAlert>
            )}

            {success && (
              <CAlert color="success" className="mb-4">
                Product {isEditMode ? 'updated' : 'created'} successfully!
              </CAlert>
            )}

            <CRow className="mb-4">
              <CCol md={6}>
                <TextInputField
                  id="product-name"
                  name="name"
                  label="Product Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={validationErrors.name}
                  placeholder="Enter product name"
                  required
                />
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <label htmlFor="product-category" className="form-label">
                    Category <span className="text-danger">*</span>
                  </label>
                  <CFormSelect
                    id="product-category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    invalid={!!validationErrors.category}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.title}
                      </option>
                    ))}
                  </CFormSelect>
                  {validationErrors.category && (
                    <CFormFeedback invalid>
                      {validationErrors.category}
                    </CFormFeedback>
                  )}
                </div>
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <TextInputField
                  id="product-price"
                  name="price"
                  label="Price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  error={validationErrors.price}
                  placeholder="0.00"
                  required
                />
              </CCol>
              <CCol md={6}>
                <ImageUploadField
                  id="product-image"
                  label="Product Image"
                  currentImage={null}
                  imagePreview={imagePreview}
                  onImageChange={handleImageChange}
                  onImageRemove={handleImageRemove}
                  error={validationErrors.image}
                  helpText="Recommended size: 800x600px, max size: 2MB"
                />
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={12}>
                <TextAreaField
                  id="product-description"
                  name="description"
                  label="Product Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  error={validationErrors.description}
                  placeholder="Enter product description..."
                  required
                  rows={6}
                />
              </CCol>
            </CRow>

            <CRow className="mt-4">
              <CCol>
                <CButton type="submit" color="primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>{isEditMode ? 'Update' : 'Create'} Product</>
                  )}
                </CButton>
                <CButton
                  type="button"
                  color="secondary"
                  variant="outline"
                  className="ms-2"
                  onClick={handleBack}
                >
                  Cancel
                </CButton>
              </CCol>
            </CRow>
          </CForm>
        )}
      </CCardBody>
    </CCard>
  )
}

export default ProductForm
