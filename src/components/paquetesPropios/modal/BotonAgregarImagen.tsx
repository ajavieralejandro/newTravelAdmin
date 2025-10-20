'use client'

import * as React from 'react'
import { styled } from '@mui/material/styles'
import Button from '@mui/material/Button'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
})

interface BotonAgregarImagenProps {
  name?: string
  multiple?: boolean
  onChange?: (files: FileList) => void
}

export default function BotonAgregarImagen({
  name = 'imagen',
  multiple = false,
  onChange
}: BotonAgregarImagenProps) {
  const [fileName, setFileName] = React.useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0]
      setFileName(selectedFile.name)
      onChange?.(event.target.files)
    }
  }

  return (
    <Box marginY={2}>
      <Typography variant="subtitle2" gutterBottom>
        Imagen principal
      </Typography>
      <Button
        component="label"
        variant="contained"
        fullWidth
        startIcon={<CloudUploadIcon />}
      >
        Subir imagen
        <VisuallyHiddenInput
          name={name}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileChange}
        />
      </Button>
      {fileName && (
        <Typography variant="body2" color="text.secondary" mt={1}>
          📸 Imagen seleccionada: <strong>{fileName}</strong>
        </Typography>
      )}
    </Box>
  )
}
