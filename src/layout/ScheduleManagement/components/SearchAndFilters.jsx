import React from 'react'
import { CRow, CCol, CFormInput, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'

const SearchAndFilters = ({
  searchTerm,
  onSearchChange,
  onRefresh,
  loading = false,
}) => {
  return (
    <CRow className="mb-3">
      <CCol md={6}>
        <div className="position-relative">
          <CFormInput
            placeholder="Search schedules..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={loading}
          />
          <div
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <CIcon icon={cilSearch} />
          </div>
        </div>
      </CCol>
      <CCol md={6} className="d-flex justify-content-end">
        <CButton color="primary" onClick={onRefresh} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Data'}
        </CButton>
      </CCol>
    </CRow>
  )
}

export default SearchAndFilters
