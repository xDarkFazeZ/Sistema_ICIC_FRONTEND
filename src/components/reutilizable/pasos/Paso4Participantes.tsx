/**
 * Paso4Participantes.tsx
 */

import {
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Input,
  Progress,
  Switch,
} from "@heroui/react";

import {
  AcademicCapIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

import type {
  CursoCerradoForm,
  EmpresaResumen,
  ParticipanteNuevoForm,
  ParticipanteResumen,
} from "../../../types/cursoCerrado.types";

type TipoCurso = "ABIERTO" | "CERRADO";

interface Paso4Props {
  tipoCurso: TipoCurso;
  form: CursoCerradoForm;
  empresaSel: EmpresaResumen | null;
  participanteForm: ParticipanteNuevoForm;
  participanteErrors: Record<string, string>;
  participantesRegistrados: number;
  participantesLista: ParticipanteResumen[];
  numP: number;
  precioPorP: number;
  isSubmitting: boolean;
  isEditMode: boolean;
  onChangeParticipante: <K extends keyof ParticipanteNuevoForm>(
    field: K,
    value: ParticipanteNuevoForm[K],
  ) => void;
  onRegistrar: () => void;
  onTerminarDespues: () => void;
  onClose: () => void;
}

export default function Paso4Participantes({
  tipoCurso,
  form,
  empresaSel,
  participanteForm,
  participanteErrors,
  participantesRegistrados,
  participantesLista,
  numP,
  isSubmitting,
  isEditMode,
  onChangeParticipante,
  onRegistrar,
  onTerminarDespues,
  onClose,
}: Paso4Props) {
  const esAbierto = tipoCurso === "ABIERTO";
  const esCerrado = tipoCurso === "CERRADO";

  const completo = esCerrado && participantesRegistrados >= numP;

  const participantesRestantes = Math.max(numP - participantesRegistrados, 0);

  return (
    <div className="space-y-5">
      {/* Banner: Curso + Empresa solo si es cerrado */}
      <Card className="border-2 border-success-200 bg-gradient-to-r from-success-50 to-emerald-50">
        <CardBody className="py-4 px-5 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-success-600" />
            <p className="text-sm font-bold text-success-700">
              {isEditMode
                ? esAbierto
                  ? "Curso abierto"
                  : "Curso cerrado"
                : esAbierto
                  ? "Curso abierto creado exitosamente"
                  : "Curso cerrado creado exitosamente"}
            </p>
          </div>

          <Divider className="bg-success-200" />

          <div
            className={
              esCerrado
                ? "grid grid-cols-2 gap-3"
                : "grid grid-cols-1 gap-3"
            }
          >
            <InfoCard
              icon={<AcademicCapIcon className="w-4 h-4 text-success-500" />}
              label="Curso"
              value={form.nombre}
            />

            {esCerrado && (
              <InfoCard
                icon={
                  <BuildingOffice2Icon className="w-4 h-4 text-success-500" />
                }
                label="Empresa"
                value={empresaSel?.nombre ?? "—"}
              />
            )}
          </div>

          {esAbierto && (
            <p className="text-xs text-success-700">
              Ahora puedes registrar participantes de forma individual.
            </p>
          )}
        </CardBody>
      </Card>

      {/* Contador de progreso: SOLO curso cerrado */}
      {esCerrado && (
        <Card
          className={`border-2 transition-all duration-300 ${
            completo
              ? "border-success-300 bg-success-50"
              : "border-primary-200 bg-gradient-to-r from-primary-50 to-blue-50"
          }`}
        >
          <CardBody className="py-4 px-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-primary-600" />
                <p className="text-sm font-bold text-default-700">
                  Progreso de registro
                </p>
              </div>

              <Chip
                size="lg"
                variant="flat"
                color={completo ? "success" : "primary"}
                className="font-bold"
              >
                {participantesRegistrados} / {numP}
              </Chip>
            </div>

            <Progress
              value={numP > 0 ? (participantesRegistrados / numP) * 100 : 0}
              color={completo ? "success" : "primary"}
              size="md"
              className="w-full"
            />

            <p className="text-xs text-default-500 text-center">
              {completo
                ? "¡Todos los participantes han sido registrados!"
                : `Faltan ${participantesRestantes} participante${
                    participantesRestantes !== 1 ? "s" : ""
                  } por registrar`}
            </p>
          </CardBody>
        </Card>
      )}

      {/* Formulario de nuevo participante */}
      {(!completo || esAbierto) && (
        <Card className="border border-default-200">
          <CardBody className="space-y-4 py-5 px-5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary-100 rounded-lg">
                <UserIcon className="w-4 h-4 text-primary-600" />
              </div>

              <h3 className="text-sm font-bold text-default-800">
                {esAbierto
                  ? "Nuevo participante"
                  : `Participante #${participantesRegistrados + 1}`}
              </h3>

              {esCerrado && (
                <Chip
                  size="sm"
                  variant="flat"
                  color="default"
                  className="ml-auto"
                >
                  {participantesRestantes} restante
                  {participantesRestantes !== 1 ? "s" : ""}
                </Chip>
              )}

              {esAbierto && (
                <Chip
                  size="sm"
                  variant="flat"
                  color="primary"
                  className="ml-auto"
                >
                  Curso abierto
                </Chip>
              )}
            </div>

            <Divider />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre(s)"
                isRequired
                size="lg"
                autoFocus
                value={participanteForm.nombre}
                onValueChange={(v) => onChangeParticipante("nombre", v)}
                isInvalid={!!participanteErrors.nombre}
                errorMessage={participanteErrors.nombre}
                placeholder="Ej: Juan Carlos"
              />

              <Input
                label="Apellido Paterno"
                isRequired
                size="lg"
                value={participanteForm.apellidoPaterno}
                onValueChange={(v) =>
                  onChangeParticipante("apellidoPaterno", v)
                }
                isInvalid={!!participanteErrors.apellidoPaterno}
                errorMessage={participanteErrors.apellidoPaterno}
                placeholder="Ej: García"
              />

              <Input
                label="Apellido Materno"
                size="lg"
                value={participanteForm.apellidoMaterno}
                onValueChange={(v) =>
                  onChangeParticipante("apellidoMaterno", v)
                }
                placeholder="Ej: López"
              />

              <Input
                type="date"
                label="Fecha de nacimiento"
                isRequired
                size="lg"
                value={participanteForm.fechaNacimiento}
                onChange={(e) =>
                  onChangeParticipante("fechaNacimiento", e.target.value)
                }
                isInvalid={!!participanteErrors.fechaNacimiento}
                errorMessage={participanteErrors.fechaNacimiento}
              />

              <Input
                label="Correo electrónico"
                size="lg"
                type="email"
                value={participanteForm.correo}
                onValueChange={(v) => onChangeParticipante("correo", v)}
                placeholder="correo@ejemplo.com"
              />

              <Input
                label="Celular"
                size="lg"
                value={participanteForm.celular}
                onValueChange={(v) => onChangeParticipante("celular", v)}
                placeholder="614 123 4567"
              />

              <div className="flex items-center">
                <Switch
                  isSelected={participanteForm.esAfiliado}
                  onValueChange={(v) =>
                    onChangeParticipante("esAfiliado", v)
                  }
                  color="success"
                  size="lg"
                >
                  <span className="text-sm font-medium">
                    {participanteForm.esAfiliado
                      ? "Afiliado"
                      : "No afiliado"}
                  </span>
                </Switch>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Lista de participantes ya registrados */}
      {participantesLista.length > 0 && (
        <Card className="border border-default-200">
          <CardBody className="py-3 px-5">
            <p className="text-xs font-semibold text-default-500 uppercase tracking-wide mb-2">
              Participantes registrados
            </p>

            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {participantesLista.map((p, i) => (
                <div
                  key={p.id ?? i}
                  className="flex items-center gap-2 text-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-success-100 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-success-600">
                      {i + 1}
                    </span>
                  </div>

                  <span className="text-default-700">
                    {p.nombre} {p.apellidoPaterno}{" "}
                    {p.apellidoMaterno ?? ""}
                  </span>

                  {p.esAfiliado && (
                    <Chip
                      size="sm"
                      color="success"
                      variant="flat"
                      className="ml-auto"
                    >
                      Afiliado
                    </Chip>
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Footer */}
      <div className="flex justify-between gap-3 pt-4 border-t border-default-200">
        {completo ? (
          <Button
            color="success"
            size="lg"
            className="w-full"
            onPress={onClose}
            startContent={<CheckCircleIcon className="w-5 h-5" />}
          >
            Finalizar
          </Button>
        ) : (
          <>
            <Button
              variant="flat"
              size="lg"
              color="warning"
              onPress={onTerminarDespues}
            >
              {esAbierto ? "Finalizar" : "Terminar después"}
            </Button>

            <Button
              color="primary"
              size="lg"
              isLoading={isSubmitting}
              onPress={onRegistrar}
              startContent={
                !isSubmitting && <UserPlusIcon className="w-5 h-5" />
              }
            >
              {esAbierto
                ? "Registrar participante"
                : `Registrar participante ${participantesRegistrados + 1}`}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Sub-componente local ─────────────────────────────────────────────────────

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-white/70 border border-success-100 p-3">
      <span className="mt-0.5 shrink-0">{icon}</span>

      <div className="min-w-0">
        <p className="text-[10px] text-default-400 font-medium uppercase tracking-wide">
          {label}
        </p>

        <p className="text-sm font-semibold text-default-800 leading-tight truncate">
          {value}
        </p>
      </div>
    </div>
  );
}