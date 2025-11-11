import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CSpinner,
  CAlert,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { ScheduleCard, SearchAndFilters } from './components'
import scheduleCapacityService from './services/scheduleCapacityService'
import { useAuth } from '../../context/AuthContext'

const ScheduleCapacityDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState(null)
  const { admin } = useAuth()
  const navigate = useNavigate()

  // Load schedules with capacity information
  useEffect(() => {
    fetchSchedulesWithCapacity()
  }, [admin?.role])

  const fetchSchedulesWithCapacity = async () => {
    try {
      setLoading(true)
      setError(null)

      // Admins see all; tutors see assigned schedules only
      if (admin?.role === 'tutor') {
        const token = localStorage.getItem('admin_token')
        const res = await fetch(
          `${scheduleCapacityService.baseURL}/api/tutor/me/schedules`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        const data = await res.json()
        const list = Array.isArray(data.data)
          ? data.data
          : data.status === 'success' && Array.isArray(data)
            ? data
            : []
        // Normalize minimal fields for capacity view
        setSchedules(
          list.map((s) => ({
            ...s,
            enrolledStudents: s.enrolledStudents ?? 0,
            studentCapacity: s.studentCapacity ?? 0,
            isFull: (s.enrolledStudents ?? 0) >= (s.studentCapacity ?? 0),
          })),
        )
      } else {
        const schedulesData =
          await scheduleCapacityService.fetchSchedulesWithCapacity()
        setSchedules(schedulesData)
      }
    } catch (err) {
      console.error('Error loading schedules with capacity:', err)
      setError(`Failed to load schedules: ${err.message}`)
      setSchedules([])
    } finally {
      setLoading(false)
    }
  }

  // Handle view registrations
  const handleViewRegistrations = (scheduleId) => {
    navigate(`/schedule-registrations/${scheduleId}`)
  }

  // Filter schedules based on search term
  const filteredSchedules = schedules.filter(
    (schedule) =>
      schedule.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.text?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const renderEmptyState = () => (
    <div className="text-center py-5">
      <h6>No schedules found</h6>
      <p className="text-muted">
        {searchTerm
          ? 'Try a different search term'
          : 'Create schedules to see them here'}
      </p>
    </div>
  )

  const renderLoadingState = () => (
    <div className="text-center my-5">
      <CSpinner color="primary" />
      <div className="mt-2">Loading schedule capacity information...</div>
    </div>
  )

  const renderSchedulesTable = () => (
    <CTable hover responsive className="border">
      <CTableHead className="bg-light">
        <CTableRow>
          <CTableHeaderCell scope="col">Schedule</CTableHeaderCell>
          <CTableHeaderCell scope="col">Date</CTableHeaderCell>
          <CTableHeaderCell scope="col">Capacity</CTableHeaderCell>
          <CTableHeaderCell scope="col">Enrollment</CTableHeaderCell>
          <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {filteredSchedules.map((schedule) => (
          <ScheduleCard
            key={schedule._id}
            schedule={schedule}
            onViewRegistrations={handleViewRegistrations}
          />
        ))}
      </CTableBody>
    </CTable>
  )

  return (
    <CRow>
      <CCol>
        <CCard className="mb-4">
          <CCardHeader>
            <CRow>
              <CCol>
                <h5>Schedule Capacity Dashboard</h5>
              </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody>
            {error && (
              <CAlert color="danger" dismissible>
                {error}
              </CAlert>
            )}

            <SearchAndFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onRefresh={fetchSchedulesWithCapacity}
              loading={loading}
            />

            {loading
              ? renderLoadingState()
              : filteredSchedules.length === 0
                ? renderEmptyState()
                : renderSchedulesTable()}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ScheduleCapacityDashboard
