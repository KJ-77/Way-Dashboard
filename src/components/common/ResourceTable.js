import React from 'react'
import {
  CTable,
  CTableBody,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
  CButton,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import { useAuth } from 'src/context/AuthContext'

const ResourceTable = ({
  columns,
  data,
  onView,
  onEdit,
  onDelete,
  pagination,
  emptyState,
  resourceType,
  actionButtonLabels = { view: 'View', edit: 'Edit', delete: 'Delete' },
}) => {
  const { canRead, canWrite } = useAuth()

  const hasReadPermission = canRead(resourceType)

  const hasWritePermission = canWrite(resourceType)

  if (!hasReadPermission) {
    return (
      <div className="text-center p-4">
        <p className="text-medium-emphasis">
          You don't have permission to view this resource.
        </p>
      </div>
    )
  }

  return (
    <>
      {data.length === 0 ? (
        emptyState
      ) : (
        <>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                {columns.map((column, index) => (
                  <CTableHeaderCell key={index}>
                    {column.label}
                  </CTableHeaderCell>
                ))}
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {data.map((item) => (
                <CTableRow key={item._id || item.id || item.slug}>
                  {columns.map((column, index) => (
                    <CTableDataCell key={index}>
                      {column.render ? column.render(item) : item[column.key]}
                    </CTableDataCell>
                  ))}
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          {pagination && pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <CPagination aria-label="Page navigation">
                <CPaginationItem
                  aria-label="Previous"
                  disabled={pagination.currentPage === 1}
                  onClick={() =>
                    pagination.onPageChange(pagination.currentPage - 1)
                  }
                >
                  <span aria-hidden="true">&laquo;</span>
                </CPaginationItem>

                {[...Array(pagination.totalPages)].map((_, i) => (
                  <CPaginationItem
                    key={i}
                    active={i + 1 === pagination.currentPage}
                    onClick={() => pagination.onPageChange(i + 1)}
                  >
                    {i + 1}
                  </CPaginationItem>
                ))}

                <CPaginationItem
                  aria-label="Next"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() =>
                    pagination.onPageChange(pagination.currentPage + 1)
                  }
                >
                  <span aria-hidden="true">&raquo;</span>
                </CPaginationItem>
              </CPagination>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default ResourceTable
