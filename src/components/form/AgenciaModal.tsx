// components/form/AgenciaModal.tsx
'use client';

import React from 'react';
import { FormProvider } from 'react-hook-form';
import { stepsConfig } from './configStep';
import { Modal, Box, Typography, Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import EstadoEnvioMensaje from './EstadoEnvioMensaje';
import ControlesStep from './ControlesStep';

import { useAgenciaForm } from './hooks/useAgenciaForm';
import { useModalAgenciaGlobal } from '@/contexts/ModalAgenciaProvider';
import { useAgenciaModalHandler } from './hooks/useAgenciaModalHandler';
import type { AgenciaBackData } from '@/types/AgenciaBackData';

const AgenciaModal = () => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const { isOpen, closeModal, datosEdicion } = useModalAgenciaGlobal();

  // RHF + hidratación (se encarga de resetear según datosEdicion/isOpen)
  const methods = useAgenciaForm();
  const StepComponent = stepsConfig[currentStep]?.component;

  // Al cerrar, volver al primer paso
  React.useEffect(() => {
    if (!isOpen) setCurrentStep(0);
  }, [isOpen]);

  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      keepMounted={false}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <FormProvider {...methods}>
        <Box
          component="form"
          onSubmit={(e) => e.preventDefault()}
          autoComplete="off"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90vw',
            maxWidth: 720,
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 3,
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
            height: 'auto',
            overflow: 'hidden',
          }}
        >
          <IconButton
            onClick={closeModal}
            sx={{ position: 'absolute', top: 8, right: 8 }}
            aria-label="Cerrar"
          >
            <CloseIcon />
          </IconButton>

          <AgenciaContenidoInterno
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            StepComponent={StepComponent}
            datosEdicion={datosEdicion}
          />
        </Box>
      </FormProvider>
    </Modal>
  );
};

export default AgenciaModal;

/* ===============================
   Subcomponente interno
   =============================== */

interface PropsContenidoInterno {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  StepComponent: React.ElementType | undefined;
  datosEdicion?: AgenciaBackData; // ← crear = undefined, editar = objeto
}

const AgenciaContenidoInterno = ({
  currentStep,
  setCurrentStep,
  StepComponent,
  datosEdicion,
}: PropsContenidoInterno) => {
  const { submissionState, handleSubmitClick } = useAgenciaModalHandler();

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Encabezado */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={600} id="modal-title" textAlign="center">
          {stepsConfig[currentStep]?.title}
        </Typography>
        <Divider sx={{ mt: 1 }} />
      </Box>

      {/* Contenido del paso */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          py: 1,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 600 }}>
          {StepComponent && <StepComponent />}
        </Box>
      </Box>

      {/* Estado de envío */}
      <Box sx={{ mt: 1 }}>
        <EstadoEnvioMensaje
          status={submissionState.status}
          message={submissionState.message}
          modoEdicion={!!datosEdicion}
        />
      </Box>

      {/* Controles de paso */}
      <Box sx={{ mt: 2 }}>
        <ControlesStep
          currentStep={currentStep}
          totalSteps={stepsConfig.length}
          isLoading={submissionState.status === 'loading'}
          isEditMode={!!datosEdicion}
          onBack={handleBack}
          onNext={handleNext}
          onSubmit={handleSubmitClick}
        />
      </Box>
    </Box>
  );
};
