/**
 * useCursoCerradoWizard.ts
 *
 * Contiene TODO el estado y la lógica del wizard de curso cerrado.
 * El componente CursoCerradoModal solo renderiza; este hook decide.
 */

import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { parseDate } from "@internationalized/date";
import { sileo } from "sileo";

import { buscarInstructores }           from "../services/instructorService";
import { buscarEmpresas }               from "../services/empresaService";
import { crearParticipante }            from "../services/participanteService";
import { crearInscripcionCursoCerrado } from "../services/inscripcionService";
import { actualizarCurso }              from "../services/cursoService";
import { apiClient }                    from "../services/api/client";
import { useCamposCurso }               from "./UseCamposCurso";

import type {
  CursoCerradoDetalle,
  CursoCerradoForm,
  CursoCerradoPayload,
  DateRangeValue,
  EmpresaMode,
  EmpresaResumen,
  InstructorMode,
  InstructorResumen,
  ParticipanteNuevoForm,
  ParticipanteResumen,
  PreciosCerradoForm,
  WizardPaso,
} from "../types/cursoCerrado.types";

// ─── Helpers de tipo ──────────────────────────────────────────────────────────

type ApiError = { response?: { data?: { message?: string } }; message?: string };

function getMensajeError(error: unknown): string {
  const err = error as ApiError;
  return err?.response?.data?.message ?? err?.message ?? "Error inesperado";
}

// ─── Valores iniciales ────────────────────────────────────────────────────────

const CURSO_INITIAL: CursoCerradoForm = {
  nombre:         "",
  descripcion:    "",
  duracion:       "",
  horario:        "",
  fechaInicio:    "",
  fechaFin:       "",
  aula:           "",
  nivelGerencial: "",
  activo:         true,
  instructorId:   null,
};

