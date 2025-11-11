import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'
import { useAuth } from '../context/AuthContext'

// routes config
import routes from '../routes'

const AppContent = () => {
  const { admin } = useAuth()

  // Function to check if admin has access to a route
  const hasRouteAccess = (requiredRole) => {
    if (!requiredRole) return true // No role requirement
    if (!admin) return false // No admin logged in

    // If required role is an array, check if admin role is in the array
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(admin.role)
    }

    // If required role is a string, directly compare
    return admin.role === requiredRole
  }

  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route, idx) => {
            return (
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  element={
                    hasRouteAccess(route.requiredRole) ? (
                      <route.element />
                    ) : (
                      <Navigate to="/dashboard" replace />
                    )
                  }
                />
              )
            )
          })}
          <Route path="/" element={<Navigate to="dashboard" />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)
