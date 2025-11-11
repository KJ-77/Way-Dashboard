import React from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CSpinner,
} from '@coreui/react'

const ConfirmPurchaseModal = ({
  confirmModalVisible,
  setConfirmModalVisible,
  selectedUser,
  markingPaid,
  handleCompletePurchase,
}) => {
  if (!confirmModalVisible) return null

  return (
    <CModal
      visible={confirmModalVisible}
      onClose={() => setConfirmModalVisible(false)}
    >
      <CModalHeader>
        <CModalTitle>Confirm Purchase Completion</CModalTitle>
      </CModalHeader>
      <CModalBody>
        Are you sure you want to complete{' '}
        <strong>{selectedUser?.fullName}</strong>'s purchase?
        <p className="mt-2">This will:</p>
        <ul>
          <li>Mark these items as purchased</li>
          <li>Add them to the user's purchased items</li>
          <li>Create a transaction record</li>
          <li>Clear their cart</li>
          <li>Send a confirmation email</li>
        </ul>
        <p>This action cannot be undone.</p>
      </CModalBody>
      <CModalFooter>
        <CButton
          color="secondary"
          onClick={() => setConfirmModalVisible(false)}
        >
          Cancel
        </CButton>
        <CButton
          color="success"
          className="text-white"
          onClick={handleCompletePurchase}
          disabled={markingPaid}
        >
          {markingPaid ? (
            <>
              <CSpinner size="sm" className="me-1" />
              Processing...
            </>
          ) : (
            'Complete Purchase'
          )}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ConfirmPurchaseModal
