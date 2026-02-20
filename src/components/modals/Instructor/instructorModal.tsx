import { useState, useEffect, useRef } from "react";
import {
  Input,
  Button,
  Select,
  SelectItem,
  Switch,
  Spinner,
} from "@heroui/react";
import { DatePicker } from "@heroui/react";
import { sileo } from "sileo";
import ModalForm from "../../common/modalForm";

// Servicios
//import { crearInstructor, actualizarInstructor } from "../../../services/instructorService";

// ── Iconos ───────────────────────────────────────────────────────────────────
const Ic = {
  User: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Phone: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
    </svg>
  ),
  Mail: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/>
    </svg>
  ),
  Receipt: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Info: () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
};

// ── HELPERS DE UI (DEFINIDOS ANTES DE USARLOS) ─────────────────────────────
function RequiredLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <span>
      {label}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </span>
  );
}

function FieldOk({ ok }: { ok: boolean }) {
  return ok ? <span className="text-emerald-500"><Ic.Check /></span> : null;
}

// ✅ OptionalBanner definido ANTES de ser usado
function OptionalBanner({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 mb-5">
      <span className="text-slate-400 flex-shrink-0"><Ic.Info /></span>
      <p className="text-[11px] text-slate-500">{text}</p>
    </div>
  );
}

// ── Validadores ───────────────────────────────────────────────────────────────
const validators: Record<string, (v: any, form?: Record<string, any>) => string | null> = {
  nombre: v => !v || v.trim().length < 2 
    ? "Requerido · Mínimo 2 caracteres" 
    : v.length > 50 ? "Máximo 50 caracteres" : null,

  apellidoPaterno: v => !v || v.trim().length < 2 
    ? "Requerido · Mínimo 2 caracteres" 
    : v.length > 50 ? "Máximo 50 caracteres" : null,

  apellidoMaterno: v => v && v.trim().length < 2 
    ? "Mínimo 2 caracteres" 
    : v && v.length > 50 ? "Máximo 50 caracteres" : null,

  fechaNacimiento: v => !v ? "La fecha de nacimiento es requerida" : null,

  rfc: v => v && !/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(v) 
    ? "RFC inválido · 12-13 caracteres" : null,

  celular: v => v && !/^[0-9]{10}$/.test(v) 
    ? "Debe tener exactamente 10 dígitos" : null,

  correo: v => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) 
    ? "Formato de correo inválido" : null,
};

const REQUIRED_FIELDS = ["nombre", "apellidoPaterno", "fechaNacimiento"];

