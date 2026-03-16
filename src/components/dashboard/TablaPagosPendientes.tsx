// components/dashboard/TablaPagosPendientes.tsx
import { Card, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import {
  Clock,
  Mail,
  Phone,
  CheckCircle,
  MoreVertical,
  Eye,
  CreditCard,
  Ban,
} from 'lucide-react';

// Interfaz que coincide con lo que envía el backend
interface PagoPendiente {
  id: number;
  participante: {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    correo?: string;
    celular?: string;
  };
  curso: {
    nombre: string;
    fechaInicio: string;
  };
  montoEsperado: number;  // ✅ Usamos montoEsperado, no monto
  estadoPago: string;
  inscritoEn: string;
}

interface Props {
  pagosPendientes: PagoPendiente[];
  onEditarPago?: (pago: PagoPendiente) => void;
  onVerDetalle?: (pago: PagoPendiente) => void;
  onRegistrarPago?: (pago: PagoPendiente) => void;
  onCancelarInscripcion?: (pago: PagoPendiente) => void;
}

export default function TablaPagosPendientes({
  pagosPendientes,
  onVerDetalle,
  onRegistrarPago,
  onCancelarInscripcion
}: Props) {
  return (
    <Card className="p-6 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
          <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Pagos Pendientes
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {pagosPendientes.length} participantes con pagos pendientes
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Participante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Curso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fecha Inicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {pagosPendientes.map((pago) => {
              // ✅ Validación de seguridad para evitar errores
              if (!pago) return null;

              return (
                <tr key={pago.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {pago.participante?.nombre} {pago.participante?.apellidoPaterno}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {pago.curso?.nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {/* ✅ Usamos montoEsperado con valor por defecto 0 */}
                      ${(pago.montoEsperado || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {pago.curso?.fechaInicio
                        ? new Date(pago.curso.fechaInicio).toLocaleDateString()
                        : 'Fecha no disponible'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {pago.participante?.correo && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="w-3 h-3" />
                          <span className="text-xs">{pago.participante.correo}</span>
                        </div>
                      )}
                      {pago.participante?.celular && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="w-3 h-3" />
                          <span className="text-xs">{pago.participante.celular}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          className="text-gray-600 dark:text-gray-400"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Acciones de pago">
                        <DropdownItem
                          key="ver"
                          startContent={<Eye className="w-4 h-4" />}
                          onPress={() => onVerDetalle?.(pago)}
                        >
                          Ver detalles
                        </DropdownItem>

                        <DropdownItem
                          key="registrar"
                          startContent={<CreditCard className="w-4 h-4" />}
                          onPress={() => onRegistrarPago?.(pago)}
                          className="text-success"
                        >
                          Registrar pago
                        </DropdownItem>
                        <DropdownItem
                          key="cancelar"
                          startContent={<Ban className="w-4 h-4" />}
                          onPress={() => onCancelarInscripcion?.(pago)}
                          className="text-danger"
                          color="danger"
                        >
                          Cancelar inscripción
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {pagosPendientes.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No hay pagos pendientes
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}