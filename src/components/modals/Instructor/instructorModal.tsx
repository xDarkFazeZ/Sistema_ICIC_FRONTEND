import { useEffect, useState } from "react";
import { Input, DatePicker } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { sileo } from "sileo";
import ModalForm from "../../common/modalForm";
import {
  crearInstructor,
  actualizarInstructor,
} from "../../../services/instructorService";

interface InstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (instructor: any) => void;
  instructorToEdit?: any;
}

const validate = {
  nombre: (v: string) =>
    !v || v.trim().length < 2
      ? "Mínimo 2 caracteres"
      : v.length > 50
      ? "Máximo 50 caracteres"
      : null,

  apellidoPaterno: (v: string) =>
    !v || v.trim().length < 2
      ? "Mínimo 2 caracteres"
      : v.length > 50
      ? "Máximo 50 caracteres"
      : null,

  apellidoMaterno: (v: string) =>
    v && v.trim().length < 2
      ? "Mínimo 2 caracteres"
      : v && v.length > 50
      ? "Máximo 50 caracteres"
      : null,

  rfc: (v: string) =>
    v && !/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(v)
      ? "RFC inválido (12-13 caracteres)"
      : null,

  celular: (v: string) =>
    v && !/^[0-9]{10}$/.test(v) ? "Debe tener 10 dígitos" : null,

  correo: (v: string) =>
    v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      ? "Formato de correo inválido"
      : null,
  
  fechaNacimiento: (v: string) => {
    if (!v) return null;
    const date = new Date(v);
    return isNaN(date.getTime()) ? "Fecha inválida" : null;
  },
};

const INITIAL_FORM = {
  nombre: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  rfc: "",
  celular: "",
  correo: "",
  fechaNacimiento: "",
};

const FORM_ID = "instructor-modal-form";