const PARTICIPANTE_INITIAL: ParticipanteNuevoForm = {
  nombre:          "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  fechaNacimiento: "",
  correo:          "",
  celular:         "",
  esAfiliado:      false,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface UseCursoCerradoWizardProps {
  isOpen:        boolean;
  onClose:       () => void;
  onCursoCreado: (payload: CursoCerradoPayload) => Promise<CursoCerradoDetalle>;
  cursoToEdit?:  CursoCerradoDetalle;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCursoCerradoWizard({
  isOpen,
  onClose,
  onCursoCreado,
  cursoToEdit,
}: UseCursoCerradoWizardProps) {

  const isEditMode = !!cursoToEdit;

  // ── Wizard ──────────────────────────────────────────────────────────────────
  const [paso, setPaso] = useState<WizardPaso>(1);

  // ── Formulario del curso ────────────────────────────────────────────────────
  const [form, setForm]           = useState<CursoCerradoForm>({ ...CURSO_INITIAL });
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [dateRange, setDateRange] = useState<DateRangeValue | null>(null);

  // ── Precios (delegado a useCamposCurso) ─────────────────────────────────────
  const {
    preciosCerrado,
    setPreciosCerrado,
    costoTotal,
    numP,
    precioPorP,
    resetPrecios,
    buildPreciosPayload,
    validatePrecios,
  } = useCamposCurso("CERRADO");

  // ── Instructor ──────────────────────────────────────────────────────────────
  const [instructorMode, setInstructorMode]           = useState<InstructorMode | null>(null);
  const [instructorSearch, setInstructorSearch]       = useState("");
  const [debouncedInstSearch]                         = useDebounce(instructorSearch, 400);
  const [instructores, setInstructores]               = useState<InstructorResumen[]>([]);
  const [loadingInst, setLoadingInst]                 = useState(false);
  const [instructorSel, setInstructorSel]             = useState<InstructorResumen | null>(null);
  const [modalInstructorOpen, setModalInstructorOpen] = useState(false);

  // ── Empresa ─────────────────────────────────────────────────────────────────
  const [empresaMode, setEmpresaMode]         = useState<EmpresaMode>("buscar");
  const [empresaSearch, setEmpresaSearch]     = useState("");
  const [debouncedEmpSearch]                  = useDebounce(empresaSearch, 400);
  const [empresas, setEmpresas]               = useState<EmpresaResumen[]>([]);
  const [loadingEmp, setLoadingEmp]           = useState(false);
  const [empresaSel, setEmpresaSel]           = useState<EmpresaResumen | null>(null);
  const [empresaErrors, setEmpresaErrors]     = useState<Record<string, string>>({});
  const [modalEmpresaOpen, setModalEmpresaOpen] = useState(false);

  // ── Participantes (paso 4) ───────────────────────────────────────────────────
  const [cursoCreado, setCursoCreado]                       = useState<CursoCerradoDetalle | null>(null);
  const [participanteForm, setParticipanteForm]             = useState<ParticipanteNuevoForm>({ ...PARTICIPANTE_INITIAL });
  const [participanteErrors, setParticipanteErrors]         = useState<Record<string, string>>({});
  const [participantesRegistrados, setParticipantesRegistrados] = useState(0);
  const [isSubmittingParticipante, setIsSubmittingParticipante] = useState(false);
  const [participantesLista, setParticipantesLista]         = useState<ParticipanteResumen[]>([]);

  // ─── Reset al cerrar ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (isOpen) return;

    setPaso(1);
    setForm({ ...CURSO_INITIAL });
    setErrors({});
    setDateRange(null);
    resetPrecios();
    setInstructorMode(null);
    setInstructorSearch("");
    setInstructores([]);
    setInstructorSel(null);
    setEmpresaMode("buscar");
    setEmpresaSearch("");
    setEmpresas([]);
    setEmpresaSel(null);
    setEmpresaErrors({});
    setCursoCreado(null);
    setParticipanteForm({ ...PARTICIPANTE_INITIAL });
    setParticipanteErrors({});
    setParticipantesRegistrados(0);
    setIsSubmittingParticipante(false);
    setParticipantesLista([]);
  }, [isOpen]); // resetPrecios es estable (useCallback en UseCamposCurso)

  // ─── Pre-carga en modo edición ────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen || !cursoToEdit) return;

    const fi = cursoToEdit.fechaInicio
      ? String(cursoToEdit.fechaInicio).split("T")[0]
      : "";
    const ff = cursoToEdit.fechaFin
      ? String(cursoToEdit.fechaFin).split("T")[0]
      : "";

    setForm({
      nombre:          cursoToEdit.nombre          ?? "",
      descripcion:     cursoToEdit.descripcion     ?? "",
      duracion:        cursoToEdit.duracion?.toString() ?? "",
      horario:         cursoToEdit.horario         ?? "",
      fechaInicio:     fi,
      fechaFin:        ff,
      aula:            cursoToEdit.aula            ?? "",
      nivelGerencial:  cursoToEdit.nivelGerencial  ?? "",
      activo:          cursoToEdit.activo          ?? true,
      instructorId:    cursoToEdit.instructorId    ?? null,
    });

    if (fi && ff) {
      try {
        setDateRange({ start: parseDate(fi), end: parseDate(ff) });
      } catch {
        // formato inválido — dejar vacío
      }
    }

    setInstructorMode(cursoToEdit.instructor ? "buscar" : "despues");
    if (cursoToEdit.instructor) setInstructorSel(cursoToEdit.instructor);
    if (cursoToEdit.empresa)    setEmpresaSel(cursoToEdit.empresa);

    const precio  = cursoToEdit.precioPublico ?? cursoToEdit.precioAfiliado ?? 0;
    const numPart = cursoToEdit.numParticipantes ?? cursoToEdit._count?.inscripciones ?? 1;

    setPreciosCerrado({
      precioPorParticipante: precio.toString(),
      numParticipantes:      numPart.toString(),
    });

    setCursoCreado(cursoToEdit);
    setPaso(1);

    apiClient
      .get<{ data: Array<{ participante: ParticipanteResumen }> }>(
        `/cursos/${cursoToEdit.id}/inscripciones`,
      )
      .then(({ data: res }) => {
        const participantes = (res.data ?? [])
          .map((insc) => insc.participante)
          .filter(Boolean);
        setParticipantesLista(participantes);
        setParticipantesRegistrados(participantes.length);
      })
      .catch(console.error);

  }, [isOpen, cursoToEdit]); // setPreciosCerrado es estable

  // ─── Búsqueda de instructores ─────────────────────────────────────────────────

  useEffect(() => {
    if (instructorMode !== "buscar" || debouncedInstSearch.length < 2) {
      setInstructores([]);
      return;
    }
    setLoadingInst(true);
    buscarInstructores(debouncedInstSearch)
      .then(setInstructores)
      .finally(() => setLoadingInst(false));
  }, [debouncedInstSearch, instructorMode]);

  // ─── Búsqueda de empresas ─────────────────────────────────────────────────────

  useEffect(() => {
    if (empresaMode !== "buscar" || debouncedEmpSearch.length < 2) {
      setEmpresas([]);
      return;
    }
    setLoadingEmp(true);
    buscarEmpresas(debouncedEmpSearch)
      .then(setEmpresas)
      .finally(() => setLoadingEmp(false));
  }, [debouncedEmpSearch, empresaMode]);

  // ─── Helpers de formulario ────────────────────────────────────────────────────

  const handleChange = (
    field: keyof CursoCerradoForm,
    value: CursoCerradoForm[keyof CursoCerradoForm],
  ) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleDateRangeChange = (range: DateRangeValue | null) => {
    setDateRange(range);
    const fi = range?.start ? range.start.toString() : "";
    const ff = range?.end   ? range.end.toString()   : "";
    setForm((p) => ({ ...p, fechaInicio: fi, fechaFin: ff }));
    setErrors((p) => ({ ...p, fechaInicio: "", fechaFin: "" }));
  };

  // ─── Helpers de instructor ────────────────────────────────────────────────────

  const selectInstructor = (instructor: InstructorResumen) => {
    handleChange("instructorId", instructor.id);
    setInstructorSel(instructor);
    setInstructorSearch(`${instructor.nombre} ${instructor.apellidoPaterno}`);
    setInstructores([instructor]);
    setInstructorMode("buscar");
    setModalInstructorOpen(false);
  };

  const clearInstructor = () => {
    handleChange("instructorId", null);
    setInstructorSel(null);
    setInstructorSearch("");
    setInstructores([]);
  };

  const handleInstructorModeChange = (mode: InstructorMode) => {
    if (mode === instructorMode && mode !== "crear") return;
    setInstructorMode(mode);
    if (mode !== "buscar") clearInstructor();
    if (mode === "crear") setModalInstructorOpen(true);
  };

  // ─── Helpers de empresa ───────────────────────────────────────────────────────

  const selectEmpresa = (empresa: EmpresaResumen) => {
    setEmpresaSel(empresa);
    setEmpresaErrors({});
  };

  const clearEmpresa = () => {
    setEmpresaSel(null);
    setEmpresaSearch("");
    setEmpresas([]);
  };

  const handleEmpresaCreada = (empresa: EmpresaResumen) => {
    setEmpresaSel(empresa);
    setEmpresaErrors({});
    setModalEmpresaOpen(false);
    sileo.success({ title: "Empresa asignada", description: empresa.nombre });
  };

  // ─── Validaciones ─────────────────────────────────────────────────────────────

  const validatePaso1 = (): boolean => {
    const e: Record<string, string> = {};

    if (!form.nombre || form.nombre.trim().length < 3)
      e.nombre = "Mínimo 3 caracteres";
    if (!form.aula)           e.aula           = "Aula requerida";
    if (!form.nivelGerencial) e.nivelGerencial = "Nivel requerido";
    if (!form.horario)        e.horario        = "Horario requerido";
    if (!form.fechaInicio)    e.fechaInicio    = "Fecha inicio requerida";
    if (!form.fechaFin)       e.fechaFin       = "Fecha fin requerida";
    if (form.fechaInicio && form.fechaFin && form.fechaFin < form.fechaInicio)
      e.fechaFin = "La fecha fin debe ser posterior a la fecha inicio";
    if (instructorMode === "buscar" && !form.instructorId)
      e.instructorId = "Selecciona un instructor";

    Object.assign(e, validatePrecios());

    if (Object.keys(e).length > 0) {
      setErrors(e);
      sileo.warning({ title: "Campos incompletos", description: "Revisa los campos marcados." });
      return false;
    }
    return true;
  };

  const validatePaso2 = (): boolean => {
    if (!empresaSel) {
      setEmpresaErrors({ empresa: "Debes seleccionar o crear una empresa" });
      sileo.warning({ title: "Empresa requerida" });
      return false;
    }
    setEmpresaErrors({});
    return true;
  };

  // ─── Navegación ───────────────────────────────────────────────────────────────

  const handleSiguiente = () => {
    if (paso === 1 && !validatePaso1()) return;
    if (paso === 2 && !validatePaso2()) return;
    setPaso((p) => (p + 1) as WizardPaso);
  };

  const handleAnterior = () => {
    setPaso((p) => (p - 1) as WizardPaso);
  };

  // ─── Submit del curso (paso 3) ────────────────────────────────────────────────

  const handleSubmitCurso = () => {
    const run = async () => {
      const payload: CursoCerradoPayload = {
        ...form,
        ...buildPreciosPayload(),
        tipoCurso:        "CERRADO",
        empresaId:        empresaSel!.id,
        duracion:         form.duracion ? Number(form.duracion) : undefined,
        instructorId:     instructorMode === "despues" ? null : form.instructorId,
        numParticipantes: numP,
      };

      try {
        if (isEditMode && cursoToEdit?.id) {
          // ── Modo edición ──────────────────────────────────────────────
          const actualizado = await actualizarCurso(cursoToEdit.id, payload);
          setCursoCreado(actualizado as CursoCerradoDetalle);
          sileo.success({ title: "Curso actualizado correctamente" });
        } else {
          // ── Modo creación ─────────────────────────────────────────────
          const nuevo = await onCursoCreado(payload);
          setCursoCreado(nuevo);
        }
        setPaso(4);
      } catch (error: unknown) {
        // ✅ FIX: antes la guarda era `if (!isEditMode) return` — silenciaba
        // el error en creación. Ahora siempre se muestra.
        sileo.error({
          title:       isEditMode ? "Error al actualizar" : "Error al crear el curso",
          description: getMensajeError(error),
        });
      }
    };

    void run();
  };

  // ─── Participante (paso 4) ────────────────────────────────────────────────────

  const validateParticipante = (): boolean => {
    const e: Record<string, string> = {};

    if (!participanteForm.nombre || participanteForm.nombre.trim().length < 2)
      e.nombre = "Nombre requerido (mín. 2 caracteres)";
    if (!participanteForm.apellidoPaterno || participanteForm.apellidoPaterno.trim().length < 2)
      e.apellidoPaterno = "Apellido paterno requerido (mín. 2 caracteres)";
    if (!participanteForm.fechaNacimiento)
      e.fechaNacimiento = "Fecha de nacimiento requerida";

    if (Object.keys(e).length > 0) {
      setParticipanteErrors(e);
      sileo.warning({ title: "Campos incompletos", description: "Revisa los campos marcados." });
      return false;
    }
    return true;
  };

  const handleParticipanteChange = <K extends keyof ParticipanteNuevoForm>(
    field: K,
    value: ParticipanteNuevoForm[K],
  ) => {
    setParticipanteForm((p) => ({ ...p, [field]: value }));
    if (participanteErrors[field])
      setParticipanteErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleRegistrarParticipante = () => {
    const run = async () => {
      if (!validateParticipante()) return;
      setIsSubmittingParticipante(true);

      try {
        const participantePayload: Record<string, unknown> = {
          nombre:          participanteForm.nombre.trim(),
          apellidoPaterno: participanteForm.apellidoPaterno.trim(),
          fechaNacimiento: participanteForm.fechaNacimiento,
          esAfiliado:      participanteForm.esAfiliado,
          empresaId:       empresaSel!.id,
        };

        if (participanteForm.apellidoMaterno?.trim())
          participantePayload.apellidoMaterno = participanteForm.apellidoMaterno.trim();
        if (participanteForm.correo?.trim())
          participantePayload.correo = participanteForm.correo.trim();
        if (participanteForm.celular?.trim())
          participantePayload.celular = participanteForm.celular.trim();

        const respParticipante = await crearParticipante(participantePayload);
        const participante: ParticipanteResumen = respParticipante?.data ?? respParticipante;

        await crearInscripcionCursoCerrado({
          participanteId:     participante.id,
          cursoId:            cursoCreado?.id,
          tipoPrecioAplicado: participante.esAfiliado ? "AFILIADO" : "PUBLICO_GENERAL",
          metodoPago:         "EFECTIVO",
          montoEsperado:      precioPorP,
          montoFinal:         precioPorP,
          montoDescuento:     0,
          estadoPago:         "PAGADO",
          montoPagado:        precioPorP,
          notas:              "",
        });

        const nuevo = participantesRegistrados + 1;
        setParticipantesRegistrados(nuevo);
        setParticipantesLista((prev) => [...prev, participante]);
        setParticipanteForm({ ...PARTICIPANTE_INITIAL });
        setParticipanteErrors({});

        if (nuevo >= numP) {
          sileo.success({
            title:       "¡Carga completa!",
            description: `Se registraron ${numP} participantes para el curso.`,
          });
          onClose();
        } else {
          sileo.success({
            title:       `Participante ${nuevo} de ${numP} registrado`,
            description: `${participante.nombre} ${participante.apellidoPaterno}`,
          });
        }
      } catch (error: unknown) {
        sileo.error({
          title:       "Error al registrar participante",
          description: getMensajeError(error),
        });
      } finally {
        setIsSubmittingParticipante(false);
      }
    };

    void run();
  };

  const handleTerminarDespues = () => {
    sileo.warning({
      title:       "Registro incompleto",
      description: `Faltan ${numP - participantesRegistrados} participantes. Puedes continuar después desde el detalle del curso.`,
    });
    onClose();
  };

  // ─── Return ───────────────────────────────────────────────────────────────────

  return {
    // Meta
    isEditMode,

    // Wizard
    paso,
    setPaso,
    handleSiguiente,
    handleAnterior,

    // Curso
    form,
    errors,
    dateRange,
    handleChange,
    handleDateRangeChange,
    handleSubmitCurso,

    // Precios
    preciosCerrado,
    setPreciosCerrado,
    costoTotal,
    numP,
    precioPorP,

    // Instructor
    instructorMode,
    instructorSearch,
    setInstructorSearch,
    instructores,
    loadingInst,
    instructorSel,
    modalInstructorOpen,
    setModalInstructorOpen,
    handleInstructorModeChange,
    selectInstructor,
    clearInstructor,

    // Empresa
    empresaMode,
    setEmpresaMode,
    empresaSearch,
    setEmpresaSearch,
    empresas,
    loadingEmp,
    empresaSel,
    empresaErrors,
    modalEmpresaOpen,
    setModalEmpresaOpen,
    selectEmpresa,
    clearEmpresa,
    handleEmpresaCreada,

    // Paso 4
    cursoCreado,
    participanteForm,
    participanteErrors,
    participantesRegistrados,
    isSubmittingParticipante,
    participantesLista,
    handleParticipanteChange,
    handleRegistrarParticipante,
    handleTerminarDespues,
  } as const;
}