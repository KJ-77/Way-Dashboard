import React from 'react'
import { useLocation, Link } from 'react-router-dom'

import routes from '../routes'

import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'

const AppBreadcrumb = () => {
  const currentLocation = useLocation().pathname

  const getRouteName = (pathname, routes) => {
    // First try exact match
    const exactRoute = routes.find((route) => route.path === pathname)
    if (exactRoute) return exactRoute.name

    // If no exact match, try matching dynamic routes
    const pathSegments = pathname.split('/')
    for (const route of routes) {
      if (route.path.includes(':')) {
        const routeSegments = route.path.split('/')
        if (routeSegments.length === pathSegments.length) {
          const matches = routeSegments.every((segment, index) => {
            return segment.startsWith(':') || segment === pathSegments[index]
          })
          if (matches) return route.name
        }
      }
    }
    return false
  }

  const getBreadcrumbs = (location) => {
    const breadcrumbs = []
    const pathSegments = location.split('/').filter(Boolean)

    pathSegments.reduce((prev, curr, index, array) => {
      const currentPathname = `/${array.slice(0, index + 1).join('/')}`
      const routeName = getRouteName(currentPathname, routes)

      if (routeName) {
        breadcrumbs.push({
          pathname: currentPathname,
          name: routeName,
          active: index + 1 === array.length,
        })
      }
      return currentPathname
    }, '')

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs(currentLocation)

  return (
    <CBreadcrumb className="my-0">
      <CBreadcrumbItem>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          Home
        </Link>
      </CBreadcrumbItem>
      {breadcrumbs.map((breadcrumb, index) => {
        return (
          <CBreadcrumbItem active={breadcrumb.active} key={index}>
            {breadcrumb.active ? (
              breadcrumb.name
            ) : (
              <Link
                to={breadcrumb.pathname}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                {breadcrumb.name}
              </Link>
            )}
          </CBreadcrumbItem>
        )
      })}
    </CBreadcrumb>
  )
}

export default React.memo(AppBreadcrumb)
