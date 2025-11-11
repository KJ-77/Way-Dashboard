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
  CFormSelect,
  CBadge,
  CPagination,
  CPaginationItem,
  CImage,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilTrash, cilPencil, cilPlus } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal'
import PermissionGate from '../../components/PermissionGate'
import EmptyState from '../../components/common/EmptyState'
import BACKEND_URL, { BASE_URL } from '../../config'

const ProductList = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [deleteModal, setDeleteModal] = useState({
    visible: false,
    product: null,
  })

  const { getAuthHeaders } = useAuth()
  const navigate = useNavigate()

  // Load product categories for filter dropdown
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
        // Don't show error for categories, just log it
      }
    }

    fetchCategories()
  }, [getAuthHeaders])

  // Load products from API
  const loadProducts = async (page = 1, search = '', category = '') => {
    setLoading(true)
    try {
      let url = `${BACKEND_URL}/products?page=${page}&limit=10&search=${search}`
      if (category) {
        url += `&category=${category}`
      }

      const token = localStorage.getItem('admin_token')
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      setProducts(data.data)
      setTotalPages(data.pagination.pages)
      setCurrentPage(data.pagination.page)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Load products on initial render or filter/search change
  useEffect(() => {
    loadProducts(currentPage, searchTerm, categoryFilter)
  }, [currentPage, searchTerm, categoryFilter])

  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page on new search
  }

  // Handle category filter change
  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value)
    setCurrentPage(1) // Reset to first page on filter change
  }

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Navigate to edit page
  const handleEditProduct = (product) => {
    navigate(`/products/edit/${product.slug}`)
  }

  // Open delete confirmation modal
  const handleDeleteProduct = (product) => {
    setDeleteModal({ visible: true, product })
  }

  // Handle delete confirmation
  const confirmDelete = async () => {
    if (!deleteModal.product) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(
        `${BACKEND_URL}/products/${deleteModal.product.slug}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      // Remove the deleted product from the state
      setProducts((prev) =>
        prev.filter((p) => p._id !== deleteModal.product._id),
      )

      // Close the modal
      setDeleteModal({ visible: false, product: null })
    } catch (err) {
      console.error('Error deleting product:', err)
      setError('Failed to delete product. Please try again.')
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

  // Format price with currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  // Navigate to create new product page
  const handleAddNew = () => {
    navigate('/products/create')
  }

  // Get image URL for display
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    if (imagePath.startsWith('http')) return imagePath
    return `${BASE_URL}/uploads/${imagePath}`
  }

  // Truncate text for display
  const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // Render empty state when no products exist
  const renderEmptyState = () => (
    <EmptyState
      title="No Products Found"
      message="There are no products yet. Create your first one to get started."
      buttonText="Create Product"
      onAction={handleAddNew}
    />
  )

  // Render products table
  const renderTable = () => (
    <CTable hover responsive>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell style={{ width: '80px' }}>Image</CTableHeaderCell>
          <CTableHeaderCell>Name</CTableHeaderCell>
          <CTableHeaderCell>Category</CTableHeaderCell>
          <CTableHeaderCell>Price</CTableHeaderCell>
          <CTableHeaderCell>Created</CTableHeaderCell>
          <CTableHeaderCell>Actions</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {products.map((product) => (
          <CTableRow key={product._id}>
            <CTableDataCell>
              {product.image ? (
                <CImage
                  src={getImageUrl(product.image)}
                  width={50}
                  height={50}
                  style={{ objectFit: 'cover' }}
                  alt={product.name}
                />
              ) : (
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                  }}
                >
                  No Image
                </div>
              )}
            </CTableDataCell>
            <CTableDataCell>{product.name}</CTableDataCell>
            <CTableDataCell>
              {product.category?.title || 'Unknown Category'}
            </CTableDataCell>
            <CTableDataCell>{formatPrice(product.price)}</CTableDataCell>
            <CTableDataCell>{formatDate(product.createdAt)}</CTableDataCell>
            <CTableDataCell>
              <CButton
                color="primary"
                size="sm"
                className="me-2"
                onClick={() => handleEditProduct(product)}
              >
                <CIcon icon={cilPencil} />
              </CButton>
              <CButton
                color="danger"
                size="sm"
                onClick={() => handleDeleteProduct(product)}
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
          <h5>Products</h5>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol lg={4} className="mb-2">
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilSearch} />
                </CInputGroupText>
                <CFormInput
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </CInputGroup>
            </CCol>
            <CCol lg={4} className="mb-2">
              <CFormSelect
                value={categoryFilter}
                onChange={handleCategoryChange}
                aria-label="Category filter"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.title}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol lg={4} className="d-flex justify-content-end mb-2">
              <CButton color="primary" onClick={handleAddNew}>
                <CIcon icon={cilPlus} className="me-2" />
                Add New Product
              </CButton>
            </CCol>
          </CRow>

          {loading ? (
            <div className="text-center py-5">
              <CSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-5 text-danger">{error}</div>
          ) : products.length === 0 ? (
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
        onClose={() => setDeleteModal({ visible: false, product: null })}
        onConfirm={confirmDelete}
        itemName={deleteModal.product?.name || 'this product'}
        itemType="product"
      />
    </>
  )
}

export default ProductList
