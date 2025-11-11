import React from 'react'
import UserList from './UserList'

// For User Detail views, provide a placeholder component
const UserDetail = () => {
  return React.createElement(
    'div',
    null,
    'User detail view is not implemented in this version.',
  )
}

// Export all components
export { UserList, UserDetail }
