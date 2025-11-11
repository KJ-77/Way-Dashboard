import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CSpinner,
  CAlert,
  CBadge,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import { api } from 'src/services/api'
import CartModal from './components/CartModal'
import OrdersModal from './components/OrdersModal'

const UserList = () => {
  // State
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchField, setSearchField] = useState('all') // Options: all, name, phone
  const [statusFilter, setStatusFilter] = useState('all') // Options: all, verified, not_verified
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  })

  // Cart states
  const [selectedUser, setSelectedUser] = useState(null)
  const [userCart, setUserCart] = useState(null)
  const [cartLoading, setCartLoading] = useState(false)
  const [cartError, setCartError] = useState(null)
  const [showCartModal, setShowCartModal] = useState(false)

  // Order states
  const [orderSelectedUser, setOrderSelectedUser] = useState(null)
  const [userOrders, setUserOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState(null)
  const [showOrdersModal, setShowOrdersModal] = useState(false)

  // Load users with pagination and search
  const loadUsers = async () => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      })

      // Add search term if provided
      if (searchTerm) {
        params.append('search', searchTerm)

        // Add search field if specific (backend will need to support this)
        if (searchField !== 'all') {
          params.append('searchField', searchField)
        }
      }

      // Add status filter if not "all"
      if (statusFilter !== 'all') {
        params.append(
          'isVerified',
          statusFilter === 'verified' ? 'true' : 'false',
        )
      }

      // Make API request
      const response = await api.get(
        `/admin/regular-users?${params.toString()}`,
      )

      // Update state
      setUsers(response.data || [])
      setPagination(
        response.pagination || {
          page: 1,
          limit: 10,
          totalItems: 0,
          totalPages: 0,
        },
      )
      setError(null)
    } catch (err) {
      console.error('Error loading users:', err)
      setError(`Failed to load users: ${err.message}`)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  // Handle page change
  const handlePageChange = (page) => {
    setPagination((prev) => ({
      ...prev,
      page,
    }))
  }

  // Apply search when search term, search field, or status filter changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        loadUsers()
      } else {
        // If we're not on page 1, reset to page 1 (which will trigger loadUsers)
        setPagination((prev) => ({
          ...prev,
          page: 1,
        }))
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, searchField, statusFilter])

  // Load users on initial render and when page changes
  useEffect(() => {
    loadUsers()
  }, [pagination.page])

  // Handle search field change
  const handleSearchFieldChange = (e) => {
    setSearchField(e.target.value)
  }

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value)
  }

  // Load user's cart
  const loadUserCart = async (userId) => {
    try {
      setCartLoading(true)
      setCartError(null)

      // Make API request to get user's cart
      const response = await api.get(`/admin/regular-users/${userId}/cart`)
      console.log('Cart response:', response)
      setUserCart(response.data || { products: [], total: 0 })
      setShowCartModal(true)
    } catch (err) {
      console.error('Error loading user cart:', err)
      // Only set error for actual errors, not for "no cart" responses
      if (err.message !== 'Cart not found for this user') {
        setCartError(`Failed to load user's cart: ${err.message}`)
      } else {
        // Just set an empty cart
        setUserCart({ products: [], total: 0 })
      }
      setShowCartModal(true)
    } finally {
      setCartLoading(false)
    }
  }

  // Load user's orders
  const loadUserOrders = async (userId) => {
    try {
      setOrdersLoading(true)
      setOrdersError(null)

      // Make API request to get user's orders
      const response = await api.get(`/admin/regular-users/${userId}/orders`)
      console.log('Orders response:', response) // Debug log

      // Extract orders from the response based on the backend format
      const orders = response.data?.orders || []
      setUserOrders(orders)
      setShowOrdersModal(true)
    } catch (err) {
      console.error('Error loading user orders:', err)
      setOrdersError(`Failed to load user's orders: ${err.message}`)
      setUserOrders([])
      setShowOrdersModal(true)
    } finally {
      setOrdersLoading(false)
    }
  }

  // Handle view cart click
  const handleViewCart = (user) => {
    setSelectedUser(user)
    loadUserCart(user._id)
  }

  // Handle view orders click
  const handleViewOrders = (user) => {
    setOrderSelectedUser(user)
    loadUserOrders(user._id)
  }

  // Get verification badge color
  const getVerificationBadge = (verified) => {
    return verified
      ? React.createElement(CBadge, { color: 'success' }, 'Verified')
      : React.createElement(CBadge, { color: 'warning' }, 'Not Verified')
  }

  // Client-side filtering for local search
  const filterUsers = (users, term, field) => {
    if (!term) return users

    return users.filter((user) => {
      if (field === 'name' || field === 'all') {
        if (user.fullName.toLowerCase().includes(term.toLowerCase())) {
          return true
        }
      }

      if (field === 'phone' || field === 'all') {
        if (user.phoneNumber && user.phoneNumber.includes(term)) {
          return true
        }
      }

      return false
    })
  }

  // Client-side filtering by verification status
  const filterUsersByStatus = (users, status) => {
    if (status === 'all') return users

    return users.filter((user) => {
      if (status === 'verified') {
        return user.verified === true
      } else if (status === 'not_verified') {
        return user.verified === false
      }
      return true
    })
  }

  // Apply client-side filtering if we have users loaded
  let displayedUsers = users

  // Apply search filter if term exists
  if (searchTerm && displayedUsers.length > 0) {
    displayedUsers = filterUsers(displayedUsers, searchTerm, searchField)
  }

  // Apply status filter if not "all"
  if (statusFilter !== 'all' && displayedUsers.length > 0) {
    displayedUsers = filterUsersByStatus(displayedUsers, statusFilter)
  }

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(CCard, { className: 'mb-4' }, [
      React.createElement(
        CCardHeader,
        { key: 'header' },
        React.createElement(
          CRow,
          {},
          React.createElement(
            CCol,
            {},
            React.createElement('h5', {}, 'User Management'),
          ),
        ),
      ),
      React.createElement(CCardBody, { key: 'body' }, [
        error &&
          React.createElement(CAlert, { color: 'danger', key: 'error' }, error),

        // Search and filter options
        React.createElement(CRow, { className: 'mb-3', key: 'filters' }, [
          // Search field dropdown and input
          React.createElement(
            CCol,
            { md: 8, key: 'search-col' },
            React.createElement(CInputGroup, {}, [
              React.createElement(
                CFormSelect,
                {
                  key: 'search-field',
                  value: searchField,
                  onChange: handleSearchFieldChange,
                  style: { maxWidth: '150px' },
                },
                [
                  React.createElement(
                    'option',
                    { value: 'all', key: 'all' },
                    'All Fields',
                  ),
                  React.createElement(
                    'option',
                    { value: 'name', key: 'name' },
                    'Name',
                  ),
                  React.createElement(
                    'option',
                    { value: 'phone', key: 'phone' },
                    'Phone Number',
                  ),
                ],
              ),
              React.createElement(CFormInput, {
                key: 'search-input',
                type: 'text',
                placeholder:
                  searchField === 'name'
                    ? 'Search by name...'
                    : searchField === 'phone'
                      ? 'Search by phone number...'
                      : 'Search users...',
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
              }),
            ]),
          ),

          // Status filter
          React.createElement(
            CCol,
            { md: 4, key: 'status-filter-col' },
            React.createElement(CInputGroup, {}, [
              React.createElement(
                CInputGroupText,
                { key: 'status-label' },
                'Status',
              ),
              React.createElement(
                CFormSelect,
                {
                  key: 'status-filter',
                  value: statusFilter,
                  onChange: handleStatusFilterChange,
                },
                [
                  React.createElement(
                    'option',
                    { value: 'all', key: 'status-all' },
                    'All',
                  ),
                  React.createElement(
                    'option',
                    { value: 'verified', key: 'status-verified' },
                    'Verified',
                  ),
                  React.createElement(
                    'option',
                    { value: 'not_verified', key: 'status-not-verified' },
                    'Not Verified',
                  ),
                ],
              ),
            ]),
          ),
        ]),

        // Users Table
        loading
          ? React.createElement(
              'div',
              { className: 'text-center py-5', key: 'loading' },
              React.createElement(CSpinner),
            )
          : displayedUsers.length === 0
            ? React.createElement(
                CAlert,
                { color: 'info', key: 'no-users' },
                'No users found.',
              )
            : React.createElement(
                CTable,
                { hover: true, responsive: true, key: 'table' },
                [
                  // Table header
                  React.createElement(
                    CTableHead,
                    { key: 'thead' },
                    React.createElement(CTableRow, {}, [
                      React.createElement(
                        CTableHeaderCell,
                        { key: 'h1' },
                        'Name',
                      ),
                      React.createElement(
                        CTableHeaderCell,
                        { key: 'h2' },
                        'Email',
                      ),
                      React.createElement(
                        CTableHeaderCell,
                        { key: 'h3' },
                        'Phone',
                      ),
                      React.createElement(
                        CTableHeaderCell,
                        { key: 'h4' },
                        'Status',
                      ),
                      React.createElement(
                        CTableHeaderCell,
                        { key: 'h5' },
                        'Created At',
                      ),
                      React.createElement(
                        CTableHeaderCell,
                        { key: 'h6' },
                        'Actions',
                      ),
                    ]),
                  ),

                  // Table body with users
                  React.createElement(
                    CTableBody,
                    { key: 'tbody' },
                    displayedUsers.map((user) =>
                      React.createElement(CTableRow, { key: user._id }, [
                        React.createElement(
                          CTableDataCell,
                          { key: 'name' },
                          user.fullName,
                        ),
                        React.createElement(
                          CTableDataCell,
                          { key: 'email' },
                          user.email,
                        ),
                        React.createElement(
                          CTableDataCell,
                          { key: 'phone' },
                          user.phoneNumber,
                        ),
                        React.createElement(
                          CTableDataCell,
                          { key: 'status' },
                          getVerificationBadge(user.verified),
                        ),
                        React.createElement(
                          CTableDataCell,
                          { key: 'created' },
                          new Date(user.createdAt).toLocaleDateString(),
                        ),
                        React.createElement(
                          CTableDataCell,
                          { key: 'actions' },
                          [
                            React.createElement(
                              CButton,
                              {
                                color: 'info',
                                size: 'sm',
                                className: 'me-2',
                                onClick: () => handleViewCart(user),
                                key: 'view-cart',
                              },
                              'View Cart',
                            ),
                            React.createElement(
                              CButton,
                              {
                                color: 'primary',
                                size: 'sm',
                                onClick: () => handleViewOrders(user),
                                key: 'view-orders',
                              },
                              'Order History',
                            ),
                          ],
                        ),
                      ]),
                    ),
                  ),
                ],
              ),

        // Simple Pagination
        pagination.totalPages > 1 &&
          React.createElement(
            'div',
            {
              className: 'd-flex justify-content-center mt-4',
              key: 'pagination',
            },
            React.createElement('ul', { className: 'pagination' }, [
              React.createElement(
                'li',
                {
                  className: `page-item ${
                    pagination.page === 1 ? 'disabled' : ''
                  }`,
                  key: 'prev',
                },
                React.createElement(
                  'button',
                  {
                    className: 'page-link',
                    onClick: () => handlePageChange(pagination.page - 1),
                    disabled: pagination.page === 1,
                  },
                  'Previous',
                ),
              ),
              [...Array(pagination.totalPages).keys()].map((page) =>
                React.createElement(
                  'li',
                  {
                    key: page + 1,
                    className: `page-item ${
                      pagination.page === page + 1 ? 'active' : ''
                    }`,
                  },
                  React.createElement(
                    'button',
                    {
                      className: 'page-link',
                      onClick: () => handlePageChange(page + 1),
                    },
                    page + 1,
                  ),
                ),
              ),
              React.createElement(
                'li',
                {
                  className: `page-item ${
                    pagination.page === pagination.totalPages ? 'disabled' : ''
                  }`,
                  key: 'next',
                },
                React.createElement(
                  'button',
                  {
                    className: 'page-link',
                    onClick: () => handlePageChange(pagination.page + 1),
                    disabled: pagination.page === pagination.totalPages,
                  },
                  'Next',
                ),
              ),
            ]),
          ),
      ]),
    ]),

    // Cart Modal
    React.createElement(CartModal, {
      selectedUser: showCartModal ? selectedUser : null,
      userCart: userCart,
      cartLoading: cartLoading,
      cartError: cartError,
      setSelectedUser: () => {
        setShowCartModal(false)
        setSelectedUser(null)
      },
      readOnly: true,
      key: 'cart-modal',
    }),

    // Orders Modal
    React.createElement(OrdersModal, {
      visible: showOrdersModal,
      onClose: () => setShowOrdersModal(false),
      selectedUser: orderSelectedUser,
      userOrders: userOrders,
      loading: ordersLoading,
      error: ordersError,
      key: 'orders-modal',
    }),
  )
}

export default UserList
