import React from 'react'
import { CTableRow, CTableDataCell, CButton, CBadge } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople } from '@coreui/icons'
import { CapacityProgressBar } from './'

const ScheduleCard = ({ schedule, onViewRegistrations }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const { enrolledStudents = 0, studentCapacity = 0, isFull = false } = schedule

  // Calculate available spots
  const available = Math.max(0, studentCapacity - enrolledStudents)

  return (
    <CTableRow>
      <CTableDataCell>
        <div className="fw-bold">{schedule.title || 'Untitled Schedule'}</div>
        <small className="text-muted">
          {schedule.text ? `${schedule.text.substring(0, 50)}...` : ''}
        </small>
      </CTableDataCell>
      <CTableDataCell>
        <div>
          <strong>Start:</strong> {formatDate(schedule.startDate)}
        </div>
        <div>
          <strong>End:</strong> {formatDate(schedule.endDate)}
        </div>
        <div>
          <small className="text-muted">
            {schedule.classTime || 'Time not specified'}
          </small>
        </div>
      </CTableDataCell>
      <CTableDataCell>
        <div className="mb-1">
          <strong>Total:</strong> {studentCapacity} students
        </div>
        <div className="mb-1">
          <strong>Available:</strong> {available} spots
        </div>
        <div>
          {isFull ? (
            <CBadge color="danger">Full</CBadge>
          ) : (
            <CBadge color="success">Available</CBadge>
          )}
        </div>
      </CTableDataCell>
      <CTableDataCell>
        <CapacityProgressBar
          enrolled={enrolledStudents}
          total={studentCapacity}
        />
      </CTableDataCell>
      <CTableDataCell>
        <CButton
          color="primary"
          size="sm"
          className="mb-1 w-100"
          onClick={() => onViewRegistrations(schedule._id)}
        >
          <CIcon icon={cilPeople} className="me-2" />
          View Registrations
        </CButton>
      </CTableDataCell>
    </CTableRow>
  )
}

export default ScheduleCard
