import { useState, useRef, useEffect } from "react";
import {
  Input,
  Button,
  Autocomplete,
  AutocompleteItem,
  Switch,
  Chip,
  Avatar,
  Spinner,
  Card,
  CardBody,
  Divider,
} from "@heroui/react";
import { DatePicker } from "@heroui/react";
import { CalendarDate, parseDate} from "@internationalized/date";
import { sileo } from "sileo";
import ModalForm from "../../common/modalForm";
import InscripcionModal from "../inscripcionModal";

import { buscarEmpresas, crearEmpresa} from "../../../services/empresaService";
import { listarCursos, obtenerCursoPorId } from "../../../services/cursoService";
import { crearParticipante, actualizarParticipante } from "../../../services/participanteService";
import {
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import {
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";

// ── Tokens ───────────────────────────────────────────────────────────────────
const C = { accentSolid: "#4f46e5" };

// ── Iconos SVG inline ─────────────────────────────────────────────────────────
const Ic = {
  User: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  MapPin: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Receipt: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M14 8H8M16 12H8M13 16H8" />
    </svg>
  ),
  Building: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  Book: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  AlertCircle: () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Info: () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

// ── Tipos de modo ─────────────────────────────────────────────────────────────
type EmpresaMode = "buscar" | "crear" | "despues" | null;
type CursoMode = "buscar" | "despues" | null;

// ── Validadores participante ──────────────────────────────────────────────────
const validators: Record<string, (v: any, form?: Record<string, any>) => string | null> = {
  nombre:
    v => !v || v.trim().length < 2 ? "Requerido · Mínimo 2 caracteres" : v.length > 50 ? "Máximo 50 caracteres" : null,
  apellidoPaterno:
    v => !v || v.trim().length < 2 ? "Requerido · Mínimo 2 caracteres" : v.length > 50 ? "Máximo 50 caracteres" : null,
  fechaNacimiento:
    v => !v ? "La fecha de nacimiento es requerida" : null,
  apellidoMaterno:
    v => v && v.trim().length < 2 ? "Mínimo 2 caracteres" : v && v.length > 50 ? "Máximo 50 caracteres" : null,
  celular:
    v => v && !/^[0-9]{10}$/.test(v) ? "Debe tener exactamente 10 dígitos" : null,
  correo:
    v => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Formato de correo inválido" : null,
  curp:
    v => v && !/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z]{2}$/.test(v) ? "CURP inválida · 18 caracteres" : null,
  rfc:
    v => v && !/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(v) ? "RFC inválido · 12-13 caracteres" : null,
  calle:
    v => v && v.trim().length < 3 ? "Mínimo 3 caracteres" : v && v.length > 100 ? "Máximo 100 caracteres" : null,
  colonia:
    v => v && v.trim().length < 3 ? "Mínimo 3 caracteres" : v && v.length > 100 ? "Máximo 100 caracteres" : null,
  cp:
    v => v && !/^\d{5}$/.test(v) ? "5 dígitos numéricos requeridos" : null,
  empresaId:
    (v, form) => form?.esAfiliado && form?.empresaMode === "buscar" && !v
      ? "Requerido cuando el participante es afiliado"
      : null,
};

// ── Validadores empresa nueva ─────────────────────────────────────────────────
const empresaValidators = {
  nombre: (v: string) =>
    !v || v.trim().length < 2 ? "Requerido · Mínimo 2 caracteres" : v.length > 100 ? "Máximo 100 caracteres" : null,
  rfc: (v: string) =>
    !v ? "RFC es requerido" :
      !/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(v) ? "RFC inválido · 12-13 caracteres" : null,
  direccion: (v: string) =>
    !v || v.trim().length < 5 ? "Requerido · Mínimo 5 caracteres" : v.length > 200 ? "Máximo 200 caracteres" : null,
};

const REQUIRED_FIELDS = ["nombre", "apellidoPaterno", "fechaNacimiento"];

// ── Helpers de UI ─────────────────────────────────────────────────────────────
function RequiredLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <span>
      {label}
      {required
        ? <span className="text-rose-500 ml-0.5">*</span>
        : <span className="text-slate-300 text-[10px] ml-1.5 font-normal">(opcional)</span>}
    </span>
  );
}

function FieldOk({ ok }: { ok: boolean }) {
  return ok ? <span className="text-emerald-500"><Ic.Check /></span> : null;
}

function OptionalBanner({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 mb-3">
      <span className="text-slate-400 flex-shrink-0"><Ic.Info /></span>
      <p className="text-[11px] text-slate-500">{text}</p>
    </div>
  );
}

