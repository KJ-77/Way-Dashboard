import React from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { cilAccountLogout, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useAuth } from 'src/context/AuthContext'

const AppHeaderDropdown = () => {
  const { admin, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  // Function to get admin initials for avatar
  const getInitials = () => {
    if (!admin || !admin.fullName) return 'AD'

    const names = admin.fullName.split(' ')
    if (names.length === 1) return names[0].charAt(0).toUpperCase()

    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase()
  }

  // Get background color based on role
  const getAvatarColor = () => {
    if (!admin) return '#6c757d' // default gray

    switch (admin.role) {
      case 'super_admin':
        return '#dc3545' // danger/red
      case 'admin':
        return '#0d6efd' // primary/blue
      case 'read_only':
        return '#0dcaf0' // info/cyan
      default:
        return '#6c757d'
    }
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle
        placement="bottom-end"
        className="py-0 pe-0"
        caret={false}
      >
        <CAvatar
          size="md"
          style={{
            backgroundColor: getAvatarColor(),
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          {getInitials()}
        </CAvatar>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownItem href="#" className="d-flex align-items-center">
          <CIcon icon={cilUser} className="me-2" />
          {admin?.fullName || 'Admin User'}
          <span className="ms-2 small text-muted">
            ({admin?.role?.replace('_', ' ') || 'admin'})
          </span>
        </CDropdownItem>
        <CDropdownItem
          onClick={handleLogout}
          className="d-flex align-items-center"
        >
          <CIcon icon={cilAccountLogout} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
