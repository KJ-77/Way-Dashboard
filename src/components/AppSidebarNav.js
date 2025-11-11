import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'

import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

import { CBadge, CNavLink, CSidebarNav } from '@coreui/react'
import { useAuth } from '../context/AuthContext'
import getNavItems from '../_nav'

export const AppSidebarNav = () => {
  const location = useLocation()
  const { admin } = useAuth()

  // Get navigation items based on admin role
  const navItems = admin ? getNavItems(admin.role) : []

  const navLink = (name, icon, badge, indent = false) => {
    return (
      <>
        {icon
          ? icon
          : indent && (
              <span className="nav-icon">
                <span className="nav-icon-bullet"></span>
              </span>
            )}
        {name && name}
        {badge && (
          <CBadge color={badge.color} className="ms-auto" size="sm">
            {badge.text}
          </CBadge>
        )}
      </>
    )
  }

  const navItem = (item, index, indent = false) => {
    const { component, name, badge, icon, ...rest } = item
    const Component = component
    return (
      <Component as="div" key={index}>
        {rest.to || rest.href ? (
          <CNavLink
            {...(rest.to && { as: NavLink })}
            {...(rest.href && { target: '_blank', rel: 'noopener noreferrer' })}
            {...rest}
          >
            {navLink(name, icon, badge, indent)}
          </CNavLink>
        ) : (
          navLink(name, icon, badge, indent)
        )}
      </Component>
    )
  }

  const navGroup = (item, index) => {
    const { component, name, icon, items, to, ...rest } = item
    const Component = component
    return (
      <Component
        compact
        as="div"
        key={index}
        toggler={navLink(name, icon)}
        {...rest}
      >
        {items?.map((item, index) =>
          item.items ? navGroup(item, index) : navItem(item, index, true),
        )}
      </Component>
    )
  }

  // This is the function that was missing
  const renderNavItem = (item, index) => {
    return item.items ? navGroup(item, index) : navItem(item, index)
  }

  return (
    <CSidebarNav as={SimpleBar}>
      {navItems.map((item, index) => renderNavItem(item, index, location))}
    </CSidebarNav>
  )
}

// Remove props requirement since we're not using props anymore
AppSidebarNav.propTypes = {}

export default React.memo(AppSidebarNav)
