import { useEffect } from "react";
import {
  Input, Select, SelectItem, Card, CardBody,
  Divider, Chip,
} from "@heroui/react";
import {
  LockClosedIcon,
  BuildingOffice2Icon,
  CurrencyDollarIcon,
  BanknotesIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  GiftIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

import ModalForm from "../../common/modalForm";
import {
  useInscripcionCerrada,
  METODOS_CERRADO,
  ESTADOS_PAGO,
  PERIODICIDADES,
} from "../../../hooks/UseInscripcionCerrada";

// ─── Helpers de formato ───────────────────────────────────────────────────────

function fmt(n: number | null | undefined) {
  return (n ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 });
}

// ─── Sub-componentes internos ─────────────────────────────────────────────────

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
            row.destacado
              ? "bg-warning-50/60 border-t border-warning-100"
              : "bg-default-50",
            i > 0 && !row.destacado ? "border-t border-default-100" : "",
          ].join(" ")}
        >
          <span
            className={`text-sm ${
              row.destacado ? "font-semibold text-default-700" : "text-default-500"
            }`}
          >
            {row.label}
          </span>
          <span
            className={`text-sm font-bold ${
              row.color ??
              (row.negativo
                ? "text-danger-600"
                : row.destacado
                  ? "text-warning-700"
                  : "text-default-700")
            }`}
          >
            {row.negativo ? "-" : ""}${fmt(row.valor)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Banner superior: datos fijos del curso cerrado ──────────────────────────

function BannerCursoCerrado({
  curso,
  empresa,
  tipoPrecio,
  precioBase,
}: {
  curso:      any;
  empresa:    any;
  tipoPrecio: string;
  precioBase: number;
}) {
  const labelTipo =
    tipoPrecio === "AFILIADO"        ? "Afiliado"        :
    tipoPrecio === "PUBLICO_GENERAL" ? "Público general" : "Estudiante";

  return (
    <Card className="border-2 border-warning-200 bg-gradient-to-r from-warning-50 to-orange-50">
      <CardBody className="py-4 px-5 space-y-3">
        {/* Encabezado */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-warning-100 rounded-lg shrink-0">
            <LockClosedIcon className="w-4 h-4 text-warning-600" />
          </div>
          <p className="text-sm font-bold text-warning-700">Inscripción a curso cerrado</p>
          <Chip size="sm" variant="flat" color="warning" className="ml-auto">
            Auto-configurado
          </Chip>
        </div>

        <Divider className="bg-warning-200" />

        {/* Curso y empresa en grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start gap-2 rounded-lg bg-white/70 border border-warning-100 p-3">
            <CurrencyDollarIcon className="w-4 h-4 text-warning-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-default-400 font-medium uppercase tracking-wide">
                Curso
              </p>
              <p className="text-sm font-semibold text-default-800 leading-tight truncate">
                {curso?.nombre ?? "—"}
              </p>
              {curso?.fechaInicio && (
                <p className="text-xs text-default-500 mt-0.5">
                  {new Date(curso.fechaInicio).toLocaleDateString("es-MX", {
                    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-white/70 border border-warning-100 p-3">
            <BuildingOffice2Icon className="w-4 h-4 text-warning-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-default-400 font-medium uppercase tracking-wide">
                Empresa
              </p>
              <p className="text-sm font-semibold text-default-800 leading-tight truncate">
                {empresa?.nombre ?? "—"}
              </p>
              {empresa?.rfc && (
                <p className="text-xs text-default-500 mt-0.5">RFC: {empresa.rfc}</p>
              )}
            </div>
          </div>
        </div>

        {/* Precio fijo — sin mostrar tipo de precio ni selector */}
        <div className="flex items-center justify-between rounded-lg bg-white/70 border border-warning-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-success-500" />
            <span className="text-sm text-default-600">
              Precio aplicado automáticamente
            </span>
          </div>
          <span className="text-xl font-black text-warning-700">${fmt(precioBase)}</span>
        </div>
      </CardBody>
    </Card>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface InscripcionCerradaModalProps {
  isOpen:       boolean;
  onClose:      () => void;
  onSuccess?:   (inscripcion: any) => void;
  participante: any;
  curso:        any;
  empresa:      any;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function InscripcionCerradaModal({
  isOpen,
  onClose,
  onSuccess,
  participante,
  curso,
  empresa,
}: InscripcionCerradaModalProps) {

  const {
    form,
    handleChange,
    handleDescuentoChange,
    reset,
    tipoPrecio,
    precioBase,
    montoFinal,
    montoPorPago,
    saldoInfo,
    metodosFiltrados,
    isSubmitting,
    submit,
  } = useInscripcionCerrada({ participante, curso, empresa, onSuccess });

  // Reset al cerrar
  useEffect(() => {
    if (!isOpen) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const isSinCosto   = form.metodoPago === "SIN_COSTO";
  const metodoActual = METODOS_CERRADO.find((m) => m.key === form.metodoPago);

  const handleSubmit = async () => {
    await submit();
    onClose();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title="Inscribir participante"
      size="2xl"
      isLoading={isSubmitting}
      onSubmit={handleSubmit}
      submitText="Registrar inscripción"
      hideCloseButton
      hideCancelButton
    >
      <div className="space-y-5 px-1">

        {/* ── 1. Banner con datos fijos (curso, empresa, precio) ─────────── */}
        <BannerCursoCerrado
          curso={curso}
          empresa={empresa}
          tipoPrecio={tipoPrecio}
          precioBase={precioBase}
        />

        {/* ── 2. Participante ───────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-default-50 border border-default-200">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary-600">
              {participante?.nombre?.charAt(0) ?? "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-default-800 truncate">
              {participante?.nombre} {participante?.apellidoPaterno}{" "}
              {participante?.apellidoMaterno ?? ""}
            </p>
            {participante?.correo && (
              <p className="text-xs text-default-500 truncate">{participante.correo}</p>
            )}
          </div>
          {participante?.esAfiliado && (
            <Chip size="sm" color="success" variant="flat">Afiliado</Chip>
          )}
        </div>

        {/* ── 3. Método de pago ─────────────────────────────────────────── */}
        <Select
          label="Método de pago"
          placeholder="Selecciona un método"
          selectedKeys={form.metodoPago ? [form.metodoPago] : []}
          disallowEmptySelection
          onChange={(e) => {
            if (e.target.value) handleChange("metodoPago", e.target.value as any);
          }}
          startContent={
            <span className="text-base">{metodoActual?.icon}</span>
          }
        >
          {metodosFiltrados.map((mp) => (
            <SelectItem key={mp.key} startContent={<span>{mp.icon}</span>}>
              {mp.label}
            </SelectItem>
          ))}
        </Select>

        <Divider />

        {/* ── 4. Paneles por método ─────────────────────────────────────── */}

        {/* Sin Costo */}
        {isSinCosto && (
          <div className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-success-50 to-emerald-50 border-2 border-success-300">
            <div className="p-3 bg-success-100 rounded-full shrink-0">
              <GiftIcon className="w-7 h-7 text-success-600" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-success-700">🎉 Inscripción sin costo</p>
              <p className="text-sm text-success-600 mt-1">
                Estado marcado automáticamente como <strong>PAGADO</strong>.
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-black text-success-600">$0.00</p>
            </div>
          </div>
        )}

        {/* Efectivo */}
        {!isSinCosto && form.metodoPago === "EFECTIVO" && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-default-700">
              <BanknotesIcon className="w-4 h-4" /> Pago en efectivo
            </h4>
            <MontoResumen rows={[{ label: "Total esperado", valor: precioBase }]} />
            <Input
              label="Monto recibido"
              placeholder="0.00"
              type="number"
              min={0}
              step="0.01"
              value={form.montoPagado?.toString() || ""}
              onChange={(e) => {
                const v = parseFloat(e.target.value.replace(/[^0-9.]/g, ""));
                handleChange("montoPagado", isNaN(v) ? null : v);
              }}
              startContent={<span className="text-default-400 text-sm">$</span>}
              classNames={{ input: "font-semibold" }}
            />
            {(form.montoPagado ?? 0) > montoFinal && (form.montoPagado ?? 0) > 0 && (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-success-50 border border-success-200">
                <span className="text-sm text-success-700 font-medium">Cambio a devolver</span>
                <span className="text-sm font-bold text-success-600">
                  ${fmt((form.montoPagado ?? 0) - montoFinal)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Transferencia */}
        {!isSinCosto && form.metodoPago === "TRANSFERENCIA" && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-default-700">
              <CreditCardIcon className="w-4 h-4" /> Transferencia bancaria
            </h4>
            <MontoResumen rows={[{ label: "Total esperado", valor: precioBase }]} />
            <Input
              label="Monto transferido"
              placeholder="0.00"
              type="number"
              min={0}
              step="0.01"
              value={form.montoPagado?.toString() || ""}
              onChange={(e) => {
                const v = parseFloat(e.target.value.replace(/[^0-9.]/g, ""));
                handleChange("montoPagado", isNaN(v) ? null : v);
              }}
              startContent={<span className="text-default-400 text-sm">$</span>}
              classNames={{ input: "font-semibold" }}
            />
          </div>
        )}

        {/* FECAP */}
        {!isSinCosto && form.metodoPago === "FECAP" && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-default-700">
              <BuildingLibraryIcon className="w-4 h-4" />
              Fondo FECAP — {empresa?.nombre ?? "cargando…"}
            </h4>
            {saldoInfo ? (
              <Card
                className={`border-2 ${
                  saldoInfo.suficiente
                    ? "border-success-300 bg-success-50/30"
                    : "border-danger-300 bg-danger-50/30"
                }`}
              >
                <CardBody className="py-3 px-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "Disponible", valor: saldoInfo.disponible, color: "text-success-600" },
                      { label: "A aplicar",  valor: saldoInfo.costo,      color: "text-primary-600" },
                      { label: "Restante",   valor: saldoInfo.restante,   color: saldoInfo.suficiente ? "text-success-600" : "text-danger-600" },
                    ].map(({ label, valor, color }) => (
                      <div key={label} className="p-2 rounded-lg bg-white/60 border border-default-100">
                        <p className="text-[10px] text-default-400 font-medium">{label}</p>
                        <p className={`text-sm font-bold mt-0.5 ${color}`}>${fmt(valor)}</p>
                      </div>
                    ))}
                  </div>
                  <MontoResumen rows={[
                    { label: "Saldo disponible",            valor: saldoInfo.disponible },
                    { label: "Costo del curso",             valor: saldoInfo.costo, negativo: true },
                    {
                      label:    "Saldo restante tras el pago",
                      valor:    saldoInfo.restante,
                      color:    saldoInfo.suficiente ? "text-success-600" : "text-danger-600",
                      destacado: true,
                    },
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
        {!isSinCosto && form.metodoPago === "FINANCIAMIENTO" && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-default-700">
              <CreditCardIcon className="w-4 h-4" /> Detalles del financiamiento
            </h4>
            <MontoResumen rows={[{ label: "Total a financiar", valor: montoFinal, destacado: true }]} />
            <div className="grid grid-cols-3 gap-4">
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
                onChange={(e) => handleChange("periodicidad", e.target.value as any)}
              >
                {PERIODICIDADES.map((p) => (
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

        {/* Vale de Afiliación */}
        {!isSinCosto && form.metodoPago === "VALE_AFILIACION" && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-default-700">
              <TagIcon className="w-4 h-4" /> Vale de afiliación
            </h4>
            <div className="grid grid-cols-2 gap-4">
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
            <MontoResumen rows={[
              { label: "Precio del curso",   valor: precioBase },
              { label: "Descuento del vale", valor: form.montoDescuento, negativo: true },
              { label: "Total a pagar",      valor: montoFinal, destacado: true },
            ]} />
          </div>
        )}

        {/* ── 5. Estado de pago — simplificado, sin fecha de pago ──────── */}
        {!isSinCosto && (
          <>
            <Divider />
            <Select
              label="Estado de pago"
              selectedKeys={form.estadoPago ? [form.estadoPago] : []}
              disallowEmptySelection
              onChange={(e) => {
                if (e.target.value) handleChange("estadoPago", e.target.value as any);
              }}
            >
              {ESTADOS_PAGO.map((ep) => (
                <SelectItem key={ep.key}>{ep.label}</SelectItem>
              ))}
            </Select>
          </>
        )}

        {/* ── 6. Notas ─────────────────────────────────────────────────── */}
        <Input
          label="Notas (opcional)"
          value={form.notas || ""}
          onChange={(e) => handleChange("notas", e.target.value)}
          placeholder="Observaciones adicionales..."
        />

      </div>
    </ModalForm>
  );
}