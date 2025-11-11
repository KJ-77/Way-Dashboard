import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div className="d-flex align-items-center justify-content-between w-100">
        <div className="">
          <a href="https://coreui.io" target="_blank" rel="noopener noreferrer">
            CoreUI
          </a>
          <span className="ms-1">&copy; 2025 creativeLabs.</span>
        </div>
        <div className="">
          <span className="me-1">Powered by</span>
          <a
            href="https://www.dowgroup.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Dow Group
          </a>
          <span className="mx-1">&bull;</span>
        </div>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
