/**
 * CursoModal.tsx
 *
 * Modal unificado para crear y editar cursos (ABIERTO y CERRADO).
 * Usa Breadcrumbs de HeroUI como navegador de pasos.
 * Cero lógica de negocio — todo vive en useCursoWizard.
 */

import { useState } from "react";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import {
  Breadcrumbs,
  BreadcrumbItem,
  Chip,
  Card,
  CardBody,
} from "@heroui/react";
import { Globe, Building2 } from "lucide-react";

import ModalForm from "../../common/modalForm";
import InstructorModal from "../Instructor/instructorModal";
import EmpresaModal from "../Empresa/empresaModal";
import { EmpresaModalProvider } from "../Empresa/EmpresaModalContext";

// Este está en: src/components/modals/common/SiguientePasoModal.tsx
import SiguientePasoModal from "../../common/siguientePasoModal";

// Ajusta esta ruta si tu archivo está en otra carpeta
import ParticipanteModal from "../Participante/participanteModal";

import Paso1DatosCurso from "../../reutilizable/pasos/Paso1DatosCurso";
import Paso2Empresa from "../../reutilizable/pasos/Paso2Empresa";
import Paso3Confirmacion from "../../reutilizable/pasos/Paso3Confirmacion";
import Paso4Participantes from "../../reutilizable/pasos/Paso4Participantes";
import PasoPreciosCerrado from "../../reutilizable/pasos/PasoPreciosCerrado";
import PasoPreciosAbierto from "../../reutilizable/pasos/PasoPreciosAbierto";

import {
  useCursoWizard,
  type TipoCurso,
  type PasoId,
  type CursoPayload,
} from "../../../hooks/useCursoWizard";

import type {
  CursoCerradoDetalle,
} from "../../../types/cursoCerrado.types";

// ─── Tipos locales ────────────────────────────────────────────────────────────

type ParticipanteCreado = {
  id?: number;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string | null;
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface CursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCursoCreado?: (payload: CursoPayload) => Promise<CursoCerradoDetalle>;
  cursoToEdit?: CursoCerradoDetalle;
}

// ─── Paso 0: selección de tipo ────────────────────────────────────────────────

