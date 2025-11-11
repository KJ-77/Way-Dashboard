import React from 'react'
import PropTypes from 'prop-types'
import { useAuth } from 'src/context/AuthContext'
import { Navigate } from 'react-router-dom'

/**
 * Higher-order component to protect write actions (create/update/delete) based on permissions
 * If user doesn't have permission, they will be redirected to dashboard
 *
 * @param {Object} props
 * @param {string} props.resourceType - The resource type (e.g., 'books', 'courses')
 * @param {React.ReactNode} props.children - The components to render if permission is granted
 * @returns {React.ReactNode}
 */
const ProtectedWriteAction = ({ resourceType, children }) => {
  const { canWrite } = useAuth()

  // Check if user has write permission
  if (!canWrite(resourceType)) {
    return null // Don't render anything if no permission
  }

  return children
}

ProtectedWriteAction.propTypes = {
  resourceType: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

export default ProtectedWriteAction
