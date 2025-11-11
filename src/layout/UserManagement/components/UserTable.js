import React from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CSpinner,
  CBadge,
} from '@coreui/react'
import { Link } from 'react-router-dom'

const UserTable = ({ users, loading, searchTerm, filters, handleViewCart }) => {
  const { verificationFilter, paymentFilter, itemsFilter } = filters

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <CTable hover responsive>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>Name</CTableHeaderCell>
          <CTableHeaderCell>Email</CTableHeaderCell>
          <CTableHeaderCell>Phone</CTableHeaderCell>
          <CTableHeaderCell>Verification</CTableHeaderCell>
          <CTableHeaderCell>Cart Status</CTableHeaderCell>
          <CTableHeaderCell>Items</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {users.length === 0 ? (
          <CTableRow>
            <CTableDataCell colSpan="7" className="text-center">
              {searchTerm || verificationFilter || paymentFilter || itemsFilter
                ? 'No users found matching your filters'
                : 'No users found'}
            </CTableDataCell>
          </CTableRow>
        ) : (
          users.map((user) => (
            <CTableRow key={user._id}>
              <CTableDataCell>{user.fullName}</CTableDataCell>
              <CTableDataCell>{user.email}</CTableDataCell>
              <CTableDataCell>{user.phoneNumber}</CTableDataCell>
              <CTableDataCell>
                <CBadge color={user.verified ? 'success' : 'warning'}>
                  {user.verified ? 'Verified' : 'Not Verified'}
                </CBadge>
              </CTableDataCell>
              <CTableDataCell>
                {user.cartStatus ? (
                  <CBadge
                    color={
                      user.cartStatus === 'pending'
                        ? 'warning'
                        : user.cartStatus === 'completed'
                          ? 'success'
                          : 'info'
                    }
                  >
                    {user.cartStatus.charAt(0).toUpperCase() +
                      user.cartStatus.slice(1)}
                  </CBadge>
                ) : (
                  <CBadge color="light" textColor="dark">
                    No Cart
                  </CBadge>
                )}
              </CTableDataCell>
              <CTableDataCell>
                <div className="d-flex gap-1">
                  <Link to={`/users/${user._id}/view`}>
                    <CButton color="info" size="sm" className="text-white">
                      View Details
                    </CButton>
                  </Link>
                  <CButton
                    color="secondary"
                    size="sm"
                    onClick={() => handleViewCart(user)}
                  >
                    View Cart
                  </CButton>
                </div>
              </CTableDataCell>
            </CTableRow>
          ))
        )}
      </CTableBody>
    </CTable>
  )
}

export default UserTable
