/**
 * useCursoWizard.ts
 *
 * Hook unificado para el wizard de creación/edición de cursos
 * (ABIERTO y CERRADO) dentro de un solo modal.
 */

import { useEffect, useState, useCallback } from "react";
import { useDebounce } from "use-debounce";
import { parseDate } from "@internationalized/date";
import { sileo } from "sileo";

import { buscarInstructores } from "../services/instructorService";
import { buscarEmpresas } from "../services/empresaService";
import { crearParticipante } from "../services/participanteService";
import { crearInscripcionCursoCerrado } from "../services/inscripcionService";
import { actualizarCurso, crearCurso } from "../services/cursoService";
import { apiClient } from "../services/api/client";
import { useCamposCurso } from "./UseCamposCurso";

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
  TipoCurso,
} from "../types/cursoCerrado.types";

// ─── Tipos del wizard ─────────────────────────────────────────────────────────

export type { TipoCurso };

/**
 * Payload extendido que acepta ambos tipos de curso.
 */
export type CursoPayload = Omit<
  CursoCerradoPayload,
  "tipoCurso" | "empresaId" | "numParticipantes"
> & {
  tipoCurso: TipoCurso;
  empresaId?: number;
  numParticipantes?: number;
};

export type PasoId =
  | "tipo"
  | "datos"
  | "precios"
  | "empresa"
  | "confirmacion"
  | "participantes";

export interface PasoConfig {
  id: PasoId;
  label: string;
}

export function getPasos(
  tipoCurso: TipoCurso | null,
  isEditMode: boolean,
): PasoConfig[] {
  const pasos: PasoConfig[] = [];

  if (!isEditMode) {
    pasos.push({ id: "tipo", label: "Tipo" });
  }

  pasos.push({ id: "datos", label: "Datos" });
  pasos.push({ id: "precios", label: "Precios" });

  if (tipoCurso === "CERRADO") {
    pasos.push({ id: "empresa", label: "Empresa" });
    pasos.push({ id: "confirmacion", label: "Confirmar" });
    pasos.push({ id: "participantes", label: "Participantes" });
  } else {
    pasos.push({ id: "confirmacion", label: "Confirmar" });
  }

  return pasos;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface UseCursoWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCursoCreado?: (payload: CursoPayload) => Promise<CursoCerradoDetalle>;
  onCursoAbiertoCreado?: (curso: CursoCerradoDetalle) => void;
  cursoToEdit?: CursoCerradoDetalle;
}

// ─── Estado inicial ───────────────────────────────────────────────────────────

const CURSO_INITIAL: CursoCerradoForm = {
  nombre: "",
  descripcion: "",
  duracion: "",
  horario: "",
  fechaInicio: "",
  fechaFin: "",
  aula: "",
  nivelGerencial: "",
  activo: true,
  instructorId: null,
};

