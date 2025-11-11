import React, { useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CSpinner,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CCardImage,
} from '@coreui/react'
import { api } from 'src/services/api'
import { BASE_URL } from '../../../config'

const CartModal = ({
  selectedUser,
  userCart,
  cartLoading,
  cartError,
  setSelectedUser,
  readOnly = true,
}) => {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [orderError, setOrderError] = useState(null)

  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  // Close modal
  const handleClose = () => {
    setSelectedUser(null)
    setOrderSuccess(null)
    setOrderError(null)
  }

  // Create order from cart
  const handleCreateOrder = async () => {
    if (
      !selectedUser ||
      !userCart ||
      !userCart.products ||
      userCart.products.length === 0
    ) {
      setOrderError('Cannot create order from an empty cart')
      return
    }

    try {
      setIsCreatingOrder(true)
      setOrderSuccess(null)
      setOrderError(null)

      // Prepare delivery info with user's data
      const deliveryInfo = {
        contactName: selectedUser.fullName,
        phoneNumber: selectedUser.phoneNumber || '000-000-0000',
        street: 'Default Address',
        city: 'Default City',
        state: 'Default State',
        postalCode: '00000',
        country: 'Default Country',
        specialInstructions: 'Order created by admin',
      }

      // Create the order
      const response = await api.post(
        `/admin/users/${selectedUser._id}/create-order`,
        {
          deliveryInfo,
          paymentMethod: 'cash_on_delivery',
        },
      )

      if (response.success) {
        setOrderSuccess(
          `Order created successfully: ${response.data?.orderNumber || 'N/A'}`,
        )
        // Reset the cart display after order is created
        if (typeof userCart.setUserCart === 'function') {
          userCart.setUserCart({ products: [], total: 0 })
        }
      } else {
        setOrderError(
          `Failed to create order: ${response.message || 'Unknown error'}`,
        )
      }
    } catch (err) {
      console.error('Error creating order:', err)
      setOrderError(`Failed to create order: ${err.message}`)
    } finally {
      setIsCreatingOrder(false)
    }
  }

  // Check if the user has a cart with products
  const hasProducts =
    userCart && userCart.products && userCart.products.length > 0

  // Get verification badge
  const getVerificationBadge = (isVerified) => {
    return isVerified
      ? React.createElement(CBadge, { color: 'success' }, 'Verified')
      : React.createElement(CBadge, { color: 'warning' }, 'Not Verified')
  }

  // Generate image URL for product
  const getProductImageUrl = (image) => {
    if (!image) return null

    // If image has data field (filename path)
    if (image.data) {
      return `${BASE_URL}/${image.data}`
    }

    // If image has filename field
    if (image.filename) {
      return `${BASE_URL}/uploads/${image.filename}`
    }

    // If image is just a string path
    if (typeof image === 'string') {
      return image.startsWith('http') ? image : `${BASE_URL}/${image}`
    }

    return null
  }

  // Create modal footer
  const renderModalFooter = () => {
    const buttons = []

    if (hasProducts && !readOnly) {
      buttons.push(
        React.createElement(
          CButton,
          {
            color: 'success',
            onClick: handleCreateOrder,
            disabled: isCreatingOrder,
            className: 'me-2',
            key: 'create-order-btn',
          },
          isCreatingOrder ? 'Creating Order...' : 'Create Order',
        ),
      )
    }

    buttons.push(
      React.createElement(
        CButton,
        {
          color: 'secondary',
          onClick: handleClose,
          key: 'close-btn',
        },
        'Close',
      ),
    )

    return React.createElement(CModalFooter, {}, buttons)
  }

  return React.createElement(
    CModal,
    {
      visible: selectedUser !== null,
      onClose: handleClose,
      backdrop: 'static',
      size: 'xl',
    },
    [
      // Modal Header
      React.createElement(
        CModalHeader,
        { onClose: handleClose, key: 'header' },
        React.createElement(
          CModalTitle,
          {},
          selectedUser ? `${selectedUser.fullName}'s Cart` : 'User Cart',
        ),
      ),

      // Modal Body
      React.createElement(
        CModalBody,
        { key: 'body' },
        cartLoading
          ? React.createElement(
              'div',
              { className: 'text-center py-5' },
              React.createElement(CSpinner),
            )
          : cartError
            ? React.createElement(CAlert, { color: 'danger' }, cartError)
            : !hasProducts
              ? React.createElement(
                  CAlert,
                  { color: 'info' },
                  "This user doesn't have any items in their cart.",
                )
              : [
                  // Success alert
                  orderSuccess &&
                    React.createElement(
                      CAlert,
                      { color: 'success', dismissible: true, key: 'success' },
                      orderSuccess,
                    ),

                  // Error alert
                  orderError &&
                    React.createElement(
                      CAlert,
                      { color: 'danger', dismissible: true, key: 'error' },
                      orderError,
                    ),

                  // Products table - simplified for readability
                  React.createElement(
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
                            { style: { width: '80px' }, key: 'h1' },
                            'Image',
                          ),
                          React.createElement(
                            CTableHeaderCell,
                            { style: { width: '200px' }, key: 'h2' },
                            'Product',
                          ),
                          React.createElement(
                            CTableHeaderCell,
                            { style: { width: '100px' }, key: 'h3' },
                            'Quantity',
                          ),
                          React.createElement(
                            CTableHeaderCell,
                            { style: { width: '120px' }, key: 'h4' },
                            'Unit Price',
                          ),
                          React.createElement(
                            CTableHeaderCell,
                            { style: { width: '120px' }, key: 'h5' },
                            'Total',
                          ),
                        ]),
                      ),

                      // Table body with items
                      React.createElement(
                        CTableBody,
                        { key: 'tbody' },
                        userCart.products.map((item, index) => {
                          const imageUrl = getProductImageUrl(
                            item.image || item.productId?.image,
                          )

                          return React.createElement(
                            CTableRow,
                            { key: item._id || index },
                            [
                              // Image cell
                              React.createElement(
                                CTableDataCell,
                                { key: 'c1' },
                                imageUrl
                                  ? React.createElement(CCardImage, {
                                      src: imageUrl,
                                      alt: item.productName || 'Product',
                                      style: {
                                        width: '60px',
                                        height: '60px',
                                        objectFit: 'cover',
                                        borderRadius: '4px',
                                      },
                                      onError: (e) => {
                                        e.target.style.display = 'none'
                                      },
                                    })
                                  : React.createElement(
                                      'div',
                                      {
                                        style: {
                                          width: '60px',
                                          height: '60px',
                                          backgroundColor: '#f8f9fa',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          borderRadius: '4px',
                                          border: '1px solid #dee2e6',
                                        },
                                      },
                                      React.createElement(
                                        'span',
                                        {
                                          style: {
                                            fontSize: '12px',
                                            color: '#6c757d',
                                          },
                                        },
                                        'No Image',
                                      ),
                                    ),
                              ),

                              // Product name cell
                              React.createElement(
                                CTableDataCell,
                                { key: 'c2' },
                                React.createElement('div', {}, [
                                  React.createElement(
                                    'strong',
                                    { key: 'name' },
                                    item.productName ||
                                      item.productId?.name ||
                                      'Unknown Product',
                                  ),
                                ]),
                              ),

                              // Quantity cell
                              React.createElement(
                                CTableDataCell,
                                { key: 'c3' },
                                React.createElement(
                                  CBadge,
                                  { color: 'info' },
                                  item.quantity,
                                ),
                              ),

                              // Unit price cell
                              React.createElement(
                                CTableDataCell,
                                { key: 'c4' },
                                formatPrice(item.price),
                              ),

                              // Total price cell
                              React.createElement(
                                CTableDataCell,
                                { key: 'c5' },
                                React.createElement(
                                  'strong',
                                  {},
                                  formatPrice(
                                    item.totalPrice ||
                                      item.price * item.quantity,
                                  ),
                                ),
                              ),
                            ],
                          )
                        }),
                      ),
                    ],
                  ),

                  // Cart total
                  React.createElement(
                    'div',
                    {
                      className:
                        'd-flex justify-content-end my-3 border-top pt-3',
                      key: 'total',
                    },
                    React.createElement('div', { className: 'text-end' }, [
                      React.createElement(
                        'h5',
                        { className: 'mb-0', key: 'total-amount' },
                        React.createElement(
                          'strong',
                          {},
                          `Total: ${formatPrice(userCart.total)}`,
                        ),
                      ),
                      React.createElement(
                        'small',
                        { className: 'text-muted', key: 'total-items' },
                        `${userCart.products.length} item${userCart.products.length !== 1 ? 's' : ''}`,
                      ),
                    ]),
                  ),

                  // User info
                  selectedUser &&
                    React.createElement(
                      'div',
                      {
                        className: 'user-details mt-4 p-3 bg-light rounded',
                        key: 'user-info',
                      },
                      [
                        React.createElement(
                          'h6',
                          { className: 'mb-3', key: 'title' },
                          'User Information',
                        ),
                        React.createElement(
                          'div',
                          { className: 'row', key: 'user-data' },
                          [
                            React.createElement(
                              'div',
                              { className: 'col-md-6', key: 'left-col' },
                              [
                                React.createElement(
                                  'p',
                                  { className: 'mb-2', key: 'name' },
                                  [
                                    React.createElement('strong', {}, 'Name: '),
                                    selectedUser.fullName,
                                  ],
                                ),
                                React.createElement(
                                  'p',
                                  { className: 'mb-2', key: 'email' },
                                  [
                                    React.createElement(
                                      'strong',
                                      {},
                                      'Email: ',
                                    ),
                                    selectedUser.email,
                                  ],
                                ),
                              ],
                            ),
                            React.createElement(
                              'div',
                              { className: 'col-md-6', key: 'right-col' },
                              [
                                React.createElement(
                                  'p',
                                  { className: 'mb-2', key: 'phone' },
                                  [
                                    React.createElement(
                                      'strong',
                                      {},
                                      'Phone: ',
                                    ),
                                    selectedUser.phoneNumber,
                                  ],
                                ),
                                React.createElement(
                                  'p',
                                  { className: 'mb-2', key: 'verification' },
                                  [
                                    React.createElement(
                                      'strong',
                                      {},
                                      'Verification Status: ',
                                    ),
                                    getVerificationBadge(selectedUser.verified),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                        userCart.createdAt &&
                          React.createElement(
                            'p',
                            { className: 'mb-0 text-muted', key: 'cart-date' },
                            React.createElement(
                              'small',
                              {},
                              `Cart created: ${new Date(userCart.createdAt).toLocaleString()}`,
                            ),
                          ),
                      ],
                    ),
                ],
      ),

      // Modal Footer
      renderModalFooter(),
    ],
  )
}

export default CartModal
