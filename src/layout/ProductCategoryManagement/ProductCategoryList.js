import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CSpinner,
  CInputGroup,
  CFormInput,
  CInputGroupText,
  CBadge,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilTrash, cilPencil, cilPlus } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal'
import EmptyState from '../../components/common/EmptyState'
import BACKEND_URL from '../../config'

const ProductCategoryList = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState({
    visible: false,
    category: null,
  })

  const { getAuthHeaders } = useAuth()
  const navigate = useNavigate()

  // Load categories from API
  const loadCategories = async (page = 1, search = '') => {
    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(
        `${BACKEND_URL}/product-categories?page=${page}&limit=10&search=${search}`,
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
      setCategories(data.data)
      setTotalPages(data.pagination.pages)
      setCurrentPage(data.pagination.page)
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Failed to load categories. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Load categories on initial render
  useEffect(() => {
    loadCategories()
  }, [])

  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    loadCategories(1, e.target.value)
  }

  // Handle pagination
  const handlePageChange = (page) => {
    loadCategories(page, searchTerm)
  }

  // Navigate to edit page
  const handleEditCategory = (category) => {
    navigate(`/product-categories/edit/${category.slug}`)
  }

  // Open delete confirmation modal
  const handleDeleteCategory = (category) => {
    setDeleteModal({ visible: true, category })
  }

  // Handle delete confirmation
  const confirmDelete = async () => {
    if (!deleteModal.category) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(
        `${BACKEND_URL}/product-categories/${deleteModal.category.slug}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error('Failed to delete category')
      }

      // Remove the deleted category from the state
      setCategories((prev) =>
        prev.filter((cat) => cat._id !== deleteModal.category._id),
      )

      // Close the modal
      setDeleteModal({ visible: false, category: null })
    } catch (err) {
      console.error('Error deleting category:', err)
      setError('Failed to delete category. Please try again.')
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch (err) {
      return 'Invalid date'
    }
  }

  // Navigate to create new category page
  const handleAddNew = () => {
    navigate('/product-categories/create')
  }

  // Render empty state when no categories exist
  const renderEmptyState = () => (
    <EmptyState
      title="No Categories Found"
      message="There are no product categories yet. Create your first one to get started."
      buttonText="Create Category"
      onAction={handleAddNew}
    />
  )

  // Render categories table
  const renderTable = () => (
    <CTable hover responsive>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>Title</CTableHeaderCell>
          <CTableHeaderCell>Slug</CTableHeaderCell>
          <CTableHeaderCell>Created</CTableHeaderCell>
          <CTableHeaderCell>Actions</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {categories.map((category) => (
          <CTableRow key={category._id}>
            <CTableDataCell>{category.title}</CTableDataCell>
            <CTableDataCell>{category.slug}</CTableDataCell>
            <CTableDataCell>{formatDate(category.createdAt)}</CTableDataCell>
            <CTableDataCell>
              <CButton
                color="primary"
                size="sm"
                className="me-2"
                onClick={() => handleEditCategory(category)}
              >
                <CIcon icon={cilPencil} />
              </CButton>
              <CButton
                color="danger"
                size="sm"
                onClick={() => handleDeleteCategory(category)}
              >
                <CIcon icon={cilTrash} />
              </CButton>
            </CTableDataCell>
          </CTableRow>
        ))}
      </CTableBody>
    </CTable>
  )

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <h5>Product Categories</h5>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={6} className="mb-2">
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilSearch} />
                </CInputGroupText>
                <CFormInput
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </CInputGroup>
            </CCol>
            <CCol md={6} className="d-flex justify-content-end mb-2">
              <CButton color="primary" onClick={handleAddNew}>
                <CIcon icon={cilPlus} className="me-2" />
                Add New Category
              </CButton>
            </CCol>
          </CRow>

          {loading ? (
            <div className="text-center py-5">
              <CSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-5 text-danger">{error}</div>
          ) : categories.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {renderTable()}

              {/* Pagination */}
              {totalPages > 1 && (
                <CPagination
                  align="center"
                  aria-label="Page navigation"
                  className="mt-4"
                >
                  {[...Array(totalPages).keys()].map((page) => (
                    <CPaginationItem
                      key={page + 1}
                      active={page + 1 === currentPage}
                      onClick={() => handlePageChange(page + 1)}
                    >
                      {page + 1}
                    </CPaginationItem>
                  ))}
                </CPagination>
              )}
            </>
          )}
        </CCardBody>
      </CCard>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        visible={deleteModal.visible}
        onClose={() => setDeleteModal({ visible: false, category: null })}
        onConfirm={confirmDelete}
        itemName={deleteModal.category?.title || 'this category'}
        itemType="product category"
      />
    </>
  )
}

export default ProductCategoryList
