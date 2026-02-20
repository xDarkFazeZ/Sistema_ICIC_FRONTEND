import { useState, useEffect, useRef } from "react";
import {
  Input,
  Textarea,
  Button,
  Select,
  SelectItem,
  Switch,
  Chip,
  Spinner,
} from "@heroui/react";
import { DatePicker } from "@heroui/react";
import { CalendarDate, parseDate } from "@internationalized/date";
import { sileo } from "sileo";
import ModalForm from "../../common/modalForm";

// Servicios
//import { crearCurso, actualizarCurso } from "../../services/cursoService";
import { buscarInstructores } from "../../../services/instructorService";

// ── Iconos ───────────────────────────────────────────────────────────────────
const Ic = {
  Book: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
    </svg>
  ),
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
  Clock: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Building: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  Dollar: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
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
};

// ── Validadores ───────────────────────────────────────────────────────────────
const validators: Record<string, (v: any, form?: Record<string, any>) => string | null> = {
  nombre: v => !v || v.trim().length < 3 
    ? "Requerido · Mínimo 3 caracteres" 
    : v.length > 100 ? "Máximo 100 caracteres" : null,

  instructorId: v => !v ? "Debes seleccionar un instructor" : null,

  precioAfiliado: v => !v || isNaN(v) || Number(v) <= 0 
    ? "Precio válido requerido" : null,

  precioPublico: v => !v || isNaN(v) || Number(v) <= 0 
    ? "Precio válido requerido" : null,

  precioEstudiante: v => !v || isNaN(v) || Number(v) <= 0 
    ? "Precio válido requerido" : null,

  horario: v => !v || v.trim().length < 3 
    ? "Requerido" : null,

  fechaInicio: v => !v ? "Fecha de inicio requerida" : null,

  // ✅ CORREGIDO: validador de fechaFin sin parámetros opcionales anidados
  fechaFin: (v, form) => {
    if (!v) return "Fecha de fin requerida";
    if (!form?.fechaInicio) return null;
    const inicio = new Date(form.fechaInicio);
    const fin = new Date(v);
    return fin <= inicio ? "La fecha de fin debe ser posterior a la de inicio" : null;
  },

  duracion: v => !v || isNaN(v) || Number(v) <= 0 
    ? "Duración válida requerida (horas)" : null,

  nivelGerencial: v => !v || v.trim().length < 2 
    ? "Requerido" : null,

  aula: v => v && v.length > 50 ? "Máximo 50 caracteres" : null,
};

const REQUIRED_FIELDS = [
  "nombre", "instructorId", "precioAfiliado", "precioPublico", 
  "precioEstudiante", "horario", "fechaInicio", "fechaFin", 
  "duracion", "nivelGerencial"
];

// ── Helper de label ──────────────────────────────────────────────────────────
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

