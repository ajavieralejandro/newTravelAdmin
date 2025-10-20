'use client';
import { Box, OutlinedInput, Typography } from "@mui/material";
import { forwardRef } from "react";

interface SelectorColorCampoProps {
  label: string;
  descripcion?: string;
  error?: boolean;
  helperText?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  [x: string]: any;
}

const SelectorColorCampo = forwardRef<HTMLInputElement, SelectorColorCampoProps>(
  (
    {
      label,
      descripcion,
      error = false,
      helperText,
      value = "#000000",
      onChange,
      ...rest
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
    };

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          mb: 4,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>

        {descripcion && (
          <Typography variant="caption" color="text.secondary">
            {descripcion}
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <input
            type="color"
            value={value}
            onChange={handleChange}
            ref={ref}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              transition: "transform 0.2s",
            }}
            {...rest}
          />
          <OutlinedInput
            value={value}
            onChange={handleChange}
            sx={{
              maxWidth: 140,
              fontSize: "0.9rem",
              "& input": {
                padding: "10px",
              },
            }}
            inputProps={{
              'aria-label': `Valor hexadecimal para ${label}`,
            }}
          />
        </Box>

        {helperText && (
          <Typography variant="caption" color={error ? "error" : "text.secondary"}>
            {helperText}
          </Typography>
        )}
      </Box>
    );
  }
);

SelectorColorCampo.displayName = "SelectorColorCampo";

export default SelectorColorCampo;