function ModeCard({ active, color = "danger", icon, label, description, onPress }: {
  active: boolean;
  color?: "danger" | "warning" | "success";
  icon: React.ReactNode;
  label: string;
  description: string;
  onPress: () => void;
}) {
  const activeClass =
    color === "danger" ? "border-danger bg-danger-50 dark:bg-danger-900/20 shadow-lg shadow-danger/20" :
      color === "success" ? "border-success bg-success-50 dark:bg-success-900/20 shadow-lg shadow-success/20" :
        "border-warning bg-warning-50 dark:bg-warning-900/20 shadow-lg shadow-warning/20";
  const iconColor = color === "danger" ? "text-danger" : color === "success" ? "text-success" : "text-warning";
  const textColor = color === "danger" ? "text-danger" : color === "success" ? "text-success" : "text-warning";

  return (
    <Card
      isPressable
      onPress={onPress}
      className={`cursor-pointer border-2 transition-all duration-300 hover:scale-[1.02] ${active ? activeClass : "border-default-200 hover:border-default-400 hover:shadow-md"
        }`}
    >
      <CardBody className="flex flex-col items-center gap-2 py-4 text-center">
        <div className={`p-2 rounded-full ${active ? `bg-${color}/10` : "bg-default-100"}`}>
          <span className={active ? iconColor : "text-default-500"}>{icon}</span>
        </div>
        <span className={`text-sm font-semibold ${active ? textColor : "text-default-600"}`}>{label}</span>
        <span className="text-xs text-default-400">{description}</span>
      </CardBody>
    </Card>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface ParticipanteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (participante: any) => void;
  participanteToEdit?: any;
  cursoIdParaAsignar?: number | null;
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function ParticipanteModal({
  isOpen,
  onClose,
  onSuccess,
  participanteToEdit,
  cursoIdParaAsignar,
}: ParticipanteModalProps) {
  const [form, setForm] = useState<Record<string, any>>({ esAfiliado: false });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Estados para modales anidados
  const [inscripcionModalOpen, setInscripcionModalOpen] = useState(false);
  const [inscripcionData, setInscripcionData] = useState<any>(null);

  // Empresa
  const [empresaMode, setEmpresaMode] = useState<EmpresaMode>(null);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [empresaSearch, setEmpresaSearch] = useState("");
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<any | null>(null);
  const [empresaCompleta, setEmpresaCompleta] = useState<any | null>(null);

  // ── Estado: nueva empresa ─────────────────────────────────────────────────
  const [nuevaEmpresa, setNuevaEmpresa] = useState({ nombre: "", rfc: "", direccion: "N/A" });
  const [nuevaEmpresaErrors, setNuevaEmpresaErrors] = useState<Record<string, string | null>>({});
  const [nuevaEmpresaTouched, setNuevaEmpresaTouched] = useState<Record<string, boolean>>({});
  const [creandoEmpresa, setCreandoEmpresa] = useState(false);
  const [empresaCreada, setEmpresaCreada] = useState<any | null>(null);

  // Curso
  const [cursoMode, setCursoMode] = useState<CursoMode>(null);
  const [cursos, setCursos] = useState<any[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [cursoSearch, setCursoSearch] = useState("");
  const [cursoSeleccionado, setCursoSeleccionado] = useState<any | null>(null);

  const timeouts = useRef<Record<string, any>>({});

  // ── Reset y carga de datos ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setForm({ esAfiliado: false });
      setErrors({}); setTouched({}); setSubmitError(null);
      setEmpresaMode(null); setEmpresas([]); setEmpresaSearch(""); setEmpresaSeleccionada(null); setEmpresaCompleta(null);
      setNuevaEmpresa({ nombre: "", rfc: "", direccion: "N/A" });
      setNuevaEmpresaErrors({}); setNuevaEmpresaTouched({}); setEmpresaCreada(null);
      setCursoMode(null); setCursos([]); setCursoSearch(""); setCursoSeleccionado(null);
      setInscripcionModalOpen(false); setInscripcionData(null);
    } else if (participanteToEdit) {
      // IMPORTANTE: Formatear la fecha correctamente
      const fechaFormateada = participanteToEdit.fechaNacimiento
        ? participanteToEdit.fechaNacimiento.split('T')[0]
        : null;

      setForm({
        ...participanteToEdit,
        fechaNacimiento: fechaFormateada,
      });

      // Si tiene empresa, cargar datos completos
      if (participanteToEdit.empresaId) {
        setEmpresaMode("buscar");
        obtenerEmpresa(participanteToEdit.empresaId).then(emp => {
          setEmpresaCompleta(emp);
          setEmpresaSeleccionada(emp);
        }).catch(console.error);
      }

      // Si tiene curso, cargar datos
      if (participanteToEdit.cursoId) {
        setCursoMode("buscar");
        obtenerCursoPorId(participanteToEdit.cursoId).then(curso => {
          setCursoSeleccionado(curso);
          setCursoSearch(curso.nombre);
          setCursos([curso]);
        }).catch(console.error);
      }
    } else if (cursoIdParaAsignar) {
      setCursoMode("buscar");
      obtenerCursoPorId(cursoIdParaAsignar).then(curso => {
        setCursoSeleccionado(curso);
        setForm(prev => ({ ...prev, cursoId: curso.id }));
        setCursoSearch(curso.nombre);
        setCursos([curso]);
      }).catch(console.error);
    }
  }, [isOpen, participanteToEdit, cursoIdParaAsignar]);

  // Cargar datos completos de empresa cuando se selecciona una
  useEffect(() => {
    if (form.empresaId && !empresaCompleta) {
      obtenerEmpresa(form.empresaId).then(emp => {
        setEmpresaCompleta(emp);
      }).catch(console.error);
    }
  }, [form.empresaId, empresaCompleta]);

  // ── Debounce empresas ─────────────────────────────────────────────────────
  const buscarEmpresasDebounced = (value: string) => {
    setEmpresaSearch(value);
    clearTimeout(timeouts.current["emp"]);
    if (!value || value.trim().length < 2) { setEmpresas([]); return; }
    timeouts.current["emp"] = setTimeout(async () => {
      try { setLoadingEmpresas(true); setEmpresas(await buscarEmpresas(value)); }
      finally { setLoadingEmpresas(false); }
    }, 350);
  };

  // ── Debounce cursos ───────────────────────────────────────────────────────
  const buscarCursosDebounced = (value: string) => {
    setCursoSearch(value);
    clearTimeout(timeouts.current["cur"]);
    if (!value || value.trim().length < 2) { setCursos([]); return; }
    timeouts.current["cur"] = setTimeout(async () => {
      try {
        setLoadingCursos(true);
        const res = await listarCursos({ search: value, limit: 20 });
        setCursos(res.data ?? []);
      } finally { setLoadingCursos(false); }
    }, 350);
  };

  // ── Cambio de modo empresa ────────────────────────────────────────────────
  const handleEmpresaMode = (mode: EmpresaMode) => {
    if (mode === empresaMode) return;
    setEmpresaMode(mode);
    setEmpresas([]); setEmpresaSearch(""); setEmpresaSeleccionada(null); setEmpresaCompleta(null);
    setNuevaEmpresa({ nombre: "", rfc: "", direccion: "N/A" });
    setNuevaEmpresaErrors({}); setNuevaEmpresaTouched({}); setEmpresaCreada(null);
    handleChange("empresaId", null);
  };

  const handleCursoMode = (mode: CursoMode) => {
    if (mode === cursoMode) return;
    setCursoMode(mode);
    setCursos([]); setCursoSearch(""); setCursoSeleccionado(null);
    handleChange("cursoId", null);
  };

  // ── Helpers nueva empresa ─────────────────────────────────────────────────
  const handleNuevaEmpresaChange = (field: string, value: string) => {
    const v = value.trim() === "" ? "" : value;
    setNuevaEmpresa(prev => ({ ...prev, [field]: v }));
    if (nuevaEmpresaTouched[field]) {
      setNuevaEmpresaErrors(prev => ({
        ...prev,
        [field]: empresaValidators[field as keyof typeof empresaValidators]?.(v) ?? null,
      }));
    }
  };

  const handleNuevaEmpresaBlur = (field: string) => {
    setNuevaEmpresaTouched(prev => ({ ...prev, [field]: true }));
    setNuevaEmpresaErrors(prev => ({
      ...prev,
      [field]: empresaValidators[field as keyof typeof empresaValidators]?.(
        nuevaEmpresa[field as keyof typeof nuevaEmpresa]
      ) ?? null,
    }));
  };

  const validateNuevaEmpresa = () => {
    const e: Record<string, string | null> = {};
    for (const [field, validate] of Object.entries(empresaValidators)) {
      const err = validate(nuevaEmpresa[field as keyof typeof nuevaEmpresa]);
      if (err) e[field] = err;
    }
    setNuevaEmpresaErrors(e);
    setNuevaEmpresaTouched({ nombre: true, rfc: true, direccion: true });
    return Object.keys(e).length === 0;
  };

  // ── Crear empresa ─────────────────────────────────────────────────────────
  const handleCrearEmpresa = async () => {
    if (!validateNuevaEmpresa()) {
      sileo.warning({ title: "Datos incompletos", description: "Completa los campos requeridos de la empresa." });
      return;
    }
    setCreandoEmpresa(true);
    try {
      const response = await crearEmpresa({
        nombre: nuevaEmpresa.nombre.trim(),
        rfc: nuevaEmpresa.rfc.trim().toUpperCase(),
        direccion: nuevaEmpresa.direccion.trim(),
      });

      const empresa = response?.data ?? response;

      setEmpresaCreada(empresa);
      setEmpresaCompleta(empresa);
      handleChange("empresaId", empresa.id);

      sileo.success({
        title: "¡Empresa creada!",
        description: `"${empresa.nombre}" fue registrada y asignada correctamente.`,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Error al crear la empresa";
      sileo.error({ title: "Error al crear empresa", description: msg });
    } finally {
      setCreandoEmpresa(false);
    }
  };

  // ── Form helpers ──────────────────────────────────────────────────────────
  const handleChange = (field: string, value: any) => {
    const v = value === "" ? null : value;
    const updated = { ...form, [field]: v };
    setForm(updated);
    if (touched[field] && validators[field])
      setErrors(p => ({ ...p, [field]: validators[field](v, { ...updated, empresaMode }) }));
  };

  const handleBlur = (field: string) => {
    setTouched(p => ({ ...p, [field]: true }));
    if (validators[field])
      setErrors(p => ({ ...p, [field]: validators[field](form[field], { ...form, empresaMode }) }));
  };

  const validateAll = () => {
    const e: Record<string, string | null> = {};
    for (const [field, validate] of Object.entries(validators)) {
      const err = validate(form[field], { ...form, empresaMode });
      if (err) e[field] = err;
    }
    setErrors(e);
    setTouched(Object.fromEntries(Object.keys(validators).map(k => [k, true])));
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    // Validar que si modo "crear" la empresa ya fue creada
    if (empresaMode === "crear" && !empresaCreada) {
      sileo.warning({
        title: "Empresa sin crear",
        description: 'Haz clic en "Crear empresa" antes de guardar el participante.',
      });
      return;
    }

    if (!validateAll()) {
      sileo.warning({ title: "Campos con errores", description: "Revisa los campos marcados antes de continuar." });
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    // Construir payload de manera más controlada
    const payload: Record<string, any> = { 
      esAfiliado: form.esAfiliado ?? false 
    };

    // Lista de campos válidos del participante
    const camposParticipante = [
      'nombre', 'apellidoPaterno', 'apellidoMaterno', 'fechaNacimiento',
      'celular', 'correo', 'curp', 'rfc', 'calle', 'colonia', 'cp'
    ];

    // Agregar solo campos que tienen valor
    for (const campo of camposParticipante) {
      if (form[campo] !== null && form[campo] !== undefined && form[campo] !== '') {
        payload[campo] = form[campo];
      }
    }

    // Manejar empresa
    if (empresaMode === "buscar" && form.empresaId) {
      payload.empresaId = Number(form.empresaId);
    }

    try {
      let response;
      
      if (participanteToEdit) {
        // MODO EDICIÓN - usar PUT
        response = await actualizarParticipante(participanteToEdit.id, payload);
        sileo.success({ 
          title: "¡Actualizado!", 
          description: "El participante fue actualizado correctamente." 
        });
        onSuccess?.(response);
        onClose();
      } else {
        // MODO CREACIÓN - usar POST
        response = await crearParticipante(payload);
        sileo.success({ 
          title: "¡Registro exitoso!", 
          description: "El participante fue guardado correctamente." 
        });
        
        // Si hay curso seleccionado, abrir modal de inscripción
        if (cursoMode === "buscar" && cursoSeleccionado) {
          setInscripcionData({
            participante: response.data || response,
            curso: cursoSeleccionado,
          });
          setInscripcionModalOpen(true);
        } else {
          onSuccess?.(response);
          onClose();
        }
      }
    } catch (err: any) {
      const data = err?.response?.data;
      // Manejo especial para errores de campos únicos
      if (err?.response?.status === 409) {
        const msg = data?.message ?? "Ya existe otro participante con ese correo, CURP o RFC";
        setSubmitError(msg);
        sileo.error({ title: "Error de duplicado", description: msg });
      } else {
        const msg = data?.message ?? data?.error ?? data ?? err?.message ?? "Error desconocido";
        setSubmitError(typeof msg === "string" ? msg : JSON.stringify(msg, null, 2));
        sileo.error({ title: "Error al registrar", description: "Revisa los datos e inténtalo de nuevo." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Progreso ──────────────────────────────────────────────────────────────
  const filled = REQUIRED_FIELDS.filter(f => form[f] != null && form[f] !== "").length;
  const extraRequired = form.esAfiliado ? 1 : 0;
  const extraFilled = form.esAfiliado && form.empresaId ? 1 : 0;
  const pct = Math.round(((filled + extraFilled) / (REQUIRED_FIELDS.length + extraRequired)) * 100);

  // ── Estilos compartidos ───────────────────────────────────────────────────
  const inputCN = {
    inputWrapper: [
      "border border-slate-200 bg-white shadow-sm transition-all duration-200",
      "data-[hover=true]:border-indigo-300",
      "data-[focus=true]:border-indigo-500 data-[focus=true]:shadow-md data-[focus=true]:shadow-indigo-100/60",
      "data-[invalid=true]:border-rose-400 data-[invalid=true]:bg-rose-50/30",
    ].join(" "),
    label: "text-slate-500 text-xs font-medium",
    input: "text-slate-800 text-sm font-medium placeholder:text-slate-300",
    errorMessage: "text-rose-500 text-[11px] font-medium mt-1",
  };

  const inp = (field: string, label: string, required = false, extra: any = {}) => ({
    label: <RequiredLabel label={label} required={required} /> as any,
    size: "sm" as const, variant: "bordered" as const, radius: "lg" as const,
    isInvalid: !!(touched[field] && errors[field]),
    errorMessage: touched[field] ? errors[field] ?? undefined : undefined,
    onBlur: () => handleBlur(field),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange(field, e.target.value),
    classNames: inputCN,
    ...extra,
  });

  // Mismos estilos para campos de nueva empresa
  const inpEmpresa = (field: keyof typeof nuevaEmpresa, label: string, required = false) => ({
    label: <RequiredLabel label={label} required={required} /> as any,
    size: "sm" as const, variant: "bordered" as const, radius: "lg" as const,
    value: nuevaEmpresa[field],
    isInvalid: !!(nuevaEmpresaTouched[field] && nuevaEmpresaErrors[field]),
    errorMessage: nuevaEmpresaTouched[field] ? nuevaEmpresaErrors[field] ?? undefined : undefined,
    onBlur: () => handleNuevaEmpresaBlur(field),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleNuevaEmpresaChange(field, e.target.value),
    classNames: inputCN,
  });

  const acCN = {
    base: "w-full",
    listboxWrapper: "shadow-2xl rounded-2xl border border-slate-100 overflow-hidden",
    selectorButton: "text-slate-400 hover:text-indigo-500 transition-colors",
  };
  const acInp = {
    classNames: {
      inputWrapper: [
        "border border-slate-200 bg-white shadow-sm",
        "data-[hover=true]:border-indigo-300",
        "data-[focus=true]:border-indigo-500 data-[focus=true]:shadow-md",
        "data-[invalid=true]:border-rose-400",
      ].join(" "),
      label: "text-slate-500 text-xs font-medium",
      input: "text-slate-800 text-sm font-medium",
    },
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <ModalForm
        isOpen={isOpen}
        onClose={onClose}
        title={participanteToEdit ? "Editar Participante" : "Nuevo Participante"}
        size="3xl"
        isLoading={isSubmitting}
        onSubmit={handleSubmit}
        submitText={participanteToEdit ? "Actualizar participante" : "Crear participante"}
      >
        <div className="space-y-6 px-1">

          {/* Barra de progreso */}
          {!participanteToEdit && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/90 backdrop-blur-sm border border-slate-200 sticky top-0 z-10">
              <div className="relative w-10 h-10 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <circle
                    cx="20" cy="20" r="16" fill="none"
                    stroke={pct === 100 ? "#10b981" : C.accentSolid}
                    strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 16}`}
                    strokeDashoffset={`${2 * Math.PI * 16 * (1 - pct / 100)}`}
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-slate-700">
                  {pct}%
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-600">Progreso de campos requeridos</p>
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error servidor */}
          {submitError && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-rose-500 flex-shrink-0 mt-0.5"><Ic.AlertCircle /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-rose-700">Error del servidor</p>
                <pre className="text-xs text-rose-600 mt-0.5 whitespace-pre-wrap break-words font-mono">{submitError}</pre>
              </div>
              <button onClick={() => setSubmitError(null)} className="text-rose-400 hover:text-rose-600"><Ic.X /></button>
            </div>
          )}

          {/* ══ 1. DATOS PERSONALES ══ */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Ic.User /> Datos personales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input {...inp("nombre", "Nombre", true)} value={form.nombre ?? ""}
                endContent={<FieldOk ok={!!form.nombre && !errors.nombre} />} />
              <Input {...inp("apellidoPaterno", "Apellido Paterno", true)} value={form.apellidoPaterno ?? ""}
                endContent={<FieldOk ok={!!form.apellidoPaterno && !errors.apellidoPaterno} />} />
              <Input {...inp("apellidoMaterno", "Apellido Materno")} value={form.apellidoMaterno ?? ""} />

              <DatePicker
                label={<RequiredLabel label="Fecha de Nacimiento" required />}
                size="sm"
                variant="bordered"
                radius="lg"
                value={form.fechaNacimiento ? parseDate(form.fechaNacimiento) : null}
                onChange={(date: CalendarDate | null) => {
                  handleChange("fechaNacimiento", date ? date.toString() : null);
                  setTouched(p => ({ ...p, fechaNacimiento: true }));
                }}
                isInvalid={!!(touched.fechaNacimiento && errors.fechaNacimiento)}
                errorMessage={touched.fechaNacimiento ? errors.fechaNacimiento : undefined}
                showMonthAndYearPickers
                granularity="day"
                dateInput={{
                  locale: "es-MX",
                  inputProps: {
                    placeholder: "dd/mm/aaaa",
                  },
                }}
                classNames={{
                  ...inputCN,
                  selectorButton: "text-danger",
                }}
                maxValue={parseDate(new Date().toISOString().split('T')[0])}
              />

              <Input {...inp("celular", "Celular")} value={form.celular ?? ""} maxLength={10} type="tel"
                description="10 dígitos" endContent={form.celular && !errors.celular ? <FieldOk ok /> : null} />
              <Input {...inp("correo", "Correo electrónico")} value={form.correo ?? ""} type="email"
                endContent={form.correo && !errors.correo ? <FieldOk ok /> : null} />
            </div>

            {/* Toggle Afiliado */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-indigo-50/80 to-blue-50/60 border border-indigo-100/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white">
                  <Ic.Star />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Participante Afiliado</p>
                  <p className="text-[11px] text-slate-500">{form.esAfiliado ? "Requerirá seleccionar empresa" : "Actívalo si aplica"}</p>
                </div>
              </div>
              <Switch isSelected={form.esAfiliado} onValueChange={val => handleChange("esAfiliado", val)} size="sm" color="primary" />
            </div>
          </div>

          {/* ══ 2. DIRECCIÓN ══ */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Ic.MapPin /> Dirección <span className="text-[10px] font-normal text-slate-400">(opcional)</span>
            </h3>
            <OptionalBanner text="Todos los campos de dirección son opcionales." />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input {...inp("calle", "Calle")} value={form.calle ?? ""}
                  endContent={form.calle && !errors.calle ? <FieldOk ok /> : null} />
              </div>
              <Input {...inp("colonia", "Colonia")} value={form.colonia ?? ""}
                endContent={form.colonia && !errors.colonia ? <FieldOk ok /> : null} />
              <Input {...inp("cp", "Código Postal")} value={form.cp ?? ""} maxLength={5} description="5 dígitos"
                endContent={form.cp && !errors.cp ? <FieldOk ok /> : null} />
            </div>
          </div>

          {/* ══ 3. DATOS FISCALES ══ */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Ic.Receipt /> Datos fiscales <span className="text-[10px] font-normal text-slate-400">(opcional)</span>
            </h3>
            <OptionalBanner text="CURP y RFC opcionales. Se validará el formato si los proporcionas." />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input {...inp("curp", "CURP")} value={form.curp ?? ""} description="18 caracteres" maxLength={18}
                onChange={e => handleChange("curp", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                endContent={form.curp && !errors.curp ? <FieldOk ok /> : null} />
              <Input {...inp("rfc", "RFC")} value={form.rfc ?? ""} description="12-13 caracteres" maxLength={13}
                onChange={e => handleChange("rfc", e.target.value.toUpperCase().replace(/[^A-ZÑ&0-9]/g, ""))}
                endContent={form.rfc && !errors.rfc ? <FieldOk ok /> : null} />
            </div>
          </div>

          {/* ══ 4. EMPRESA ══ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Ic.Building />
              <h3 className="text-sm font-semibold text-slate-700">Empresa</h3>
              {form.esAfiliado
                ? <Chip size="sm" variant="flat" color="warning" className="ml-2">Requerido para afiliados</Chip>
                : <Chip size="sm" variant="flat" color="default" className="ml-2">Opcional</Chip>
              }
            </div>
            <Divider />

            {form.esAfiliado && (
              <div className="flex items-start gap-3 rounded-xl bg-warning-50 border border-warning-200 p-3">
                <ExclamationTriangleIcon className="w-4 h-4 text-warning-600 mt-0.5 shrink-0" />
                <p className="text-xs text-warning-700 font-medium">El participante es afiliado — debes asociarle una empresa.</p>
              </div>
            )}

            {/* Mostrar saldos si hay empresa seleccionada */}
            {empresaCompleta && (
              <Card className="bg-primary-50/30 border border-primary-200">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <CurrencyDollarIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{empresaCompleta.nombre}</p>
                    <div className="flex gap-4 mt-1 text-xs">
                      <span className="text-primary-600">Federal: ${empresaCompleta.saldoFederalDisponible?.toFixed(2)}</span>
                      <span className="text-primary-600">Local: ${empresaCompleta.saldoLocalDisponible?.toFixed(2)}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* 3 opciones: buscar / crear / después */}
            <div className="grid grid-cols-3 gap-3">
              <ModeCard active={empresaMode === "buscar"} color="danger"
                icon={<MagnifyingGlassIcon className="w-6 h-6" />}
                label="Buscar empresa" description="Selecciona de la base"
                onPress={() => handleEmpresaMode("buscar")} />
              <ModeCard active={empresaMode === "crear"} color="success"
                icon={<PlusCircleIcon className="w-6 h-6" />}
                label="Crear empresa" description="Registra una nueva"
                onPress={() => handleEmpresaMode("crear")} />
              <ModeCard active={empresaMode === "despues"} color="warning"
                icon={<ClockIcon className="w-6 h-6" />}
                label="Asignar después" description="Pendiente"
                onPress={() => handleEmpresaMode("despues")} />
            </div>

            {/* ── MODO: Buscar ── */}
            {empresaMode === "buscar" && (
              <div className="mt-3">
                {empresaSeleccionada && form.empresaId ? (
                  <div className="flex items-center gap-3 rounded-xl bg-success-50 border border-success-200 p-4">
                    <CheckCircleIcon className="w-5 h-5 text-success-600 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-success-700 font-semibold">{empresaSeleccionada.nombre}</p>
                      {empresaSeleccionada.rfc && <p className="text-xs text-success-600 mt-0.5">RFC: {empresaSeleccionada.rfc}</p>}
                    </div>
                    <Button size="sm" variant="light" color="success" onPress={() => {
                      setEmpresaSeleccionada(null); setEmpresaCompleta(null);
                      handleChange("empresaId", null);
                      setEmpresaSearch(""); setEmpresas([]);
                    }}>Cambiar</Button>
                  </div>
                ) : (
                  <Autocomplete
                    label={<RequiredLabel label="Buscar empresa" required={form.esAfiliado} /> as any}
                    size="sm" variant="bordered" radius="lg" inputValue={empresaSearch}
                    isInvalid={!!(touched.empresaId && errors.empresaId)}
                    errorMessage={touched.empresaId ? errors.empresaId ?? undefined : undefined}
                    onInputChange={buscarEmpresasDebounced}
                    onSelectionChange={key => {
                      if (!key) { handleChange("empresaId", null); setEmpresaSeleccionada(null); setEmpresaCompleta(null); return; }
                      const found = empresas.find(e => String(e.id) === String(key));
                      if (found) {
                        handleChange("empresaId", Number(key));
                        setEmpresaSeleccionada(found);
                        // Cargar datos completos
                        obtenerEmpresa(Number(key)).then(setEmpresaCompleta).catch(console.error);
                      }
                      setTouched(p => ({ ...p, empresaId: true }));
                    }}
                    isLoading={loadingEmpresas} placeholder="Escribe el nombre de la empresa..."
                    classNames={acCN} inputProps={acInp}
                    listboxProps={{
                      emptyContent: loadingEmpresas
                        ? <div className="flex justify-center py-5"><Spinner size="sm" color="primary" /></div>
                        : <p className="text-xs text-slate-400 text-center py-4">Sin resultados — escribe para buscar</p>,
                    }}
                  >
                    {empresas.map(emp => (
                      <AutocompleteItem key={emp.id} textValue={emp.nombre}>
                        <div className="flex items-center gap-2.5 py-1">
                          <Avatar name={emp.nombre.charAt(0)} size="sm" className="w-7 h-7 text-tiny bg-indigo-100 text-indigo-600 font-bold" />
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{emp.nombre}</p>
                            {emp.rfc && <p className="text-[11px] text-slate-400">{emp.rfc}</p>}
                          </div>
                        </div>
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>
                )}
              </div>
            )}

            {/* ── MODO: Crear nueva empresa ── */}
            {empresaMode === "crear" && (
              <div className="mt-3 space-y-3">
                {empresaCreada ? (
                  <div className="flex items-center gap-3 rounded-xl bg-success-50 border border-success-200 p-4">
                    <CheckCircleIcon className="w-5 h-5 text-success-600 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-success-700 font-semibold">
                        {empresaCreada.nombre}
                        <Chip size="sm" color="success" variant="flat" className="ml-2">Creada y asignada</Chip>
                      </p>
                      <p className="text-xs text-success-600 mt-0.5">RFC: {empresaCreada.rfc}</p>
                    </div>
                    <Button
                      size="sm" variant="light" color="success"
                      onPress={() => {
                        setEmpresaCreada(null);
                        setEmpresaCompleta(null);
                        setNuevaEmpresa({ nombre: "", rfc: "", direccion: "N/A" });
                        setNuevaEmpresaErrors({}); setNuevaEmpresaTouched({});
                        handleChange("empresaId", null);
                      }}
                    >
                      Cambiar
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                    <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                      <PlusCircleIcon className="w-4 h-4" />
                      Datos de la nueva empresa
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        {...inpEmpresa("nombre", "Nombre de la empresa", true)}
                        endContent={
                          nuevaEmpresa.nombre && !nuevaEmpresaErrors.nombre
                            ? <FieldOk ok /> : null
                        }
                      />
                      <Input
                        {...inpEmpresa("rfc", "RFC de la empresa", true)}
                        maxLength={13}
                        description="12-13 caracteres"
                        onChange={e =>
                          handleNuevaEmpresaChange("rfc", e.target.value.toUpperCase().replace(/[^A-ZÑ&0-9]/g, ""))
                        }
                        endContent={
                          nuevaEmpresa.rfc && !nuevaEmpresaErrors.rfc
                            ? <FieldOk ok /> : null
                        }
                      />
                    </div>

                    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
                      <ExclamationTriangleIcon className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-amber-700">
                        Si la empresa ya existe con ese RFC, el servidor retornará un error. Usa <strong>Buscar empresa</strong> en ese caso.
                      </p>
                    </div>

                    <Button
                      color="success"
                      variant="flat"
                      size="sm"
                      isLoading={creandoEmpresa}
                      startContent={!creandoEmpresa ? <PlusCircleIcon className="w-4 h-4" /> : null}
                      onPress={handleCrearEmpresa}
                      className="w-full font-semibold"
                    >
                      {creandoEmpresa ? "Creando empresa..." : "Crear empresa y asignar"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {empresaMode === "despues" && (
              <div className="flex items-start gap-3 rounded-xl bg-warning-50 border border-warning-200 p-4 mt-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-warning-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-warning-700">Empresa pendiente</p>
                  <p className="text-xs text-warning-600 mt-1">El participante se guardará sin empresa. Recuerda asignarla después si es afiliado.</p>
                </div>
              </div>
            )}

            {!empresaMode && (
              <p className="text-sm text-default-400 text-center py-3 italic">Selecciona una opción para la empresa</p>
            )}
          </div>

          {/* ══ 5. CURSO ══ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Ic.Book />
              <h3 className="text-sm font-semibold text-slate-700">Curso</h3>
              <Chip size="sm" variant="flat" color="default" className="ml-2">Opcional</Chip>
            </div>
            <Divider />

            <div className="grid grid-cols-2 gap-3">
              <ModeCard active={cursoMode === "buscar"} color="danger"
                icon={<MagnifyingGlassIcon className="w-6 h-6" />}
                label="Buscar curso" description="Selecciona de la base"
                onPress={() => handleCursoMode("buscar")} />
              <ModeCard active={cursoMode === "despues"} color="warning"
                icon={<ClockIcon className="w-6 h-6" />}
                label="Inscribir después" description="Pendiente"
                onPress={() => handleCursoMode("despues")} />
            </div>

            {cursoMode === "buscar" && (
              <div className="mt-3">
                {cursoSeleccionado && form.cursoId ? (
                  <div className="flex items-center gap-3 rounded-xl bg-success-50 border border-success-200 p-4">
                    <CheckCircleIcon className="w-5 h-5 text-success-600 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-success-700 font-semibold">{cursoSeleccionado.nombre}</p>
                      {cursoSeleccionado.instructor && (
                        <p className="text-xs text-success-600 mt-0.5">
                          {cursoSeleccionado.instructor?.nombre} {cursoSeleccionado.instructor?.apellidoPaterno}
                        </p>
                      )}
                    </div>
                    <Button size="sm" variant="light" color="success" onPress={() => {
                      setCursoSeleccionado(null); handleChange("cursoId", null);
                      setCursoSearch(""); setCursos([]);
                    }}>Cambiar</Button>
                  </div>
                ) : (
                  <Autocomplete
                    label="Buscar curso" size="sm" variant="bordered" radius="lg" inputValue={cursoSearch}
                    onInputChange={buscarCursosDebounced}
                    onSelectionChange={key => {
                      if (!key) { handleChange("cursoId", null); setCursoSeleccionado(null); return; }
                      const found = cursos.find(c => String(c.id) === String(key));
                      if (found) {
                        handleChange("cursoId", Number(key));
                        setCursoSeleccionado(found);
                      }
                    }}
                    isLoading={loadingCursos} placeholder="Escribe el nombre del curso..."
                    classNames={acCN} inputProps={acInp}
                    listboxProps={{
                      emptyContent: loadingCursos
                        ? <div className="flex justify-center py-5"><Spinner size="sm" color="primary" /></div>
                        : <p className="text-xs text-slate-400 text-center py-4">Sin resultados — escribe para buscar</p>,
                    }}
                  >
                    {cursos.map(curso => (
                      <AutocompleteItem key={curso.id} textValue={curso.nombre}>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{curso.nombre}</p>
                          {curso.instructor && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {curso.instructor?.nombre} {curso.instructor?.apellidoPaterno}
                            </p>
                          )}
                        </div>
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>
                )}
              </div>
            )}

            {cursoMode === "despues" && (
              <div className="flex items-start gap-3 rounded-xl bg-warning-50 border border-warning-200 p-4 mt-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-warning-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-warning-700">Inscripción pendiente</p>
                  <p className="text-xs text-warning-600 mt-1">El participante se guardará sin curso. Puedes inscribirlo después.</p>
                </div>
              </div>
            )}

            {!cursoMode && (
              <p className="text-sm text-default-400 text-center py-3 italic">Selecciona una opción para el curso</p>
            )}
          </div>

        </div>
      </ModalForm>

      {/* Modal de inscripción */}
      {inscripcionData && (
        <InscripcionModal
          isOpen={inscripcionModalOpen}
          onClose={() => {
            setInscripcionModalOpen(false);
            setInscripcionData(null);
            onClose(); // Cerrar también el modal de participante
          }}
          onSuccess={(inscripcion) => {
            sileo.success({ title: "Inscripción completada" });
            setInscripcionModalOpen(false);
            setInscripcionData(null);
            onSuccess?.(inscripcionData.participante);
            onClose();
          }}
          participante={inscripcionData.participante}
          curso={inscripcionData.curso}
          empresa={empresaCompleta}
        />
      )}
    </>
  );
}