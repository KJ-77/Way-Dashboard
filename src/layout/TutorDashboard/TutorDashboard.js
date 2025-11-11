import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CSpinner,
  CAlert,
  CProgress,
  CProgressBar,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import tutorService from '../../services/tutorService'

const TutorDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [classes, setClasses] = useState([])
  const [tutorInfo, setTutorInfo] = useState(null)

  useEffect(() => {
    fetchTutorData()
  }, [])

  const fetchTutorData = async () => {
    try {
      setLoading(true)
      // Get tutor ID from localStorage (this assumes you've stored it during login)
      const tutorInfo = JSON.parse(localStorage.getItem('tutor_info'))

      if (!tutorInfo || !tutorInfo.id) {
        setError('Tutor information not found. Please log in again.')
        setLoading(false)
        return
      }

      setTutorInfo(tutorInfo)

      // Fetch tutor's assigned schedules
      const response = await tutorService.getTutorSchedules(tutorInfo.id)
      setClasses(response.data)

      setLoading(false)
    } catch (error) {
      console.error('Error fetching tutor data:', error)
      setError('Failed to load your assigned classes. Please try again later.')
      setLoading(false)
    }
  }

  const calculateCapacityPercentage = (enrolled, capacity) => {
    return (enrolled / capacity) * 100
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>My Classes</strong>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <div className="text-center">
                  <CSpinner color="primary" />
                </div>
              ) : error ? (
                <CAlert color="danger">{error}</CAlert>
              ) : (
                <>
                  {tutorInfo && (
                    <div className="mb-4">
                      <h5>Welcome, {tutorInfo.name}!</h5>
                      <p>You are assigned to {classes.length} classes.</p>
                    </div>
                  )}

                  {classes.length > 0 ? (
                    <CTable hover responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Class Title</CTableHeaderCell>
                          <CTableHeaderCell>Date</CTableHeaderCell>
                          <CTableHeaderCell>Time</CTableHeaderCell>
                          <CTableHeaderCell>Capacity</CTableHeaderCell>
                          <CTableHeaderCell>Students Enrolled</CTableHeaderCell>
                          <CTableHeaderCell>Actions</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {classes.map((cls) => {
                          // This is just a placeholder - in a real app, you would track enrolled students
                          const studentsEnrolled = cls.studentsEnrolled || 0
                          const capacityPercentage =
                            calculateCapacityPercentage(
                              studentsEnrolled,
                              cls.studentCapacity,
                            )

                          return (
                            <CTableRow key={cls._id}>
                              <CTableDataCell>{cls.title}</CTableDataCell>
                              <CTableDataCell>
                                {new Date(cls.date).toLocaleDateString()}
                              </CTableDataCell>
                              <CTableDataCell>{cls.classTime}</CTableDataCell>
                              <CTableDataCell>
                                {cls.studentCapacity}
                              </CTableDataCell>
                              <CTableDataCell>
                                <div className="clearfix">
                                  <div className="float-start">
                                    <strong>
                                      {studentsEnrolled}/{cls.studentCapacity}
                                    </strong>
                                  </div>
                                  <div className="float-end">
                                    <small className="text-medium-emphasis">
                                      {capacityPercentage.toFixed(0)}%
                                    </small>
                                  </div>
                                </div>
                                <CProgress thin>
                                  <CProgressBar
                                    color={
                                      capacityPercentage > 80
                                        ? 'danger'
                                        : capacityPercentage > 50
                                          ? 'warning'
                                          : 'success'
                                    }
                                    value={capacityPercentage}
                                  />
                                </CProgress>
                              </CTableDataCell>
                              <CTableDataCell>
                                <CButton
                                  color="info"
                                  size="sm"
                                  onClick={() =>
                                    navigate(`/class/${cls._id}/students`)
                                  }
                                >
                                  View Students
                                </CButton>
                              </CTableDataCell>
                            </CTableRow>
                          )
                        })}
                      </CTableBody>
                    </CTable>
                  ) : (
                    <div className="text-center">
                      <p>You have not been assigned to any classes yet.</p>
                    </div>
                  )}
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default TutorDashboard
