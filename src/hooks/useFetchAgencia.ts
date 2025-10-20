import { useEffect, useState } from 'react';
import { AgenciaBackData } from '@/types/AgenciaBackData';

export const useFetchAgencia = (
  idAgencia: number | string | undefined
): {
  agencia: AgenciaBackData | null;
  cargando: boolean;
  error: string | null;
} => {
  const [agencia, setAgencia] = useState<AgenciaBackData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idAgencia) return;

    const fetchAgencia = async () => {
      setCargando(true);
      setError(null);

      try {
        const response = await fetch(`https://travelconnect.com.ar/agencias2/${idAgencia}`);
        if (!response.ok) throw new Error(`Error ${response.status}`);

        const data: AgenciaBackData = await response.json();
        setAgencia(data);
        console.log('✅ Agencia cargada sin transformación:', data);
      } catch (err) {
        console.error('❌ Error al cargar agencia:', err);
        setError('Error al cargar la agencia');
        setAgencia(null);
      } finally {
        setCargando(false);
      }
    };

    fetchAgencia();
  }, [idAgencia]);

  return { agencia, cargando, error };
};

