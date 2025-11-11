import React from 'react'
import { CFormInput, CFormLabel, CFormText } from '@coreui/react'
import PropTypes from 'prop-types'

const TextInputField = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  required = false,
  disabled = false,
  type = 'text',
  showCharCount = true,
  helpText,
  error,
  ...props
}) => {
  return (
    <div className="mb-3">
      <CFormLabel htmlFor={id}>
        {label} {required && <span className="text-danger">*</span>}
      </CFormLabel>
      <CFormInput
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        disabled={disabled}
        className={error ? 'is-invalid' : ''}
        {...props}
      />

      {/* Character count */}
      {showCharCount && maxLength && (
        <CFormText className="d-flex justify-content-between">
          <span>{helpText}</span>
          <span
            className={
              value.length > maxLength * 0.9 ? 'text-warning' : 'text-muted'
            }
          >
            {value.length}/{maxLength} characters
          </span>
        </CFormText>
      )}

      {/* Help text without character count */}
      {helpText && !showCharCount && (
        <CFormText className="text-muted">{helpText}</CFormText>
      )}

      {/* Error message */}
      {error && <CFormText className="text-danger">{error}</CFormText>}
    </div>
  )
}

TextInputField.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.string,
  showCharCount: PropTypes.bool,
  helpText: PropTypes.string,
  error: PropTypes.string,
}

export default TextInputField
