/**
 * Paso3Confirmacion.tsx
 */

import { Button, Card, CardBody } from "@heroui/react";
import {
  AcademicCapIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

import type {
  CursoCerradoForm,
  EmpresaResumen,
  InstructorResumen,
} from "../../../types/cursoCerrado.types";

type TipoCurso = "ABIERTO" | "CERRADO";

interface Paso3Props {
  tipoCurso: TipoCurso;
  form: CursoCerradoForm;
  empresaSel: EmpresaResumen | null;
  instructorSel: InstructorResumen | null;
  precioPorP: number;
  numP: number;
  costoTotal: number;
  isLoading: boolean;
  isEditMode: boolean;
  onSubmit: () => void;
  onAnterior: () => void;
}

function ResumenFila({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <span className="text-default-400 text-xs">{label}: </span>
      <span className="font-medium text-default-800">{value}</span>
    </div>
  );
}

export default function Paso3Confirmacion({
  tipoCurso,
  form,
  empresaSel,
  instructorSel,
  precioPorP,
  numP,
  costoTotal,
  isLoading,
  isEditMode,
  onSubmit,
  onAnterior,
}: Paso3Props) {
  const esAbierto = tipoCurso === "ABIERTO";
  const esCerrado = tipoCurso === "CERRADO";

  return (
    <div className="space-y-6">
      {/* Resumen del curso */}
      <Card className="bg-default-50 border border-default-200">
        <CardBody className="space-y-4">
          <div className="flex items-center gap-2">
            <AcademicCapIcon className="w-5 h-5 text-danger" />
            <h3 className="font-semibold text-default-800">
              Resumen del curso
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
            <ResumenFila label="Nombre" value={form.nombre || "—"} />

            {esCerrado && (
              <ResumenFila
                label="Empresa"
                value={empresaSel?.nombre ?? "—"}
              />
            )}

            <ResumenFila label="Horario" value={form.horario || "—"} />

            <ResumenFila
              label="Periodo"
              value={`${form.fechaInicio || "—"}  →  ${form.fechaFin || "—"}`}
            />

            <ResumenFila label="Aula" value={form.aula || "—"} />

            <ResumenFila
              label="Nivel"
              value={form.nivelGerencial || "—"}
            />

            {form.duracion && (
              <ResumenFila
                label="Duración"
                value={`${form.duracion} hrs`}
              />
            )}

            {instructorSel && (
              <ResumenFila
                label="Instructor"
                value={`${instructorSel.nombre} ${instructorSel.apellidoPaterno}`}
              />
            )}
          </div>
        </CardBody>
      </Card>

      {/* Resumen de costo: SOLO curso cerrado */}
      {esCerrado && (
        <Card className="border-2 border-danger/20 bg-gradient-to-br from-danger/5 to-danger/10">
          <CardBody className="space-y-4 py-5">
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-danger" />
              <h3 className="font-semibold text-default-800">
                Resumen de costo
              </h3>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-white/60 rounded-xl border border-danger/10">
              <div className="space-y-1">
                <p className="text-xs text-default-500">
                  Precio / participante
                </p>
                <p className="text-xl font-bold text-default-800">
                  ${precioPorP.toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              <span className="text-2xl text-default-300 font-light">
                ×
              </span>

              <div className="space-y-1 text-center">
                <p className="text-xs text-default-500">Participantes</p>
                <p className="text-xl font-bold text-default-800">
                  {numP}
                </p>
              </div>

              <span className="text-2xl text-default-300 font-light">
                =
              </span>

              <div className="space-y-1 text-right">
                <p className="text-xs text-default-500">
                  Total del curso
                </p>
                <p className="text-2xl font-bold text-danger">
                  ${costoTotal.toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            <p className="text-xs text-default-400 text-center">
              El pago individual de cada participante se captura en su inscripción.
            </p>
          </CardBody>
        </Card>
      )}

      {/* Mensaje para curso abierto */}
      {esAbierto && (
        <Card className="border border-primary-200 bg-primary-50">
          <CardBody className="py-4 px-5">
            <p className="text-sm font-medium text-primary-700">
              Al crear el curso abierto podrás comenzar a registrar participantes de forma individual.
            </p>
            <p className="text-xs text-primary-600 mt-1">
              Este curso no se asigna a una empresa específica.
            </p>
          </CardBody>
        </Card>
      )}

      {/* Footer */}
      <div className="flex justify-between gap-3 pt-4 border-t border-default-200">
        <Button variant="flat" size="lg" onPress={onAnterior}>
          ← Anterior
        </Button>

        <Button
          color="danger"
          size="lg"
          isLoading={isLoading}
          onPress={onSubmit}
          startContent={
            !isLoading && <AcademicCapIcon className="w-5 h-5" />
          }
        >
          {isEditMode
            ? "Guardar y continuar"
            : esAbierto
              ? "Crear Curso Abierto"
              : "Crear Curso Cerrado"}
        </Button>
      </div>
    </div>
  );
}