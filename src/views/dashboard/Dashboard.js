import React from 'react'
import { CCard, CCardBody } from '@coreui/react'

const Dashboard = () => {
  return (
      <CCard className="mb-4">
        <CCardBody className="p-2 p-md-5">
          <h2 className="mb-3">Welcome to Admin Panel</h2>
          <p className="text-medium-emphasis mb-0">
            This administration interface provides you with tools to manage your
            application. Use the navigation menu to access different sections.
          </p>
        </CCardBody>
      </CCard>
  )
}

export default Dashboard
