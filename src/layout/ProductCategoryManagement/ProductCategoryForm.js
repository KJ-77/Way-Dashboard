import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormLabel,
  CRow,
  CSpinner,
  CAlert,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import TextInputField from '../../components/common/TextInputField'
import BACKEND_URL from '../../config'

const ProductCategoryForm = () => {
  const { slug } = useParams()
  const isEditMode = !!slug

  // State variables
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  const navigate = useNavigate()
  const { getAuthHeaders } = useAuth()

  // Load category data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const loadCategoryData = async () => {
        setLoading(true)
        try {
          const token = localStorage.getItem('admin_token')
          const response = await fetch(
            `${BACKEND_URL}/product-categories/${slug}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            },
          )

          if (!response.ok) {
            throw new Error('Failed to fetch category')
          }

          const data = await response.json()
          if (data.success && data.data) {
            setTitle(data.data.title)
          } else {
            throw new Error(data.message || 'Invalid category data')
          }
        } catch (err) {
          console.error('Error fetching category:', err)
          setError(err.message || 'Error loading category data')
        } finally {
          setLoading(false)
        }
      }

      loadCategoryData()
    }
  }, [slug, isEditMode, getAuthHeaders])

  // Handle input change
  const handleInputChange = (e) => {
    setTitle(e.target.value)

    // Clear validation error when user types
    if (validationErrors.title) {
      setValidationErrors((prev) => ({ ...prev, title: null }))
    }
  }

  // Form validation
  const validateForm = () => {
    const errors = {}

    if (!title.trim()) {
      errors.title = 'Category title is required'
    } else if (title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters'
    } else if (title.trim().length > 50) {
      errors.title = 'Title cannot exceed 50 characters'
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
      ? `${BACKEND_URL}/product-categories/${slug}`
      : `${BACKEND_URL}/product-categories`

    const method = isEditMode ? 'PATCH' : 'POST'

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific errors from API
        if (response.status === 409) {
          setValidationErrors({
            title: 'A category with this title already exists',
          })
          throw new Error('A category with this title already exists')
        }
        throw new Error(data.message || 'Failed to save category')
      }

      setSuccess(true)

      // If creating new category, redirect after short delay
      if (!isEditMode) {
        setTimeout(() => {
          navigate('/product-categories')
        }, 1500)
      }
    } catch (err) {
      console.error('Error saving category:', err)
      setError(err.message || 'Error saving category')
    } finally {
      setSubmitting(false)
    }
  }

  // Navigate back to categories list
  const handleBack = () => {
    navigate('/product-categories')
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <h5>
          {isEditMode ? 'Edit Product Category' : 'Create Product Category'}
        </h5>
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
                Category {isEditMode ? 'updated' : 'created'} successfully!
              </CAlert>
            )}

            <CRow className="mb-4">
              <CCol md={6}>
                <TextInputField
                  id="category-title"
                  label="Category Title"
                  value={title}
                  onChange={handleInputChange}
                  error={validationErrors.title}
                  placeholder="Enter category title"
                  required
                  maxLength={50}
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
                    <>{isEditMode ? 'Update' : 'Create'} Category</>
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

export default ProductCategoryForm
