// components/modals/Inscripcion/inscripcionModal.tsx
import { useState, useEffect, useMemo } from "react";
import {
  Input,
  Select,
  SelectItem,
  Card,
  CardBody,
  Divider,
  Chip,
  DatePicker,
} from "@heroui/react";
import { sileo } from "sileo";
import { parseDate, type CalendarDate } from "@internationalized/date";
import ModalForm from "../../common/modalForm";
import { obtenerCursoPorId } from "../../../services/cursoService";
import { obtenerEmpresa } from "../../../services/empresaService";
import { crearInscripcion, actualizarInscripcion } from "../../../services/inscripcionService";
import {
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  TagIcon,
  GiftIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

// ──────────────────────────────────────────────
// Catálogos
// ──────────────────────────────────────────────

const METODOS_PAGO = [
  { key: "VENTA_AFILIADO", label: "Venta Afiliado", icon: "👤", requiereEmpresa: false, requiereSaldo: false },
  { key: "VENTA_PUBLICO", label: "Venta Público General", icon: "🌐", requiereEmpresa: false, requiereSaldo: false },
  { key: "FECAP", label: "Saldo FECAP", icon: "🏗️", requiereEmpresa: true, requiereSaldo: true },
  { key: "FINANCIAMIENTO", label: "Financiamiento", icon: "📆", requiereEmpresa: false, requiereSaldo: false },
  { key: "SIN_COSTO", label: "Sin Costo", icon: "🎁", requiereEmpresa: false, requiereSaldo: false },
  { key: "VALE_AFILIACION", label: "Vale de Afiliación", icon: "🎫", requiereEmpresa: false, requiereSaldo: false },
] as const;

const TIPO_PRECIO = [
  { key: "AFILIADO", label: "Afiliado", field: "precioAfiliado" },
  { key: "PUBLICO_GENERAL", label: "Público General", field: "precioPublico" },
  { key: "ESTUDIANTE", label: "Estudiante", field: "precioEstudiante" },
] as const;

const ESTADO_PAGO = [
  { key: "PENDIENTE", label: "Pendiente" },
  { key: "PAGADO", label: "Pagado" },
  { key: "CANCELADO", label: "Cancelado" },
  { key: "REEMBOLSADO", label: "Reembolsado" },
] as const;

const PERIODICIDAD = [
  { key: "SEMANAL", label: "Semanal" },
  { key: "QUINCENAL", label: "Quincenal" },
  { key: "MENSUAL", label: "Mensual" },
] as const;

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────

interface InscripcionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (inscripcion: any) => void;
  participante: any;
  curso?: any;
  empresa?: any;
  inscripcionToEdit?: any;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function fmt(n: number | null | undefined) {
  return (n ?? 0).toFixed(2);
}

function getPrecioCurso(curso: any, tipoPrecio: string): number {
  if (!curso) return 0;
  switch (tipoPrecio) {
    case "AFILIADO": return curso.precioAfiliado ?? 0;
    case "PUBLICO_GENERAL": return curso.precioPublico ?? 0;
    case "ESTUDIANTE": return curso.precioEstudiante ?? 0;
    default: return 0;
  }
}

// Sub-componente: Celda de saldo
function SaldoCell({ label, valor, color }: { label: string; valor: number; color: string }) {
  return (
    <div className="p-2 rounded-lg bg-white/60 border border-default-100 text-center">
      <p className="text-[10px] text-default-400 font-medium">{label}</p>
      <p className={`text-sm font-bold mt-0.5 ${color}`}>${fmt(valor)}</p>
    </div>
  );
}

// Sub-componente: Resumen de montos
function MontoResumen({
  rows,
}: {
  rows: Array<{
    label: string;
    valor: number;
    destacado?: boolean;
    negativo?: boolean;
    color?: string;
  }>;
}) {
  return (
    <div className="rounded-xl border border-default-200 overflow-hidden">
      {rows.map((row, i) => (
        <div
          key={i}
          className={[
            "flex items-center justify-between px-4 py-2.5",
            row.destacado ? "bg-primary-50/50 border-t border-primary-100" : "bg-default-50",
            i > 0 && !row.destacado ? "border-t border-default-100" : "",
          ].join(" ")}
        >
          <span className={`text-sm ${row.destacado ? "font-semibold text-default-700" : "text-default-500"}`}>
            {row.label}
          </span>
          <span
            className={`text-sm font-bold ${row.color ||
              (row.negativo ? "text-danger-600" :
                row.destacado ? "text-primary-600" :
                  "text-default-700")
              }`}
          >
            {row.negativo ? "-" : ""}${fmt(row.valor)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────

export default function InscripcionModal({
  isOpen,
  onClose,
  onSuccess,
  participante,
  curso,
  empresa: empresaProp,
  inscripcionToEdit,
}: InscripcionModalProps) {

  const [form, setForm] = useState<any>(() => {
    if (inscripcionToEdit) {
      return {
        ...inscripcionToEdit,
        fechaPago: inscripcionToEdit.fechaPago?.split("T")[0] || null,
        fechaPrimerPago: inscripcionToEdit.fechaPrimerPago?.split("T")[0] || null,
      };
    }
    return {
      cursoId: curso?.id || null,
      participanteId: participante?.id || null,
      estadoPago: "PENDIENTE",
      tipoPrecioAplicado: participante?.esAfiliado ? "AFILIADO" : "PUBLICO_GENERAL",
      metodoPago: participante?.esAfiliado ? "VENTA_AFILIADO" : "VENTA_PUBLICO",
      montoEsperado: 0,
      montoPagado: null,
      montoDescuento: 0,
      montoFinal: 0,
      tieneVale: false,
      codigoVale: null,
      fechaPago: null,
      notas: "",
      numeroPagos: null,
      periodicidad: null,
      fechaPrimerPago: null,
    };
  });

  const [cursoData, setCursoData] = useState<any>(curso || null);
  const [empresaData, setEmpresaData] = useState<any>(empresaProp || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar curso
  useEffect(() => {
    if (form.cursoId && !cursoData) {
      obtenerCursoPorId(form.cursoId).then(setCursoData);
    }
  }, [form.cursoId]);

  // Cargar empresa
  useEffect(() => {
    if (empresaProp) {
      setEmpresaData(empresaProp);
    } else if (participante?.empresaId && !empresaData) {
      obtenerEmpresa(participante.empresaId).then(setEmpresaData);
    }
  }, [participante, empresaProp]);

  // Método seleccionado
  const metodo = useMemo(
    () => METODOS_PAGO.find((m) => m.key === form.metodoPago),
    [form.metodoPago]
  );

  // Precio base
  const precioBase = useMemo(
    () => getPrecioCurso(cursoData, form.tipoPrecioAplicado),
    [cursoData, form.tipoPrecioAplicado]
  );

  // Recalcular montos al cambiar método, tipo de precio o descuento
  useEffect(() => {
    if (!cursoData) return;

    if (form.metodoPago === "SIN_COSTO") {
      setForm((prev: any) => ({ ...prev, montoEsperado: 0, montoDescuento: 0, montoFinal: 0 }));
      return;
    }

    if (form.metodoPago === "VALE_AFILIACION") {
      // Conservar el descuento que el usuario escribió; recalcular sólo montoFinal
      setForm((prev: any) => ({
        ...prev,
        montoEsperado: precioBase,
        montoFinal: Math.max(0, precioBase - (prev.montoDescuento || 0)),
      }));
      return;
    }

    // Para el resto (VENTA, CAPTACION, FINANCIAMIENTO): sin descuento
    setForm((prev: any) => ({
      ...prev,
      montoEsperado: precioBase,
      montoDescuento: 0,
      montoFinal: precioBase,
    }));
  }, [form.metodoPago, form.tipoPrecioAplicado, cursoData]);
  // NOTA: NO incluimos form.montoDescuento aquí para evitar loop;
  // el descuento se actualiza en handleDescuentoChange directamente.

  // Saldo de FECAP
  const saldoInfo = useMemo(() => {
    if (!empresaData || form.metodoPago !== "FECAP") return null;
    const disponible = empresaData.saldoFecapDisponible ?? 0;
    return {
      disponible,
      aplicado: empresaData.saldoFecapAplicado ?? 0,
      porDescontar: form.montoFinal ?? 0,
      nuevoDisponible: Math.max(0, disponible - (form.montoFinal ?? 0)),
      suficiente: disponible >= (form.montoFinal ?? 0),
    };
  }, [form.metodoPago, form.montoFinal, empresaData]);

  // Monto por pago (financiamiento)
  const montoPorPago = useMemo(() => {
    if (form.metodoPago !== "FINANCIAMIENTO" || !form.numeroPagos || form.numeroPagos < 1) return 0;
    return (form.montoFinal ?? 0) / form.numeroPagos;
  }, [form.metodoPago, form.montoFinal, form.numeroPagos]);

  const handleChange = (field: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [field]: value }));

  // Cambio de descuento (sólo para Vale)
  const handleDescuentoChange = (val: string) => {
    const descuento = Math.min(Number(val) || 0, precioBase);
    setForm((prev: any) => ({
      ...prev,
      montoDescuento: descuento,
      montoFinal: Math.max(0, precioBase - descuento),
    }));
  };

  const validateForm = (): boolean => {
    if (!cursoData) {
      sileo.warning({ title: "Curso requerido", description: "Selecciona un curso" });
      return false;
    }

    if (!form.metodoPago) {
      sileo.warning({ title: "Método de pago requerido", description: "Selecciona un método de pago para continuar." });
      return false;
    }

    if (!form.tipoPrecioAplicado) {
      sileo.warning({ title: "Tipo de precio requerido", description: "Selecciona el tipo de precio del curso." });
      return false;
    }

    if (!form.estadoPago) {
      sileo.warning({ title: "Estado de pago requerido", description: "Selecciona el estado de pago." });
      return false;
    }

    if (form.estadoPago === "PAGADO" && !form.fechaPago) {
      sileo.warning({ title: "Fecha de pago requerida", description: "Indica la fecha en que se realizó el pago." });
      return false;
    }

    if (metodo?.requiereEmpresa && !empresaData) {
      sileo.warning({ title: "Empresa requerida", description: "Este método requiere empresa asociada al participante." });
      return false;
    }

    if (saldoInfo && !saldoInfo.suficiente) {
      sileo.warning({ title: "Saldo insuficiente", description: "Saldo FECAP insuficiente para esta inscripción." });
      return false;
    }

    if (form.metodoPago === "FINANCIAMIENTO") {
      if (!form.numeroPagos || form.numeroPagos < 1) {
        sileo.warning({ title: "Campo requerido", description: "Ingresa el número de pagos." });
        return false;
      }
      if (!form.periodicidad) {
        sileo.warning({ title: "Campo requerido", description: "Selecciona la periodicidad de los pagos." });
        return false;
      }
      if (!form.fechaPrimerPago) {
        sileo.warning({ title: "Fecha requerida", description: "Indica la fecha del primer pago." });
        return false;
      }
    }

    if (form.metodoPago === "VALE_AFILIACION") {
      if (!form.codigoVale) {
        sileo.warning({ title: "Código requerido", description: "Ingresa el código del vale de afiliación." });
        return false;
      }
      if (!form.montoDescuento || form.montoDescuento <= 0) {
        sileo.warning({ title: "Descuento requerido", description: "Ingresa el monto del descuento del vale." });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const payload: any = {
        participanteId: participante.id,
        cursoId: cursoData.id,
        tipoPrecioAplicado: form.tipoPrecioAplicado,
        metodoPago: form.metodoPago,
        montoEsperado: form.montoEsperado,
        montoFinal: form.montoFinal,
        montoDescuento: form.montoDescuento || 0,
        estadoPago: form.estadoPago,
        notas: form.notas || "",
      };

      if (form.montoPagado) payload.montoPagado = form.montoPagado;
      if (form.codigoVale) payload.codigoVale = form.codigoVale;
      if (form.tieneVale) payload.tieneVale = true;
      if (form.fechaPago) payload.fechaPago = form.fechaPago;

      if (form.metodoPago === "FINANCIAMIENTO") {
        payload.esFinanciamiento = true;
        payload.numeroPagos = form.numeroPagos;
        payload.periodicidad = form.periodicidad;
        payload.montoPorPago = montoPorPago;
        if (form.fechaPrimerPago) payload.fechaPrimerPago = form.fechaPrimerPago;
      }

      if (form.metodoPago === "FECAP") {
        payload.empresaId = empresaData.id;
      }

      let response;
      if (inscripcionToEdit) {
        response = await actualizarInscripcion(inscripcionToEdit.id, payload);
        sileo.success({ title: "¡Actualizado!", description: "Inscripción actualizada correctamente" });
      } else {
        response = await crearInscripcion(payload);
        sileo.success({ title: "¡Inscripción creada!", description: "Inscripción registrada exitosamente" });
      }

      onSuccess?.(response.data || response);
      onClose();
    } catch (error: any) {
      sileo.error({
        title: "Error al guardar",
        description: error?.response?.data?.message || error?.message || "Error inesperado",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ──────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title={inscripcionToEdit ? "Editar Inscripción" : "Nueva Inscripción"}
      size="3xl"
      isLoading={isSubmitting}
      onSubmit={handleSubmit}
      submitText={inscripcionToEdit ? "Guardar cambios" : "Registrar inscripción"}
      hideCloseButton
      hideCancelButton
    >
      <div className="space-y-5 px-1">

        {/* Header: Curso + Participante */}
        <Card className="bg-primary-50/30 border border-primary-200">
          <CardBody className="flex flex-row items-center gap-4 py-3">
            <div className="p-2.5 bg-primary-100 rounded-xl">
              <CurrencyDollarIcon className="w-7 h-7 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base truncate">
                {cursoData?.nombre || "Sin curso seleccionado"}
              </p>
              <p className="text-sm text-default-500 truncate">
                {participante?.nombre} {participante?.apellidoPaterno} {participante?.apellidoMaterno || ""}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {participante?.esAfiliado && (
                <Chip size="sm" color="success" variant="flat">Afiliado</Chip>
              )}
              {empresaData && (
                <Chip size="sm" color="primary" variant="flat">{empresaData.nombre}</Chip>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Precios del curso — selector visual */}
        {cursoData && (
          <div>
            <p className="text-xs text-default-500 font-medium mb-2">Tipo de precio</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Afiliado", precio: cursoData.precioAfiliado, tipo: "AFILIADO" },
                { label: "Público General", precio: cursoData.precioPublico, tipo: "PUBLICO_GENERAL" },
                { label: "Estudiante", precio: cursoData.precioEstudiante, tipo: "ESTUDIANTE" },
              ].map(({ label, precio, tipo }) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => handleChange("tipoPrecioAplicado", tipo)}
                  className={[
                    "rounded-xl border-2 p-3 text-left transition-all cursor-pointer",
                    form.tipoPrecioAplicado === tipo
                      ? "border-primary-500 bg-primary-50"
                      : "border-default-200 bg-default-50 hover:border-primary-300",
                  ].join(" ")}
                >
                  <p className="text-xs text-default-500 font-medium">{label}</p>
                  <p className={`text-base font-bold mt-0.5 ${form.tipoPrecioAplicado === tipo ? "text-primary-600" : "text-default-700"}`}>
                    ${fmt(precio)}
                  </p>
                  {form.tipoPrecioAplicado === tipo && (
                    <p className="text-[10px] text-primary-500 font-semibold mt-0.5">Seleccionado ✓</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Método de pago */}
        <Select
          label="Método de pago"
          placeholder="Selecciona un método"
          selectedKeys={form.metodoPago ? [form.metodoPago] : []}
          disallowEmptySelection  // ← agrega esto
          onChange={(e) => {
            if (e.target.value) handleChange("metodoPago", e.target.value);
          }}
          startContent={<span className="text-base">{metodo?.icon}</span>}
        >
          {METODOS_PAGO
            .filter((m) => {
              if (!m.requiereEmpresa) return true;
              return !!participante?.empresaId && (empresaData?.saldoFecapDisponible ?? 0) > 0;
            })
            .map((mp) => (
              <SelectItem key={mp.key} startContent={<span>{mp.icon}</span>}>
                {mp.label}
              </SelectItem>
            ))}
        </Select>

        {/* Advertencia empresa requerida */}
        {metodo?.requiereEmpresa && !empresaData && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-danger-50 border border-danger-200">
            <ExclamationTriangleIcon className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-danger-700">Empresa requerida</p>
              <p className="text-xs text-danger-500 mt-0.5">
                Este método requiere que el participante esté asociado a una empresa.
              </p>
            </div>
          </div>
        )}

        <Divider />

        {/* ════════════════════════════════════════
            PANEL POR MÉTODO DE PAGO
        ════════════════════════════════════════ */}

        {/* VENTA AFILIADO / VENTA PÚBLICO */}
        {(form.metodoPago === "VENTA_AFILIADO" || form.metodoPago === "VENTA_PUBLICO") && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-default-700">
              <BanknotesIcon className="w-4 h-4" />
              Resumen de pago
            </h4>
            <MontoResumen
              rows={[
                { label: "Precio del curso", valor: form.montoEsperado },
                { label: "Total a pagar", valor: form.montoFinal, destacado: true },
              ]}
            />
          </div>
        )}

        {/* SALDO FECAP */}
        {form.metodoPago === "FECAP" && saldoInfo && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-default-700">
              <BuildingLibraryIcon className="w-4 h-4" />
              Saldo FECAP — {empresaData?.nombre}
            </h4>

            <Card className={`border-2 ${saldoInfo.suficiente ? "border-success-300 bg-success-50/30" : "border-danger-300 bg-danger-50/30"}`}>
              <CardBody className="py-3 px-4 space-y-3">

                {/* Saldos actuales */}
                <div className="grid grid-cols-2 gap-2">
                  <SaldoCell label="Disponible" valor={saldoInfo.disponible} color="text-success-600" />
                  <SaldoCell label="Aplicado" valor={saldoInfo.aplicado} color="text-default-500" />
                </div>

                <Divider />

                {/* Impacto del cargo */}
                <MontoResumen
                  rows={[
                    { label: "Costo del curso", valor: saldoInfo.porDescontar },
                    {
                      label: "Saldo disponible tras el pago", valor: saldoInfo.nuevoDisponible,
                      color: saldoInfo.suficiente ? "text-success-600" : "text-danger-600",
                      destacado: true
                    },
                  ]}
                />

                <p className={`text-xs font-semibold ${saldoInfo.suficiente ? "text-success-600" : "text-danger-600"}`}>
                  {saldoInfo.suficiente
                    ? "✅ Saldo FECAP suficiente para cubrir el pago"
                    : "❌ Saldo FECAP insuficiente para esta inscripción"}
                </p>
              </CardBody>
            </Card>
          </div>
        )}

        {/* FINANCIAMIENTO */}
        {form.metodoPago === "FINANCIAMIENTO" && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-default-700">
              <CreditCardIcon className="w-4 h-4" />
              Detalles del financiamiento
            </h4>

            <MontoResumen
              rows={[{ label: "Total a financiar", valor: form.montoFinal, destacado: true }]}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Número de pagos"
                type="number"
                min={1}
                max={36}
                placeholder="Ej: 6"
                value={form.numeroPagos?.toString() || ""}
                onChange={(e) => handleChange("numeroPagos", Number(e.target.value))}
              />
              <Input
                label="Monto por pago"
                value={fmt(montoPorPago)}
                readOnly
                startContent={<span className="text-default-400 text-sm">$</span>}
                classNames={{ input: "font-semibold text-primary-600" }}
              />
              <Select
                label="Periodicidad"
                placeholder="Selecciona"
                selectedKeys={form.periodicidad ? [form.periodicidad] : []}
                onChange={(e) => handleChange("periodicidad", e.target.value)}
              >
                {PERIODICIDAD.map((p) => (
                  <SelectItem key={p.key}>{p.label}</SelectItem>
                ))}
              </Select>
            </div>

            <Input
              type="date"
              label="Fecha del primer pago"
              value={form.fechaPrimerPago || ""}
              onChange={(e) => handleChange("fechaPrimerPago", e.target.value)}
            />
          </div>
        )}

        {/* SIN COSTO */}
        {form.metodoPago === "SIN_COSTO" && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-success-50 border border-success-200">
            <GiftIcon className="w-6 h-6 text-success-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-success-700">Inscripción sin costo</p>
              <p className="text-xs text-success-600 mt-0.5">
                El participante no realizará ningún pago. Todos los montos quedan en $0.00.
              </p>
            </div>
            <span className="text-xl font-bold text-success-600">$0.00</span>
          </div>
        )}

        {/* VALE DE AFILIACIÓN */}
        {form.metodoPago === "VALE_AFILIACION" && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-default-700">
              <TagIcon className="w-4 h-4" />
              Vale de afiliación
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Código del vale"
                placeholder="Ingresa el código"
                value={form.codigoVale || ""}
                onChange={(e) => {
                  handleChange("codigoVale", e.target.value);
                  handleChange("tieneVale", !!e.target.value);
                }}
              />
              <Input
                label="Descuento del vale"
                type="number"
                min={0}
                max={precioBase}
                value={form.montoDescuento?.toString() || "0"}
                onChange={(e) => handleDescuentoChange(e.target.value)}
                startContent={<span className="text-default-400 text-sm">$</span>}
              />
            </div>

            <MontoResumen
              rows={[
                { label: "Precio del curso", valor: form.montoEsperado },
                { label: "Descuento del vale", valor: form.montoDescuento, negativo: true },
                { label: "Total a pagar", valor: form.montoFinal, destacado: true },
              ]}
            />
          </div>
        )}

        {/* Estado de pago y fecha */}
        <Divider />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Estado — sigue siendo Select */}
          <Select
            label="Estado de pago"
            selectedKeys={form.estadoPago ? [form.estadoPago] : []}
            disallowEmptySelection  // ← agrega esto
            onChange={(e) => {
              if (e.target.value) handleChange("estadoPago", e.target.value);
            }}
          >
            {ESTADO_PAGO.map((ep) => (
              <SelectItem key={ep.key}>{ep.label}</SelectItem>
            ))}
          </Select>

          {/* Fecha de pago — ahora con DatePicker de HeroUI */}
          {form.estadoPago === "PAGADO" && (
            <DatePicker
              label="Fecha del pago"
              value={form.fechaPago ? parseDate(form.fechaPago) as any : null}
              onChange={(date) => handleChange("fechaPago", date ? date.toString() : null)}
              showMonthAndYearPickers
              granularity="day"
              className="md:col-span-3"
            />
          )}
        </div>

        {/* Notas */}
        <Input
          label="Notas"
          value={form.notas || ""}
          onChange={(e) => handleChange("notas", e.target.value)}
          placeholder="Observaciones adicionales..."
        />
      </div>
    </ModalForm>
  );
}