// ── Props del modal ──────────────────────────────────────────────────────────
interface InstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (instructor: any) => void;
  instructorToEdit?: any;
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function InstructorModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  instructorToEdit 
}: InstructorModalProps) {
  const [form, setForm] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset form cuando se abre/cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setForm({});
      setErrors({});
      setTouched({});
      setSubmitError(null);
    } else if (instructorToEdit) {
      setForm({
        ...instructorToEdit,
        fechaNacimiento: instructorToEdit.fechaNacimiento?.split('T')[0],
      });
    }
  }, [isOpen, instructorToEdit]);

  // Handlers
  const handleChange = (field: string, value: any) => {
    const v = value === "" ? null : value;
    const updated = { ...form, [field]: v };
    setForm(updated);
    if (touched[field] && validators[field]) {
      setErrors(p => ({ ...p, [field]: validators[field](v, updated) }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(p => ({ ...p, [field]: true }));
    if (validators[field]) {
      setErrors(p => ({ ...p, [field]: validators[field](form[field], form) }));
    }
  };

  const validateAll = () => {
    const e: Record<string, string | null> = {};
    for (const [field, validate] of Object.entries(validators)) {
      const err = validate(form[field], form);
      if (err) e[field] = err;
    }
    setErrors(e);
    setTouched(Object.fromEntries(Object.keys(validators).map(k => [k, true])));
    return Object.keys(e).length === 0;
  };

  // Submit
  const handleSubmit = async () => {
    if (!validateAll()) {
      sileo.warning({
        title: "Campos con errores",
        description: "Revisa los campos marcados en rojo antes de continuar.",
      });
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    // Limpiar datos vacíos
    const payload: Record<string, any> = {};
    for (const [k, v] of Object.entries(form)) {
      if (v !== null && v !== undefined && v !== "") {
        payload[k] = v;
      }
    }

    try {
      let response;
      if (instructorToEdit) {
        response = await actualizarInstructor(instructorToEdit.id, payload);
      } else {
        response = await crearInstructor(payload);
      }

      sileo.success({
        title: instructorToEdit ? "Instructor actualizado" : "Instructor creado",
        description: instructorToEdit 
          ? "El instructor se ha actualizado correctamente." 
          : "El instructor se ha creado correctamente.",
      });

      onSuccess?.(response);
      onClose();
    } catch (err: any) {
      const data = err?.response?.data;
      const msg = data?.message ?? data?.error ?? err?.message ?? "Error al guardar el instructor";
      setSubmitError(typeof msg === "string" ? msg : JSON.stringify(msg));
      sileo.error({
        title: "Error",
        description: "No se pudo guardar el instructor. Intenta de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calcular progreso
  const filled = REQUIRED_FIELDS.filter(f => {
    const val = form[f];
    return val !== null && val !== undefined && val !== "";
  }).length;
  const totalRequired = REQUIRED_FIELDS.length;
  const pct = Math.round((filled / totalRequired) * 100);

  // Estilos compartidos
  const inputCN = {
    inputWrapper: [
      "border border-slate-200 bg-white shadow-sm transition-all duration-200",
      "data-[hover=true]:border-indigo-300",
      "data-[focus=true]:border-indigo-500 data-[focus=true]:shadow-md",
      "data-[invalid=true]:border-rose-400 data-[invalid=true]:bg-rose-50/30",
    ].join(" "),
    label: "text-slate-500 text-xs font-medium",
    input: "text-slate-800 text-sm font-medium",
    errorMessage: "text-rose-500 text-[11px] font-medium mt-1",
  };

  const inp = (field: string, label: string, required = true, extra: any = {}) => ({
    label: <RequiredLabel label={label} required={required} /> as any,
    size: "sm" as const,
    variant: "bordered" as const,
    radius: "lg" as const,
    isInvalid: !!(touched[field] && errors[field]),
    errorMessage: touched[field] ? errors[field] ?? undefined : undefined,
    onBlur: () => handleBlur(field),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange(field, e.target.value),
    classNames: inputCN,
    value: form[field]?.toString() ?? "",
    ...extra,
  });

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title={instructorToEdit ? "Editar Instructor" : "Nuevo Instructor"}
      size="2xl"
      isLoading={isSubmitting}
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
        
        {/* Barra de progreso */}
        {!instructorToEdit && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 sticky top-0 z-10 bg-white/90 backdrop-blur-sm">
            <div className="relative w-10 h-10 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle
                  cx="20" cy="20" r="16" fill="none"
                  stroke={pct === 100 ? "#10b981" : "#4f46e5"}
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
              <p className="text-xs font-medium text-slate-600">Progreso del formulario</p>
              <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Error del servidor */}
        {submitError && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200">
            <span className="text-rose-500 mt-0.5"><Ic.AlertCircle /></span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-700">Error</p>
              <p className="text-xs text-rose-600">{submitError}</p>
            </div>
            <button onClick={() => setSubmitError(null)} className="text-rose-400">
              <Ic.X />
            </button>
          </div>
        )}

        {/* 1. DATOS PERSONALES */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Ic.User /> Datos personales
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              {...inp("nombre", "Nombre", true)}
              placeholder="Ej: Juan"
              endContent={<FieldOk ok={!!form.nombre && !errors.nombre} />}
            />

            <Input
              {...inp("apellidoPaterno", "Apellido Paterno", true)}
              placeholder="Ej: Pérez"
              endContent={<FieldOk ok={!!form.apellidoPaterno && !errors.apellidoPaterno} />}
            />

            <Input
              {...inp("apellidoMaterno", "Apellido Materno", false)}
              placeholder="Ej: González"
              endContent={form.apellidoMaterno && !errors.apellidoMaterno ? <FieldOk ok /> : null}
            />

            <DatePicker
              label={<RequiredLabel label="Fecha de Nacimiento" required /> as any}
              size="sm"
              variant="bordered"
              radius="lg"
              locale="es-MX"
              showMonthAndYearPickers
              isInvalid={!!(touched.fechaNacimiento && errors.fechaNacimiento)}
              errorMessage={touched.fechaNacimiento ? errors.fechaNacimiento ?? undefined : undefined}
              onChange={(date) => {
                handleChange("fechaNacimiento", date?.toString());
                setTouched(p => ({ ...p, fechaNacimiento: true }));
              }}
              classNames={inputCN}
            />
          </div>
        </div>

        {/* 2. CONTACTO */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Ic.Phone /> Contacto <span className="text-[10px] font-normal text-slate-400">(opcional)</span>
          </h3>
          
          <OptionalBanner text="Los datos de contacto son opcionales, pero ayudarán a comunicarse con el instructor." />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              {...inp("celular", "Celular", false)}
              placeholder="5512345678"
              maxLength={10}
              description="10 dígitos"
              startContent={<span className="text-slate-400">+52</span>}
              endContent={form.celular && !errors.celular ? <FieldOk ok /> : null}
            />

            <Input
              {...inp("correo", "Correo electrónico", false)}
              placeholder="ejemplo@correo.com"
              type="email"
              endContent={form.correo && !errors.correo ? <FieldOk ok /> : null}
            />
          </div>
        </div>

        {/* 3. DATOS FISCALES */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Ic.Receipt /> Datos fiscales <span className="text-[10px] font-normal text-slate-400">(opcional)</span>
          </h3>

          <OptionalBanner text="El RFC es opcional. Si lo proporcionas, se validará el formato." />

          <Input
            {...inp("rfc", "RFC", false)}
            placeholder="XXXX000101XXX"
            maxLength={13}
            onChange={e => handleChange("rfc", e.target.value.toUpperCase().replace(/[^A-ZÑ&0-9]/g, ""))}
            endContent={form.rfc && !errors.rfc ? <FieldOk ok /> : null}
          />
        </div>

        <div className="h-4" />
      </div>
    </ModalForm>
  );
}