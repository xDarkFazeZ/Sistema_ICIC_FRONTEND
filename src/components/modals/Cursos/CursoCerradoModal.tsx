/**
 * CursoCerradoModal.tsx
 *
 * Solo renderiza. Cero lógica de negocio.
 * Toda la lógica vive en useCursoCerradoWizard.
 */

import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { Chip } from "@heroui/react";

import ModalForm from "../../common/modalForm";
import InstructorModal from "../Instructor/instructorModal";
import EmpresaModal from "../Empresa/empresaModal";
import { EmpresaModalProvider } from "../Empresa/EmpresaModalContext";

import WizardStepper from "./WizardStepper";
import Paso1DatosCurso from "../../reutilizable/pasos/Paso1DatosCurso";
import Paso2Empresa from "../../reutilizable/pasos/Paso2Empresa";
import Paso3Confirmacion from "../../reutilizable/pasos/Paso3Confirmacion";
import Paso4Participantes from "../../reutilizable/pasos/Paso4Participantes";

import { useCursoCerradoWizard } from "../../../hooks/useCursoCerradoWizard";

import type {
  CursoCerradoDetalle,
  CursoCerradoPayload,
} from "../../../types/cursoCerrado.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CursoCerradoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCursoCreado: (payload: CursoCerradoPayload) => Promise<CursoCerradoDetalle>;
  isLoading?: boolean;
  cursoToEdit?: CursoCerradoDetalle;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CursoCerradoModal({
  isOpen,
  onClose,
  onCursoCreado,
  isLoading = false,
  cursoToEdit,
}: CursoCerradoModalProps) {
  const w = useCursoCerradoWizard({
    isOpen,
    onClose,
    onCursoCreado,
    cursoToEdit,
  });

  // ─── Título dinámico ──────────────────────────────────────────────────────

  const titulo = w.isEditMode
    ? "Editar Curso Cerrado"
    : w.paso <= 3
      ? "Nuevo Curso Cerrado"
      : "Registrar Participantes";

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <ModalForm
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2">
            <AcademicCapIcon className="w-6 h-6 text-danger" />

            <span>{titulo}</span>

            <Chip
              size="sm"
              variant="flat"
              color={w.paso <= 3 ? "warning" : "success"}
              className="ml-2"
            >
              Paso {w.paso} de 4
            </Chip>
          </div>
        }
        size="3xl"
        isLoading={isLoading}
        hideFooter
        hideCloseButton={w.paso === 4 && !w.isEditMode}
      >
        {/* ── Barra de progreso ─────────────────────────────────────────── */}
        <WizardStepper pasoActual={w.paso} />

        {/* ── Paso 1: datos básicos + precios + instructor ─────────────── */}
        {w.paso === 1 && (
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
          />
        )}

        {/* ── Paso 2: empresa ──────────────────────────────────────────── */}
        {w.paso === 2 && (
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

        {/* ── Paso 3: confirmación + submit ────────────────────────────── */}
        {w.paso === 3 && (
          <Paso3Confirmacion
            tipoCurso="CERRADO"
            form={w.form}
            empresaSel={w.empresaSel}
            instructorSel={w.instructorSel}
            precioPorP={w.precioPorP}
            numP={w.numP}
            costoTotal={w.costoTotal}
            isLoading={isLoading}
            isEditMode={w.isEditMode}
            onSubmit={w.handleSubmitCurso}
            onAnterior={w.handleAnterior}
          />
        )}

        {/* ── Paso 4: alta de participantes ────────────────────────────── */}
        {w.paso === 4 && (
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

      {/* ── Modal: crear instructor ───────────────────────────────────────── */}
      <InstructorModal
        isOpen={w.modalInstructorOpen}
        onClose={() => {
          w.setModalInstructorOpen(false);

          // Si se cierra sin seleccionar, revertir modo
          if (!w.form.instructorId) {
            w.handleInstructorModeChange("despues");
          }
        }}
        onSuccess={w.selectInstructor}
      />

      {/* ── Modal: crear empresa ─────────────────────────────────────────── */}
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
    </>
  );
}