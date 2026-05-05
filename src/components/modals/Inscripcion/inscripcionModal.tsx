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
import { parseDate } from "@internationalized/date";
import ModalForm from "../../common/modalForm";
import { obtenerCursoPorId } from "../../../services/cursoService";
import { obtenerEmpresa } from "../../../services/empresaService";
import { crearInscripcion, actualizarInscripcion } from "../../../services/inscripcionService";
import { fecapService } from "../../../services/fecapService";
import {
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  TagIcon,
  GiftIcon,
  BanknotesIcon,
  CalendarIcon,
  LockClosedIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

// ──────────────────────────────────────────────
// Catálogos
// ──────────────────────────────────────────────

const METODOS_PAGO = [
  { key: "EFECTIVO",       label: "Efectivo",          icon: "💵", requiereEmpresa: false },
  { key: "TRANSFERENCIA",  label: "Transferencia",      icon: "🏦", requiereEmpresa: false },
  { key: "FECAP",          label: "Fondo FECAP",        icon: "🏗️", requiereEmpresa: true  },
  { key: "FINANCIAMIENTO", label: "Financiamiento",     icon: "📆", requiereEmpresa: false },
  { key: "SIN_COSTO",      label: "Sin Costo",          icon: "🎁", requiereEmpresa: false },
  { key: "VALE_AFILIACION",label: "Vale de Afiliación", icon: "🎫", requiereEmpresa: false },
] as const;

const ESTADO_PAGO = [
  { key: "PENDIENTE",   label: "Pendiente"   },
  { key: "PAGADO",      label: "Pagado"      },
  { key: "CANCELADO",   label: "Cancelado"   },
  { key: "REEMBOLSADO", label: "Reembolsado" },
] as const;

const PERIODICIDAD = [
  { key: "SEMANAL",   label: "Semanal"   },
  { key: "QUINCENAL", label: "Quincenal" },
  { key: "MENSUAL",   label: "Mensual"   },
] as const;

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────

interface InscripcionModalProps {
  isOpen:              boolean;
  onClose:             () => void;
  onSuccess?:          (inscripcion: any) => void;
  participante:        any;
  curso?:              any;
  empresa?:            any;
  inscripcionToEdit?:  any;
  /** Activa el modo simplificado para cursos cerrados:
   *  curso, empresa y precio quedan fijos; solo se elige método de pago */
  modoCerrado?:        boolean;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function fmt(n: number | null | undefined) {
  return (n ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 });
}

function getPrecioCurso(curso: any, tipoPrecio: string): number {
  if (!curso) return 0;
  switch (tipoPrecio) {
    case "AFILIADO":        return curso.precioAfiliado   ?? 0;
    case "PUBLICO_GENERAL": return curso.precioPublico    ?? 0;
    case "ESTUDIANTE":      return curso.precioEstudiante ?? 0;
    default:                return 0;
  }
}

function obtenerTipoPrecioDefault(participante: any) {
  if (!participante) return "PUBLICO_GENERAL";
  if (participante.tipoPrecio) return participante.tipoPrecio;
  return participante.esAfiliado ? "AFILIADO" : "PUBLICO_GENERAL";
}

function SaldoCell({ label, valor, color }: { label: string; valor: number; color: string }) {
  return (
    <div className="p-2 rounded-lg bg-white/60 border border-default-100 text-center">
      <p className="text-[10px] text-default-400 font-medium">{label}</p>
      <p className={`text-sm font-bold mt-0.5 ${color}`}>${fmt(valor)}</p>
    </div>
  );
}

function MontoResumen({
  rows,
}: {
  rows: Array<{
    label:      string;
    valor:      number;
    destacado?: boolean;
    negativo?:  boolean;
    color?:     string;
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
          <span className={`text-sm font-bold ${
            row.color ?? (row.negativo ? "text-danger-600" : row.destacado ? "text-primary-600" : "text-default-700")
          }`}>
            {row.negativo ? "-" : ""}${fmt(row.valor)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Banner informativo de curso cerrado (fijo, no editable)
// ──────────────────────────────────────────────────────────────────────────────
function CursoCerradoBanner({
  curso,
  empresa,
  tipoPrecio,
  total,
}: {
  curso:      any;
  empresa:    any;
  tipoPrecio: string;
  total:      number;
}) {
  const labelTipo =
    tipoPrecio === "AFILIADO"        ? "Afiliado"        :
    tipoPrecio === "PUBLICO_GENERAL" ? "Público general" : "Estudiante";

  return (
    <Card className="border-2 border-warning-200 bg-gradient-to-r from-warning-50 to-orange-50">
      <CardBody className="space-y-3 py-4 px-5">

        {/* Título */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-warning-100 rounded-lg">
            <LockClosedIcon className="w-4 h-4 text-warning-600" />
          </div>
          <p className="text-sm font-bold text-warning-700">Inscripción a curso cerrado</p>
          <Chip size="sm" variant="flat" color="warning">Auto-configurado</Chip>
        </div>

        <Divider className="bg-warning-200" />

        {/* Curso y empresa fijos */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start gap-2 rounded-lg bg-white/70 border border-warning-100 p-3">
            <CurrencyDollarIcon className="w-4 h-4 text-warning-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-default-400 font-medium uppercase tracking-wide">Curso</p>
              <p className="text-sm font-semibold text-default-800 leading-tight truncate">
                {curso?.nombre ?? "—"}
              </p>
              <p className="text-xs text-default-500 mt-0.5">
                {curso?.fechaInicio
                  ? new Date(curso.fechaInicio).toLocaleDateString("es-MX", {
                      day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
                    })
                  : ""}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-white/70 border border-warning-100 p-3">
            <BuildingOffice2Icon className="w-4 h-4 text-warning-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-default-400 font-medium uppercase tracking-wide">Empresa</p>
              <p className="text-sm font-semibold text-default-800 leading-tight truncate">
                {empresa?.nombre ?? "—"}
              </p>
              {empresa?.rfc && (
                <p className="text-xs text-default-500 mt-0.5">RFC: {empresa.rfc}</p>
              )}
            </div>
          </div>
        </div>

        {/* Precio fijo */}
        <div className="flex items-center justify-between rounded-lg bg-white/70 border border-warning-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-success-500" />
            <span className="text-sm text-default-600">
              Precio aplicado automáticamente
            </span>
          </div>
          <span className="text-xl font-black text-warning-700">${fmt(total)}</span>
        </div>

      </CardBody>
    </Card>
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
  modoCerrado = false,
}: InscripcionModalProps) {

  const tipoPrecioInicial = obtenerTipoPrecioDefault(participante);

  const [form, setForm] = useState<any>(() => {
    if (inscripcionToEdit) {
      return {
        ...inscripcionToEdit,
        fechaPago:       inscripcionToEdit.fechaPago?.split("T")[0]       || null,
        fechaPrimerPago: inscripcionToEdit.fechaPrimerPago?.split("T")[0] || null,
      };
    }
    return {
      cursoId:             curso?.id             || null,
      participanteId:      participante?.id       || null,
      estadoPago:          "PENDIENTE",
      tipoPrecioAplicado:  tipoPrecioInicial,
      metodoPago:          "EFECTIVO",
      montoEsperado:       0,
      montoPagado:         null,
      montoDescuento:      0,
      montoFinal:          0,
      tieneVale:           false,
      codigoVale:          null,
      fechaPago:           null,
      notas:               "",
      numeroPagos:         null,
      periodicidad:        null,
      fechaPrimerPago:     null,
    };
  });

  const [cursoData,    setCursoData]    = useState<any>(curso    || null);
  const [empresaData,  setEmpresaData]  = useState<any>(empresaProp || null);
  const [saldoFecap,   setSaldoFecap]   = useState<{ disponible: number; aplicado: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSinCosto = form.metodoPago === "SIN_COSTO";

  // ── Cargar curso si no vino como prop ──────────────────────────────────────
  useEffect(() => {
    if (form.cursoId && !cursoData) {
      obtenerCursoPorId(form.cursoId).then(setCursoData).catch(console.error);
    }
  }, [form.cursoId]);

  // ── Cargar empresa ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (empresaProp) {
      setEmpresaData(empresaProp);
    } else if (participante?.empresaId && !empresaData) {
      obtenerEmpresa(participante.empresaId).then(setEmpresaData).catch(console.error);
    }
  }, [participante, empresaProp]);

  useEffect(() => {
    if (!isOpen) return;
    if (curso    && !cursoData)   setCursoData(curso);
    if (empresaProp && !empresaData) setEmpresaData(empresaProp);
  }, [isOpen, curso, cursoData, empresaProp, empresaData]);

  // ── Pre-calcular precio cuando el curso está listo (modo cerrado) ──────────
  useEffect(() => {
    if (!modoCerrado || !cursoData || inscripcionToEdit) return;
    const precio = getPrecioCurso(cursoData, tipoPrecioInicial);
    setForm((prev: any) => ({
      ...prev,
      tipoPrecioAplicado: tipoPrecioInicial,
      montoEsperado:      precio,
      montoFinal:         precio,
      montoDescuento:     0,
    }));
  }, [modoCerrado, cursoData]);

  // ── Saldo FECAP al cambiar método ─────────────────────────────────────────
  useEffect(() => {
    if (form.metodoPago === "FECAP" && empresaData?.id) {
      fecapService
        .getSaldoEmpresa(empresaData.id)
        .then((data) => setSaldoFecap({
          disponible: data.saldoFecapDisponible ?? 0,
          aplicado:   data.saldoFecapAplicado   ?? 0,
        }))
        .catch(console.error);
    } else {
      setSaldoFecap(null);
    }
  }, [form.metodoPago, empresaData?.id]);

  // ── Sin Costo: forzar montos a 0 ──────────────────────────────────────────
  useEffect(() => {
    if (isSinCosto) {
      setForm((prev: any) => ({
        ...prev,
        estadoPago:    "PAGADO",
        montoEsperado: 0,
        montoPagado:   0,
        montoDescuento: 0,
        montoFinal:    0,
        numeroPagos:   null,
        periodicidad:  null,
        codigoVale:    null,
        tieneVale:     false,
      }));
    }
  }, [isSinCosto]);

  // ── Derivados ─────────────────────────────────────────────────────────────
  const metodo = useMemo(
    () => METODOS_PAGO.find((m) => m.key === form.metodoPago),
    [form.metodoPago],
  );

  const precioBase = useMemo(
    () => getPrecioCurso(cursoData, form.tipoPrecioAplicado),
    [cursoData, form.tipoPrecioAplicado],
  );

  const fecapDisponible =
    !!participante?.empresaId &&
    ((saldoFecap?.disponible ?? 0) > 0 || (empresaData?.saldoFecapDisponible ?? 0) > 0);

  // En modo cerrado también habilitar FECAP si la empresa del curso tiene saldo
  const fecapDisponibleCerrado =
    modoCerrado &&
    !!empresaData?.id &&
    ((saldoFecap?.disponible ?? 0) > 0 || (empresaData?.saldoFecapDisponible ?? 0) > 0);

  const metodosFiltrados = METODOS_PAGO.filter((m) => {
    if (m.key !== "FECAP") return true;
    return modoCerrado ? fecapDisponibleCerrado : fecapDisponible;
  });

  useEffect(() => {
    const fecapOk = modoCerrado ? fecapDisponibleCerrado : fecapDisponible;
    if (form.metodoPago === "FECAP" && !fecapOk) {
      setForm((prev: any) => ({ ...prev, metodoPago: "EFECTIVO" }));
    }
  }, [fecapDisponible, fecapDisponibleCerrado]);

  const saldoInfo = useMemo(() => {
    if (form.metodoPago !== "FECAP") return null;
    const fuente = saldoFecap ?? {
      disponible: empresaData?.saldoFecapDisponible ?? 0,
      aplicado:   empresaData?.saldoFecapAplicado   ?? 0,
    };
    const costo = form.montoFinal ?? 0;
    return {
      disponible: fuente.disponible,
      aplicado:   fuente.aplicado,
      costo,
      restante:   Math.max(0, fuente.disponible - costo),
      suficiente: fuente.disponible >= costo,
    };
  }, [form.metodoPago, form.montoFinal, saldoFecap, empresaData]);

  const montoPorPago = useMemo(() => {
    if (form.metodoPago !== "FINANCIAMIENTO" || !form.numeroPagos || form.numeroPagos < 1) return 0;
    return (form.montoFinal ?? 0) / form.numeroPagos;
  }, [form.metodoPago, form.montoFinal, form.numeroPagos]);

  // ── Recalcular montos al cambiar método / tipo de precio ───────────────────
  // En modo cerrado no recalculamos al cambiar método (precio ya está fijo)
  useEffect(() => {
    if (!cursoData || isSinCosto || modoCerrado) return;

    if (form.metodoPago === "VALE_AFILIACION") {
      setForm((prev: any) => ({
        ...prev,
        montoEsperado: precioBase,
        montoFinal:    Math.max(0, precioBase - (prev.montoDescuento || 0)),
      }));
      return;
    }

    setForm((prev: any) => ({
      ...prev,
      montoEsperado: precioBase,
      montoDescuento: 0,
      montoFinal:    precioBase,
    }));
  }, [form.metodoPago, form.tipoPrecioAplicado, cursoData, isSinCosto, modoCerrado]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (field: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [field]: value }));

  const handleMontoInput = (field: string, raw: string) => {
    const sanitized = raw.replace(/[^0-9.]/g, "");
    const num = parseFloat(sanitized);
    handleChange(field, isNaN(num) ? null : num);
  };

  const handleDescuentoChange = (val: string) => {
    const descuento = Math.min(Number(val) || 0, precioBase);
    setForm((prev: any) => ({
      ...prev,
      montoDescuento: descuento,
      montoFinal:     Math.max(0, precioBase - descuento),
    }));
  };

  // ── Validación ────────────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    if (!cursoData) {
      sileo.warning({ title: "Curso requerido" }); return false;
    }
    if (!form.metodoPago && !modoCerrado) {
      sileo.warning({ title: "Método de pago requerido" }); return false;
    }
    if (!form.tipoPrecioAplicado) {
      sileo.warning({ title: "Tipo de precio requerido" }); return false;
    }

    if (!isSinCosto) {
      if (!form.estadoPago && !modoCerrado) {
        sileo.warning({ title: "Estado de pago requerido" }); return false;
      }
      if (
        (form.metodoPago === "EFECTIVO" || form.metodoPago === "TRANSFERENCIA") &&
        (!form.montoPagado || form.montoPagado <= 0)
      ) {
        sileo.warning({ title: "Monto requerido", description: "Ingresa el monto recibido." }); return false;
      }
      if (form.estadoPago === "PAGADO" && !form.fechaPago) {
        sileo.warning({ title: "Fecha de pago requerida" }); return false;
      }
      if (form.metodoPago === "FECAP") {
        const empOk = modoCerrado ? !!empresaData : !!empresaData;
        if (!empOk) {
          sileo.warning({ title: "Empresa requerida" }); return false;
        }
        if (saldoInfo && !saldoInfo.suficiente) {
          sileo.warning({ title: "Saldo insuficiente" }); return false;
        }
      }
      if (form.metodoPago === "FINANCIAMIENTO") {
        if (!form.numeroPagos || form.numeroPagos < 1) {
          sileo.warning({ title: "Número de pagos requerido" }); return false;
        }
        if (!form.periodicidad) {
          sileo.warning({ title: "Periodicidad requerida" }); return false;
        }
        if (!form.fechaPrimerPago) {
          sileo.warning({ title: "Fecha del primer pago requerida" }); return false;
        }
      }
      if (form.metodoPago === "VALE_AFILIACION") {
        if (!form.codigoVale) {
          sileo.warning({ title: "Código del vale requerido" }); return false;
        }
        if (!form.montoDescuento || form.montoDescuento <= 0) {
          sileo.warning({ title: "Descuento del vale requerido" }); return false;
        }
      }
    }
    return true;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const payload: any = {
        participanteId:     participante.id,
        cursoId:            cursoData.id,
        tipoPrecioAplicado: form.tipoPrecioAplicado,
        metodoPago:         form.metodoPago,
        montoEsperado:      isSinCosto ? 0 : form.montoEsperado,
        montoFinal:         isSinCosto ? 0 : (form.montoFinal ?? 0),
        montoDescuento:     isSinCosto ? 0 : (form.montoDescuento || 0),
        estadoPago:         isSinCosto ? "PAGADO" : form.estadoPago,
        notas:              form.notas || "",
      };

      if (!isSinCosto && form.montoPagado)  payload.montoPagado = form.montoPagado;
      if (!isSinCosto && form.codigoVale)   payload.codigoVale  = form.codigoVale;
      if (!isSinCosto && form.tieneVale)    payload.tieneVale   = true;
      if (form.fechaPago)                   payload.fechaPago   = form.fechaPago;

      if (form.metodoPago === "FINANCIAMIENTO" && !isSinCosto) {
        payload.esFinanciamiento = true;
        payload.numeroPagos      = form.numeroPagos;
        payload.periodicidad     = form.periodicidad;
        payload.montoPorPago     = montoPorPago;
        if (form.fechaPrimerPago) payload.fechaPrimerPago = form.fechaPrimerPago;
      }

      // FECAP: en modo cerrado usar empresa del curso, si no la del participante
      if (form.metodoPago === "FECAP" && !isSinCosto) {
        payload.empresaId = empresaData.id;
      }

      let response;
      if (inscripcionToEdit) {
        response = await actualizarInscripcion(inscripcionToEdit.id, payload);
        sileo.success({ title: "¡Actualizado!", description: "Inscripción actualizada correctamente." });
      } else {
        response = await crearInscripcion(payload);
        sileo.success({ title: "¡Inscripción creada!", description: "Inscripción registrada exitosamente." });
      }

      onSuccess?.(response.data || response);
      onClose();
    } catch (error: any) {
      sileo.error({
        title:       "Error al guardar",
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

        {/* ── MODO CERRADO: banner fijo con curso/empresa/precio ────────────── */}
        {modoCerrado && cursoData ? (
          <CursoCerradoBanner
            curso={cursoData}
            empresa={empresaData}
            tipoPrecio={form.tipoPrecioAplicado}
            total={form.montoFinal ?? precioBase}
          />
        ) : (
          /* ── MODO NORMAL: header original ─────────────────────────────────── */
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
                  {participante?.nombre} {participante?.apellidoPaterno}{" "}
                  {participante?.apellidoMaterno || ""}
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
        )}

        {/* ── TIPO DE PRECIO: solo en modo normal y no Sin Costo ───────────── */}
        {!modoCerrado && cursoData && !isSinCosto && (
          <div>
            <p className="text-xs text-default-500 font-medium mb-2">
              Tipo de precio
              <span className="text-default-400 font-normal ml-1">
                — define el monto base de la inscripción
              </span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Afiliado",        precio: cursoData.precioAfiliado,   tipo: "AFILIADO"        },
                { label: "Público General", precio: cursoData.precioPublico,    tipo: "PUBLICO_GENERAL" },
                { label: "Estudiante",      precio: cursoData.precioEstudiante, tipo: "ESTUDIANTE"      },
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

        {!modoCerrado && (
          <div className="space-y-1.5">
            <Select
              label="Método de pago"
              placeholder="Selecciona un método"
              selectedKeys={form.metodoPago ? [form.metodoPago] : []}
              disallowEmptySelection
              onChange={(e) => { if (e.target.value) handleChange("metodoPago", e.target.value); }}
              startContent={<span className="text-base">{metodo?.icon}</span>}
            >
              {metodosFiltrados.map((mp) => (
                <SelectItem key={mp.key} startContent={<span>{mp.icon}</span>}>
                  {mp.label}
                </SelectItem>
              ))}
            </Select>

            {!isSinCosto && !participante?.empresaId && (
              <p className="text-[11px] text-default-400 flex items-center gap-1 px-1">
                <ExclamationTriangleIcon className="w-3.5 h-3.5 shrink-0" />
                Fondo FECAP requiere empresa asignada al participante.
              </p>
            )}
            {!isSinCosto && participante?.empresaId && !fecapDisponible && (
              <p className="text-[11px] text-warning-600 flex items-center gap-1 px-1">
                <ExclamationTriangleIcon className="w-3.5 h-3.5 shrink-0" />
                Fondo FECAP no disponible — sin saldo en la empresa asociada.
              </p>
            )}
          </div>
        )}

        {!modoCerrado && <Divider />}

        {/* ══════════════════════════════════════════════════════════════════
            PANELES POR MÉTODO  (idénticos para modo normal y cerrado)
        ══════════════════════════════════════════════════════════════════ */}

        {/* Sin Costo */}
        {isSinCosto && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-5 rounded-xl bg-gradient-to-r from-success-50 to-emerald-50 border-2 border-success-300 shadow-lg">
              <div className="p-3 bg-success-100 rounded-full">
                <GiftIcon className="w-8 h-8 text-success-600" />
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-success-700">🎉 Inscripción sin costo</p>
                <p className="text-sm text-success-600 mt-1">
                  El estado se marcará automáticamente como <strong>PAGADO</strong>.
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-success-600">$0.00</p>
                <Chip size="sm" color="success" variant="flat" className="mt-1">Sin costo</Chip>
              </div>
            </div>
            <DatePicker
              label="Fecha del registro (opcional)"
              value={form.fechaPago ? parseDate(form.fechaPago) as any : null}
              onChange={(date) => handleChange("fechaPago", date ? date.toString() : null)}
              showMonthAndYearPickers
              granularity="day"
            />
          </div>
        )}

        {/* Efectivo */}
        {!isSinCosto && !modoCerrado && form.metodoPago === "EFECTIVO" && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-default-700">
              <BanknotesIcon className="w-4 h-4" /> Pago en efectivo
            </h4>
            <MontoResumen rows={[{ label: "Total esperado", valor: form.montoEsperado }]} />
            <Input
              label="Monto recibido" placeholder="0.00" type="number" min={0} step="0.01"
              value={form.montoPagado?.toString() || ""}
              onChange={(e) => handleMontoInput("montoPagado", e.target.value)}
              startContent={<span className="text-default-400 text-sm">$</span>}
              classNames={{ input: "font-semibold" }}
            />
            {(form.montoPagado ?? 0) > form.montoFinal && form.montoPagado > 0 && (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-success-50 border border-success-200">
                <span className="text-sm text-success-700 font-medium">Cambio a devolver</span>
                <span className="text-sm font-bold text-success-600">
                  ${fmt((form.montoPagado ?? 0) - form.montoFinal)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Transferencia */}
        {!isSinCosto && !modoCerrado && form.metodoPago === "TRANSFERENCIA" && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-default-700">
              <CreditCardIcon className="w-4 h-4" /> Transferencia bancaria
            </h4>
            <MontoResumen rows={[{ label: "Total esperado", valor: form.montoEsperado }]} />
            <Input
              label="Monto transferido" placeholder="0.00" type="number" min={0} step="0.01"
              value={form.montoPagado?.toString() || ""}
              onChange={(e) => handleMontoInput("montoPagado", e.target.value)}
              startContent={<span className="text-default-400 text-sm">$</span>}
              classNames={{ input: "font-semibold" }}
            />
          </div>
        )}

        {/* FECAP */}
        {!isSinCosto && !modoCerrado && form.metodoPago === "FECAP" && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-default-700">
              <BuildingLibraryIcon className="w-4 h-4" />
              Fondo FECAP — {empresaData?.nombre ?? "cargando…"}
            </h4>
            {saldoInfo ? (
              <Card className={`border-2 ${saldoInfo.suficiente ? "border-success-300 bg-success-50/30" : "border-danger-300 bg-danger-50/30"}`}>
                <CardBody className="py-3 px-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <SaldoCell label="Saldo Disponible" valor={saldoInfo.disponible} color="text-success-600" />
                    <SaldoCell label="Saldo a Aplicar"  valor={saldoInfo.costo}      color="text-primary-600" />
                    <SaldoCell label="Saldo Restante"   valor={saldoInfo.restante}   color={saldoInfo.suficiente ? "text-success-600" : "text-danger-600"} />
                  </div>
                  <Divider />
                  <MontoResumen rows={[
                    { label: "Saldo disponible",            valor: saldoInfo.disponible },
                    { label: "Costo del curso",             valor: saldoInfo.costo,     negativo: true },
                    { label: "Saldo restante tras el pago", valor: saldoInfo.restante,
                      color: saldoInfo.suficiente ? "text-success-600" : "text-danger-600",
                      destacado: true },
                  ]} />
                  <p className={`text-xs font-semibold ${saldoInfo.suficiente ? "text-success-600" : "text-danger-600"}`}>
                    {saldoInfo.suficiente ? "✅ Saldo suficiente" : "❌ Saldo insuficiente"}
                  </p>
                </CardBody>
              </Card>
            ) : (
              <div className="p-3 rounded-xl bg-default-50 border border-default-200">
                <span className="text-default-400 text-xs animate-pulse">Cargando saldo FECAP…</span>
              </div>
            )}
          </div>
        )}

        {/* Financiamiento */}
        {!isSinCosto && !modoCerrado && form.metodoPago === "FINANCIAMIENTO" && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-default-700">
              <CreditCardIcon className="w-4 h-4" /> Detalles del financiamiento
            </h4>
            <MontoResumen rows={[{ label: "Total a financiar", valor: form.montoFinal, destacado: true }]} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Número de pagos" type="number" min={1} max={36} placeholder="Ej: 6"
                value={form.numeroPagos?.toString() || ""}
                onChange={(e) => handleChange("numeroPagos", Number(e.target.value))}
              />
              <Input
                label="Monto por pago" value={fmt(montoPorPago)} readOnly
                startContent={<span className="text-default-400 text-sm">$</span>}
                classNames={{ input: "font-semibold text-primary-600" }}
              />
              <Select
                label="Periodicidad" placeholder="Selecciona"
                selectedKeys={form.periodicidad ? [form.periodicidad] : []}
                onChange={(e) => handleChange("periodicidad", e.target.value)}
              >
                {PERIODICIDAD.map((p) => (<SelectItem key={p.key}>{p.label}</SelectItem>))}
              </Select>
            </div>
            <Input
              type="date" label="Fecha del primer pago"
              value={form.fechaPrimerPago || ""}
              onChange={(e) => handleChange("fechaPrimerPago", e.target.value)}
            />
          </div>
        )}

        {/* Vale de afiliación */}
        {!isSinCosto && !modoCerrado && form.metodoPago === "VALE_AFILIACION" && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-default-700">
              <TagIcon className="w-4 h-4" /> Vale de afiliación
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Código del vale" placeholder="Ingresa el código"
                value={form.codigoVale || ""}
                onChange={(e) => { handleChange("codigoVale", e.target.value); handleChange("tieneVale", !!e.target.value); }}
              />
              <Input
                label="Descuento del vale" type="number" min={0} max={precioBase}
                value={form.montoDescuento?.toString() || "0"}
                onChange={(e) => handleDescuentoChange(e.target.value)}
                startContent={<span className="text-default-400 text-sm">$</span>}
              />
            </div>
            <MontoResumen rows={[
              { label: "Precio del curso",  valor: form.montoEsperado },
              { label: "Descuento del vale",valor: form.montoDescuento, negativo: true },
              { label: "Total a pagar",     valor: form.montoFinal, destacado: true },
            ]} />
          </div>
        )}

        {/* Estado de pago y fecha (modo normal, no Sin Costo) */}
        {!isSinCosto && !modoCerrado && (
          <>
            <Divider />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Estado de pago"
                selectedKeys={form.estadoPago ? [form.estadoPago] : []}
                disallowEmptySelection
                onChange={(e) => { if (e.target.value) handleChange("estadoPago", e.target.value); }}
              >
                {ESTADO_PAGO.map((ep) => (<SelectItem key={ep.key}>{ep.label}</SelectItem>))}
              </Select>
              {form.estadoPago === "PAGADO" && (
                <DatePicker
                  label="Fecha del pago"
                  value={form.fechaPago ? parseDate(form.fechaPago) as any : null}
                  onChange={(date) => handleChange("fechaPago", date ? date.toString() : null)}
                  showMonthAndYearPickers granularity="day"
                />
              )}
            </div>
          </>
        )}

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