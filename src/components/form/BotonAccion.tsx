// src/componentes/BotonAccion.tsx
import { Button, ButtonProps } from "@mui/material";
import { ReactNode } from "react";

interface BotonAccionProps extends ButtonProps {
  icono?: ReactNode;
  label: string;
  onClickHooks?: (() => void | Promise<void>)[];
}
const BotonAccion = ({ icono, label, onClickHooks = [], ...props }: BotonAccionProps) => {
    const handleClick = async () => {
      for (const hook of onClickHooks) {
        await hook?.(); // por si hay async
      }
    };
  
    return (
      <Button
        startIcon={icono}
        onClick={handleClick}
        {...props}
      >
        {label}
      </Button>
    );
  };
  
  export default BotonAccion;
  
