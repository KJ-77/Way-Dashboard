import React from 'react'
import PropTypes from 'prop-types'
import { useAuth } from 'src/context/AuthContext'

/**
 * Component to conditionally render children based on user permissions
 *
 * @param {Object} props
 * @param {string} props.resource - The resource to check permissions for (e.g., 'books', 'courses')
 * @param {string} props.action - The action to check permissions for ('read' or 'write')
 * @param {React.ReactNode} props.children - The content to render if permission is granted
 * @param {React.ReactNode} props.fallback - Optional content to render if permission is denied
 * @returns {React.ReactNode}
 */
const PermissionGate = ({ resource, action, children, fallback = null }) => {
  const { hasPermission } = useAuth()

  // Check if user has permission
  const permitted = hasPermission(resource, action)

  // Return children if permitted, otherwise fallback
  return permitted ? children : fallback
}

PermissionGate.propTypes = {
  resource: PropTypes.string.isRequired,
  action: PropTypes.oneOf(['read', 'write']).isRequired,
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
}

export default PermissionGate
