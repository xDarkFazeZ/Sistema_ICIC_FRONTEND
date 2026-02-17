import { useState, useRef } from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Autocomplete,
  AutocompleteItem,
  Switch,
  Chip,
  Avatar,
  Spinner,
} from "@heroui/react";
import { DatePicker } from "@heroui/react";
import { CalendarDate } from "@internationalized/date";
import { sileo } from "sileo";

import { buscarEmpresas } from "../services/empresaService";
import { buscarCursos } from "../services/cursoService";
import { crearParticipante } from "../services/participanteService";

// ── Paleta / tokens ──────────────────────────────────────────────────────────
// Accent azul corporativo — ajusta aquí para re-themar todo el form
const C = {
  accent:      "from-blue-600 to-indigo-600",
  accentSolid: "#4f46e5",
  ring:        "data-[focus=true]:ring-2 data-[focus=true]:ring-indigo-300",
};

// ── Iconos SVG inline ─────────────────────────────────────────────────────────
const Ic = {
  User: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  MapPin: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Receipt: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
      <path d="M14 8H8M16 12H8M13 16H8"/>
    </svg>
  ),
  Building: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  Book: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

// ── Validación ────────────────────────────────────────────────────────────────
const validators: Record<string, (v: any) => string | null> = {
  nombre:          v => (!v || v.length < 2) ? "Mínimo 2 caracteres" : v.length > 50 ? "Máximo 50" : null,
  apellidoPaterno: v => (!v || v.length < 2) ? "Mínimo 2 caracteres" : v.length > 50 ? "Máximo 50" : null,
  apellidoMaterno: v => v && v.length < 2 ? "Mínimo 2 caracteres" : v && v.length > 50 ? "Máximo 50" : null,
  celular:         v => v && !/^[0-9]{10}$/.test(v) ? "10 dígitos requeridos" : null,
  correo:          v => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Correo inválido" : null,
  calle:           v => (!v || v.length < 3) ? "Mínimo 3 caracteres" : v.length > 100 ? "Máximo 100" : null,
  colonia:         v => (!v || v.length < 3) ? "Mínimo 3 caracteres" : v.length > 100 ? "Máximo 100" : null,
  cp:              v => (!v || !/^\d{5}$/.test(v)) ? "5 dígitos requeridos" : null,
  curp:            v => v && !/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z]{2}$/.test(v) ? "CURP inválida" : null,
  rfc:             v => v && !/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(v) ? "RFC inválido" : null,
};

const REQUIRED = ["nombre", "apellidoPaterno", "fechaNacimiento", "calle", "colonia", "cp"];

