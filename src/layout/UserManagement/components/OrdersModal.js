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
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'
import { api } from 'src/services/api'

const OrdersModal = ({
  visible,
  onClose,
  selectedUser,
  userOrders,
  loading,
  error,
}) => {
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [updateSuccess, setUpdateSuccess] = useState(null)
  const [updateError, setUpdateError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)

  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  // Format order date
  const formatOrderDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  // Get badge color for order status
  const getOrderStatusBadge = (status) => {
    const statusColors = {
      pending: 'warning',
      delivered: 'success',
      cancelled: 'danger',
    }

    return React.createElement(
      CBadge,
      { color: statusColors[status] || 'secondary' },
      status,
    )
  }

  // Handle order status update
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId)
      setUpdateSuccess(null)
      setUpdateError(null)

      // Use the correct API endpoint
      await api.put(`/orders/${orderId}/status`, {
        status: newStatus,
      })

      // Update the order status locally
      const updatedOrders = userOrders.map((order) => {
        if (order._id === orderId) {
          return { ...order, orderStatus: newStatus }
        }
        return order
      })

      // Pass the updated orders back to parent component
      if (typeof userOrders.setUserOrders === 'function') {
        userOrders.setUserOrders(updatedOrders)
      }

      setUpdateSuccess(`Order ${orderId} status updated to ${newStatus}`)

      // If the selected order is the one being updated, update it too
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus })
      }
    } catch (err) {
      console.error('Error updating order status:', err)
      setUpdateError(`Failed to update order status: ${err.message}`)
    } finally {
      setUpdatingOrderId(null)
    }
  }

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  // Close order details modal
  const closeOrderDetails = () => {
    setShowOrderDetails(false)
    setSelectedOrder(null)
  }

  // Render order details modal
  const renderOrderDetailsModal = () => {
    if (!selectedOrder) return null

    return React.createElement(
      CModal,
      {
        visible: showOrderDetails,
        onClose: closeOrderDetails,
        backdrop: 'static',
        size: 'lg',
        scrollable: true,
      },
      [
        React.createElement(
          CModalHeader,
          { onClose: closeOrderDetails, key: 'header' },
          React.createElement(
            CModalTitle,
            {},
            `Order Details: ${selectedOrder.orderNumber}`,
          ),
        ),
        React.createElement(CModalBody, { key: 'body' }, [
          // Order status section
          React.createElement(
            CCard,
            { className: 'mb-3', key: 'status-card' },
            [
              React.createElement(
                CCardHeader,
                { key: 'status-header' },
                'Order Status',
              ),
              React.createElement(CCardBody, { key: 'status-body' }, [
                React.createElement(CRow, { key: 'status-row' }, [
                  React.createElement(CCol, { md: 6, key: 'status-col1' }, [
                    React.createElement(
                      'p',
                      { className: 'mb-1', key: 'status' },
                      [
                        React.createElement('strong', {}, 'Status: '),
                        ' ',
                        getOrderStatusBadge(selectedOrder.orderStatus),
                      ],
                    ),
                    React.createElement(
                      'p',
                      { className: 'mb-1', key: 'created' },
                      [
                        React.createElement('strong', {}, 'Created: '),
                        ' ',
                        formatOrderDate(selectedOrder.createdAt),
                      ],
                    ),
                  ]),
                  React.createElement(CCol, { md: 6, key: 'status-col2' }, [
                    React.createElement(
                      'p',
                      { className: 'mb-1', key: 'payment' },
                      [
                        React.createElement('strong', {}, 'Payment Method: '),
                        ' ',
                        selectedOrder.paymentMethod === 'cash_on_delivery'
                          ? 'Cash on Delivery'
                          : 'Online Payment',
                      ],
                    ),
                    selectedOrder.deliveredAt &&
                      React.createElement(
                        'p',
                        { className: 'mb-1', key: 'delivered' },
                        [
                          React.createElement('strong', {}, 'Delivered: '),
                          ' ',
                          formatOrderDate(selectedOrder.deliveredAt),
                        ],
                      ),
                  ]),
                ]),
              ]),
            ],
          ),

          // Order items section
          React.createElement(CCard, { className: 'mb-3', key: 'items-card' }, [
            React.createElement(
              CCardHeader,
              { key: 'items-header' },
              'Order Items',
            ),
            React.createElement(CCardBody, { key: 'items-body' }, [
              React.createElement(
                CTable,
                { hover: true, responsive: true, key: 'items-table' },
                [
                  React.createElement(
                    CTableHead,
                    { key: 'items-thead' },
                    React.createElement(CTableRow, {}, [
                      React.createElement(
                        CTableHeaderCell,
                        { key: 'h1' },
                        'Product',
                      ),
                      React.createElement(
                        CTableHeaderCell,
                        { key: 'h2' },
                        'Quantity',
                      ),
                      React.createElement(
                        CTableHeaderCell,
                        { key: 'h3' },
                        'Unit Price',
                      ),
                      React.createElement(
                        CTableHeaderCell,
                        { key: 'h4' },
                        'Total',
                      ),
                    ]),
                  ),
                  React.createElement(
                    CTableBody,
                    { key: 'items-tbody' },
                    selectedOrder.items.map((item, index) =>
                      React.createElement(
                        CTableRow,
                        { key: item._id || index },
                        [
                          React.createElement(
                            CTableDataCell,
                            { key: 'c1' },
                            item.productName,
                          ),
                          React.createElement(
                            CTableDataCell,
                            { key: 'c2' },
                            item.quantity,
                          ),
                          React.createElement(
                            CTableDataCell,
                            { key: 'c3' },
                            formatPrice(item.unitPrice),
                          ),
                          React.createElement(
                            CTableDataCell,
                            { key: 'c4' },
                            formatPrice(item.totalPrice),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              React.createElement(
                'div',
                { className: 'text-end mt-3', key: 'totals' },
                [
                  React.createElement('p', { key: 'subtotal' }, [
                    React.createElement('strong', {}, 'Subtotal: '),
                    formatPrice(selectedOrder.subtotal),
                  ]),
                  React.createElement('p', { key: 'delivery' }, [
                    React.createElement('strong', {}, 'Delivery Fee: '),
                    formatPrice(selectedOrder.deliveryFee),
                  ]),
                  React.createElement('p', { className: 'h5', key: 'total' }, [
                    React.createElement('strong', {}, 'Total: '),
                    formatPrice(selectedOrder.total),
                  ]),
                ],
              ),
            ]),
          ]),

          // Delivery information section
          React.createElement(CCard, { key: 'delivery-card' }, [
            React.createElement(
              CCardHeader,
              { key: 'delivery-header' },
              'Delivery Information',
            ),
            React.createElement(CCardBody, { key: 'delivery-body' }, [
              React.createElement(CRow, { key: 'delivery-row' }, [
                React.createElement(CCol, { md: 6, key: 'delivery-col1' }, [
                  React.createElement(
                    'p',
                    { className: 'mb-1', key: 'contact' },
                    [
                      React.createElement('strong', {}, 'Contact: '),
                      selectedOrder.deliveryInfo.contactName,
                    ],
                  ),
                  React.createElement(
                    'p',
                    { className: 'mb-1', key: 'phone' },
                    [
                      React.createElement('strong', {}, 'Phone: '),
                      selectedOrder.deliveryInfo.phoneNumber,
                    ],
                  ),
                  React.createElement(
                    'p',
                    { className: 'mb-1', key: 'address' },
                    [
                      React.createElement('strong', {}, 'Address: '),
                      `${selectedOrder.deliveryInfo.street}, ${selectedOrder.deliveryInfo.city}`,
                    ],
                  ),
                  React.createElement(
                    'p',
                    { className: 'mb-1', key: 'location' },
                    [
                      React.createElement('strong', {}, 'Location: '),
                      `${selectedOrder.deliveryInfo.state || ''} ${
                        selectedOrder.deliveryInfo.postalCode || ''
                      }, ${selectedOrder.deliveryInfo.country}`,
                    ],
                  ),
                ]),
                React.createElement(CCol, { md: 6, key: 'delivery-col2' }, [
                  selectedOrder.deliveryInfo.specialInstructions &&
                    React.createElement(
                      'p',
                      { className: 'mb-1', key: 'instructions' },
                      [
                        React.createElement(
                          'strong',
                          {},
                          'Special Instructions: ',
                        ),
                        selectedOrder.deliveryInfo.specialInstructions,
                      ],
                    ),
                  selectedOrder.deliveryInfo.preferredDeliveryTime &&
                    React.createElement(
                      'p',
                      { className: 'mb-1', key: 'preferred-time' },
                      [
                        React.createElement(
                          'strong',
                          {},
                          'Preferred Delivery Time: ',
                        ),
                        selectedOrder.deliveryInfo.preferredDeliveryTime,
                      ],
                    ),
                ]),
              ]),
            ]),
          ]),
        ]),
        React.createElement(CModalFooter, { key: 'footer' }, [
          // Only show status update buttons if order is not delivered or cancelled
          selectedOrder.orderStatus !== 'delivered' &&
            selectedOrder.orderStatus !== 'cancelled' &&
            React.createElement(
              CButton,
              {
                color: 'success',
                onClick: () => {
                  updateOrderStatus(selectedOrder._id, 'delivered')
                  closeOrderDetails()
                },
                disabled: updatingOrderId === selectedOrder._id,
                key: 'deliver-btn',
              },
              'Mark as Delivered',
            ),
          selectedOrder.orderStatus !== 'delivered' &&
            selectedOrder.orderStatus !== 'cancelled' &&
            React.createElement(
              CButton,
              {
                color: 'danger',
                onClick: () => {
                  updateOrderStatus(selectedOrder._id, 'cancelled')
                  closeOrderDetails()
                },
                disabled: updatingOrderId === selectedOrder._id,
                className: 'ms-2',
                key: 'cancel-btn',
              },
              'Cancel Order',
            ),
          React.createElement(
            CButton,
            {
              color: 'secondary',
              onClick: closeOrderDetails,
              className: 'ms-2',
              key: 'close-btn',
            },
            'Close',
          ),
        ]),
      ],
    )
  }

  return React.createElement(React.Fragment, null, [
    // Main orders modal
    React.createElement(
      CModal,
      {
        visible: visible,
        onClose: onClose,
        backdrop: 'static',
        size: 'xl',
        scrollable: true,
        key: 'main-modal',
      },
      [
        React.createElement(
          CModalHeader,
          { onClose: onClose, key: 'header' },
          React.createElement(
            CModalTitle,
            {},
            selectedUser
              ? `${selectedUser.fullName}'s Order History`
              : 'Order History',
          ),
        ),
        React.createElement(
          CModalBody,
          { key: 'body' },
          loading
            ? React.createElement(
                'div',
                { className: 'text-center py-5' },
                React.createElement(CSpinner),
              )
            : error
              ? React.createElement(CAlert, { color: 'danger' }, error)
              : !userOrders || userOrders.length === 0
                ? React.createElement(
                    CAlert,
                    { color: 'info' },
                    "This user doesn't have any orders.",
                  )
                : [
                    updateSuccess &&
                      React.createElement(
                        CAlert,
                        { color: 'success', dismissible: true, key: 'success' },
                        updateSuccess,
                      ),
                    updateError &&
                      React.createElement(
                        CAlert,
                        { color: 'danger', dismissible: true, key: 'error' },
                        updateError,
                      ),
                    React.createElement(
                      CTable,
                      {
                        hover: true,
                        responsive: true,
                        className: 'mb-0',
                        key: 'table',
                      },
                      [
                        React.createElement(
                          CTableHead,
                          { key: 'thead' },
                          React.createElement(CTableRow, {}, [
                            React.createElement(
                              CTableHeaderCell,
                              { key: 'h1' },
                              'Order Number',
                            ),
                            React.createElement(
                              CTableHeaderCell,
                              { key: 'h2' },
                              'Date',
                            ),
                            React.createElement(
                              CTableHeaderCell,
                              { key: 'h3' },
                              'Items',
                            ),
                            React.createElement(
                              CTableHeaderCell,
                              { key: 'h4' },
                              'Total',
                            ),
                            React.createElement(
                              CTableHeaderCell,
                              { key: 'h5' },
                              'Status',
                            ),
                            React.createElement(
                              CTableHeaderCell,
                              { key: 'h6' },
                              'Actions',
                            ),
                          ]),
                        ),
                        React.createElement(
                          CTableBody,
                          { key: 'tbody' },
                          userOrders.map((order) =>
                            React.createElement(CTableRow, { key: order._id }, [
                              React.createElement(
                                CTableDataCell,
                                { key: 'c1' },
                                order.orderNumber,
                              ),
                              React.createElement(
                                CTableDataCell,
                                { key: 'c2' },
                                formatOrderDate(order.createdAt),
                              ),
                              React.createElement(
                                CTableDataCell,
                                { key: 'c3' },
                                `${order.items?.length || 0} items`,
                              ),
                              React.createElement(
                                CTableDataCell,
                                { key: 'c4' },
                                formatPrice(order.total),
                              ),
                              React.createElement(
                                CTableDataCell,
                                { key: 'c5' },
                                getOrderStatusBadge(order.orderStatus),
                              ),
                              React.createElement(
                                CTableDataCell,
                                { key: 'c6' },
                                React.createElement(
                                  'div',
                                  { className: 'd-flex' },
                                  [
                                    React.createElement(
                                      CDropdown,
                                      { className: 'me-2', key: 'dropdown' },
                                      [
                                        React.createElement(
                                          CDropdownToggle,
                                          {
                                            color: 'secondary',
                                            size: 'sm',
                                            disabled:
                                              updatingOrderId === order._id ||
                                              order.orderStatus ===
                                                'delivered' ||
                                              order.orderStatus === 'cancelled',
                                            key: 'toggle',
                                          },
                                          updatingOrderId === order._id
                                            ? [
                                                React.createElement(CSpinner, {
                                                  size: 'sm',
                                                  component: 'span',
                                                  className: 'me-1',
                                                  key: 'spinner',
                                                }),
                                                ' Updating...',
                                              ]
                                            : order.orderStatus ===
                                                  'delivered' ||
                                                order.orderStatus ===
                                                  'cancelled'
                                              ? 'Status Locked'
                                              : 'Update Status',
                                        ),
                                        // Only show dropdown menu if order status is not delivered or cancelled
                                        order.orderStatus !== 'delivered' &&
                                        order.orderStatus !== 'cancelled'
                                          ? React.createElement(
                                              CDropdownMenu,
                                              { key: 'menu' },
                                              [
                                                React.createElement(
                                                  CDropdownItem,
                                                  {
                                                    onClick: () =>
                                                      updateOrderStatus(
                                                        order._id,
                                                        'pending',
                                                      ),
                                                    disabled:
                                                      order.orderStatus ===
                                                      'pending',
                                                    key: 'pending',
                                                  },
                                                  'Pending',
                                                ),
                                                React.createElement(
                                                  CDropdownItem,
                                                  {
                                                    onClick: () =>
                                                      updateOrderStatus(
                                                        order._id,
                                                        'delivered',
                                                      ),
                                                    disabled:
                                                      order.orderStatus ===
                                                      'delivered',
                                                    key: 'delivered',
                                                  },
                                                  'Delivered',
                                                ),
                                                React.createElement(
                                                  CDropdownItem,
                                                  {
                                                    onClick: () =>
                                                      updateOrderStatus(
                                                        order._id,
                                                        'cancelled',
                                                      ),
                                                    disabled:
                                                      order.orderStatus ===
                                                      'cancelled',
                                                    key: 'cancelled',
                                                  },
                                                  'Cancelled',
                                                ),
                                              ],
                                            )
                                          : null,
                                      ],
                                    ),
                                    React.createElement(
                                      CButton,
                                      {
                                        color: 'info',
                                        size: 'sm',
                                        onClick: () => viewOrderDetails(order),
                                        key: 'details',
                                      },
                                      'Details',
                                    ),
                                  ],
                                ),
                              ),
                            ]),
                          ),
                        ),
                      ],
                    ),

                    selectedUser &&
                      React.createElement(
                        'div',
                        {
                          className: 'mt-4 p-3 bg-light rounded',
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
                            { className: 'row', key: 'info-row' },
                            [
                              React.createElement(
                                'div',
                                { className: 'col-md-6', key: 'col1' },
                                [
                                  React.createElement(
                                    'p',
                                    { className: 'mb-2', key: 'name' },
                                    [
                                      React.createElement(
                                        'strong',
                                        { key: 'name-label' },
                                        'Name:',
                                      ),
                                      ' ',
                                      selectedUser.fullName,
                                    ],
                                  ),
                                  React.createElement(
                                    'p',
                                    { className: 'mb-2', key: 'email' },
                                    [
                                      React.createElement(
                                        'strong',
                                        { key: 'email-label' },
                                        'Email:',
                                      ),
                                      ' ',
                                      selectedUser.email,
                                    ],
                                  ),
                                ],
                              ),
                              React.createElement(
                                'div',
                                { className: 'col-md-6', key: 'col2' },
                                [
                                  React.createElement(
                                    'p',
                                    { className: 'mb-2', key: 'phone' },
                                    [
                                      React.createElement(
                                        'strong',
                                        { key: 'phone-label' },
                                        'Phone:',
                                      ),
                                      ' ',
                                      selectedUser.phoneNumber,
                                    ],
                                  ),
                                  React.createElement(
                                    'p',
                                    { className: 'mb-2', key: 'created' },
                                    [
                                      React.createElement(
                                        'strong',
                                        { key: 'created-label' },
                                        'Account Created:',
                                      ),
                                      ' ',
                                      new Date(
                                        selectedUser.createdAt,
                                      ).toLocaleDateString(),
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                  ],
        ),
        React.createElement(
          CModalFooter,
          { key: 'footer' },
          React.createElement(
            CButton,
            { color: 'secondary', onClick: onClose },
            'Close',
          ),
        ),
      ],
    ),

    // Order details modal
    renderOrderDetailsModal(),
  ])
}

export default OrdersModal
