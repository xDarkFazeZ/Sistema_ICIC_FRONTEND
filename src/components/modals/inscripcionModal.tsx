// components/modals/Inscripcion/inscripcionModal.tsx
import { useState, useEffect } from "react";
import {
  Input,
  Select,
  SelectItem,
  Button,
  Card,
  CardBody,
  Divider,
  Chip,
} from "@heroui/react";
import { sileo } from "sileo";
import ModalForm from "../common/modalForm";
import { obtenerCursoPorId } from "../../services/cursoService";
import { obtenerEmpresa } from "../../services/empresaService";
import { crearInscripcion, actualizarInscripcion } from "../../services/inscripcionService";
import {
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// Enums
const METODOS_PAGO = [
  { key: "VENTA_AFILIADO", label: "Venta Afiliado", requiereEmpresa: false, requiereSaldo: false },
  { key: "VENTA_PUBLICO", label: "Venta Público", requiereEmpresa: false, requiereSaldo: false },
  { key: "CAPTACION_FEDERAL", label: "Captación Federal", requiereEmpresa: true, requiereSaldo: true, tipoCaptacion: "FEDERAL" },
  { key: "CAPTACION_LOCAL", label: "Captación Local", requiereEmpresa: true, requiereSaldo: true, tipoCaptacion: "LOCAL" },
  { key: "FINANCIAMIENTO", label: "Financiamiento", requiereEmpresa: false, requiereSaldo: false },
  { key: "SIN_COSTO", label: "Sin Costo", requiereEmpresa: false, requiereSaldo: false },
  { key: "VALE_AFILIACION", label: "Vale Afiliación", requiereEmpresa: false, requiereSaldo: false },
];

const TIPO_PRECIO = [
  { key: "AFILIADO", label: "Afiliado" },
  { key: "PUBLICO_GENERAL", label: "Público General" },
  { key: "ESTUDIANTE", label: "Estudiante" },
];

const ESTADO_PAGO = [
  { key: "PENDIENTE", label: "Pendiente" },
  { key: "PAGADO", label: "Pagado" },
  { key: "CANCELADO", label: "Cancelado" },
  { key: "REEMBOLSADO", label: "Reembolsado" },
];

const PERIODICIDAD = [
  { key: "SEMANAL", label: "Semanal" },
  { key: "QUINCENAL", label: "Quincenal" },
  { key: "MENSUAL", label: "Mensual" },
];

interface InscripcionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (inscripcion: any) => void;
  participante: any;
  curso?: any;
  empresa?: any; // Empresa ya cargada desde el modal padre
  inscripcionToEdit?: any;
}