// ── Step label (pill izquierdo de cada sección) ───────────────────────────────
function StepPill({ n, icon, label, sub }: { n: number; icon: React.ReactNode; label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3.5 mb-7">
      {/* Número + icono */}
      <div className="relative flex-shrink-0">
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${C.accent} flex items-center justify-center text-white shadow-md shadow-indigo-200`}>
          {icon}
        </div>
        <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-slate-900 text-white text-[9px] font-black flex items-center justify-center tracking-tight">
          {n}
        </span>
      </div>
      {/* Texto */}
      <div>
        <p className="text-sm font-semibold text-slate-800 leading-none">{label}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
      </div>
      {/* Línea decorativa */}
      <div className="ml-auto hidden sm:block h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent max-w-[80px]" />
    </div>
  );
}

// ── Badge de campo requerido / OK ─────────────────────────────────────────────
function FieldBadge({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="text-emerald-500 flex items-center"><Ic.Check /></span>
  ) : null;
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function ParticipanteForm() {
  const [form, setForm]     = useState<Record<string, any>>({ esAfiliado: false });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);

  const [empresas, setEmpresas]               = useState<any[]>([]);
  const [cursos, setCursos]                   = useState<any[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [loadingCursos, setLoadingCursos]     = useState(false);

  const empresasCargadas = useRef(false);
  const cursosCargados   = useRef(false);
  const timeouts         = useRef<Record<string, any>>({});

  // ── Carga al abrir dropdown ───────────────────────────────────────────────
  const handleOpenEmpresas = async () => {
    if (empresasCargadas.current) return;
    setLoadingEmpresas(true);
    try { setEmpresas(await buscarEmpresas("")); empresasCargadas.current = true; }
    catch (e) { console.error(e); }
    finally { setLoadingEmpresas(false); }
  };

  const handleOpenCursos = async () => {
    if (cursosCargados.current) return;
    setLoadingCursos(true);
    try { setCursos(await buscarCursos("")); cursosCargados.current = true; }
    catch (e) { console.error(e); }
    finally { setLoadingCursos(false); }
  };

  // ── Búsqueda debounced ────────────────────────────────────────────────────
  const debounce = (key: string, fn: (v: string) => void, delay = 350) =>
    (value: string) => {
      clearTimeout(timeouts.current[key]);
      if (!value.trim()) {
        if (key === "emp" && empresasCargadas.current) buscarEmpresas("").then(setEmpresas);
        if (key === "cur" && cursosCargados.current)   buscarCursos("").then(setCursos);
        return;
      }
      timeouts.current[key] = setTimeout(() => fn(value), delay);
    };

  const buscarEmpresasDebounced = debounce("emp", async v => setEmpresas(await buscarEmpresas(v)));
  const buscarCursosDebounced   = debounce("cur", async v => setCursos(await buscarCursos(v)));

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (field: string, value: any) => {
    const v = value === "" ? null : value;
    setForm(p => ({ ...p, [field]: v }));
    if (touched[field] && validators[field])
      setErrors(p => ({ ...p, [field]: validators[field](value) }));
  };

  const handleBlur = (field: string) => {
    setTouched(p => ({ ...p, [field]: true }));
    if (validators[field])
      setErrors(p => ({ ...p, [field]: validators[field](form[field]) }));
  };

  const validateAll = () => {
    const e: Record<string, string | null> = {};
    REQUIRED.forEach(f => { if (validators[f]) e[f] = validators[f](form[f]); });
    Object.keys(validators).forEach(f => { if (form[f]) e[f] = validators[f](form[f]); });
    setErrors(e);
    setTouched(Object.fromEntries(Object.keys(validators).map(k => [k, true])));
    return !Object.values(e).some(Boolean);
  };

  // ── Submit con sileo.promise ──────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateAll()) {
      sileo.warning({
        title: "Campos incompletos",
        description: "Revisa los campos marcados en rojo antes de continuar.",
      });
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    // Sanitizar payload
    const payload: Record<string, any> = {};
    for (const [k, v] of Object.entries(form)) {
      if (v === null || v === undefined || v === "") continue;
      if ((k === "empresaId" || k === "cursoId") && isNaN(Number(v))) continue;
      payload[k] = v;
    }
    payload.esAfiliado = form.esAfiliado ?? false;

    console.log("📤 Payload:", payload);

    // sileo.promise maneja loading → success / error automáticamente
    await sileo.promise(
      crearParticipante(payload)
        .then(() => {
          // Reset del form tras éxito
          setForm({ esAfiliado: false });
          setTouched({});
          setErrors({});
          empresasCargadas.current = false;
          cursosCargados.current   = false;
          setEmpresas([]);
          setCursos([]);
        })
        .catch((err: any) => {
          const data = err?.response?.data;
          const msg  = data?.message ?? data?.error ?? data ?? err?.message ?? "Error desconocido";
          const txt  = typeof msg === "string" ? msg : JSON.stringify(msg, null, 2);
          setSubmitError(txt);
          console.error("❌", data);
          throw err; // necesario para que sileo muestre el estado error
        })
        .finally(() => setIsSubmitting(false)),
      {
        loading: { title: "Registrando participante...", description: "Por favor espera." },
        success: { title: "¡Registro exitoso!", description: "El participante fue guardado correctamente." },
        error:   { title: "Error al registrar",   description: "Revisa los datos e inténtalo de nuevo." },
      }
    );
  };

  // ── Progress ──────────────────────────────────────────────────────────────
  const filled = REQUIRED.filter(f => form[f] !== null && form[f] !== undefined && form[f] !== "").length;
  const pct    = Math.round((filled / REQUIRED.length) * 100);

  // ── Shared Input props ────────────────────────────────────────────────────
  const inp = (field: string, label: string, extra: any = {}) => ({
    label,
    size: "sm" as const,
    variant: "bordered" as const,
    radius: "lg" as const,
    isInvalid: !!(touched[field] && errors[field]),
    errorMessage: touched[field] ? errors[field] ?? undefined : undefined,
    onBlur: () => handleBlur(field),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange(field, e.target.value),
    classNames: {
      inputWrapper: [
        "border border-slate-200 bg-white shadow-sm transition-all duration-200",
        "data-[hover=true]:border-indigo-300 data-[hover=true]:shadow-indigo-50",
        "data-[focus=true]:border-indigo-500 data-[focus=true]:shadow-md data-[focus=true]:shadow-indigo-100/60",
        "data-[invalid=true]:border-rose-400",
      ].join(" "),
      label: "text-slate-400 text-xs font-medium",
      input: "text-slate-800 text-sm font-medium placeholder:text-slate-300",
    },
    ...extra,
  });

  // Shared Autocomplete styles
  const acCN = {
    base: "w-full",
    listboxWrapper: "shadow-2xl rounded-2xl border border-slate-100 overflow-hidden",
    selectorButton: "text-slate-400 hover:text-indigo-500 transition-colors",
  };
  const acInp = {
    classNames: {
      inputWrapper: [
        "border border-slate-200 bg-white shadow-sm transition-all duration-200",
        "data-[hover=true]:border-indigo-300",
        "data-[focus=true]:border-indigo-500 data-[focus=true]:shadow-md data-[focus=true]:shadow-indigo-100/60",
      ].join(" "),
      label: "text-slate-400 text-xs font-medium",
      input: "text-slate-800 text-sm font-medium",
    },
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen py-10 px-4"
      style={{
        fontFamily: "'DM Sans', 'Geist', system-ui, sans-serif",
        background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0f9ff 100%)",
      }}
    >
      {/* ── Decorative background blobs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-indigo-100/40 blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 rounded-full bg-blue-100/30 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-violet-100/20 blur-3xl" />
      </div>

      {/* ── Header ── */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="flex items-start justify-between">
          <div>
            {/* Breadcrumb / sistema */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-[11px] font-semibold tracking-widest text-indigo-500 uppercase">
                Sistema de Capacitación
              </span>
            </div>
            <h1 className="text-[2rem] font-black text-slate-900 tracking-tight leading-none">
              Alta de Participante
            </h1>
            <p className="text-slate-400 text-sm mt-2 max-w-sm">
              Completa la información para registrar a un nuevo participante en el sistema.
            </p>
          </div>

          {/* Progreso circular-ish */}
          <div className="hidden sm:flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                <circle
                  cx="32" cy="32" r="26" fill="none"
                  stroke={pct === 100 ? "#10b981" : C.accentSolid}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - pct / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-700">
                {pct}%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              {pct === 100 ? "✓ Completo" : "Progreso"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Secciones ── */}
      <div className="max-w-3xl mx-auto space-y-4">

        {/* 1 · DATOS PERSONALES */}
        <Card
          shadow="none"
          className="rounded-3xl border border-white/80 bg-white/70 backdrop-blur-xl overflow-visible"
          style={{ boxShadow: "0 4px 24px 0 rgba(99,102,241,0.07), 0 1px 4px 0 rgba(0,0,0,0.04)" }}
        >
          <CardBody className="p-8">
            <StepPill n={1} icon={<Ic.User />} label="Datos personales" sub="Campos marcados con * son obligatorios" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                {...inp("nombre", "Nombre *")}
                endContent={<FieldBadge ok={!!form.nombre && !errors.nombre} />}
              />
              <Input
                {...inp("apellidoPaterno", "Apellido Paterno *")}
                endContent={<FieldBadge ok={!!form.apellidoPaterno && !errors.apellidoPaterno} />}
              />
              <Input
                {...inp("apellidoMaterno", "Apellido Materno")}
                description="Opcional"
              />
              <DatePicker
                label="Fecha de Nacimiento *"
                size="sm"
                variant="bordered"
                radius="lg"
                locale="es-MX"
                showMonthAndYearPickers
                isInvalid={!!(touched.fechaNacimiento && errors.fechaNacimiento)}
                errorMessage={touched.fechaNacimiento ? errors.fechaNacimiento ?? undefined : undefined}
                onChange={(date: CalendarDate | null) => {
                  handleChange("fechaNacimiento", date ? date.toString() : null);
                  setTouched(p => ({ ...p, fechaNacimiento: true }));
                }}
                classNames={{
                  inputWrapper: [
                    "border border-slate-200 bg-white shadow-sm transition-all duration-200",
                    "data-[hover=true]:border-indigo-300",
                    "data-[focus=true]:border-indigo-500 data-[focus=true]:shadow-md data-[focus=true]:shadow-indigo-100/60",
                  ].join(" "),
                  label: "text-slate-400 text-xs font-medium",
                  input: "text-slate-800 text-sm font-medium",
                }}
              />
              <Input
                {...inp("celular", "Celular")}
                description="10 dígitos · Opcional"
                maxLength={10}
                type="tel"
              />
              <Input
                {...inp("correo", "Correo electrónico")}
                description="Opcional"
                type="email"
              />
            </div>

            {/* Afiliado toggle */}
            <div className="mt-5 flex items-center justify-between px-5 py-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-blue-50/60 border border-indigo-100/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white shadow-sm shadow-amber-200">
                  <Ic.Star />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 leading-none">Participante Afiliado</p>
                  <p className="text-[11px] text-slate-400 mt-1">Accede a tarifas preferenciales en cursos</p>
                </div>
              </div>
              <Switch
                isSelected={form.esAfiliado}
                onValueChange={val => handleChange("esAfiliado", val)}
                size="sm"
                color="primary"
              />
            </div>
          </CardBody>
        </Card>

        {/* 2 · DIRECCIÓN */}
        <Card
          shadow="none"
          className="rounded-3xl border border-white/80 bg-white/70 backdrop-blur-xl"
          style={{ boxShadow: "0 4px 24px 0 rgba(99,102,241,0.07), 0 1px 4px 0 rgba(0,0,0,0.04)" }}
        >
          <CardBody className="p-8">
            <StepPill n={2} icon={<Ic.MapPin />} label="Dirección" sub="Domicilio actual del participante" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input {...inp("calle", "Calle *")} endContent={<FieldBadge ok={!!form.calle && !errors.calle} />} />
              </div>
              <Input {...inp("colonia", "Colonia *")} endContent={<FieldBadge ok={!!form.colonia && !errors.colonia} />} />
              <Input
                {...inp("cp", "Código Postal *")}
                maxLength={5}
                type="text"
                inputMode="numeric"
                endContent={<FieldBadge ok={!!form.cp && !errors.cp} />}
              />
            </div>
          </CardBody>
        </Card>

        {/* 3 · DATOS FISCALES */}
        <Card
          shadow="none"
          className="rounded-3xl border border-white/80 bg-white/70 backdrop-blur-xl"
          style={{ boxShadow: "0 4px 24px 0 rgba(99,102,241,0.07), 0 1px 4px 0 rgba(0,0,0,0.04)" }}
        >
          <CardBody className="p-8">
            <StepPill n={3} icon={<Ic.Receipt />} label="Datos fiscales" sub="Todos los campos son opcionales" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                {...inp("curp", "CURP")}
                description="18 caracteres"
                maxLength={18}
                onChange={e => handleChange("curp", e.target.value.toUpperCase())}
              />
              <Input
                {...inp("rfc", "RFC")}
                description="12 – 13 caracteres"
                maxLength={13}
                onChange={e => handleChange("rfc", e.target.value.toUpperCase())}
              />
            </div>
          </CardBody>
        </Card>

        {/* 4 + 5 · EMPRESA / CURSO (dos columnas) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Empresa */}
          <Card
            shadow="none"
            className="rounded-3xl border border-white/80 bg-white/70 backdrop-blur-xl"
            style={{ boxShadow: "0 4px 24px 0 rgba(99,102,241,0.07), 0 1px 4px 0 rgba(0,0,0,0.04)" }}
          >
            <CardBody className="p-8">
              <StepPill n={4} icon={<Ic.Building />} label="Empresa" sub="Opcional" />
              <Autocomplete
                label="Buscar empresa"
                size="sm"
                variant="bordered"
                radius="lg"
                onOpenChange={open => { if (open) handleOpenEmpresas(); }}
                onInputChange={buscarEmpresasDebounced}
                onSelectionChange={key => handleChange("empresaId", key ? Number(key) : null)}
                isLoading={loadingEmpresas}
                placeholder={loadingEmpresas ? "Cargando..." : "Escriba o seleccione"}
                classNames={acCN}
                inputProps={acInp}
                listboxProps={{
                  emptyContent: loadingEmpresas
                    ? <div className="flex justify-center py-5"><Spinner size="sm" color="primary" /></div>
                    : <p className="text-xs text-slate-400 text-center py-4">Sin resultados</p>,
                }}
              >
                {empresas.map(emp => (
                  <AutocompleteItem key={emp.id} textValue={emp.nombre}>
                    <div className="flex items-center gap-2.5 py-1">
                      <Avatar
                        name={emp.nombre.charAt(0)}
                        size="sm"
                        className="w-7 h-7 text-tiny bg-indigo-100 text-indigo-600 font-bold flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">{emp.nombre}</p>
                        {emp.rfc && <p className="text-[11px] text-slate-400">{emp.rfc}</p>}
                      </div>
                    </div>
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            </CardBody>
          </Card>

          {/* Curso */}
          <Card
            shadow="none"
            className="rounded-3xl border border-white/80 bg-white/70 backdrop-blur-xl"
            style={{ boxShadow: "0 4px 24px 0 rgba(99,102,241,0.07), 0 1px 4px 0 rgba(0,0,0,0.04)" }}
          >
            <CardBody className="p-8">
              <StepPill n={5} icon={<Ic.Book />} label="Curso" sub="Opcional" />
              <Autocomplete
                label="Buscar curso"
                size="sm"
                variant="bordered"
                radius="lg"
                onOpenChange={open => { if (open) handleOpenCursos(); }}
                onInputChange={buscarCursosDebounced}
                onSelectionChange={key => handleChange("cursoId", key ? Number(key) : null)}
                isLoading={loadingCursos}
                placeholder={loadingCursos ? "Cargando..." : "Escriba o seleccione"}
                classNames={acCN}
                inputProps={acInp}
                listboxProps={{
                  emptyContent: loadingCursos
                    ? <div className="flex justify-center py-5"><Spinner size="sm" color="primary" /></div>
                    : <p className="text-xs text-slate-400 text-center py-4">Sin resultados</p>,
                }}
              >
                {cursos.map(curso => (
                  <AutocompleteItem key={curso.id} textValue={curso.nombre}>
                    <div className="py-1">
                      <p className="text-sm font-semibold text-slate-700">{curso.nombre}</p>
                      {curso.instructor && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {typeof curso.instructor === "object"
                            ? `${curso.instructor.nombre ?? ""} ${curso.instructor.apellidoPaterno ?? ""}`.trim()
                            : curso.instructor}
                        </p>
                      )}
                      {(curso.precioAfiliado != null || curso.precioPublico != null) && (
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          {curso.precioAfiliado != null && (
                            <Chip size="sm" variant="flat" color="primary" className="h-[18px] text-[10px] font-semibold">
                              Afiliado ${curso.precioAfiliado}
                            </Chip>
                          )}
                          {curso.precioPublico != null && (
                            <Chip size="sm" variant="flat" color="default" className="h-[18px] text-[10px] font-semibold">
                              Público ${curso.precioPublico}
                            </Chip>
                          )}
                        </div>
                      )}
                    </div>
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            </CardBody>
          </Card>
        </div>

        {/* ── Error banner del servidor ── */}
        {submitError && (
          <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-rose-50 border border-rose-200">
            <span className="text-rose-500 flex-shrink-0 mt-0.5"><Ic.AlertCircle /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-rose-700">Error del servidor</p>
              <pre className="text-xs text-rose-600 mt-0.5 whitespace-pre-wrap break-words font-mono leading-relaxed">
                {submitError}
              </pre>
            </div>
            <button
              onClick={() => setSubmitError(null)}
              className="text-rose-400 hover:text-rose-600 transition-colors flex-shrink-0"
            >
              <Ic.X />
            </button>
          </div>
        )}

        {/* ── Botón submit ── */}
        <div className="pb-8">
          <Button
            size="lg"
            radius="full"
            isLoading={isSubmitting}
            onPress={handleSubmit}
            className={[
              "w-full h-14 text-[15px] font-bold tracking-wide text-white",
              `bg-gradient-to-r ${C.accent}`,
              "shadow-xl shadow-indigo-300/50",
              "hover:shadow-2xl hover:shadow-indigo-400/40 hover:scale-[1.015]",
              "active:scale-[0.985]",
              "transition-all duration-200",
            ].join(" ")}
          >
            {isSubmitting ? "Registrando..." : "Registrar participante"}
          </Button>

          {/* Leyenda */}
          <p className="text-center text-[11px] text-slate-400 mt-3 tracking-wide">
            Campos con <span className="text-rose-400 font-bold">*</span> son obligatorios · Los demás son opcionales
          </p>
        </div>

      </div>
    </div>
  );
}