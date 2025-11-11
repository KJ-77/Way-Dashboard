import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

// Import CoreUI styles
import '@coreui/coreui/dist/css/coreui.min.css'
import './scss/style.scss' // Your custom styles

import App from './App'
import store from './store'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
