import { Button, Input } from "@heroui/react";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import type { PreciosAbierto } from "../../../hooks/UseCamposCurso";

interface PasoPreciosAbiertoProps {
  preciosAbierto: PreciosAbierto;
  errors:         Record<string, string>;
  onChangePrecio: (field: keyof PreciosAbierto, value: string) => void;
  onSiguiente:    () => void;
  onAnterior:     () => void;
}

export default function PasoPreciosAbierto({
  preciosAbierto,
  errors,
  onChangePrecio,
  onSiguiente,
  onAnterior,
}: PasoPreciosAbiertoProps) {
  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="flex items-center gap-2">
        <CurrencyDollarIcon className="w-5 h-5 text-danger" />
        <h3 className="text-lg font-semibold text-default-800">
          Precios del curso abierto
        </h3>
      </div>

      <p className="text-sm text-default-500">
        Define el precio para cada tipo de participante. El precio de afiliado
        debe ser menor o igual al precio público.
      </p>

      <div className="grid grid-cols-1 gap-4">
        <Input
          type="number"
          label="Precio Afiliado"
          isRequired
          size="lg"
          value={preciosAbierto.precioAfiliado}
          onValueChange={(v) => onChangePrecio("precioAfiliado", v)}
          isInvalid={!!errors.precioAfiliado}
          errorMessage={errors.precioAfiliado}
          startContent={<span className="text-default-400 text-sm font-medium">$</span>}
          min={0}
          placeholder="800"
          description="Precio especial para participantes afiliados"
        />
        <Input
          type="number"
          label="Precio Público General"
          isRequired
          size="lg"
          value={preciosAbierto.precioPublico}
          onValueChange={(v) => onChangePrecio("precioPublico", v)}
          isInvalid={!!errors.precioPublico}
          errorMessage={errors.precioPublico}
          startContent={<span className="text-default-400 text-sm font-medium">$</span>}
          min={0}
          placeholder="1,200"
          description="Precio estándar para el público en general"
        />
        <Input
          type="number"
          label="Precio Estudiante"
          isRequired
          size="lg"
          value={preciosAbierto.precioEstudiante}
          onValueChange={(v) => onChangePrecio("precioEstudiante", v)}
          isInvalid={!!errors.precioEstudiante}
          errorMessage={errors.precioEstudiante}
          startContent={<span className="text-default-400 text-sm font-medium">$</span>}
          min={0}
          placeholder="600"
          description="Precio reducido para estudiantes"
        />
      </div>

      {/* Resumen visual de los tres precios */}
      {(preciosAbierto.precioAfiliado || preciosAbierto.precioPublico || preciosAbierto.precioEstudiante) && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Afiliado",  valor: preciosAbierto.precioAfiliado,   color: "text-success-600" },
            { label: "Público",   valor: preciosAbierto.precioPublico,    color: "text-primary-600" },
            { label: "Estudiante",valor: preciosAbierto.precioEstudiante, color: "text-warning-600" },
          ].map(({ label, valor, color }) => (
            <div
              key={label}
              className="rounded-xl border border-default-200 bg-default-50 p-3 text-center"
            >
              <p className="text-xs text-default-400 font-medium">{label}</p>
              <p className={`text-lg font-bold mt-0.5 ${color}`}>
                {valor
                  ? `$${Number(valor).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
                  : "—"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Footer de navegación */}
      <div className="flex justify-between gap-3 pt-4 border-t border-default-200">
        <Button variant="flat" size="lg" onPress={onAnterior}>
          ← Anterior
        </Button>
        <Button color="danger" size="lg" onPress={onSiguiente}>
          Siguiente: Confirmar →
        </Button>
      </div>
    </div>
  );
}