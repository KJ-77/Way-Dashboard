import React from 'react'
import { CFormTextarea, CFormLabel, CFormText } from '@coreui/react'
import PropTypes from 'prop-types'

const TextAreaField = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  rows = 6,
  maxLength,
  required = false,
  disabled = false,
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
      <CFormTextarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        required={required}
        disabled={disabled}
        className={error ? 'is-invalid' : ''}
        {...props}
      />

      {/* Character count */}
      {showCharCount && (
        <CFormText className="d-flex justify-content-between">
          <span>{helpText}</span>
          <span
            className={
              maxLength && value.length > maxLength * 0.9
                ? 'text-warning'
                : 'text-muted'
            }
          >
            {value.length} {maxLength && `/${maxLength}`} characters
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

TextAreaField.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  rows: PropTypes.number,
  maxLength: PropTypes.number,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  showCharCount: PropTypes.bool,
  helpText: PropTypes.string,
  error: PropTypes.string,
}

export default TextAreaField
