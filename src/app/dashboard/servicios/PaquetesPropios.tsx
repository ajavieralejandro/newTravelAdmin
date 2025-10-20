// src/components/ConfigAgencia/PaquetesPropios.tsx
'use client';

import { Box, Stack, Typography } from '@mui/material';
import { useAlertaLocal } from '@/components/ConfigAgencia/hooks/useAlertaLocal';
import { BotonImportarCSV } from '@/components/ConfigAgencia/BotonImportarCSV';
import { BotonExportarCSV } from '@/components/ConfigAgencia/BotonExportarCSV';
import {
  exportarArchivoPaquetes,
  subirArchivoPaquetes,
} from '@/components/ConfigAgencia/paquetespropiosService';
import type { AgenciaBackData } from '@/types/AgenciaBackData';

interface PaquetesPropiosProps {
  agencia: AgenciaBackData;
}

const PaquetesPropios = ({ agencia }: PaquetesPropiosProps): React.JSX.Element => {
  const { mostrarAlerta, alertaJSX } = useAlertaLocal();

  const handleExportar = async () => {
    if (!agencia?.idAgencia) {
      mostrarAlerta('No se pudo exportar: agencia no definida.', 'error');
      return;
    }

    const url = await exportarArchivoPaquetes(parseInt(agencia.idAgencia));

    if (url) {
      window.open(url, '_blank');
      mostrarAlerta('Archivo exportado correctamente.', 'success');
    } else {
      mostrarAlerta('No se pudo exportar el archivo.', 'error');
    }
  };

  const handleImportar = async (archivo: File) => {
    if (!archivo || !agencia?.idAgencia) {
      mostrarAlerta('Archivo no válido o agencia faltante.', 'error');
      return;
    }

    try {
      const response = await subirArchivoPaquetes(parseInt(agencia.idAgencia), archivo);

      if (response.status === 'success') {
        const { stats } = response;
        const resumen = stats
          ? `✔️ Total: ${stats.total_records} | 🆕 Creados: ${stats.created} | 🔁 Actualizados: ${stats.updated} | 💤 Desactivados: ${stats.deactivated} | ⚠️ Errores: ${stats.errors}`
          : 'Archivo importado correctamente.';
        mostrarAlerta(`${response.message ?? 'Importación exitosa.'} ${resumen}`, 'success');
      } else {
        const mensaje = response.message || 'Ocurrió un error al importar el archivo.';
        mostrarAlerta(`Error: ${mensaje}`, 'error');
      }
    } catch (error) {
      console.error('💥 Error inesperado en importación:', error);
      mostrarAlerta('Error inesperado en la importación.', 'error');
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" align="center">
          Gestión de Paquetes Propios
        </Typography>
        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          sx={{ maxWidth: 500, mt: 1 }}
        >
          Aquí podrás exportar un archivo con los paquetes actuales o importar uno nuevo con
          modificaciones. El archivo será enviado junto con los cambios al confirmar.
        </Typography>
      </Box>

      <Stack direction="row" spacing={4} sx={{ mt: 4 }}>
        <BotonExportarCSV onExportar={handleExportar} />
        <BotonImportarCSV onImportar={handleImportar} />
      </Stack>

      {alertaJSX}
    </Box>
  );
};

export default PaquetesPropios;
