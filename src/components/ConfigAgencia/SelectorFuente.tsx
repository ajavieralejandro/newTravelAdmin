'use client';

import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { GOOGLE_FONTS } from '@/lib/google-fonts';

interface SelectorFuenteProps {
  value: string;
  onChange: (nuevaFuente: string) => void;
  label?: string;
}

export function SelectorFuente({
  value,
  onChange,
  label = 'Fuente',
}: SelectorFuenteProps) {
  return (
    <Autocomplete
      options={GOOGLE_FONTS}
      value={value}
      onChange={(_, nueva) => nueva && onChange(nueva)}
      renderInput={(params) => <TextField {...params} label={label} />}
      disableClearable
      fullWidth
    />
  );
}
