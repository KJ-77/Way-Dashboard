import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
} from '@coreui/react'
import BACKEND_URL from '../../config'

const ClassStudents = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [classInfo, setClassInfo] = useState(null)
  const [students, setStudents] = useState([])

  useEffect(() => {
    fetchClassStudents()
  }, [classId])

  const fetchClassStudents = async () => {
    try {
      setLoading(true)
      const token = JSON.parse(localStorage.getItem('tutor_info'))?.token

      // Fetch class details
      const classResponse = await fetch(`${BACKEND_URL}/schedule/${classId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const classData = await classResponse.json()

      if (!classResponse.ok) {
        throw new Error(classData.message || 'Failed to load class information')
      }

      setClassInfo(classData.data)

      // In a real application, you would fetch registered students for this class
      // This is a placeholder for demonstration purposes
      // Fetch students registered for this class
      /*
      const studentsResponse = await fetch(`${BACKEND_URL}/schedule/${classId}/students`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const studentsData = await studentsResponse.json()
      
      if (!studentsResponse.ok) {
        throw new Error(studentsData.message || 'Failed to load student data')
      }
      
      setStudents(studentsData.data);
      */

      // Placeholder data for demonstration
      setStudents([
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          registrationDate: '2025-07-10',
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          registrationDate: '2025-07-11',
        },
        {
          id: 3,
          name: 'Mike Johnson',
          email: 'mike@example.com',
          registrationDate: '2025-07-12',
        },
      ])

      setLoading(false)
    } catch (error) {
      console.error('Error fetching class data:', error)
      setError('Failed to load class information. Please try again.')
      setLoading(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>
              {classInfo ? `Students: ${classInfo.title}` : 'Class Students'}
            </strong>
            <CButton color="info" size="sm" onClick={() => navigate(-1)}>
              Back to Classes
            </CButton>
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
                {classInfo && (
                  <div className="mb-4 p-3 border rounded">
                    <h5>{classInfo.title}</h5>
                    <div className="row">
                      <div className="col-md-3">
                        <strong>Date:</strong>{' '}
                        {new Date(classInfo.date).toLocaleDateString()}
                      </div>
                      <div className="col-md-3">
                        <strong>Time:</strong> {classInfo.classTime}
                      </div>
                      <div className="col-md-3">
                        <strong>Capacity:</strong> {classInfo.studentCapacity}
                      </div>
                      <div className="col-md-3">
                        <strong>Enrolled:</strong> {students.length}
                      </div>
                    </div>
                  </div>
                )}

                <h5>Enrolled Students</h5>

                {students.length > 0 ? (
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>#</CTableHeaderCell>
                        <CTableHeaderCell>Name</CTableHeaderCell>
                        <CTableHeaderCell>Email</CTableHeaderCell>
                        <CTableHeaderCell>Registration Date</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {students.map((student, index) => (
                        <CTableRow key={student.id}>
                          <CTableDataCell>{index + 1}</CTableDataCell>
                          <CTableDataCell>{student.name}</CTableDataCell>
                          <CTableDataCell>{student.email}</CTableDataCell>
                          <CTableDataCell>
                            {new Date(
                              student.registrationDate,
                            ).toLocaleDateString()}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                ) : (
                  <div className="text-center">
                    <p>No students enrolled in this class yet.</p>
                  </div>
                )}

                <div className="mt-4">
                  <CButton color="primary" onClick={() => window.print()}>
                    Print Report
                  </CButton>
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ClassStudents
