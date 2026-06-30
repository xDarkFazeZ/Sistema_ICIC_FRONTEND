import { useState } from "react";
import { Input } from "@heroui/react";
import { sileo } from "sileo";

import ModalForm from "../../common/modalForm";
import { crearEmpresa } from "../../../services/empresaService";
import { useEmpresaModal } from "./EmpresaModalContext";

import {
  BuildingOffice2Icon,
  IdentificationIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

const RFC_REGEX = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;

function validarRFC(rfc: string): string | null {
  const clean = rfc.trim().toUpperCase();

  if (!clean) return "El RFC es requerido";
  if (!RFC_REGEX.test(clean)) return "RFC inválido (ej: ABC123456XY1)";

  return null;
}

interface EmpresaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (empresa: {
    id: number;
    nombre: string;
    rfc: string;
    direccion: string;
  }) => void;
}

const INITIAL_FORM = {
  nombre: "",
  rfc: "",
  direccion: "",
  telefono: "",
  correo: "",
};

export default function EmpresaModal({
  isOpen,
  onClose,
  onSuccess,
}: EmpresaModalProps) {
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { origen } = useEmpresaModal();

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.nombre.trim() || form.nombre.trim().length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres";
    }

    if (form.nombre.trim().length > 100) {
      newErrors.nombre = "El nombre no puede exceder 100 caracteres";
    }

    const rfcError = validarRFC(form.rfc);

    if (rfcError) {
      newErrors.rfc = rfcError;
    }

    if (!form.direccion.trim() || form.direccion.trim().length < 5) {
      newErrors.direccion = "La dirección debe tener al menos 5 caracteres";
    }

    if (form.direccion.trim().length > 200) {
      newErrors.direccion = "La dirección no puede exceder 200 caracteres";
    }

    if (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      newErrors.correo = "Correo electrónico inválido";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        nombre: form.nombre.trim(),
        rfc: form.rfc.trim().toUpperCase(),
        direccion: form.direccion.trim(),
        ...(form.telefono.trim() && {
          telefono: form.telefono.trim(),
        }),
        ...(form.correo.trim() && {
          correo: form.correo.trim(),
        }),
      };

      const response = await crearEmpresa(payload);
      const empresaCreada = response.data || response;

      sileo.success({
        title: "¡Empresa creada!",
        description: `${empresaCreada.nombre} fue registrada correctamente`,
      });

      onSuccess({
        id: empresaCreada.id,
        nombre: empresaCreada.nombre,
        rfc: empresaCreada.rfc,
        direccion: empresaCreada.direccion,
      });

      handleClose();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Error al crear la empresa";

      if (
        msg.toLowerCase().includes("rfc") ||
        msg.toLowerCase().includes("unique")
      ) {
        setErrors((prev) => ({
          ...prev,
          rfc: "Este RFC ya está registrado en el sistema",
        }));
      } else {
        sileo.error({
          title: "Error al guardar",
          description: msg,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({ ...INITIAL_FORM });
    setErrors({});
    onClose();
  };

  const mensajeContextual =
    origen === "fecap"
      ? "La empresa se asignará para actualizar su saldo FECAP de inmediato."
      : origen === "curso"
        ? "La empresa se asignará al curso cerrado de manera automática."
        : "La empresa se asignará al participante de manera automática.";

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={handleClose}
      title="Nueva Empresa"
      size="lg"
      isLoading={isSubmitting}
      onSubmit={handleSubmit}
      submitText="Crear y asignar empresa"
    >
      <div className="space-y-5 px-1">
        {/* Aviso contextual según origen */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-primary-50 border border-primary-200">
          <BuildingOffice2Icon className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />

          <p className="text-sm text-primary-700">
            {mensajeContextual}
          </p>
        </div>

        {/* Datos requeridos */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-default-500 uppercase tracking-wide">
            Datos requeridos
          </p>

          <Input
            label="Nombre o razón social"
            placeholder="Ej: Empresa Ejemplo S.A. de C.V."
            value={form.nombre}
            onChange={(e) => handleChange("nombre", e.target.value)}
            isInvalid={!!errors.nombre}
            errorMessage={errors.nombre}
            maxLength={100}
            startContent={
              <BuildingOffice2Icon className="w-4 h-4 text-default-400 shrink-0" />
            }
            isRequired
          />

          <Input
            label="RFC"
            placeholder="Ej: EEM900101AB1"
            value={form.rfc}
            onChange={(e) =>
              handleChange(
                "rfc",
                e.target.value.toUpperCase().replace(/[^A-ZÑ&0-9]/g, ""),
              )
            }
            isInvalid={!!errors.rfc}
            errorMessage={errors.rfc}
            maxLength={13}
            startContent={
              <IdentificationIcon className="w-4 h-4 text-default-400 shrink-0" />
            }
            description="12 caracteres (persona moral) o 13 (persona física)"
            isRequired
          />

          <Input
            label="Dirección"
            placeholder="Calle, número, colonia, municipio, estado"
            value={form.direccion}
            onChange={(e) => handleChange("direccion", e.target.value)}
            isInvalid={!!errors.direccion}
            errorMessage={errors.direccion}
            maxLength={200}
            startContent={
              <MapPinIcon className="w-4 h-4 text-default-400 shrink-0" />
            }
            isRequired
          />
        </div>

        {/* Datos opcionales */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-default-500 uppercase tracking-wide">
            Datos opcionales
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Teléfono"
              placeholder="Ej: 8001234567"
              value={form.telefono}
              onChange={(e) =>
                handleChange(
                  "telefono",
                  e.target.value.replace(/\D/g, "").slice(0, 10),
                )
              }
              maxLength={15}
              startContent={
                <PhoneIcon className="w-4 h-4 text-default-400 shrink-0" />
              }
            />

            <Input
              label="Correo electrónico"
              placeholder="contacto@empresa.com"
              type="email"
              value={form.correo}
              onChange={(e) => handleChange("correo", e.target.value)}
              isInvalid={!!errors.correo}
              errorMessage={errors.correo}
              startContent={
                <EnvelopeIcon className="w-4 h-4 text-default-400 shrink-0" />
              }
            />
          </div>
        </div>
      </div>
    </ModalForm>
  );
}