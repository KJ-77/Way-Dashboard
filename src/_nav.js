import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilSettings,
  cilPeople,
  cilCalendar,
  cilFax,
  cilGroup,
  cilBook,
  cilFactory,
  cilChartPie,
} from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

// Function to get nav items based on role
const getNavItems = (role) => {
  const items = [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      icon: React.createElement(CIcon, {
        icon: cilSpeedometer,
        customClassName: 'nav-icon',
      }),
    },
  ]

  // Only show Admin Management for super_admin role
  if (role === 'super_admin') {
    items.push({
      component: CNavGroup,
      name: 'Admin Management',
      icon: React.createElement(CIcon, {
        icon: cilSettings,
        customClassName: 'nav-icon',
      }),
      items: [
        {
          component: CNavItem,
          name: 'Admin Users',
          to: '/admin-management',
        },
      ],
    })
  }

  // Add Tutor Management for both admin and super_admin roles
  if (role === 'super_admin' || role === 'admin') {
    items.push({
      component: CNavItem,
      name: 'Tutor Management',
      to: '/tutor-management',
      icon: React.createElement(CIcon, {
        icon: cilPeople,
        customClassName: 'nav-icon',
      }),
    })
  }

  // Add User Management for both admin and super_admin roles
  if (role === 'super_admin' || role === 'admin') {
    items.push({
      component: CNavGroup,
      name: 'User Management',
      icon: React.createElement(CIcon, {
        icon: cilPeople,
        customClassName: 'nav-icon',
      }),
      items: [
        {
          component: CNavItem,
          name: 'Users',
          to: '/users',
        },
      ],
    })
  }

  // Add Schedule Management
  if (role === 'super_admin' || role === 'admin' || role === 'tutor') {
    items.push({
      component: CNavGroup,
      name: 'Schedule Management',
      icon: React.createElement(CIcon, {
        icon: cilCalendar,
        customClassName: 'nav-icon',
      }),
      items: [
        {
          component: CNavItem,
          name: 'Schedule List',
          to: '/schedule-management',
        },
        {
          component: CNavItem,
          name: 'Schedule Management',
          to: '/schedule-capacity',
          icon: React.createElement(CIcon, {
            icon: cilChartPie,
            customClassName: 'nav-icon',
          }),
        },
        {
          component: CNavItem,
          name: 'Schedule Requests',
          to: '/schedule-requests',
        },
      ],
    })
  }

  // Add Event Management for both admin and super_admin roles
  if (role === 'super_admin' || role === 'admin') {
    items.push({
      component: CNavGroup,
      name: 'Event Management',
      icon: React.createElement(CIcon, {
        icon: cilFax,
        customClassName: 'nav-icon',
      }),
      items: [
        {
          component: CNavItem,
          name: 'Event List',
          to: '/event-management',
        },
      ],
    })
  }

  // Add Home Management for both admin and super_admin roles
  if (role === 'super_admin' || role === 'admin') {
    items.push({
      component: CNavGroup,
      name: 'Home Management',
      icon: React.createElement(CIcon, {
        icon: cilFax,
        customClassName: 'nav-icon',
      }),
      items: [
        {
          component: CNavItem,
          name: 'Home List',
          to: '/home-management',
        },
        {
          component: CNavItem,
          name: 'About Us',
          to: '/about-us-management',
        },
      ],
    })
  }

  // Add Host Management for both admin and super_admin roles
  // if (role === 'super_admin' || role === 'admin') {
  //   items.push({
  //     component: CNavGroup,
  //     name: 'Host Management',
  //     icon: React.createElement(CIcon, {
  //       icon: cilGroup,
  //       customClassName: 'nav-icon',
  //     }),
  //     items: [
  //       {
  //         component: CNavItem,
  //         name: 'Host List',
  //         to: '/host-management',
  //       },
  //     ],
  //   })
  // }

  // // Add Book With Us management for admin and super_admin roles
  // if (role === 'super_admin' || role === 'admin') {
  //   items.push({
  //     component: CNavGroup,
  //     name: 'Book With Us',
  //     icon: React.createElement(CIcon, {
  //       icon: cilBook,
  //       customClassName: 'nav-icon',
  //     }),
  //     items: [
  //       {
  //         component: CNavItem,
  //         name: 'Book With Us List',
  //         to: '/book-with-us-management',
  //       },
  //     ],
  //   })
  // }

  // Add Product management for admin and super_admin roles
  if (role === 'super_admin' || role === 'admin') {
    items.push({
      component: CNavGroup,
      name: 'Product Management',
      icon: React.createElement(CIcon, {
        icon: cilFactory,
        customClassName: 'nav-icon',
      }),
      items: [
        {
          component: CNavItem,
          name: 'Product Categories',
          to: '/product-categories',
        },
        {
          component: CNavItem,
          name: 'Products',
          to: '/products',
        },
        {
          component: CNavItem,
          name: 'Product Requests',
          to: '/product-requests',
        },
      ],
    })
  }

  return items
}

export default getNavItems
