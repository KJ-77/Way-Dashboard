import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const AdminRouteGuard = ({ component: Component, requiredRole }) => {
  const { admin, isAuthenticated, loading } = useAuth()

  // Show loading while checking auth
  if (loading) {
    return <div>Loading...</div>
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  // Check role requirements
  if (requiredRole) {
    // If role is an array, check if admin's role is in the array
    if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(admin.role)) {
        return <Navigate to="/dashboard" />
      }
    }
    // If role is a string, directly compare
    else if (admin.role !== requiredRole) {
      return <Navigate to="/dashboard" />
    }
  }

  // Render the component if all checks pass
  return <Component />
}

export default AdminRouteGuard
