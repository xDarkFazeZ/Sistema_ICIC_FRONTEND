/**
 * PasoPreciosCerrado.tsx
 *
 * Paso independiente de precios para cursos CERRADOS.
 * Extraído de Paso1DatosCurso para que el wizard pueda renderizarlo
 * como un paso propio dentro del modal unificado.
 */

import { Button, Card, CardBody, Input } from "@heroui/react";
import { CalculatorIcon, CurrencyDollarIcon, UsersIcon } from "@heroicons/react/24/outline";
import type { PreciosCerradoForm } from "../../../types/cursoCerrado.types";

interface PasoPreciosCerradoProps {
  preciosCerrado: PreciosCerradoForm;
  costoTotal:     number;
  numP:           number;
  precioPorP:     number;
  errors:         Record<string, string>;
  onChangePrecio: (field: keyof PreciosCerradoForm, value: string) => void;
  onSiguiente:    () => void;
  onAnterior:     () => void;
}

export default function PasoPreciosCerrado({
  preciosCerrado,
  costoTotal,
  numP,
  precioPorP,
  errors,
  onChangePrecio,
  onSiguiente,
  onAnterior,
}: PasoPreciosCerradoProps) {
  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="flex items-center gap-2">
        <CurrencyDollarIcon className="w-5 h-5 text-danger" />
        <h3 className="text-lg font-semibold text-default-800">
          Costo del curso cerrado
        </h3>
      </div>

      {/* Campos */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="number"
          label="Precio por participante"
          isRequired
          size="lg"
          value={preciosCerrado.precioPorParticipante}
          onValueChange={(v) => onChangePrecio("precioPorParticipante", v)}
          isInvalid={!!errors.precioPorParticipante}
          errorMessage={errors.precioPorParticipante}
          startContent={<span className="text-default-400 text-sm font-medium">$</span>}
          min={0}
          placeholder="1,200"
          description="Monto que pagará cada participante"
        />
        <Input
          type="number"
          label="Número de participantes"
          isRequired
          size="lg"
          value={preciosCerrado.numParticipantes}
          onValueChange={(v) => onChangePrecio("numParticipantes", v)}
          isInvalid={!!errors.numParticipantes}
          errorMessage={errors.numParticipantes}
          startContent={<UsersIcon className="w-4 h-4 text-default-400" />}
          min={1}
          placeholder="20"
          description="Total de personas a inscribir"
        />
      </div>

      {/* Resumen calculado */}
      <Card
        className={`border-2 transition-all duration-300 ${
          costoTotal > 0
            ? "border-danger/30 bg-gradient-to-r from-danger/5 to-danger/10"
            : "border-default-200 bg-default-50"
        }`}
      >
        <CardBody className="flex flex-row items-center justify-between py-4 px-5">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${costoTotal > 0 ? "bg-danger/10" : "bg-default-100"}`}>
              <CalculatorIcon className={`w-5 h-5 ${costoTotal > 0 ? "text-danger" : "text-default-400"}`} />
            </div>
            <div>
              <p className="text-xs text-default-500">Cálculo automático</p>
              <p className="text-sm text-default-600 font-medium">
                {numP} participante{numP !== 1 ? "s" : ""}{" "}
                × ${precioPorP.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-default-400 mb-0.5">Total del curso</p>
            <p className={`text-2xl font-bold tabular-nums ${costoTotal > 0 ? "text-danger" : "text-default-300"}`}>
              ${costoTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </CardBody>
      </Card>

      <p className="text-xs text-default-400 text-center px-4">
        El pago individual de cada participante se captura en su inscripción.
        Este total es solo para referencia del contrato.
      </p>

      {/* Footer de navegación */}
      <div className="flex justify-between gap-3 pt-4 border-t border-default-200">
        <Button variant="flat" size="lg" onPress={onAnterior}>
          ← Anterior
        </Button>
        <Button
          color="danger"
          size="lg"
          onPress={onSiguiente}
          startContent={<UsersIcon className="w-5 h-5" />}
        >
          Siguiente: Empresa
        </Button>
      </div>
    </div>
  );
}