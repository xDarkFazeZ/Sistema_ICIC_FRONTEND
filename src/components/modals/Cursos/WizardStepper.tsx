/**
 * WizardStepper.tsx
 * Barra de progreso visual del wizard. Sin lógica de negocio.
 */

import type { WizardPaso } from "../../../types/cursoCerrado.types";

const PASOS = [
  { n: 1 as WizardPaso, label: "Datos del curso" },
  { n: 2 as WizardPaso, label: "Empresa"          },
  { n: 3 as WizardPaso, label: "Confirmar"         },
  { n: 4 as WizardPaso, label: "Participantes"     },
] as const;

interface WizardStepperProps {
  pasoActual: WizardPaso;
}

export default function WizardStepper({ pasoActual }: WizardStepperProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {PASOS.map(({ n, label }) => (
        <div key={n} className="flex items-center gap-2 flex-1">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
              pasoActual === n
                ? "bg-danger text-white shadow-lg shadow-danger/40"
                : pasoActual > n
                  ? "bg-success text-white"
                  : "bg-default-200 text-default-500"
            }`}
          >
            {pasoActual > n ? "✓" : n}
          </div>

          <span
            className={`text-xs font-medium hidden sm:inline ${
              pasoActual === n
                ? "text-danger"
                : pasoActual > n
                  ? "text-success"
                  : "text-default-400"
            }`}
          >
            {label}
          </span>

          {n < 4 && (
            <div
              className={`h-0.5 flex-1 rounded-full ${
                pasoActual > n ? "bg-success" : "bg-default-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}