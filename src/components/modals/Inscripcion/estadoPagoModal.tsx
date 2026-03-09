// components/modals/Inscripcion/EstadoPagoModal.tsx
import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Input,
  Chip,
  Divider,
  Card,
  CardBody,
} from "@heroui/react";
import { sileo } from "sileo";
import { actualizarInscripcion } from "../../../services/inscripcionService";
import {
  CurrencyDollarIcon,
  XMarkIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// ── Catálogos ─────────────────────────────────────────────────────────────────

const ESTADO_PAGO = [
  { key: "PENDIENTE",   label: "Pendiente",   color: "warning" as const },
  { key: "PAGADO",      label: "Pagado",      color: "success" as const },
  { key: "CANCELADO",   label: "Cancelado",   color: "danger"  as const },
  { key: "REEMBOLSADO", label: "Reembolsado", color: "default" as const },
] as const;

type EstadoPago = typeof ESTADO_PAGO[number]["key"];

const ESTADO_ICONS: Record<string, any> = {
  PAGADO:      CheckCircleIcon,
  PENDIENTE:   ClockIcon,
  CANCELADO:   XCircleIcon,
  REEMBOLSADO: ArrowPathIcon,
};

function estadoColor(estado: string) {
  return ESTADO_PAGO.find(e => e.key === estado)?.color ?? "default";
}

function fmt(n: number | null | undefined) {
  return (n ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface EstadoPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (inscripcionActualizada: any) => void;
  /** Array de inscripciones del participante (cada una con .curso, .estadoPago, .montoFinal, etc.) */
  inscripciones: any[];
  /** Nombre completo del participante para mostrar */
  nombreParticipante?: string;
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function EstadoPagoModal({
  isOpen,
  onClose,
  onSuccess,
  inscripciones,
  nombreParticipante,
}: EstadoPagoModalProps) {

  const [inscripcionSeleccionada, setInscripcionSeleccionada] = useState<any | null>(null);
  const [estadoPago,  setEstadoPago]  = useState<EstadoPago>("PENDIENTE");
  const [fechaPago,   setFechaPago]   = useState<string>("");
  const [montoPagado, setMontoPagado] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tieneVarias = inscripciones.length > 1;

  // ── Reset / inicializar ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setInscripcionSeleccionada(null);
      setEstadoPago("PENDIENTE");
      setFechaPago("");
      setMontoPagado("");
      return;
    }
    // Una sola inscripción → cargar directo sin pantalla de selección
    if (inscripciones.length === 1) {
      cargarInscripcion(inscripciones[0]);
    }
  }, [isOpen, inscripciones]);

  const cargarInscripcion = (ins: any) => {
    setInscripcionSeleccionada(ins);
    setEstadoPago(ins.estadoPago ?? "PENDIENTE");
    setFechaPago(ins.fechaPago?.split("T")[0] ?? "");
    setMontoPagado(ins.montoPagado?.toString() ?? "");
  };

  const handleVolver = () => {
    setInscripcionSeleccionada(null);
    setEstadoPago("PENDIENTE");
    setFechaPago("");
    setMontoPagado("");
  };

  const handleSubmit = async () => {
    if (!inscripcionSeleccionada) return;
    setIsSubmitting(true);
    try {
      const payload: Record<string, any> = { estadoPago };
      if (estadoPago === "PAGADO") {
        if (fechaPago) payload.fechaPago = fechaPago;
        payload.montoPagado = montoPagado
          ? Number(montoPagado)
          : (inscripcionSeleccionada.montoFinal ?? 0);
      }

      const response = await actualizarInscripcion(inscripcionSeleccionada.id, payload);

      sileo.success({
        title: "Estado actualizado",
        description: `${inscripcionSeleccionada.curso?.nombre ?? "Inscripción"} → ${ESTADO_PAGO.find(e => e.key === estadoPago)?.label}`,
      });

      onSuccess?.(response.data ?? response);
      onClose();
    } catch (err: any) {
      sileo.error({
        title: "Error al actualizar",
        description: err?.response?.data?.message ?? err?.message ?? "Error inesperado",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Vista 1: Selector de inscripción (cuando hay varias) ──────────────────
  const renderSelector = () => (
    <div className="space-y-3">
      <p className="text-sm text-default-600 dark:text-default-400">
        <span className="font-semibold">{nombreParticipante}</span> tiene{" "}
        <span className="font-semibold text-danger">{inscripciones.length} inscripciones</span>.
        Selecciona cuál deseas editar:
      </p>

      <div className="space-y-2">
        {inscripciones.map((ins: any) => {
          const IconEstado = ESTADO_ICONS[ins.estadoPago] ?? ClockIcon;
          const color = estadoColor(ins.estadoPago);
          const saldo = ins.saldoPendiente ?? Math.max(0, (ins.montoFinal ?? 0) - (ins.montoPagado ?? 0));

          return (
            <button
              key={ins.id}
              onClick={() => cargarInscripcion(ins)}
              className="w-full text-left rounded-xl border-2 border-default-200 dark:border-default-700 hover:border-danger/50 hover:bg-danger-50/30 dark:hover:bg-danger-900/10 transition-all p-3 group"
            >
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-default-100 dark:bg-default-800 rounded-lg group-hover:bg-danger-100 dark:group-hover:bg-danger-900/30 transition-colors shrink-0 mt-0.5">
                  <AcademicCapIcon className="w-4 h-4 text-default-500 group-hover:text-danger transition-colors" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-default-800 dark:text-default-100 truncate">
                    {ins.curso?.nombre ?? "Curso sin nombre"}
                  </p>
                  {(ins.curso?.fechaInicio || ins.curso?.fechaFin) && (
                    <p className="text-[11px] text-default-400 mt-0.5">
                      {ins.curso?.fechaInicio?.substring(0, 10)} — {ins.curso?.fechaFin?.substring(0, 10)}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-xs text-default-500">
                      Total: <span className="font-semibold text-default-700 dark:text-default-300">${fmt(ins.montoFinal)}</span>
                    </span>
                    {(ins.montoPagado ?? 0) > 0 && (
                      <span className="text-xs text-success-600">
                        Pagado: <span className="font-semibold">${fmt(ins.montoPagado)}</span>
                      </span>
                    )}
                    {saldo > 0 && ins.estadoPago !== "PAGADO" && (
                      <span className="text-xs text-warning-600">
                        Saldo: <span className="font-semibold">${fmt(saldo)}</span>
                      </span>
                    )}
                  </div>
                </div>

                <Chip
                  size="sm"
                  variant="flat"
                  color={color}
                  startContent={<IconEstado className="w-3 h-3" />}
                  className="shrink-0 mt-0.5"
                >
                  {ESTADO_PAGO.find(e => e.key === ins.estadoPago)?.label ?? ins.estadoPago}
                </Chip>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Vista 2: Formulario de edición ────────────────────────────────────────
  const renderFormulario = () => {
    const ins = inscripcionSeleccionada!;
    const IconEstado = ESTADO_ICONS[ins.estadoPago] ?? ClockIcon;
    const saldo = ins.saldoPendiente ?? Math.max(0, (ins.montoFinal ?? 0) - (ins.montoPagado ?? 0));

    return (
      <div className="space-y-4">
        {/* Tarjeta resumen de la inscripción */}
        <Card className="border border-default-200 dark:border-default-700 bg-default-50/50 dark:bg-default-800/30">
          <CardBody className="py-3 px-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-danger-50 dark:bg-danger-900/30 rounded-lg shrink-0">
                <AcademicCapIcon className="w-4 h-4 text-danger" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-default-800 dark:text-default-100 truncate">
                  {ins.curso?.nombre ?? "Curso sin nombre"}
                </p>
                {nombreParticipante && (
                  <p className="text-xs text-default-500 mt-0.5">{nombreParticipante}</p>
                )}
                {(ins.curso?.fechaInicio || ins.curso?.fechaFin) && (
                  <p className="text-[11px] text-default-400 mt-0.5">
                    {ins.curso?.fechaInicio?.substring(0, 10)} — {ins.curso?.fechaFin?.substring(0, 10)}
                  </p>
                )}
              </div>
              <Chip size="sm" variant="flat" color={estadoColor(ins.estadoPago)} startContent={<IconEstado className="w-3 h-3" />}>
                {ESTADO_PAGO.find(e => e.key === ins.estadoPago)?.label ?? ins.estadoPago}
              </Chip>
            </div>

            <Divider />

            {/* Montos */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-white/60 dark:bg-default-900/40 border border-default-100 dark:border-default-700">
                <p className="text-[10px] text-default-400 font-medium">Total</p>
                <p className="text-sm font-bold text-default-700 dark:text-default-200 mt-0.5">${fmt(ins.montoFinal)}</p>
              </div>
              <div className="p-2 rounded-lg bg-white/60 dark:bg-default-900/40 border border-default-100 dark:border-default-700">
                <p className="text-[10px] text-default-400 font-medium">Pagado</p>
                <p className="text-sm font-bold text-success-600 mt-0.5">${fmt(ins.montoPagado ?? 0)}</p>
              </div>
              <div className="p-2 rounded-lg bg-white/60 dark:bg-default-900/40 border border-default-100 dark:border-default-700">
                <p className="text-[10px] text-default-400 font-medium">Saldo</p>
                <p className={`text-sm font-bold mt-0.5 ${saldo > 0 ? "text-warning-600" : "text-success-600"}`}>
                  ${fmt(saldo)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Select nuevo estado */}
        <Select
          label="Nuevo estado de pago"
          selectedKeys={[estadoPago]}
          onChange={e => setEstadoPago(e.target.value as EstadoPago)}
          size="sm"
          variant="bordered"
          radius="lg"
        >
          {ESTADO_PAGO.map(ep => (
            <SelectItem
              key={ep.key}
              startContent={<Chip size="sm" variant="dot" color={ep.color} className="border-none px-0" />}
            >
              {ep.label}
            </SelectItem>
          ))}
        </Select>

        {/* Campos extra: solo cuando cambia a PAGADO */}
        {estadoPago === "PAGADO" && (
          <div className="space-y-3">
            <Input
              type="date"
              label="Fecha de pago"
              value={fechaPago}
              onChange={e => setFechaPago(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              size="sm"
              variant="bordered"
              radius="lg"
              description="Opcional"
            />
            <Input
              type="number"
              label="Monto pagado"
              value={montoPagado}
              onChange={e => setMontoPagado(e.target.value)}
              min={0}
              startContent={<span className="text-default-400 text-sm">$</span>}
              size="sm"
              variant="bordered"
              radius="lg"
              placeholder={fmt(ins.montoFinal)}
              description={`Deja vacío para usar el total: $${fmt(ins.montoFinal)}`}
            />
          </div>
        )}
      </div>
    );
  };

  // ── Título dinámico ───────────────────────────────────────────────────────
  const titulo = tieneVarias && !inscripcionSeleccionada
    ? "Seleccionar inscripción"
    : "Editar estado de pago";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      backdrop="blur"
      hideCloseButton
      classNames={{
        base: "bg-white dark:bg-gray-900",
        header: "border-b border-default-200 dark:border-default-700",
        footer: "border-t border-default-200 dark:border-default-700",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5 text-danger" />
                <span className="text-base font-semibold">{titulo}</span>
              </div>
              <Button isIconOnly variant="light" size="sm" onPress={onClose}>
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </ModalHeader>

            <ModalBody className="py-5">
              {tieneVarias && !inscripcionSeleccionada
                ? renderSelector()
                : inscripcionSeleccionada
                ? renderFormulario()
                : <p className="text-sm text-default-400 text-center py-4">Sin inscripciones</p>
              }
            </ModalBody>

            <ModalFooter className="flex justify-between gap-2">
              {/* Botón volver: solo si hay varias y ya eligió una */}
              {tieneVarias && inscripcionSeleccionada ? (
                <Button variant="light" size="sm" onPress={handleVolver} isDisabled={isSubmitting}>
                  ← Volver
                </Button>
              ) : <div />}

              <div className="flex gap-2">
                <Button variant="light" size="sm" onPress={onClose} isDisabled={isSubmitting}>
                  Cancelar
                </Button>
                {inscripcionSeleccionada && (
                  <Button
                    color="danger"
                    size="sm"
                    onPress={handleSubmit}
                    isLoading={isSubmitting}
                    className="font-medium px-5"
                  >
                    Guardar cambio
                  </Button>
                )}
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}