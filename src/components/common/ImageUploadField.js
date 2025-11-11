import React from 'react'
import {
  CFormInput,
  CFormLabel,
  CFormText,
  CButton,
  CImage,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilImagePlus, cilTrash } from '@coreui/icons'
import PropTypes from 'prop-types'

const ImageUploadField = ({
  id,
  label,
  currentImage,
  imagePreview,
  onImageChange,
  onImageRemove,
  multiple = false,
  maxSize = 15, // MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  helpText,
  required = false,
  disabled = false,
  error,
  getImageUrl,
  ...props
}) => {
  const handleFileChange = (e) => {
    const files = multiple ? Array.from(e.target.files) : e.target.files[0]

    if (files) {
      if (multiple) {
        // Validate each file for multiple uploads
        const validFiles = []
        const errors = []

        files.forEach((file, index) => {
          if (!allowedTypes.includes(file.type)) {
            errors.push(
              `File ${index + 1}: Invalid file type. Please select ${allowedTypes.join(', ')}`,
            )
            return
          }

          if (file.size > maxSize * 1024 * 1024) {
            errors.push(
              `File ${index + 1}: File size must be less than ${maxSize}MB`,
            )
            return
          }

          validFiles.push(file)
        })

        if (errors.length > 0) {
          onImageChange(null, errors[0])
          return
        }

        onImageChange(validFiles)
      } else {
        // Validate single file
        if (!allowedTypes.includes(files.type)) {
          onImageChange(
            null,
            `Invalid file type. Please select ${allowedTypes.join(', ')}`,
          )
          return
        }

        if (files.size > maxSize * 1024 * 1024) {
          onImageChange(null, `File size must be less than ${maxSize}MB`)
          return
        }

        onImageChange(files)
      }
    }
  }

  const clearFileInput = () => {
    const fileInput = document.getElementById(id)
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleRemove = () => {
    clearFileInput()
    onImageRemove()
  }

  return (
    <div className="mb-3">
      <CFormLabel htmlFor={id}>
        {label} {required && <span className="text-danger">*</span>}
      </CFormLabel>

      {/* Current Image (Edit Mode) */}
      {currentImage && !imagePreview && (
        <div className="mb-3">
          <p className="text-muted mb-2">Current Image:</p>
          <CImage
            src={getImageUrl ? getImageUrl(currentImage) : currentImage}
            alt="Current image"
            className="img-fluid rounded"
            style={{ maxHeight: '200px' }}
          />
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3">
          <p className="text-muted mb-2">
            {multiple ? 'Selected Images:' : 'Image Preview:'}
          </p>
          <div className="position-relative d-inline-block">
            <CImage
              src={imagePreview}
              alt="Image preview"
              className="img-fluid rounded"
              style={{ maxHeight: '200px' }}
            />
            <CButton
              color="danger"
              size="sm"
              className="position-absolute top-0 end-0"
              style={{ margin: '5px' }}
              onClick={handleRemove}
            >
              <CIcon icon={cilTrash} />
            </CButton>
          </div>
        </div>
      )}

      {/* File Input */}
      <div className="d-flex align-items-center gap-2">
        <CFormInput
          id={id}
          type="file"
          accept={allowedTypes.join(',')}
          multiple={multiple}
          onChange={handleFileChange}
          className={`flex-grow-1 ${error ? 'is-invalid' : ''}`}
          required={required}
          disabled={disabled}
          {...props}
        />
        <CButton
          color="primary"
          variant="outline"
          onClick={() => document.getElementById(id).click()}
          disabled={disabled}
        >
          <CIcon icon={cilImagePlus} />
        </CButton>
      </div>

      {/* Help Text */}
      <CFormText className="text-muted">
        {helpText ||
          `Maximum file size: ${maxSize}MB. Supported formats: ${allowedTypes.join(', ')}`}
      </CFormText>

      {/* Error message */}
      {error && <CFormText className="text-danger">{error}</CFormText>}
    </div>
  )
}

ImageUploadField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  currentImage: PropTypes.string,
  imagePreview: PropTypes.string,
  onImageChange: PropTypes.func.isRequired,
  onImageRemove: PropTypes.func.isRequired,
  multiple: PropTypes.bool,
  maxSize: PropTypes.number,
  allowedTypes: PropTypes.arrayOf(PropTypes.string),
  helpText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  getImageUrl: PropTypes.func,
}

export default ImageUploadField