const PARTICIPANTE_INITIAL: ParticipanteNuevoForm = {
  nombre: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  fechaNacimiento: "",
  correo: "",
  celular: "",
  esAfiliado: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

function getMensajeError(error: unknown): string {
  const err = error as ApiError;
  return err?.response?.data?.message ?? err?.message ?? "Error inesperado";
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useCursoWizard({
  isOpen,
  onClose,
  onCursoCreado,
  onCursoAbiertoCreado,
  cursoToEdit,
}: UseCursoWizardProps) {
  const isEditMode = !!cursoToEdit;

  // ── Tipo de curso ────────────────────────────────────────────────────────────
  const [tipoCurso, setTipoCursoState] = useState<TipoCurso | null>(
    cursoToEdit ? cursoToEdit.tipoCurso : null,
  );

  // ── Navegación ───────────────────────────────────────────────────────────────
  const pasos = getPasos(tipoCurso, isEditMode);
  const primerPaso: PasoId = isEditMode ? "datos" : "tipo";

  const [pasoActual, setPasoActual] = useState<PasoId>(primerPaso);
  const [pasosVisitados, setPasosVisitados] = useState<Set<PasoId>>(
    new Set([primerPaso]),
  );

  // ── Formulario del curso ─────────────────────────────────────────────────────
  const [form, setForm] = useState<CursoCerradoForm>({ ...CURSO_INITIAL });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dateRange, setDateRange] = useState<DateRangeValue | null>(null);

  // ── Precios ──────────────────────────────────────────────────────────────────
  const camposCerrado = useCamposCurso("CERRADO");
  const camposAbierto = useCamposCurso("ABIERTO");

  const campos = tipoCurso === "ABIERTO" ? camposAbierto : camposCerrado;

  const {
    preciosCerrado,
    setPreciosCerrado,
    costoTotal,
    numP,
    precioPorP,
  } = camposCerrado;

  const {
    preciosAbierto,
    setPreciosAbierto,
  } = camposAbierto;

  // ── Instructor ───────────────────────────────────────────────────────────────
  const [instructorMode, setInstructorMode] =
    useState<InstructorMode | null>(null);
  const [instructorSearch, setInstructorSearch] = useState("");
  const [debouncedInstSearch] = useDebounce(instructorSearch, 400);
  const [instructores, setInstructores] =
    useState<InstructorResumen[]>([]);
  const [loadingInst, setLoadingInst] = useState(false);
  const [instructorSel, setInstructorSel] =
    useState<InstructorResumen | null>(null);
  const [modalInstructorOpen, setModalInstructorOpen] = useState(false);

  // ── Empresa solo CERRADO ────────────────────────────────────────────────────
  const [empresaMode, setEmpresaMode] = useState<EmpresaMode>("buscar");
  const [empresaSearch, setEmpresaSearch] = useState("");
  const [debouncedEmpSearch] = useDebounce(empresaSearch, 400);
  const [empresas, setEmpresas] = useState<EmpresaResumen[]>([]);
  const [loadingEmp, setLoadingEmp] = useState(false);
  const [empresaSel, setEmpresaSel] = useState<EmpresaResumen | null>(null);
  const [empresaErrors, setEmpresaErrors] = useState<Record<string, string>>({});
  const [modalEmpresaOpen, setModalEmpresaOpen] = useState(false);

  // ── Participantes solo CERRADO ──────────────────────────────────────────────
  const [cursoCreado, setCursoCreado] =
    useState<CursoCerradoDetalle | null>(null);
  const [participanteForm, setParticipanteForm] =
    useState<ParticipanteNuevoForm>({ ...PARTICIPANTE_INITIAL });
  const [participanteErrors, setParticipanteErrors] =
    useState<Record<string, string>>({});
  const [participantesRegistrados, setParticipantesRegistrados] = useState(0);
  const [isSubmittingParticipante, setIsSubmittingParticipante] =
    useState(false);
  const [participantesLista, setParticipantesLista] =
    useState<ParticipanteResumen[]>([]);

  // ── Loading general ──────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Reset completo ─────────────────────────────────────────────────────────

  const resetAll = useCallback(() => {
    const primer: PasoId = isEditMode ? "datos" : "tipo";

    setPasoActual(primer);
    setPasosVisitados(new Set([primer]));
    setTipoCursoState(cursoToEdit ? cursoToEdit.tipoCurso : null);

    setForm({ ...CURSO_INITIAL });
    setErrors({});
    setDateRange(null);

    camposCerrado.resetPrecios();
    camposAbierto.resetPrecios();

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

    setIsSubmitting(false);
  }, [isEditMode, cursoToEdit]);

  useEffect(() => {
    if (!isOpen) {
      resetAll();
    }
  }, [isOpen, resetAll]);

  // ─── Pre-carga en modo edición ──────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen || !cursoToEdit) return;

    const tipo = cursoToEdit.tipoCurso;

    setTipoCursoState(tipo);

    const fi = cursoToEdit.fechaInicio
      ? String(cursoToEdit.fechaInicio).split("T")[0]
      : "";

    const ff = cursoToEdit.fechaFin
      ? String(cursoToEdit.fechaFin).split("T")[0]
      : "";

    setForm({
      nombre: cursoToEdit.nombre ?? "",
      descripcion: cursoToEdit.descripcion ?? "",
      duracion: cursoToEdit.duracion?.toString() ?? "",
      horario: cursoToEdit.horario ?? "",
      fechaInicio: fi,
      fechaFin: ff,
      aula: cursoToEdit.aula ?? "",
      nivelGerencial: cursoToEdit.nivelGerencial ?? "",
      activo: cursoToEdit.activo ?? true,
      instructorId: cursoToEdit.instructorId ?? null,
    });

    if (fi && ff) {
      try {
        setDateRange({
          start: parseDate(fi),
          end: parseDate(ff),
        });
      } catch {
        // Formato inválido
      }
    }

    setInstructorMode(cursoToEdit.instructor ? "buscar" : "despues");

    if (cursoToEdit.instructor) {
      setInstructorSel(cursoToEdit.instructor);
    }

    if (cursoToEdit.empresa) {
      setEmpresaSel(cursoToEdit.empresa);
    }

    if (tipo === "CERRADO") {
      const precio =
        cursoToEdit.precioPublico ?? cursoToEdit.precioAfiliado ?? 0;

      const numPart =
        cursoToEdit.numParticipantes ??
        cursoToEdit._count?.inscripciones ??
        1;

      setPreciosCerrado({
        precioPorParticipante: precio.toString(),
        numParticipantes: numPart.toString(),
      });

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
    } else {
      setPreciosAbierto({
        precioAfiliado: (cursoToEdit.precioAfiliado ?? 0).toString(),
        precioPublico: (cursoToEdit.precioPublico ?? 0).toString(),
        precioEstudiante: (cursoToEdit.precioEstudiante ?? 0).toString(),
      });
    }

    setCursoCreado(cursoToEdit);
    setPasoActual("datos");
    setPasosVisitados(new Set(["datos"]));
  }, [
    isOpen,
    cursoToEdit,
    setPreciosCerrado,
    setPreciosAbierto,
  ]);

  // ─── Búsqueda de instructores ───────────────────────────────────────────────

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

  // ─── Búsqueda de empresas ───────────────────────────────────────────────────

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

  // ─── Navegación ─────────────────────────────────────────────────────────────

  const irA = useCallback((id: PasoId) => {
    setPasoActual(id);

    setPasosVisitados((prev) => new Set([...prev, id]));
  }, []);

  const _avanzar = useCallback((): boolean => {
    const idx = pasos.findIndex((p) => p.id === pasoActual);

    if (idx === -1 || idx >= pasos.length - 1) {
      return false;
    }

    irA(pasos[idx + 1].id);

    return true;
  }, [pasos, pasoActual, irA]);

  const handleAnterior = useCallback(() => {
    const idx = pasos.findIndex((p) => p.id === pasoActual);

    if (idx > 0) {
      irA(pasos[idx - 1].id);
    }
  }, [pasos, pasoActual, irA]);

  // ─── Selección de tipo ──────────────────────────────────────────────────────

  const handleSelectTipo = useCallback(
    (tipo: TipoCurso) => {
      setTipoCursoState(tipo);

      camposCerrado.resetPrecios();
      camposAbierto.resetPrecios();

      setEmpresaSel(null);
      setEmpresaSearch("");
      setEmpresas([]);

      irA("datos");
    },
    [irA],
  );

  // ─── Formulario ─────────────────────────────────────────────────────────────

  const handleChange = useCallback(
    (
      field: keyof CursoCerradoForm,
      value: CursoCerradoForm[keyof CursoCerradoForm],
    ) => {
      setForm((p) => ({
        ...p,
        [field]: value,
      }));

      if (errors[field]) {
        setErrors((p) => ({
          ...p,
          [field]: "",
        }));
      }
    },
    [errors],
  );

  const handleDateRangeChange = useCallback((range: DateRangeValue | null) => {
    setDateRange(range);

    const fi = range?.start ? range.start.toString() : "";
    const ff = range?.end ? range.end.toString() : "";

    setForm((p) => ({
      ...p,
      fechaInicio: fi,
      fechaFin: ff,
    }));

    setErrors((p) => ({
      ...p,
      fechaInicio: "",
      fechaFin: "",
    }));
  }, []);

  // ─── Instructor ─────────────────────────────────────────────────────────────

  const selectInstructor = useCallback(
    (instructor: InstructorResumen) => {
      handleChange("instructorId", instructor.id);

      setInstructorSel(instructor);
      setInstructorSearch(`${instructor.nombre} ${instructor.apellidoPaterno}`);
      setInstructores([instructor]);
      setInstructorMode("buscar");
      setModalInstructorOpen(false);
    },
    [handleChange],
  );

  const clearInstructor = useCallback(() => {
    handleChange("instructorId", null);

    setInstructorSel(null);
    setInstructorSearch("");
    setInstructores([]);
  }, [handleChange]);

  const handleInstructorModeChange = useCallback(
    (mode: InstructorMode) => {
      if (mode === instructorMode && mode !== "crear") return;

      setInstructorMode(mode);

      if (mode !== "buscar") {
        clearInstructor();
      }

      if (mode === "crear") {
        setModalInstructorOpen(true);
      }
    },
    [instructorMode, clearInstructor],
  );

  // ─── Empresa ────────────────────────────────────────────────────────────────

  const selectEmpresa = useCallback((empresa: EmpresaResumen) => {
    setEmpresaSel(empresa);
    setEmpresaErrors({});
  }, []);

  const clearEmpresa = useCallback(() => {
    setEmpresaSel(null);
    setEmpresaSearch("");
    setEmpresas([]);
  }, []);

  const handleEmpresaCreada = useCallback((empresa: EmpresaResumen) => {
    setEmpresaSel(empresa);
    setEmpresaErrors({});
    setModalEmpresaOpen(false);

    sileo.success({
      title: "Empresa asignada",
      description: empresa.nombre,
    });
  }, []);

  // ─── Validaciones por paso ──────────────────────────────────────────────────

  const validateDatos = (): boolean => {
    const e: Record<string, string> = {};

    if (!form.nombre || form.nombre.trim().length < 3) {
      e.nombre = "Mínimo 3 caracteres";
    }

    if (!form.aula) {
      e.aula = "Aula requerida";
    }

    if (!form.nivelGerencial) {
      e.nivelGerencial = "Nivel requerido";
    }

    if (!form.horario) {
      e.horario = "Horario requerido";
    }

    if (!form.fechaInicio) {
      e.fechaInicio = "Fecha inicio requerida";
    }

    if (!form.fechaFin) {
      e.fechaFin = "Fecha fin requerida";
    }

    if (form.fechaInicio && form.fechaFin && form.fechaFin < form.fechaInicio) {
      e.fechaFin = "La fecha fin debe ser posterior a la fecha inicio";
    }

    if (instructorMode === "buscar" && !form.instructorId) {
      e.instructorId = "Selecciona un instructor";
    }

    if (Object.keys(e).length > 0) {
      setErrors(e);

      sileo.warning({
        title: "Campos incompletos",
        description: "Revisa los campos marcados.",
      });

      return false;
    }

    return true;
  };

  const validatePrecios = (): boolean => {
    const errs = campos.validatePrecios();

    if (Object.keys(errs).length > 0) {
      setErrors(errs);

      sileo.warning({
        title: "Precios inválidos",
        description: "Revisa los precios ingresados.",
      });

      return false;
    }

    return true;
  };

  const validateEmpresa = (): boolean => {
    if (!empresaSel) {
      setEmpresaErrors({
        empresa: "Debes seleccionar o crear una empresa",
      });

      sileo.warning({
        title: "Empresa requerida",
      });

      return false;
    }

    setEmpresaErrors({});

    return true;
  };

  const validarPasoActual = (): boolean => {
    switch (pasoActual) {
      case "datos":
        return validateDatos();

      case "precios":
        return validatePrecios();

      case "empresa":
        return validateEmpresa();

      default:
        return true;
    }
  };

  const handleSiguiente = useCallback((): boolean => {
    if (!validarPasoActual()) {
      return false;
    }

    return _avanzar();
  }, [pasoActual, _avanzar]);

  // ─── Submit del curso ───────────────────────────────────────────────────────

  const handleSubmitCurso = useCallback(() => {
    const run = async () => {
      setIsSubmitting(true);

      try {
        const preciosPayload = campos.buildPreciosPayload();

        const payload: CursoPayload = {
          ...form,
          ...preciosPayload,
          tipoCurso: tipoCurso!,
          duracion: form.duracion ? Number(form.duracion) : undefined,
          instructorId: instructorMode === "despues" ? null : form.instructorId,
          ...(tipoCurso === "CERRADO" && {
            empresaId: empresaSel!.id,
            numParticipantes: numP,
          }),
        };

        let cursoGuardado: CursoCerradoDetalle;

        if (isEditMode && cursoToEdit?.id) {
          const actualizado = await actualizarCurso(
            cursoToEdit.id,
            payload as CursoCerradoPayload,
          );

          cursoGuardado = actualizado as CursoCerradoDetalle;

          setCursoCreado(cursoGuardado);

          sileo.success({
            title: "Curso actualizado correctamente",
          });
        } else {
          const nuevo = onCursoCreado
            ? await onCursoCreado(payload)
            : ((await crearCurso(payload)) as CursoCerradoDetalle);

          cursoGuardado = nuevo;

          setCursoCreado(cursoGuardado);
        }

        if (tipoCurso === "CERRADO") {
          _avanzar();
          return;
        }

        sileo.success({
          title: "Curso abierto creado correctamente",
          description: "Ahora puedes registrar participantes de forma individual.",
        });

        onCursoAbiertoCreado?.(cursoGuardado);
        onClose();
      } catch (error: unknown) {
        sileo.error({
          title: isEditMode ? "Error al actualizar" : "Error al crear el curso",
          description: getMensajeError(error),
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    void run();
  }, [
    form,
    tipoCurso,
    campos,
    instructorMode,
    empresaSel,
    numP,
    isEditMode,
    cursoToEdit,
    onCursoCreado,
    onCursoAbiertoCreado,
    onClose,
    _avanzar,
  ]);

  // ─── Participantes ──────────────────────────────────────────────────────────

  const validateParticipante = (): boolean => {
    const e: Record<string, string> = {};

    if (!participanteForm.nombre || participanteForm.nombre.trim().length < 2) {
      e.nombre = "Nombre requerido (mín. 2 caracteres)";
    }

    if (
      !participanteForm.apellidoPaterno ||
      participanteForm.apellidoPaterno.trim().length < 2
    ) {
      e.apellidoPaterno = "Apellido paterno requerido (mín. 2 caracteres)";
    }

    if (!participanteForm.fechaNacimiento) {
      e.fechaNacimiento = "Fecha de nacimiento requerida";
    }

    if (Object.keys(e).length > 0) {
      setParticipanteErrors(e);

      sileo.warning({
        title: "Campos incompletos",
        description: "Revisa los campos marcados.",
      });

      return false;
    }

    return true;
  };

  const handleParticipanteChange = useCallback(
    <K extends keyof ParticipanteNuevoForm>(
      field: K,
      value: ParticipanteNuevoForm[K],
    ) => {
      setParticipanteForm((p) => ({
        ...p,
        [field]: value,
      }));

      if (participanteErrors[field]) {
        setParticipanteErrors((p) => ({
          ...p,
          [field]: "",
        }));
      }
    },
    [participanteErrors],
  );

  const handleRegistrarParticipante = useCallback(() => {
    const run = async () => {
      if (!validateParticipante()) return;

      setIsSubmittingParticipante(true);

      try {
        const participantePayload: Record<string, unknown> = {
          nombre: participanteForm.nombre.trim(),
          apellidoPaterno: participanteForm.apellidoPaterno.trim(),
          fechaNacimiento: participanteForm.fechaNacimiento,
          esAfiliado: participanteForm.esAfiliado,
          empresaId: empresaSel!.id,
        };

        if (participanteForm.apellidoMaterno?.trim()) {
          participantePayload.apellidoMaterno =
            participanteForm.apellidoMaterno.trim();
        }

        if (participanteForm.correo?.trim()) {
          participantePayload.correo = participanteForm.correo.trim();
        }

        if (participanteForm.celular?.trim()) {
          participantePayload.celular = participanteForm.celular.trim();
        }

        const respParticipante = await crearParticipante(participantePayload);
        const participante: ParticipanteResumen =
          respParticipante?.data ?? respParticipante;

        await crearInscripcionCursoCerrado({
          participanteId: participante.id,
          cursoId: cursoCreado?.id,
          tipoPrecioAplicado: participante.esAfiliado
            ? "AFILIADO"
            : "PUBLICO_GENERAL",
          metodoPago: "EFECTIVO",
          montoEsperado: precioPorP,
          montoFinal: precioPorP,
          montoDescuento: 0,
          estadoPago: "PAGADO",
          montoPagado: precioPorP,
          notas: "",
        });

        const nuevo = participantesRegistrados + 1;

        setParticipantesRegistrados(nuevo);
        setParticipantesLista((prev) => [...prev, participante]);
        setParticipanteForm({ ...PARTICIPANTE_INITIAL });
        setParticipanteErrors({});

        if (nuevo >= numP) {
          sileo.success({
            title: "¡Carga completa!",
            description: `Se registraron ${numP} participantes para el curso.`,
          });

          onClose();
        } else {
          sileo.success({
            title: `Participante ${nuevo} de ${numP} registrado`,
            description: `${participante.nombre} ${participante.apellidoPaterno}`,
          });
        }
      } catch (error: unknown) {
        sileo.error({
          title: "Error al registrar participante",
          description: getMensajeError(error),
        });
      } finally {
        setIsSubmittingParticipante(false);
      }
    };

    void run();
  }, [
    participanteForm,
    participanteErrors,
    empresaSel,
    cursoCreado,
    precioPorP,
    participantesRegistrados,
    numP,
    onClose,
  ]);

  const handleTerminarDespues = useCallback(() => {
    sileo.warning({
      title: "Registro incompleto",
      description: `Faltan ${
        numP - participantesRegistrados
      } participantes. Puedes continuar después desde el detalle del curso.`,
    });

    onClose();
  }, [numP, participantesRegistrados, onClose]);

  // ─── Título dinámico ────────────────────────────────────────────────────────

  const tituloModal = isEditMode
    ? `Editar curso ${tipoCurso === "CERRADO" ? "cerrado" : "abierto"}`
    : pasoActual === "tipo"
      ? "Nuevo curso"
      : pasoActual === "participantes"
        ? "Registrar participantes"
        : tipoCurso === "CERRADO"
          ? "Nuevo curso cerrado"
          : "Nuevo curso abierto";

  // ─── Return ─────────────────────────────────────────────────────────────────

  return {
    isEditMode,
    tipoCurso,
    tituloModal,

    pasos,
    pasoActual,
    pasosVisitados,
    irA,
    handleSiguiente,
    handleAnterior,
    handleSelectTipo,

    form,
    errors,
    dateRange,
    handleChange,
    handleDateRangeChange,

    preciosCerrado,
    setPreciosCerrado,
    costoTotal,
    numP,
    precioPorP,

    preciosAbierto,
    setPreciosAbierto,

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

    isSubmitting,
    handleSubmitCurso,
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