export default function InstructorModal({
  isOpen,
  onClose,
  onSuccess,
  instructorToEdit,
}: InstructorModalProps) {
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setForm({ ...INITIAL_FORM });
      setErrors({});
      setTouched({});
      setSubmitError(null);
      return;
    }
    if (instructorToEdit) {
      setForm({
        nombre: instructorToEdit.nombre ?? "",
        apellidoPaterno: instructorToEdit.apellidoPaterno ?? "",
        apellidoMaterno: instructorToEdit.apellidoMaterno ?? "",
        rfc: instructorToEdit.rfc ?? "",
        celular: instructorToEdit.celular ?? "",
        correo: instructorToEdit.correo ?? "",
        fechaNacimiento: instructorToEdit.fechaNacimiento
          ? instructorToEdit.fechaNacimiento.split("T")[0]
          : "",
      });
    }
  }, [isOpen, instructorToEdit]);

  const handleChange = (field: keyof typeof INITIAL_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field] && validate[field as keyof typeof validate]) {
      setErrors((prev) => ({
        ...prev,
        [field]: (validate[field as keyof typeof validate] as any)(value),
      }));
    }
  };

  const handleBlur = (field: keyof typeof INITIAL_FORM) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (validate[field as keyof typeof validate]) {
      setErrors((prev) => ({
        ...prev,
        [field]: (validate[field as keyof typeof validate] as any)(form[field]),
      }));
    }
  };

  const validateAll = () => {
    const e: Record<string, string | null> = {};
    for (const field of Object.keys(validate) as (keyof typeof validate)[]) {
      const err = validate[field](form[field as keyof typeof INITIAL_FORM]);
      if (err) e[field] = err;
    }
    setErrors(e);
    setTouched(Object.fromEntries(Object.keys(validate).map((k) => [k, true])));
    return Object.values(e).every((v) => !v);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAll()) {
      sileo?.warning?.({
        title: "Campos con errores",
        description: "Revisa los campos marcados antes de continuar.",
      });
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    // Construir payload
    const payload: Record<string, any> = {
      nombre: form.nombre.trim(),
      apellidoPaterno: form.apellidoPaterno.trim(),
    };
    
    if (form.apellidoMaterno.trim()) payload.apellidoMaterno = form.apellidoMaterno.trim();
    if (form.rfc.trim()) payload.rfc = form.rfc.trim();
    if (form.celular.trim()) payload.celular = form.celular.trim();
    if (form.correo.trim()) payload.correo = form.correo.trim();

    // Manejar fecha de nacimiento
    if (form.fechaNacimiento && form.fechaNacimiento.trim()) {
      // Verificar que sea una fecha válida
      const parsed = new Date(form.fechaNacimiento);
      if (!isNaN(parsed.getTime())) {
        payload.fechaNacimiento = form.fechaNacimiento;
      }
    } else if (instructorToEdit) {
      // Si estamos editando y la fecha está vacía, enviar null para limpiar
      payload.fechaNacimiento = null;
    }
    // Si es creación y no hay fecha, no incluimos el campo

    console.log('📦 Payload a enviar:', payload);

    // Llamada al API
    try {
      let response;
      if (instructorToEdit) {
        response = await actualizarInstructor(instructorToEdit.id, payload);
      } else {
        response = await crearInstructor(payload);
      }

      sileo?.success?.({
        title: instructorToEdit ? "Instructor actualizado" : "Instructor creado",
        description: instructorToEdit
          ? "Los datos se actualizaron correctamente."
          : "El instructor se creó correctamente.",
      });

      onSuccess?.(response);
      onClose();
    } catch (err: any) {
      console.error('❌ Error en submit:', err);
      const data = err?.response?.data;
      const msg = data?.message ?? data?.error ?? err?.message ?? "Error desconocido";
      setSubmitError(typeof msg === "string" ? msg : JSON.stringify(msg));
      sileo?.error?.({
        title: "Error",
        description: "No se pudo guardar el instructor.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progreso de campos obligatorios
  const requeridos = ["nombre", "apellidoPaterno"] as const;
  const filled = requeridos.filter((f) => form[f].trim().length >= 2).length;
  const pct = Math.round((filled / requeridos.length) * 100);

  const fieldProps = (field: keyof typeof INITIAL_FORM) => ({
    value: form[field],
    onValueChange: (v: string) => handleChange(field, v),
    onBlur: () => handleBlur(field),
    isInvalid: !!(touched[field] && errors[field]),
    errorMessage: touched[field] ? errors[field] ?? undefined : undefined,
    size: "sm" as const,
    variant: "bordered" as const,
    radius: "lg" as const,
  });

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title={instructorToEdit ? "Editar Instructor" : "Nuevo Instructor"}
      size="2xl"
      isLoading={isSubmitting}
      formId={FORM_ID}
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-6">
        {/* Barra de progreso */}
        {!instructorToEdit && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-default-50 border border-default-200">
            <div className="relative w-10 h-10 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#e4e4e7" strokeWidth="3" />
                <circle
                  cx="20" cy="20" r="16" fill="none"
                  stroke={pct === 100 ? "#17c964" : "#006FEE"}
                  strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 16}`}
                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - pct / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-default-700">
                {pct}%
              </span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-default-600">
                Campos obligatorios completados
              </p>
              <div className="w-full h-1.5 bg-default-200 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: pct === 100 ? "#17c964" : "#006FEE",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Error del servidor */}
        {submitError && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-danger-50 border border-danger-200">
            <div className="flex-1">
              <p className="text-sm font-semibold text-danger-700">Error al guardar</p>
              <p className="text-xs text-danger-600 mt-0.5">{submitError}</p>
            </div>
            <button
              type="button"
              onClick={() => setSubmitError(null)}
              className="text-danger-400 hover:text-danger-600 text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* DATOS PERSONALES */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-default-500 uppercase tracking-wider">
              Datos personales
            </span>
            <div className="flex-1 h-px bg-default-200" />
            <span className="text-[10px] text-danger-500 font-medium">* Obligatorio</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              {...fieldProps("nombre")}
              label="Nombre"
              placeholder="Ej: Juan"
              isRequired
              description="Requerido"
            />
            <Input
              {...fieldProps("apellidoPaterno")}
              label="Apellido Paterno"
              placeholder="Ej: Pérez"
              isRequired
              description="Requerido"
            />
            <Input
              {...fieldProps("apellidoMaterno")}
              label="Apellido Materno"
              placeholder="Ej: González"
              description="Opcional"
              className="col-span-2"
            />
            <div className="col-span-2">
              <DatePicker
                label="Fecha de Nacimiento"
                size="sm"
                variant="bordered"
                radius="lg"
                granularity="day"
                showMonthAndYearPickers
                value={form.fechaNacimiento ? parseDate(form.fechaNacimiento) : undefined}
                onChange={(date) =>
                  handleChange("fechaNacimiento", date ? date.toString() : "")
                }
                isInvalid={!!(touched.fechaNacimiento && errors.fechaNacimiento)}
                errorMessage={
                  touched.fechaNacimiento ? errors.fechaNacimiento ?? undefined : undefined
                }
                description="Opcional"
              />
            </div>
          </div>
        </section>

        {/* CONTACTO */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-default-500 uppercase tracking-wider">
              Contacto
            </span>
            <div className="flex-1 h-px bg-default-200" />
            <span className="text-[10px] text-default-400 font-medium">Opcional</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              {...fieldProps("celular")}
              label="Celular"
              placeholder="5512345678"
              maxLength={10}
              description="10 dígitos"
              onValueChange={(v) =>
                handleChange("celular", v.replace(/\D/g, "").slice(0, 10))
              }
              startContent={<span className="text-default-400 text-sm">+52</span>}
            />
            <Input
              {...fieldProps("correo")}
              label="Correo electrónico"
              placeholder="ejemplo@correo.com"
              type="email"
              description="Opcional"
            />
          </div>
        </section>

        {/* DATOS FISCALES */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-default-500 uppercase tracking-wider">
              Datos fiscales
            </span>
            <div className="flex-1 h-px bg-default-200" />
            <span className="text-[10px] text-default-400 font-medium">Opcional</span>
          </div>

          <Input
            {...fieldProps("rfc")}
            label="RFC"
            placeholder="XXXX000101XXX"
            maxLength={13}
            description="12-13 caracteres"
            onValueChange={(v) =>
              handleChange("rfc", v.toUpperCase().replace(/[^A-ZÑ&0-9]/g, ""))
            }
          />
        </section>
      </form>
    </ModalForm>
  );
}