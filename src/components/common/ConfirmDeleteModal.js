import React from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
} from '@coreui/react'

const ConfirmDeleteModal = ({
  visible,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item',
}) => {
  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader>
        <CModalTitle>Confirm Delete</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p>
          Are you sure you want to delete the {itemType} "{itemName}"?
        </p>
        <p className="text-danger">
          Warning: This action cannot be undone and all associated data will be
          permanently deleted.
        </p>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Cancel
        </CButton>
        <CButton color="danger" className="text-white" onClick={onConfirm}>
          Delete
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ConfirmDeleteModal
