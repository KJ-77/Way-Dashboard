import React from 'react'
import {
  CRow,
  CCol,
  CFormInput,
  CFormSelect,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CButton,
} from '@coreui/react'

const UserFilters = ({
  searchTerm,
  setSearchTerm,
  verificationFilter,
  setVerificationFilter,
  paymentFilter,
  setPaymentFilter,
  itemsFilter,
  setItemsFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  handleFilterChange,
  resetFilters,
}) => {
  // Check if any filters are active
  const hasActiveFilters =
    searchTerm ||
    verificationFilter ||
    paymentFilter ||
    itemsFilter ||
    sortBy !== 'fullName' ||
    sortOrder !== 'asc'

  return (
    <>
      {/* Filters */}
      <CRow className="mb-3">
        <CCol md={4}>
          <CFormInput
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CCol>
        <CCol md={2}>
          <CFormSelect
            value={verificationFilter}
            onChange={(e) => {
              setVerificationFilter(e.target.value)
              handleFilterChange()
            }}
          >
            <option value="">Verification: All</option>
            <option value="verified">Verified</option>
            <option value="not-verified">Not Verified</option>
          </CFormSelect>
        </CCol>
        <CCol md={2}>
          <CFormSelect
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value)
              handleFilterChange()
            }}
          >
            <option value="">Payment: All</option>
            <option value="paid">Paid</option>
            <option value="not-paid">Not Paid</option>
          </CFormSelect>
        </CCol>
        <CCol md={2}>
          <CFormSelect
            value={itemsFilter}
            onChange={(e) => {
              setItemsFilter(e.target.value)
              handleFilterChange()
            }}
          >
            <option value="">Items: All</option>
            <option value="hasItems">Has Items</option>
            <option value="noItems">No Items</option>
          </CFormSelect>
        </CCol>
        <CCol md={2}>
          <CDropdown>
            <CDropdownToggle color="secondary">Sort: {sortBy}</CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem
                onClick={() => {
                  setSortBy('fullName')
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }}
              >
                Name{' '}
                {sortBy === 'fullName' && (sortOrder === 'asc' ? '↑' : '↓')}
              </CDropdownItem>
              <CDropdownItem
                onClick={() => {
                  setSortBy('email')
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }}
              >
                Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
              </CDropdownItem>
              <CDropdownItem
                onClick={() => {
                  setSortBy('createdAt')
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }}
              >
                Date{' '}
                {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CCol>
      </CRow>

      {/* Clear Filters Button - Only show when filters are active */}
      {hasActiveFilters && (
        <CRow className="mb-3">
          <CCol>
            <CButton color="secondary" size="sm" onClick={resetFilters}>
              Clear All Filters
            </CButton>
          </CCol>
        </CRow>
      )}
    </>
  )
}

export default UserFilters
