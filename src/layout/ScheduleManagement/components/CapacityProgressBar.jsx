import React from 'react'
import { CProgress, CProgressBar, CBadge, CTooltip } from '@coreui/react'

const CapacityProgressBar = ({ enrolled, total, showStats = true }) => {
  // Calculate percentages
  const enrolledPercent = total > 0 ? (enrolled / total) * 100 : 0
  const available = Math.max(0, total - enrolled)
  const availablePercent = total > 0 ? (available / total) * 100 : 100

  return (
    <div className="mb-2">
      {showStats && (
        <div className="d-flex justify-content-between mb-1">
          <span>
            <CBadge color="success" className="me-1">
              Enrolled
            </CBadge>
            {enrolled}
          </span>
          <span>
            <CBadge color="primary" className="me-1">
              Available
            </CBadge>
            {available}
          </span>
        </div>
      )}
      <CTooltip
        content={`Enrolled: ${enrolled}/${total} students (${Math.round(enrolledPercent)}%)`}
      >
        <CProgress className="mt-3 mb-2" height={10}>
          <CProgressBar color="success" value={enrolledPercent} />
        </CProgress>
      </CTooltip>
      <div className="text-center small text-muted">
        {enrolled} / {total} students
      </div>
    </div>
  )
}

export default CapacityProgressBar
