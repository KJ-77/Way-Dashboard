import React from 'react'
import { CPagination, CPaginationItem } from '@coreui/react'

const PaginationComponent = ({ pagination, handlePageChange }) => {
  if (pagination.totalPages <= 1) {
    return null
  }

  return (
    <CPagination className="mt-3" align="center">
      <CPaginationItem
        disabled={pagination.page === 1}
        onClick={() => handlePageChange(1)}
      >
        &laquo;
      </CPaginationItem>
      <CPaginationItem
        disabled={pagination.page === 1}
        onClick={() => handlePageChange(pagination.page - 1)}
      >
        &lt;
      </CPaginationItem>

      {/* Show up to 5 page links centered around current page */}
      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
        // Calculate the page number to display
        let pageNum = pagination.page - 2 + i

        // Adjust if we're at the start or end
        if (pagination.page < 3) {
          pageNum = i + 1
        } else if (pagination.page > pagination.totalPages - 2) {
          pageNum = pagination.totalPages - 4 + i
        }

        // Only show valid page numbers
        if (pageNum >= 1 && pageNum <= pagination.totalPages) {
          return (
            <CPaginationItem
              key={pageNum}
              active={pageNum === pagination.page}
              onClick={() => handlePageChange(pageNum)}
            >
              {pageNum}
            </CPaginationItem>
          )
        }
        return null
      })}

      <CPaginationItem
        disabled={pagination.page === pagination.totalPages}
        onClick={() => handlePageChange(pagination.page + 1)}
      >
        &gt;
      </CPaginationItem>
      <CPaginationItem
        disabled={pagination.page === pagination.totalPages}
        onClick={() => handlePageChange(pagination.totalPages)}
      >
        &raquo;
      </CPaginationItem>
    </CPagination>
  )
}

export default PaginationComponent
