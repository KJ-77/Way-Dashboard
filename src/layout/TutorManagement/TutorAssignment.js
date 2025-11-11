import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormSelect,
  CButton,
  CSpinner,
  CAlert,
  CListGroup,
  CListGroupItem,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSave, cilX } from '@coreui/icons'
import BACKEND_URL from '../../config'

const TutorAssignment = () => {
  const [tutors, setTutors] = useState([])
  const [schedules, setSchedules] = useState([])
  const [selectedTutor, setSelectedTutor] = useState('')
  const [selectedSchedule, setSelectedSchedule] = useState('')
  const [tutorSchedules, setTutorSchedules] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  // Load tutors and schedules on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load tutors
        const tutorsResponse = await fetch(`${BACKEND_URL}/tutor`)
        const tutorsData = await tutorsResponse.json()

        if (!tutorsResponse.ok) {
          throw new Error(tutorsData.message || 'Failed to load tutors')
        }

        setTutors(tutorsData.data || [])

        // Load schedules
        const schedulesResponse = await fetch(`${BACKEND_URL}/schedule`)
        const schedulesData = await schedulesResponse.json()

        if (!schedulesResponse.ok) {
          throw new Error(schedulesData.message || 'Failed to load schedules')
        }

        setSchedules(schedulesData.data || [])
      } catch (err) {
        setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Load tutor's schedules when a tutor is selected
  useEffect(() => {
    if (selectedTutor) {
      loadTutorSchedules(selectedTutor)
    } else {
      setTutorSchedules([])
    }
  }, [selectedTutor])

  // Load tutor's schedules
  const loadTutorSchedules = async (tutorId) => {
    try {
      setFormLoading(true)
      setError(null)

      const response = await fetch(`${BACKEND_URL}/tutor/${tutorId}/schedules`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load tutor schedules')
      }

      setTutorSchedules(data.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load tutor schedules')
    } finally {
      setFormLoading(false)
    }
  }

  // Handle assign schedule to tutor
  const handleAssign = async (e) => {
    e.preventDefault()

    if (!selectedTutor || !selectedSchedule) {
      setError('Please select both a tutor and a schedule')
      return
    }

    try {
      setFormLoading(true)
      setError(null)
      setSuccess(null)

      const token = localStorage.getItem('admin_token')

      const response = await fetch(`${BACKEND_URL}/tutor/assign-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tutorId: selectedTutor,
          scheduleId: selectedSchedule,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to assign schedule')
      }

      setSuccess('Schedule assigned successfully!')

      // Reload tutor schedules
      await loadTutorSchedules(selectedTutor)

      // Reset selected schedule
      setSelectedSchedule('')
    } catch (err) {
      setError(err.message || 'Failed to assign schedule')
    } finally {
      setFormLoading(false)
    }
  }

  // Handle remove schedule from tutor
  const handleRemove = async (scheduleId) => {
    try {
      setFormLoading(true)
      setError(null)
      setSuccess(null)

      const token = localStorage.getItem('admin_token')

      const response = await fetch(`${BACKEND_URL}/tutor/remove-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tutorId: selectedTutor,
          scheduleId: scheduleId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove schedule')
      }

      setSuccess('Schedule removed successfully!')

      // Reload tutor schedules
      await loadTutorSchedules(selectedTutor)
    } catch (err) {
      setError(err.message || 'Failed to remove schedule')
    } finally {
      setFormLoading(false)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  // Filter out schedules that are already assigned to the tutor
  const getAvailableSchedules = () => {
    return schedules.filter(
      (schedule) => !tutorSchedules.some((ts) => ts._id === schedule._id),
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <h5 className="mb-0">Assign Tutors to Classes</h5>
          </CCardHeader>
          <CCardBody>
            {/* Error Alert */}
            {error && (
              <CAlert color="danger" dismissible onClose={() => setError(null)}>
                {error}
              </CAlert>
            )}

            {/* Success Alert */}
            {success && (
              <CAlert
                color="success"
                dismissible
                onClose={() => setSuccess(null)}
              >
                {success}
              </CAlert>
            )}

            {/* Loading */}
            {loading ? (
              <div className="text-center py-5">
                <CSpinner color="primary" />
                <p className="mt-2">Loading data...</p>
              </div>
            ) : (
              <CRow>
                <CCol md={6}>
                  <CForm onSubmit={handleAssign}>
                    <h6 className="mb-3">Assign Class to Tutor</h6>

                    {/* Tutor Selection */}
                    <div className="mb-3">
                      <label htmlFor="tutorSelect" className="form-label">
                        Select Tutor
                      </label>
                      <CFormSelect
                        id="tutorSelect"
                        value={selectedTutor}
                        onChange={(e) => setSelectedTutor(e.target.value)}
                        disabled={formLoading || tutors.length === 0}
                      >
                        <option value="">-- Select Tutor --</option>
                        {tutors.map((tutor) => (
                          <option key={tutor._id} value={tutor._id}>
                            {tutor.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </div>

                    {selectedTutor && (
                      <>
                        {/* Schedule Selection */}
                        <div className="mb-3">
                          <label
                            htmlFor="scheduleSelect"
                            className="form-label"
                          >
                            Select Class
                          </label>
                          <CFormSelect
                            id="scheduleSelect"
                            value={selectedSchedule}
                            onChange={(e) =>
                              setSelectedSchedule(e.target.value)
                            }
                            disabled={
                              formLoading ||
                              getAvailableSchedules().length === 0
                            }
                          >
                            <option value="">-- Select Class --</option>
                            {getAvailableSchedules().map((schedule) => (
                              <option key={schedule._id} value={schedule._id}>
                                {schedule.title}
                              </option>
                            ))}
                          </CFormSelect>
                          {getAvailableSchedules().length === 0 && (
                            <div className="form-text text-muted">
                              No available classes to assign
                            </div>
                          )}
                        </div>

                        {/* Submit Button */}
                        <div>
                          <CButton
                            color="primary"
                            type="submit"
                            disabled={formLoading || !selectedSchedule}
                          >
                            {formLoading ? (
                              <>
                                <CSpinner size="sm" className="me-2" />
                                Assigning...
                              </>
                            ) : (
                              <>
                                <CIcon icon={cilSave} className="me-2" />
                                Assign Class
                              </>
                            )}
                          </CButton>
                        </div>
                      </>
                    )}
                  </CForm>
                </CCol>

                <CCol md={6}>
                  {selectedTutor && (
                    <div>
                      <h6 className="mb-3">Assigned Classes</h6>

                      {formLoading ? (
                        <div className="text-center py-3">
                          <CSpinner size="sm" />
                          <p className="mt-2">Loading classes...</p>
                        </div>
                      ) : tutorSchedules.length === 0 ? (
                        <div className="text-center py-3 border rounded">
                          <p className="text-muted mb-0">
                            No classes assigned yet
                          </p>
                        </div>
                      ) : (
                        <CListGroup>
                          {tutorSchedules.map((schedule) => (
                            <CListGroupItem
                              key={schedule._id}
                              className="d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <div className="fw-bold">{schedule.title}</div>
                                <small className="text-muted">
                                  {formatDate(schedule.startDate)} -{' '}
                                  {formatDate(schedule.endDate)}
                                </small>
                              </div>
                              <div className="d-flex align-items-center">
                                <CBadge
                                  color="info"
                                  shape="rounded-pill"
                                  className="me-2"
                                >
                                  Capacity: {schedule.studentCapacity}
                                </CBadge>
                                <CButton
                                  color="danger"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemove(schedule._id)}
                                  disabled={formLoading}
                                  title="Remove class"
                                >
                                  <CIcon icon={cilX} />
                                </CButton>
                              </div>
                            </CListGroupItem>
                          ))}
                        </CListGroup>
                      )}
                    </div>
                  )}
                </CCol>
              </CRow>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default TutorAssignment
