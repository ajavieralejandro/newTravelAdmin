// src/components/form/hooks/useAgenciaSteps.ts
'use client';

import { useState } from 'react';
import { stepsConfig } from '../configStep';

export const useAgenciaSteps = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const StepComponent = stepsConfig[currentStep]?.component;
  const stepTitle = stepsConfig[currentStep]?.title;
  const isLastStep = currentStep === stepsConfig.length - 1;

  return {
    currentStep,
    stepTitle,
    StepComponent,
    handleNext,
    handleBack,
    isLastStep,
  };
};

