import { useState, useMemo, useEffect } from "react";
import { sileo } from "sileo";
import { crearInscripcion, crearInscripcionCursoCerrado } from "../services/inscripcionService";
import { fecapService }     from "../services/fecapService";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type MetodoPagoCerrado =
  | "EFECTIVO"
  | "TRANSFERENCIA"
  | "FECAP"
  | "FINANCIAMIENTO"
  | "SIN_COSTO"
  | "VALE_AFILIACION";

export type EstadoPago = "PENDIENTE" | "PAGADO" | "CANCELADO" | "REEMBOLSADO";
export type Periodicidad = "SEMANAL" | "QUINCENAL" | "MENSUAL";

export interface FormInscripcionCerrada {
  metodoPago:      MetodoPagoCerrado;
  estadoPago:      EstadoPago;
  montoPagado:     number | null;
  montoDescuento:  number;
  codigoVale:      string;
  tieneVale:       boolean;
  fechaPago:       string | null;
  notas:           string;
  // Financiamiento
  numeroPagos:     number | null;
  periodicidad:    Periodicidad | null;
  fechaPrimerPago: string | null;
}

export interface SaldoFecapInfo {
  disponible: number;
  aplicado:   number;
  costo:      number;
  restante:   number;
  suficiente: boolean;
}

// ─── Métodos disponibles ──────────────────────────────────────────────────────

export const METODOS_CERRADO = [
  { key: "EFECTIVO"        as MetodoPagoCerrado, label: "Efectivo",          icon: "💵" },
  { key: "TRANSFERENCIA"   as MetodoPagoCerrado, label: "Transferencia",      icon: "🏦" },
  { key: "FECAP"           as MetodoPagoCerrado, label: "Fondo FECAP",        icon: "🏗️", requiereEmpresa: true },
  { key: "FINANCIAMIENTO"  as MetodoPagoCerrado, label: "Financiamiento",     icon: "📆" },
  { key: "SIN_COSTO"       as MetodoPagoCerrado, label: "Sin Costo",          icon: "🎁" },
  { key: "VALE_AFILIACION" as MetodoPagoCerrado, label: "Vale de Afiliación", icon: "🎫" },
] as const;

export const ESTADOS_PAGO = [
  { key: "PENDIENTE"   as EstadoPago, label: "Pendiente"   },
  { key: "PAGADO"      as EstadoPago, label: "Pagado"      },
  { key: "CANCELADO"   as EstadoPago, label: "Cancelado"   },
  { key: "REEMBOLSADO" as EstadoPago, label: "Reembolsado" },
] as const;

