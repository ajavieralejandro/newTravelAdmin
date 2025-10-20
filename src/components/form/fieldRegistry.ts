import { UseFormRegister } from 'react-hook-form';
import { stepsConfig } from './configStep';

/**
 * Registra todos los campos del formulario automáticamente
 * @param register Función de registro de react-hook-form
 * @param defaultValues Valores iniciales opcionales
 */
export const registerAllFields = (
  register: UseFormRegister<any>,
  defaultValues: Record<string, any> = {}
) => {
  // 1. Extraer todos los campos únicos de la configuración
  const allFields = new Set<string>();
  stepsConfig.forEach(step => {
    step.fields?.forEach(field => allFields.add(field));
  });

  // 2. Registrar cada campo con valores por defecto si existen
  Array.from(allFields).forEach(field => {
    register(field, {
      value: defaultValues[field] ?? null // Maneja valores iniciales
    });
  });

  // 3. Retornar metadata útil (opcional)
  return {
    registeredFields: Array.from(allFields),
    requiredFields: stepsConfig
      .filter(step => step.fields?.length)
      .flatMap(step => step.fields)
  };
};

/**
 * Tipo generado dinámicamente basado en configStep.ts
 */
export type FormField = typeof stepsConfig[number]['fields'][number];