function PasoTipo({ onSelect }: { onSelect: (tipo: TipoCurso) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-default-500">
        Elige el tipo de curso antes de continuar.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* ABIERTO */}
        <Card
          isPressable
          onPress={() => onSelect("ABIERTO")}
          className="border-2 border-default-200 hover:border-danger hover:shadow-lg hover:shadow-danger/20 transition-all duration-200 hover:scale-[1.03] group"
        >
          <CardBody className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="p-3 rounded-full bg-primary-50 group-hover:bg-danger-50 transition-colors">
              <Globe className="w-7 h-7 text-primary-500 group-hover:text-danger transition-colors" />
            </div>

            <div>
              <p className="font-bold text-default-800 text-base">
                Abierto
              </p>
              <p className="text-xs text-default-400 mt-1 leading-snug">
                Inscripciones individuales, sin empresa asignada
              </p>
            </div>

            <div className="flex flex-col gap-1 mt-1 text-left w-full">
              {[
                "Múltiples empresas o público",
                "Precio por participante",
                "Inscripciones independientes",
              ].map((t) => (
                <p
                  key={t}
                  className="text-xs text-default-500 flex items-center gap-1"
                >
                  <span className="text-success">✓</span> {t}
                </p>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* CERRADO */}
        <Card
          isPressable
          onPress={() => onSelect("CERRADO")}
          className="border-2 border-default-200 hover:border-danger hover:shadow-lg hover:shadow-danger/20 transition-all duration-200 hover:scale-[1.03] group"
        >
          <CardBody className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="p-3 rounded-full bg-warning-50 group-hover:bg-danger-50 transition-colors">
              <Building2 className="w-7 h-7 text-warning-500 group-hover:text-danger transition-colors" />
            </div>

            <div>
              <p className="font-bold text-default-800 text-base">
                Cerrado
              </p>
              <p className="text-xs text-default-400 mt-1 leading-snug">
                Exclusivo para una empresa, con costo grupal
              </p>
            </div>

            <div className="flex flex-col gap-1 mt-1 text-left w-full">
              {[
                "Una empresa asignada",
                "Costo × participantes",
                "Participantes de la empresa",
              ].map((t) => (
                <p
                  key={t}
                  className="text-xs text-default-500 flex items-center gap-1"
                >
                  <span className="text-success">✓</span> {t}
                </p>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

// ─── Breadcrumbs del wizard ───────────────────────────────────────────────────

function WizardBreadcrumbs({
  pasos,
  pasoActual,
  pasosVisitados,
  onNavigate,
}: {
  pasos: Array<{ id: PasoId; label: string }>;
  pasoActual: PasoId;
  pasosVisitados: Set<PasoId>;
  onNavigate: (id: PasoId) => void;
}) {
  return (
    <div className="mb-5">
      <Breadcrumbs size="sm" classNames={{ list: "flex-wrap gap-y-2" }}>
        {pasos.map((paso) => {
          const esCurrent = paso.id === pasoActual;
          const esVisitado = pasosVisitados.has(paso.id) && !esCurrent;

          return (
            <BreadcrumbItem
              key={paso.id}
              isCurrent={esCurrent}
              onPress={esVisitado ? () => onNavigate(paso.id) : undefined}
              classNames={{
                item: [
                  "text-xs font-medium transition-colors",
                  esCurrent
                    ? "text-danger"
                    : esVisitado
                      ? "text-success cursor-pointer hover:text-success-600"
                      : "text-default-400 cursor-not-allowed pointer-events-none",
                ].join(" "),
                separator: "text-default-300",
              }}
            >
              {paso.label}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumbs>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CursoModal({
  isOpen,
  onClose,
  onCursoCreado,
  cursoToEdit,
}: CursoModalProps) {
  const [participanteModalOpen, setParticipanteModalOpen] = useState(false);

  const [cursoAbiertoCreado, setCursoAbiertoCreado] =
    useState<CursoCerradoDetalle | null>(null);

  const [siguientePasoOpen, setSiguientePasoOpen] = useState(false);

  const [ultimoParticipante, setUltimoParticipante] =
    useState<ParticipanteCreado | null>(null);

  const w = useCursoWizard({
    isOpen,
    onClose,
    onCursoCreado,
    cursoToEdit,
    onCursoAbiertoCreado: (curso) => {
      setCursoAbiertoCreado(curso);
      setParticipanteModalOpen(true);
    },
  });

  const hideClose = w.pasoActual === "participantes" && !w.isEditMode;

  const nombreUltimoParticipante = ultimoParticipante
    ? [
        ultimoParticipante.nombre,
        ultimoParticipante.apellidoPaterno,
        ultimoParticipante.apellidoMaterno,
      ]
        .filter(Boolean)
        .join(" ")
    : undefined;

  const finalizarRegistroAbierto = () => {
    setSiguientePasoOpen(false);
    setParticipanteModalOpen(false);
    setUltimoParticipante(null);
    setCursoAbiertoCreado(null);
  };

  return (
    <>
      <ModalForm
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2">
            <AcademicCapIcon className="w-6 h-6 text-danger" />

            <span>{w.tituloModal}</span>

            {w.tipoCurso && (
              <Chip
                size="sm"
                variant="flat"
                color={w.tipoCurso === "CERRADO" ? "warning" : "primary"}
                className="ml-2"
              >
                {w.tipoCurso === "CERRADO" ? "Cerrado" : "Abierto"}
              </Chip>
            )}
          </div>
        }
        size="3xl"
        isLoading={w.isSubmitting}
        hideFooter
        hideCloseButton={hideClose}
      >
        {/* Breadcrumbs — ocultar en el paso de selección de tipo */}
        {w.pasoActual !== "tipo" && (
          <WizardBreadcrumbs
            pasos={w.pasos}
            pasoActual={w.pasoActual}
            pasosVisitados={w.pasosVisitados}
            onNavigate={w.irA}
          />
        )}

        {/* ── Paso: selección de tipo ──────────────────────────────────── */}
        {w.pasoActual === "tipo" && (
          <PasoTipo onSelect={w.handleSelectTipo} />
        )}

        {/* ── Paso: datos del curso ────────────────────────────────────── */}
        {w.pasoActual === "datos" && (
          <Paso1DatosCurso
            form={w.form}
            errors={w.errors}
            dateRange={w.dateRange}
            preciosCerrado={w.preciosCerrado}
            costoTotal={w.costoTotal}
            numP={w.numP}
            precioPorP={w.precioPorP}
            instructorMode={w.instructorMode}
            instructorSearch={w.instructorSearch}
            instructores={w.instructores}
            loadingInst={w.loadingInst}
            instructorSel={w.instructorSel}
            onChangeForm={w.handleChange}
            onChangeDateRange={w.handleDateRangeChange}
            onChangePrecio={(field, value) =>
              w.setPreciosCerrado((p) => ({
                ...p,
                [field]: value,
              }))
            }
            onInstructorModeChange={w.handleInstructorModeChange}
            onInstructorSearchChange={w.setInstructorSearch}
            onInstructorSelect={(id) => {
              const found = w.instructores.find((i) => i.id === id);

              if (found) {
                w.selectInstructor(found);
              }
            }}
            onClearInstructor={w.clearInstructor}
            onOpenModalInstructor={() => w.setModalInstructorOpen(true)}
            onSiguiente={w.handleSiguiente}
            onClose={onClose}
            mostrarPrecios={false}
          />
        )}

        {/* ── Paso: precios cerrado ────────────────────────────────────── */}
        {w.pasoActual === "precios" && w.tipoCurso === "CERRADO" && (
          <PasoPreciosCerrado
            preciosCerrado={w.preciosCerrado}
            costoTotal={w.costoTotal}
            numP={w.numP}
            precioPorP={w.precioPorP}
            errors={w.errors}
            onChangePrecio={(field, value) =>
              w.setPreciosCerrado((p) => ({
                ...p,
                [field]: value,
              }))
            }
            onSiguiente={w.handleSiguiente}
            onAnterior={w.handleAnterior}
          />
        )}

        {/* ── Paso: precios abierto ────────────────────────────────────── */}
        {w.pasoActual === "precios" && w.tipoCurso === "ABIERTO" && (
          <PasoPreciosAbierto
            preciosAbierto={w.preciosAbierto}
            errors={w.errors}
            onChangePrecio={(field, value) =>
              w.setPreciosAbierto((p) => ({
                ...p,
                [field]: value,
              }))
            }
            onSiguiente={w.handleSiguiente}
            onAnterior={w.handleAnterior}
          />
        )}

        {/* ── Paso: empresa solo CERRADO ───────────────────────────────── */}
        {w.pasoActual === "empresa" && (
          <Paso2Empresa
            empresaMode={w.empresaMode}
            empresaSearch={w.empresaSearch}
            empresas={w.empresas}
            loadingEmp={w.loadingEmp}
            empresaSel={w.empresaSel}
            empresaErrors={w.empresaErrors}
            onModeChange={(mode) => {
              w.setEmpresaMode(mode);
              w.clearEmpresa();
            }}
            onSearchChange={w.setEmpresaSearch}
            onEmpresaSelect={(id) => {
              const found = w.empresas.find((e) => e.id === id);

              if (found) {
                w.selectEmpresa(found);
              }
            }}
            onClearEmpresa={w.clearEmpresa}
            onOpenModalEmpresa={() => w.setModalEmpresaOpen(true)}
            onSiguiente={w.handleSiguiente}
            onAnterior={w.handleAnterior}
          />
        )}

        {/* ── Paso: confirmación ───────────────────────────────────────── */}
        {w.pasoActual === "confirmacion" && w.tipoCurso && (
          <Paso3Confirmacion
            tipoCurso={w.tipoCurso}
            form={w.form}
            empresaSel={w.tipoCurso === "CERRADO" ? w.empresaSel : null}
            instructorSel={w.instructorSel}
            precioPorP={w.tipoCurso === "CERRADO" ? w.precioPorP : 0}
            numP={w.tipoCurso === "CERRADO" ? w.numP : 0}
            costoTotal={w.tipoCurso === "CERRADO" ? w.costoTotal : 0}
            isLoading={w.isSubmitting}
            isEditMode={w.isEditMode}
            onSubmit={w.handleSubmitCurso}
            onAnterior={w.handleAnterior}
          />
        )}

        {/* ── Paso: participantes solo CERRADO ─────────────────────────── */}
        {w.pasoActual === "participantes" && w.tipoCurso === "CERRADO" && (
          <Paso4Participantes
            tipoCurso="CERRADO"
            form={w.form}
            empresaSel={w.empresaSel}
            participanteForm={w.participanteForm}
            participanteErrors={w.participanteErrors}
            participantesRegistrados={w.participantesRegistrados}
            participantesLista={w.participantesLista}
            numP={w.numP}
            precioPorP={w.precioPorP}
            isSubmitting={w.isSubmittingParticipante}
            isEditMode={w.isEditMode}
            onChangeParticipante={w.handleParticipanteChange}
            onRegistrar={w.handleRegistrarParticipante}
            onTerminarDespues={w.handleTerminarDespues}
            onClose={onClose}
          />
        )}
      </ModalForm>

      {/* Modal anidado: instructor */}
      <InstructorModal
        isOpen={w.modalInstructorOpen}
        onClose={() => {
          w.setModalInstructorOpen(false);

          if (!w.form.instructorId) {
            w.handleInstructorModeChange("despues");
          }
        }}
        onSuccess={w.selectInstructor}
      />

      {/* Modal anidado: empresa */}
      <EmpresaModalProvider origen="curso">
        <EmpresaModal
          isOpen={w.modalEmpresaOpen}
          onClose={() => {
            w.setModalEmpresaOpen(false);

            if (!w.empresaSel) {
              w.setEmpresaMode("buscar");
            }
          }}
          onSuccess={(empresa) => {
            w.handleEmpresaCreada({
              ...empresa,
              saldoFecapDisponible: 0,
            });
          }}
        />
      </EmpresaModalProvider>

      {/* Modal de participante para curso ABIERTO */}
      <ParticipanteModal
        isOpen={participanteModalOpen}
        onClose={() => {
          setParticipanteModalOpen(false);
        }}
        cursoIdParaAsignar={cursoAbiertoCreado?.id ?? null}
        onSuccess={(participante) => {
          setParticipanteModalOpen(false);
          setUltimoParticipante(participante);
          setSiguientePasoOpen(true);
        }}
      />

      {/* Pregunta después de registrar participante en curso ABIERTO */}
      <SiguientePasoModal
        isOpen={siguientePasoOpen}
        onClose={() => {
          setSiguientePasoOpen(false);
        }}
        titulo="Participante registrado"
        subtitulo={nombreUltimoParticipante}
        opciones={[
          {
            label: "Registrar otro participante",
            descripcion: "Captura otro participante para este mismo curso abierto.",
            icono: <span className="text-white text-lg font-bold">+</span>,
            color: "from-primary-400 to-blue-500",
            onClick: () => {
              setUltimoParticipante(null);
              setParticipanteModalOpen(true);
            },
          },
          {
            label: "Finalizar registro",
            descripcion: "Cerrar el registro de participantes por ahora.",
            icono: <span className="text-white text-lg font-bold">✓</span>,
            color: "from-emerald-400 to-teal-500",
            onClick: finalizarRegistroAbierto,
          },
        ]}
      />
    </>
  );
}