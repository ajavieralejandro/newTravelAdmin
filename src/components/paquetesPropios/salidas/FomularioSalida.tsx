'use client';

import {
  Grid,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Salida } from '@/types/Salidas';

interface FormularioSalidaProps {
  salida: Partial<Salida>;
  onChange: (campo: keyof Salida, valor: any) => void;
}

/** Adaptadores UI ← back */
// date: back "DD-MM-YYYY" | "YYYY-MM-DD" | "YYYY-MM-DDTHH:mm:ss" → input "YYYY-MM-DD"
const toInputDate = (v?: string | null) => {
  if (!v) return '';
  const raw = v.includes('T') ? v.split('T')[0] : v;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw; // ya OK
  if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
    const [dd, mm, yyyy] = raw.split('-');
    return `${yyyy}-${mm}-${dd}`;
  }
  return '';
};

// time: back "HH:MM:SS" | "HH:MM" → input "HH:MM" (sin grupos de captura)
const toInputTime = (v?: string | null) => {
  if (!v) return '';
  if (!/^\d{2}:\d{2}(?::\d{2})?$/.test(v)) return '';
  const [hh, mm] = v.split(':');
  return `${hh}:${mm}`;
};

export default function FormularioSalida({
  salida,
  onChange,
}: FormularioSalidaProps) {
  // Cambios genéricos: preserva '' en numéricos; no fuerces 0
  const handleChange =
    (campo: keyof Salida) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const { type, value, checked } = e.target as HTMLInputElement;

      let valor: any;
      if (type === 'checkbox') {
        valor = checked;
      } else if (type === 'number') {
        // Evita '' → 0; deja vacío hasta que el usuario confirme
        valor = value === '' ? '' : Number(value);
      } else {
        valor = value;
      }
      onChange(campo, valor);
    };

  const tiposPrecio = [
    'single',
    'doble',
    'triple',
    'cuadruple',
    'familia_1',
    'familia_2',
  ] as const;

  const subCampos = ['precio', 'impuesto', 'otro', 'otro2'] as const;

  const transporteInhabilitado = salida.tipo_transporte === 'sin_transporte';
  const textoTransporte =
    salida.tipo_transporte === 'avion'
      ? 'Avión'
      : salida.tipo_transporte === 'bus'
      ? 'Bus'
      : 'Sin transporte';

  return (
    <Grid container spacing={2}>
      {/* 🔹 DATOS GENERALES */}
      <Grid item xs={12}>
        <Typography variant="subtitle1">Datos generales</Typography>
      </Grid>

      <Grid item xs={6}>
        <TextField
          fullWidth
          label="Fecha desde"
          type="date"
          value={toInputDate(salida.fecha_desde)}
          onChange={handleChange('fecha_desde')}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          label="Fecha hasta"
          type="date"
          value={toInputDate(salida.fecha_hasta)}
          onChange={handleChange('fecha_hasta')}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          label="Fecha de viaje"
          type="date"
          value={toInputDate(salida.fecha_viaje)}
          onChange={handleChange('fecha_viaje')}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          label="Cupos"
          type="number"
          value={salida.cupos ?? ''}
          onChange={handleChange('cupos')}
          inputProps={{ step: 1 }}
        />
      </Grid>

      <Grid item xs={6}>
        <FormControl fullWidth>
          <InputLabel id="tipo-transporte-label">Tipo de transporte</InputLabel>
          <Select
            labelId="tipo-transporte-label"
            id="tipo-transporte"
            value={salida.tipo_transporte ?? 'sin_transporte'}
            label="Tipo de transporte"
            onChange={(e) => onChange('tipo_transporte', e.target.value)}
          >
            <MenuItem value="avion">Avión</MenuItem>
            <MenuItem value="bus">Bus</MenuItem>
            <MenuItem value="sin_transporte">Sin transporte</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={6}>
        <FormControlLabel
          control={
            <Switch
              checked={salida.venta_online || false}
              onChange={handleChange('venta_online')}
            />
          }
          label="Venta online"
        />
      </Grid>
      <Grid item xs={6}>
        <FormControlLabel
          control={
            <Switch
              checked={salida.info_tramos || false}
              onChange={handleChange('info_tramos')}
            />
          }
          label="Info tramos"
        />
      </Grid>

      {/* 🔹 VUELO / VIAJE IDA */}
      <Grid item xs={12}>
        <Typography variant="subtitle1">Viaje Ida</Typography>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="body2" color="text.secondary">
          Tipo de transporte seleccionado: <strong>{textoTransporte}</strong>
        </Typography>
      </Grid>

      {[
        ['ida_origen_fecha', 'date'],
        ['ida_origen_hora', 'time'],
        ['ida_origen_ciudad', 'text'],
        ['ida_destino_fecha', 'date'],
        ['ida_destino_hora', 'time'],
        ['ida_destino_ciudad', 'text'],
        ['ida_clase_vuelo', 'text'],
        ['ida_linea_aerea', 'text'],
        ['ida_vuelo', 'text'],
        ['ida_escalas', 'text'],
      ].map(([campo, tipo]) => {
        const key = campo as keyof Salida;
        const value =
          tipo === 'date'
            ? toInputDate(salida[key] as string)
            : tipo === 'time'
            ? toInputTime(salida[key] as string)
            : (salida[key] as string) ?? '';

        return (
          <Grid item xs={4} key={campo}>
            <TextField
              fullWidth
              label={campo.toString().replace(/_/g, ' ')}
              type={tipo as string}
              value={value}
              onChange={handleChange(key)}
              disabled={transporteInhabilitado}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        );
      })}

      {/* 🔹 VUELO / VIAJE VUELTA */}
      <Grid item xs={12}>
        <Typography variant="subtitle1">Viaje Vuelta</Typography>
      </Grid>

      {[
        ['vuelta_origen_fecha', 'date'],
        ['vuelta_origen_hora', 'time'],
        ['vuelta_origen_ciudad', 'text'],
        ['vuelta_destino_fecha', 'date'],
        ['vuelta_destino_hora', 'time'],
        ['vuelta_destino_ciudad', 'text'],
        ['vuelta_clase_vuelo', 'text'],
        ['vuelta_linea_aerea', 'text'],
        ['vuelta_vuelo', 'text'],
        ['vuelta_escalas', 'text'],
      ].map(([campo, tipo]) => {
        const key = campo as keyof Salida;
        const value =
          tipo === 'date'
            ? toInputDate(salida[key] as string)
            : tipo === 'time'
            ? toInputTime(salida[key] as string)
            : (salida[key] as string) ?? '';

        return (
          <Grid item xs={4} key={campo}>
            <TextField
              fullWidth
              label={campo.toString().replace(/_/g, ' ')}
              type={tipo as string}
              value={value}
              onChange={handleChange(key)}
              disabled={transporteInhabilitado}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        );
      })}

      {/* 🔹 PRECIOS */}
      <Grid item xs={12}>
        <Typography variant="subtitle1">Precios</Typography>
      </Grid>

      {tiposPrecio.flatMap((tipo) =>
        subCampos.map((campo) => {
          const key = `${tipo}_${campo}` as keyof Salida;
          return (
            <Grid item xs={3} key={key}>
              <TextField
                fullWidth
                type="number"
                label={`${tipo} ${campo}`}
                value={salida[key] ?? ''}
                onChange={handleChange(key)}
                inputProps={{ step: 'any', inputMode: 'decimal' }}
              />
            </Grid>
          );
        })
      )}
    </Grid>
  );
}
