import React from 'react'
import { CButton } from '@coreui/react'

const EmptyState = ({ onAction }) => {
  return (
    <div className="text-center p-4">
      <p>No records found.</p>
      <CButton color="primary" onClick={onAction}>
        Create Your First Record
      </CButton>
    </div>
  )
}

export default EmptyState