export default function InscripcionModal({
  isOpen,
  onClose,
  onSuccess,
  participante,
  curso,
  empresa: empresaProp, // Recibir empresa desde el padre
  inscripcionToEdit,
}: InscripcionModalProps) {
  // Estado inicial del formulario
  const [form, setForm] = useState<any>(() => {
    // Si es edición, cargar datos existentes
    if (inscripcionToEdit) {
      return {
        ...inscripcionToEdit,
        fechaPago: inscripcionToEdit.fechaPago?.split('T')[0] || null,
        fechaPrimerPago: inscripcionToEdit.fechaPrimerPago?.split('T')[0] || null,
      };
    }
    
    // Si es creación, valores por defecto
    return {
      cursoId: curso?.id || null,
      participanteId: participante?.id || null,
      estadoPago: "PENDIENTE",
      tipoPrecioAplicado: participante?.esAfiliado ? "AFILIADO" : "PUBLICO_GENERAL",
      metodoPago: participante?.esAfiliado ? "VENTA_AFILIADO" : "VENTA_PUBLICO",
      montoEsperado: 0,
      montoPagado: null,
      tieneVale: false,
      codigoVale: null,
      montoDescuento: 0,
      montoFinal: 0,
      fechaPago: null,
      notas: "",
      // Financiamiento
      esFinanciamiento: false,
      numeroPagos: null,
      montoPorPago: null,
      periodicidad: null,
      fechaPrimerPago: null,
    };
  });

  const [cursoData, setCursoData] = useState<any>(curso || null);
  const [empresaData, setEmpresaData] = useState<any>(empresaProp || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saldoInfo, setSaldoInfo] = useState<any>(null);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<any>(null);

  // Cargar datos del curso si no viene
  useEffect(() => {
    if (form.cursoId && !cursoData) {
      obtenerCursoPorId(form.cursoId).then(setCursoData);
    }
  }, [form.cursoId, cursoData]);

  // Cargar datos de la empresa si no viene del padre
  useEffect(() => {
    if (!empresaProp && participante?.empresaId && !empresaData) {
      obtenerEmpresa(participante.empresaId).then(emp => {
        setEmpresaData(emp);
      });
    } else if (empresaProp) {
      setEmpresaData(empresaProp);
    }
  }, [participante, empresaProp, empresaData]);

  // Encontrar el método de pago seleccionado
  useEffect(() => {
    const metodo = METODOS_PAGO.find(m => m.key === form.metodoPago);
    setMetodoSeleccionado(metodo);
  }, [form.metodoPago]);

  // Calcular montos cuando cambia tipo de precio o curso
  useEffect(() => {
    if (cursoData) {
      let montoBase = 0;
      switch (form.tipoPrecioAplicado) {
        case "AFILIADO":
          montoBase = cursoData.precioAfiliado || 0;
          break;
        case "PUBLICO_GENERAL":
          montoBase = cursoData.precioPublico || 0;
          break;
        case "ESTUDIANTE":
          montoBase = cursoData.precioEstudiante || 0;
          break;
      }
      
      const montoFinal = Math.max(0, montoBase - (form.montoDescuento || 0));
      
      setForm((prev: any) => ({
        ...prev,
        montoEsperado: montoBase,
        montoFinal: montoFinal,
      }));
    }
  }, [form.tipoPrecioAplicado, form.montoDescuento, cursoData]);

  // Verificar saldo cuando se selecciona captación
  useEffect(() => {
    if (empresaData && (form.metodoPago === "CAPTACION_FEDERAL" || form.metodoPago === "CAPTACION_LOCAL")) {
      const tipo = form.metodoPago === "CAPTACION_FEDERAL" ? "Federal" : "Local";
      const saldoDisponible = form.metodoPago === "CAPTACION_FEDERAL" 
        ? empresaData.saldoFederalDisponible || 0
        : empresaData.saldoLocalDisponible || 0;
      
      setSaldoInfo({
        tipo,
        disponible: saldoDisponible,
        suficiente: saldoDisponible >= (form.montoFinal || 0),
      });
    } else {
      setSaldoInfo(null);
    }
  }, [form.metodoPago, form.montoFinal, empresaData]);

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    // Validar que haya curso
    if (!cursoData) {
      sileo.warning({ title: "Curso requerido", description: "Selecciona un curso para la inscripción" });
      return false;
    }

    // Validar saldo para captación
    if (metodoSeleccionado?.requiereSaldo && saldoInfo && !saldoInfo.suficiente) {
      sileo.warning({ 
        title: "Saldo insuficiente", 
        description: `La empresa no tiene suficiente saldo ${saldoInfo.tipo} para esta inscripción` 
      });
      return false;
    }

    // Validar campos requeridos para financiamiento
    if (form.metodoPago === "FINANCIAMIENTO") {
      if (!form.numeroPagos || form.numeroPagos < 1) {
        sileo.warning({ title: "Campo requerido", description: "Ingresa el número de pagos" });
        return false;
      }
      if (!form.periodicidad) {
        sileo.warning({ title: "Campo requerido", description: "Selecciona la periodicidad" });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Construir payload asegurando que las fechas estén en formato YYYY-MM-DD
      const payload: any = {
        participanteId: participante.id,
        cursoId: cursoData.id,
        tipoPrecioAplicado: form.tipoPrecioAplicado,
        metodoPago: form.metodoPago,
        montoEsperado: form.montoEsperado,
        montoFinal: form.montoFinal,
        estadoPago: form.estadoPago,
        montoDescuento: form.montoDescuento || 0,
        notas: form.notas || "",
      };

      // Agregar campos opcionales solo si tienen valor
      if (form.montoPagado) payload.montoPagado = form.montoPagado;
      if (form.codigoVale) payload.codigoVale = form.codigoVale;
      if (form.tieneVale) payload.tieneVale = true;

      // ✅ FECHAS: Enviar en formato YYYY-MM-DD (el backend las convertirá a Date)
      if (form.fechaPago) {
        payload.fechaPago = form.fechaPago;
      }
      
      // Datos de financiamiento
      if (form.metodoPago === "FINANCIAMIENTO") {
        payload.esFinanciamiento = true;
        payload.numeroPagos = form.numeroPagos;
        payload.periodicidad = form.periodicidad;
        payload.montoPorPago = form.montoFinal / form.numeroPagos;
        if (form.fechaPrimerPago) {
          payload.fechaPrimerPago = form.fechaPrimerPago;
        }
      }

      // Datos de captación
      if (form.metodoPago === "CAPTACION_FEDERAL" || form.metodoPago === "CAPTACION_LOCAL") {
        if (!empresaData?.id) {
          throw new Error("La empresa es requerida para captación");
        }
        payload.empresaId = empresaData.id;
      }

      let response;
      if (inscripcionToEdit) {
        response = await actualizarInscripcion(inscripcionToEdit.id, payload);
        sileo.success({ title: "¡Inscripción actualizada!", description: "Los cambios se guardaron correctamente" });
      } else {
        response = await crearInscripcion(payload);
        sileo.success({ title: "¡Inscripción creada!", description: "La inscripción se registró exitosamente" });
      }

      onSuccess?.(response.data || response);
      onClose();
    } catch (error: any) {
      console.error("Error en inscripción:", error);
      sileo.error({ 
        title: "Error al guardar", 
        description: error?.response?.data?.message || error?.message || "Error al guardar la inscripción" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title="Inscripción y Pago"
      size="3xl"
      isLoading={isSubmitting}
      onSubmit={handleSubmit}
      submitText={inscripcionToEdit ? "Actualizar inscripción" : "Registrar inscripción"}
    >
      <div className="space-y-6 px-1">
        {/* Resumen del curso y participante */}
        <Card className="bg-primary-50/30 border border-primary-200">
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-xl">
              <CurrencyDollarIcon className="w-8 h-8 text-primary-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg">{cursoData?.nombre || "Curso no seleccionado"}</h4>
              <p className="text-sm text-default-600">
                {participante?.nombre} {participante?.apellidoPaterno} {participante?.apellidoMaterno || ''}
              </p>
            </div>
            {empresaData && (
              <Chip color="primary" variant="flat" className="ml-auto">
                {empresaData.nombre}
              </Chip>
            )}
          </CardBody>
        </Card>

        {/* Advertencia si el participante no tiene empresa pero el método la requiere */}
        {metodoSeleccionado?.requiereEmpresa && !empresaData && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-danger-50 border border-danger-200">
            <ExclamationTriangleIcon className="w-5 h-5 text-danger-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-danger-700">Empresa requerida</p>
              <p className="text-xs text-danger-600 mt-1">
                Este método de pago requiere que el participante tenga una empresa asociada.
              </p>
            </div>
          </div>
        )}

        {/* Tipo de precio y método de pago */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Tipo de precio"
            placeholder="Selecciona un tipo"
            selectedKeys={form.tipoPrecioAplicado ? [form.tipoPrecioAplicado] : []}
            onChange={(e) => handleChange("tipoPrecioAplicado", e.target.value)}
            isDisabled={!cursoData}
          >
            {TIPO_PRECIO.map((tp) => (
              <SelectItem key={tp.key}>{tp.label}</SelectItem>
            ))}
          </Select>

          <Select
            label="Método de pago"
            placeholder="Selecciona un método"
            selectedKeys={form.metodoPago ? [form.metodoPago] : []}
            onChange={(e) => handleChange("metodoPago", e.target.value)}
          >
            {METODOS_PAGO
              .filter(m => !m.requiereEmpresa || participante?.empresaId)
              .map((mp) => (
                <SelectItem key={mp.key}>{mp.label}</SelectItem>
              ))}
          </Select>
        </div>

        {/* Montos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Monto esperado"
            value={form.montoEsperado?.toFixed(2) || "0.00"}
            readOnly
            startContent={<span className="text-default-400 text-sm">$</span>}
            classNames={{ input: "font-semibold" }}
          />

          <Input
            label="Descuento"
            type="number"
            value={form.montoDescuento?.toString() || "0"}
            onChange={(e) => handleChange("montoDescuento", Number(e.target.value))}
            startContent={<span className="text-default-400 text-sm">$</span>}
            min={0}
            max={form.montoEsperado}
          />

          <Input
            label="Monto final"
            value={form.montoFinal?.toFixed(2) || "0.00"}
            readOnly
            startContent={<span className="text-default-400 text-sm">$</span>}
            classNames={{ input: "font-semibold text-primary-600" }}
          />
        </div>

        {/* Alerta de saldo para captación */}
        {saldoInfo && (
          <Card className={`border ${saldoInfo.suficiente ? 'border-success' : 'border-danger'}`}>
            <CardBody className="flex flex-row items-center gap-3">
              <BuildingLibraryIcon className={`w-6 h-6 ${saldoInfo.suficiente ? 'text-success' : 'text-danger'}`} />
              <div className="flex-1">
                <p className="font-medium">
                  Saldo {saldoInfo.tipo}: ${saldoInfo.disponible?.toFixed(2)}
                </p>
                <p className="text-sm text-default-600">
                  {saldoInfo.suficiente 
                    ? "✅ Saldo suficiente para cubrir el pago" 
                    : "❌ Saldo insuficiente para esta inscripción"}
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Vale de afiliación */}
        {form.metodoPago === "VALE_AFILIACION" && (
          <div className="space-y-3">
            <Divider />
            <h4 className="font-semibold flex items-center gap-2 text-sm">
              <InformationCircleIcon className="w-5 h-5 text-warning" />
              Vale de afiliación
            </h4>
            <Input
              label="Código de vale"
              value={form.codigoVale || ""}
              onChange={(e) => handleChange("codigoVale", e.target.value)}
              placeholder="Ingresa el código del vale"
            />
          </div>
        )}

        {/* Financiamiento */}
        {form.metodoPago === "FINANCIAMIENTO" && (
          <>
            <Divider />
            <h4 className="font-semibold flex items-center gap-2 text-sm">
              <CreditCardIcon className="w-5 h-5 text-primary" />
              Detalles del financiamiento
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Número de pagos"
                type="number"
                value={form.numeroPagos?.toString() || ""}
                onChange={(e) => handleChange("numeroPagos", Number(e.target.value))}
                min={1}
                max={36}
                placeholder="Ej: 6"
              />
              
              <Input
                label="Monto por pago"
                value={form.numeroPagos ? (form.montoFinal / form.numeroPagos).toFixed(2) : "0.00"}
                readOnly
                startContent={<span className="text-default-400 text-sm">$</span>}
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

              <Input
                type="date"
                label="Fecha primer pago"
                value={form.fechaPrimerPago || ""}
                onChange={(e) => handleChange("fechaPrimerPago", e.target.value)}
                className="md:col-span-2"
              />
            </div>
          </>
        )}

        {/* Estado de pago y fecha */}
        <Divider />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Estado de pago"
            selectedKeys={form.estadoPago ? [form.estadoPago] : []}
            onChange={(e) => handleChange("estadoPago", e.target.value)}
          >
            {ESTADO_PAGO.map((ep) => (
              <SelectItem key={ep.key}>{ep.label}</SelectItem>
            ))}
          </Select>

          {form.estadoPago === "PAGADO" && (
            <Input
              type="date"
              label="Fecha de pago"
              value={form.fechaPago || ""}
              onChange={(e) => handleChange("fechaPago", e.target.value)}
              max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
            />
          )}
        </div>

        {/* Notas */}
        <Input
          label="Notas"
          value={form.notas || ""}
          onChange={(e) => handleChange("notas", e.target.value)}
          placeholder="Observaciones adicionales sobre la inscripción o el pago..."
        />
      </div>
    </ModalForm>
  );
}