// ── Props del modal ──────────────────────────────────────────────────────────
interface CursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (curso: any) => void;
  cursoToEdit?: any;
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function CursoModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  cursoToEdit 
}: CursoModalProps) {
  const [form, setForm] = useState<Record<string, any>>({ activo: true });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [instructores, setInstructores] = useState<any[]>([]);
  const [loadingInstructores, setLoadingInstructores] = useState(false);

  const instructoresCargados = useRef(false);

  // Reset form cuando se abre/cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setForm({ activo: true });
      setErrors({});
      setTouched({});
      setSubmitError(null);
    } else if (cursoToEdit) {
      // Si hay curso a editar, cargar datos
      setForm({
        ...cursoToEdit,
        fechaInicio: cursoToEdit.fechaInicio?.split('T')[0],
        fechaFin: cursoToEdit.fechaFin?.split('T')[0],
      });
    }
  }, [isOpen, cursoToEdit]);

  // Cargar instructores cuando se abre el select
  const handleOpenInstructores = async () => {
    if (instructoresCargados.current) return;
    setLoadingInstructores(true);
    try {
      setInstructores(await buscarInstructores(""));
      instructoresCargados.current = true;
    } catch (e) {
      console.error("Error cargando instructores:", e);
    } finally {
      setLoadingInstructores(false);
    }
  };

  // Handlers
  const handleChange = (field: string, value: any) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (touched[field] && validators[field]) {
      const error = validators[field](value, updated);
      setErrors(p => ({ ...p, [field]: error }));
    }
    // Validación especial para fechaFin vs fechaInicio
    if (field === "fechaInicio" && touched.fechaFin) {
      const error = validators.fechaFin?.(form.fechaFin, updated);
      setErrors(p => ({ ...p, fechaFin: error ?? null }));
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

    try {
      // Preparar datos para enviar
      const cursoData = {
        ...form,
        instructorId: Number(form.instructorId),
        precioAfiliado: Number(form.precioAfiliado),
        precioPublico: Number(form.precioPublico),
        precioEstudiante: Number(form.precioEstudiante),
        duracion: Number(form.duracion),
        activo: form.activo ?? true,
      };

      let response;
      if (cursoToEdit) {
        response = await actualizarCurso(cursoToEdit.id, cursoData);
      } else {
        response = await crearCurso(cursoData);
      }

      sileo.success({
        title: cursoToEdit ? "Curso actualizado" : "Curso creado",
        description: cursoToEdit 
          ? "El curso se ha actualizado correctamente." 
          : "El curso se ha creado correctamente.",
      });

      onSuccess?.(response);
      onClose();
    } catch (err: any) {
      const data = err?.response?.data;
      const msg = data?.message ?? data?.error ?? err?.message ?? "Error al guardar el curso";
      setSubmitError(typeof msg === "string" ? msg : JSON.stringify(msg));
      sileo.error({
        title: "Error",
        description: "No se pudo guardar el curso. Intenta de nuevo.",
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
      title={cursoToEdit ? "Editar Curso" : "Nuevo Curso"}
      size="3xl"
      isLoading={isSubmitting}
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
        
        {/* Barra de progreso */}
        {!cursoToEdit && (
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

        {/* 1. INFORMACIÓN BÁSICA */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Ic.Book /> Información del curso
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            <Input
              {...inp("nombre", "Nombre del curso")}
              placeholder="Ej: Liderazgo Gerencial"
              endContent={<FieldOk ok={!!form.nombre && !errors.nombre} />}
            />

            <Textarea
              label="Descripción"
              placeholder="Describe los objetivos y contenido del curso..."
              size="sm"
              variant="bordered"
              radius="lg"
              value={form.descripcion ?? ""}
              onBlur={() => handleBlur("descripcion")}
              onChange={(e) => handleChange("descripcion", e.target.value)}
              classNames={inputCN}
              minRows={2}
            />
          </div>
        </div>

        {/* 2. INSTRUCTOR */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Ic.User /> Instructor asignado
          </h3>

          <Select
            label={<RequiredLabel label="Seleccionar instructor" required /> as any}
            size="sm"
            variant="bordered"
            radius="lg"
            placeholder="Buscar instructor..."
            isInvalid={!!(touched.instructorId && errors.instructorId)}
            errorMessage={touched.instructorId ? errors.instructorId : undefined}
            onOpenChange={handleOpenInstructores}
            isLoading={loadingInstructores}
            selectedKeys={form.instructorId ? [form.instructorId.toString()] : []}
            onChange={(e) => {
              const value = e.target.value;
              handleChange("instructorId", value ? Number(value) : null);
              handleBlur("instructorId");
            }}
            classNames={{
              trigger: [
                "border border-slate-200 bg-white shadow-sm",
                "data-[hover=true]:border-indigo-300",
                "data-[open=true]:border-indigo-500",
                "data-[invalid=true]:border-rose-400",
              ].join(" "),
              label: "text-slate-500 text-xs font-medium",
              value: "text-slate-800 text-sm",
            }}
          >
            {instructores.map(inst => (
              <SelectItem key={inst.id} value={inst.id}>
                {inst.nombre} {inst.apellidoPaterno} {inst.apellidoMaterno || ''}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* 3. FECHAS Y HORARIO */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Ic.Calendar /> Fechas y horario
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              label={<RequiredLabel label="Fecha de inicio" required /> as any}
              size="sm"
              variant="bordered"
              radius="lg"
              isInvalid={!!(touched.fechaInicio && errors.fechaInicio)}
              errorMessage={touched.fechaInicio ? errors.fechaInicio : undefined}
              onChange={(date) => {
                handleChange("fechaInicio", date?.toString());
                setTouched(p => ({ ...p, fechaInicio: true }));
              }}
              classNames={inputCN}
            />

            <DatePicker
              label={<RequiredLabel label="Fecha de fin" required /> as any}
              size="sm"
              variant="bordered"
              radius="lg"
              isInvalid={!!(touched.fechaFin && errors.fechaFin)}
              errorMessage={touched.fechaFin ? errors.fechaFin : undefined}
              onChange={(date) => {
                handleChange("fechaFin", date?.toString());
                setTouched(p => ({ ...p, fechaFin: true }));
              }}
              classNames={inputCN}
            />

            <Input
              {...inp("horario", "Horario")}
              placeholder="Ej: Lunes y Miércoles 9-11am"
              endContent={<FieldOk ok={!!form.horario && !errors.horario} />}
            />

            <Input
              {...inp("duracion", "Duración (horas)", true, { type: "number" })}
              placeholder="40"
              endContent={<FieldOk ok={!!form.duracion && !errors.duracion} />}
            />
          </div>
        </div>

        {/* 4. PRECIOS */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Ic.Dollar /> Precios
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              {...inp("precioAfiliado", "Precio Afiliado", true, { 
                type: "number",
                startContent: <span className="text-slate-400">$</span>
              })}
              placeholder="0.00"
            />
            <Input
              {...inp("precioPublico", "Precio Público", true, { 
                type: "number",
                startContent: <span className="text-slate-400">$</span>
              })}
              placeholder="0.00"
            />
            <Input
              {...inp("precioEstudiante", "Precio Estudiante", true, { 
                type: "number",
                startContent: <span className="text-slate-400">$</span>
              })}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* 5. DETALLES ADICIONALES */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Ic.Building /> Detalles adicionales
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              {...inp("nivelGerencial", "Nivel gerencial")}
              placeholder="Ej: Mandos medios, Alta dirección"
              endContent={<FieldOk ok={!!form.nivelGerencial && !errors.nivelGerencial} />}
            />

            <Input
              {...inp("aula", "Aula", false)}
              placeholder="Ej: Salón 101, Virtual"
              endContent={form.aula && !errors.aula ? <FieldOk ok /> : null}
            />
          </div>

          {/* Estado activo/inactivo */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-sm font-semibold text-slate-700">Curso activo</p>
              <p className="text-[11px] text-slate-500">
                Los cursos inactivos no aparecen en las listas de inscripción
              </p>
            </div>
            <Switch
              isSelected={form.activo ?? true}
              onValueChange={(val) => handleChange("activo", val)}
              size="sm"
              color="success"
            />
          </div>
        </div>

        <div className="h-4" /> {/* Espacio extra */}
      </div>
    </ModalForm>
  );
}