export const PERIODICIDADES = [
  { key: "SEMANAL"   as Periodicidad, label: "Semanal"   },
  { key: "QUINCENAL" as Periodicidad, label: "Quincenal" },
  { key: "MENSUAL"   as Periodicidad, label: "Mensual"   },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolverTipoPrecio(participante: any): string {
  if (!participante) return "PUBLICO_GENERAL";
  if (participante.tipoPrecio) return participante.tipoPrecio;
  return participante.esAfiliado ? "AFILIADO" : "PUBLICO_GENERAL";
}

function resolverPrecio(curso: any, tipoPrecio: string): number {
  if (!curso) return 0;
  switch (tipoPrecio) {
    case "AFILIADO":        return curso.precioAfiliado   ?? 0;
    case "ESTUDIANTE":      return curso.precioEstudiante ?? 0;
    case "PUBLICO_GENERAL":
    default:                return curso.precioPublico    ?? 0;
  }
}

const FORM_INICIAL: FormInscripcionCerrada = {
  metodoPago:      "EFECTIVO",
  estadoPago:      "PENDIENTE",
  montoPagado:     null,
  montoDescuento:  0,
  codigoVale:      "",
  tieneVale:       false,
  fechaPago:       null,
  notas:           "",
  numeroPagos:     null,
  periodicidad:    null,
  fechaPrimerPago: null,
};

// ─── Hook principal ───────────────────────────────────────────────────────────

export interface UseInscripcionCerradaOptions {
  /** Participante a inscribir (ya creado) */
  participante: any;
  /** Curso cerrado completo (con precioAfiliado, precioPublico, etc.) */
  curso:        any;
  /** Empresa del curso (ya resuelta desde el curso cerrado) */
  empresa:      any;
  /** Callback al completar exitosamente */
  onSuccess?:   (inscripcion: any) => void;
}

export function useInscripcionCerrada({
  participante,
  curso,
  empresa,
  onSuccess,
}: UseInscripcionCerradaOptions) {

  const [form, setForm]                 = useState<FormInscripcionCerrada>({ ...FORM_INICIAL });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saldoFecap, setSaldoFecap]     = useState<{ disponible: number; aplicado: number } | null>(null);

  // ── Precio auto-asignado desde el participante ────────────────────────────
  const tipoPrecio = useMemo(() => resolverTipoPrecio(participante), [participante]);
  const precioBase = useMemo(() => resolverPrecio(curso, tipoPrecio), [curso, tipoPrecio]);

  // montoFinal se deriva del precioBase menos descuento
  const montoFinal = useMemo(() => {
    if (form.metodoPago === "SIN_COSTO") return 0;
    return Math.max(0, precioBase - (form.montoDescuento || 0));
  }, [precioBase, form.montoDescuento, form.metodoPago]);

  // ── FECAP: cargar saldo de la empresa cuando se selecciona ────────────────
  useEffect(() => {
    if (form.metodoPago === "FECAP" && empresa?.id) {
      fecapService
        .getSaldoEmpresa(empresa.id)
        .then((data) => setSaldoFecap({
          disponible: data.saldoFecapDisponible ?? 0,
          aplicado:   data.saldoFecapAplicado   ?? 0,
        }))
        .catch(console.error);
    } else {
      setSaldoFecap(null);
    }
  }, [form.metodoPago, empresa?.id]);

  // ── SIN_COSTO: forzar estado PAGADO ──────────────────────────────────────
  useEffect(() => {
    if (form.metodoPago === "SIN_COSTO") {
      setForm((p) => ({ ...p, estadoPago: "PAGADO", montoPagado: 0, montoDescuento: 0 }));
    }
  }, [form.metodoPago]);

  // ── Monto por cuota (financiamiento) ──────────────────────────────────────
  const montoPorPago = useMemo(() => {
    if (form.metodoPago !== "FINANCIAMIENTO" || !form.numeroPagos || form.numeroPagos < 1) return 0;
    return montoFinal / form.numeroPagos;
  }, [form.metodoPago, form.numeroPagos, montoFinal]);

  // ── Info FECAP calculada ──────────────────────────────────────────────────
  const saldoInfo = useMemo<SaldoFecapInfo | null>(() => {
    if (form.metodoPago !== "FECAP") return null;
    const fuente = saldoFecap ?? {
      disponible: empresa?.saldoFecapDisponible ?? 0,
      aplicado:   empresa?.saldoFecapAplicado   ?? 0,
    };
    return {
      disponible: fuente.disponible,
      aplicado:   fuente.aplicado,
      costo:      montoFinal,
      restante:   Math.max(0, fuente.disponible - montoFinal),
      suficiente: fuente.disponible >= montoFinal,
    };
  }, [form.metodoPago, saldoFecap, empresa, montoFinal]);

  // ── FECAP disponible para este curso cerrado ──────────────────────────────
  const fecapDisponible =
    !!empresa?.id &&
    ((saldoFecap?.disponible ?? 0) > 0 || (empresa?.saldoFecapDisponible ?? 0) > 0);

  const metodosFiltrados = METODOS_CERRADO.filter(
    (m) => m.key !== "FECAP" || fecapDisponible,
  );

  // Si el método seleccionado era FECAP y ya no está disponible, volver a EFECTIVO
  useEffect(() => {
    if (form.metodoPago === "FECAP" && !fecapDisponible) {
      setForm((p) => ({ ...p, metodoPago: "EFECTIVO" }));
    }
  }, [fecapDisponible]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = <K extends keyof FormInscripcionCerrada>(
    field: K,
    value: FormInscripcionCerrada[K],
  ) => setForm((p) => ({ ...p, [field]: value }));

  const handleDescuentoChange = (val: string) => {
    const descuento = Math.min(Number(val) || 0, precioBase);
    setForm((p) => ({ ...p, montoDescuento: descuento }));
  };

  const reset = () => setForm({ ...FORM_INICIAL });

  // ── Validación — sin exigir fechaPago ni tipo de precio ───────────────────
  const validate = (): boolean => {
    const isSinCosto = form.metodoPago === "SIN_COSTO";

    if (!isSinCosto) {
      if (!form.estadoPago) {
        sileo.warning({ title: "Estado de pago requerido" }); return false;
      }
      if (
        (form.metodoPago === "EFECTIVO" || form.metodoPago === "TRANSFERENCIA") &&
        (!form.montoPagado || form.montoPagado <= 0)
      ) {
        sileo.warning({ title: "Monto requerido", description: "Ingresa el monto recibido." }); return false;
      }
      // ── fechaPago ya NO es obligatoria en modo cerrado ────────────────────
      if (form.metodoPago === "FECAP") {
        if (!empresa?.id) {
          sileo.warning({ title: "Empresa requerida" }); return false;
        }
        if (saldoInfo && !saldoInfo.suficiente) {
          sileo.warning({ title: "Saldo FECAP insuficiente" }); return false;
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
  const submit = async (): Promise<void> => {
    if (!validate()) return;

    setIsSubmitting(true);
    const isSinCosto = form.metodoPago === "SIN_COSTO";

    try {
      const payload: any = {
        participanteId:     participante.id,
        cursoId:            curso.id,
        tipoPrecioAplicado: tipoPrecio,
        metodoPago:         form.metodoPago,
        montoEsperado:      isSinCosto ? 0 : precioBase,
        montoFinal:         isSinCosto ? 0 : montoFinal,
        montoDescuento:     isSinCosto ? 0 : (form.montoDescuento || 0),
        estadoPago:         isSinCosto ? "PAGADO" : form.estadoPago,
        notas:              form.notas || "",
      };

      if (!isSinCosto && form.montoPagado)  payload.montoPagado = form.montoPagado;
      if (!isSinCosto && form.codigoVale)   payload.codigoVale  = form.codigoVale;
      if (!isSinCosto && form.tieneVale)    payload.tieneVale   = true;
      // fechaPago es opcional — solo se envía si el usuario la proporcionó
      if (form.fechaPago)                   payload.fechaPago   = form.fechaPago;

      if (form.metodoPago === "FINANCIAMIENTO" && !isSinCosto) {
        payload.esFinanciamiento = true;
        payload.numeroPagos      = form.numeroPagos;
        payload.periodicidad     = form.periodicidad;
        payload.montoPorPago     = montoPorPago;
        if (form.fechaPrimerPago) payload.fechaPrimerPago = form.fechaPrimerPago;
      }

      if (form.metodoPago === "FECAP" && !isSinCosto) {
        payload.empresaId = empresa.id;
      }

      const response = await crearInscripcionCursoCerrado(payload);
      sileo.success({
        title:       "¡Inscripción creada!",
        description: `${participante.nombre} ${participante.apellidoPaterno} inscrito correctamente.`,
      });
      onSuccess?.(response.data || response);
    } catch (error: any) {
      sileo.error({
        title:       "Error al guardar",
        description: error?.response?.data?.message || error?.message || "Error inesperado",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // Estado del formulario
    form,
    handleChange,
    handleDescuentoChange,
    reset,

    // Valores calculados / derivados
    tipoPrecio,
    precioBase,
    montoFinal,
    montoPorPago,
    saldoInfo,
    metodosFiltrados,
    fecapDisponible,

    // Estado de carga
    isSubmitting,

    // Acción principal
    submit,
  };
}