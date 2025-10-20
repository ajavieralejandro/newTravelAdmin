'use client'

import {
  Box,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText,
  OutlinedInputProps,
} from '@mui/material'
import { forwardRef } from 'react'
import { SelectorFuente } from '@/components/ConfigAgencia/SelectorFuente'

interface InputFormularioProps extends Omit<OutlinedInputProps, 'onChange' | 'value'> {
  label: string
  name: string
  helperText?: string
  fullWidth?: boolean
  optional?: boolean
  esTipografia?: boolean

  // Props solo para modo controlado
  value?: string
  onChange?: (event: { target: { name: string; value: string } }) => void
}

const InputFormulario = forwardRef<HTMLInputElement, InputFormularioProps>(
  (
    {
      label,
      name,
      value,
      onChange,
      required = false,
      disabled = false,
      type = 'text',
      placeholder,
      helperText,
      fullWidth = true,
      optional = false,
      error = false,
      esTipografia = false,
      ...props
    },
    ref
  ) => {
    return (
      <Box sx={{ mb: 4 }}>
        <FormControl
          fullWidth={fullWidth}
          required={required}
          disabled={disabled}
          error={error}
        >
          <InputLabel shrink htmlFor={name}>
            {label}
            {optional && ' (Opcional)'}
          </InputLabel>

          {esTipografia ? (
            <SelectorFuente
              value={value ?? ''}
              onChange={(nueva) =>
                onChange?.({ target: { name, value: nueva } })
              }
              label={label}
            />
          ) : (
            <OutlinedInput
              id={name}
              name={name}
              inputRef={ref}
              type={type}
              placeholder={placeholder}
              label={`${label}${optional ? ' (Opcional)' : ''}`}
              {...props}
            />
          )}

          {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      </Box>
    )
  }
)

InputFormulario.displayName = 'InputFormulario'

export default InputFormulario
