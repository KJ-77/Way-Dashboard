import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CAlert,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons'
import { BASE_URL } from '../../config'

const AdminList = () => {
  const navigate = useNavigate()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        // Use the correct token key
        const token = localStorage.getItem('admin_token')

        if (!token) {
          throw new Error('No authentication token found')
        }

        console.log(
          'Making request to fetch admin users with token:',
          token ? 'Token exists' : 'No token',
        )

        const response = await fetch(`${BASE_URL}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          // Handle specific status codes
          if (response.status === 401) {
            throw new Error('Your session has expired. Please login again.')
          } else if (response.status === 403) {
            throw new Error('You do not have permission to view admin users')
          } else if (response.status === 404) {
            throw new Error(
              'API endpoint not found. The admin users feature may not be implemented yet.',
            )
          }

          // Try to get error details from response
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.message || `Server error (${response.status})`,
          )
        }

        const data = await response.json()
        console.log('Admin users data received:', data)
        setAdmins(data.data || [])
      } catch (err) {
        console.error('Error fetching admin users:', err)
        setError(err.message || 'Failed to load admin users')
      } finally {
        setLoading(false)
      }
    }

    fetchAdmins()
  }, [])

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return <CBadge color="danger">Super Admin</CBadge>
      case 'admin':
        return <CBadge color="primary">Admin</CBadge>
      case 'read_only':
        return <CBadge color="info">Read Only</CBadge>
      default:
        return <CBadge color="secondary">{role}</CBadge>
    }
  }

  const handleEdit = (id) => {
    navigate(`/admin-management/${id}/edit`)
  }

  const handleDelete = async (id) => {
    // Implement delete confirmation
    if (window.confirm('Are you sure you want to delete this admin user?')) {
      try {
        const token = localStorage.getItem('admin_token')
        const response = await fetch(`${BASE_URL}/api/admin/users/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.message || `Failed to delete (${response.status})`,
          )
        }

        // Remove deleted admin from state
        setAdmins(admins.filter((admin) => admin._id !== id))
      } catch (err) {
        console.error('Error deleting admin:', err)
        setError(`Failed to delete admin: ${err.message}`)
      }
    }
  }

  const handleAddNew = () => {
    navigate('/admin-management/new')
  }

  // Loading state
  if (loading) {
    return (
      <CCard className="mb-4">
        <CCardBody
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: '300px' }}
        >
          <CSpinner color="primary" />
        </CCardBody>
      </CCard>
    )
  }

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>Admin Management</strong>
        <CButton color="primary" size="sm" onClick={handleAddNew}>
          <CIcon icon={cilPlus} className="me-2" />
          Add New Admin
        </CButton>
      </CCardHeader>
      <CCardBody>
        {error && (
          <CAlert color="danger" dismissible onClose={() => setError(null)}>
            {error}
          </CAlert>
        )}

        {admins.length === 0 && !error ? (
          <div className="text-center py-5">
            <p className="text-medium-emphasis">No admin users found</p>
            <CButton color="primary" onClick={handleAddNew}>
              Add New Admin
            </CButton>
          </div>
        ) : (
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Role</CTableHeaderCell>
                <CTableHeaderCell>Last Login</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {admins.map((admin) => (
                <CTableRow key={admin._id}>
                  <CTableDataCell>{admin.fullName}</CTableDataCell>
                  <CTableDataCell>{admin.email}</CTableDataCell>
                  <CTableDataCell>{getRoleBadge(admin.role)}</CTableDataCell>
                  <CTableDataCell>
                    {admin.lastLogin
                      ? new Date(admin.lastLogin).toLocaleString()
                      : 'Never'}
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      color="primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(admin._id)}
                    >
                      <CIcon icon={cilPencil} />
                    </CButton>
                    <CButton
                      color="danger"
                      size="sm"
                      onClick={() => handleDelete(admin._id)}
                    >
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

export default AdminList
