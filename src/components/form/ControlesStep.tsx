// src/components/form/ControlesStep.tsx
'use client';

import React from 'react';
import { CircularProgress } from '@mui/material';
import BotonAccion from './BotonAccion';
import { ChevronLeft, ChevronRight, Save } from '@mui/icons-material';

interface ControlesStepProps {
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  isEditMode: boolean;  // Controla si estamos en modo edición o creación
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

const ControlesStep: React.FC<ControlesStepProps> = ({
  currentStep,
  totalSteps,
  isLoading,
  isEditMode, // Utilizamos el estado isEditMode para determinar si estamos editando o creando
  onBack,
  onNext,
  onSubmit,
}) => {
  const esUltimoPaso = currentStep === totalSteps - 1;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        paddingTop: 16,
        borderTop: '1px solid #eee',
      }}
    >
      {currentStep > 0 ? (
        <BotonAccion
          label="Anterior"
          onClick={onBack}
          icono={<ChevronLeft />}
          variant="outlined"
          disabled={isLoading}
        />
      ) : (
        <div style={{ width: 100 }} />
      )}

      {esUltimoPaso ? (
        <BotonAccion
          label={
            isLoading
              ? 'Guardando...'
              : isEditMode
              ? 'Modificar'  // Si estamos en modo edición, el botón dice "Modificar"
              : 'Guardar'    // Si estamos en modo creación, el botón dice "Guardar"
          }
          icono={
            isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <Save />
            )
          }
          variant="contained"
          color="success"
          onClick={onSubmit}
          disabled={isLoading}
        />
      ) : (
        <BotonAccion
          label="Siguiente"
          onClick={onNext}
          icono={<ChevronRight />}
          variant="contained"
          disabled={isLoading}
        />
      )}
    </div>
  );
};

export default ControlesStep;

