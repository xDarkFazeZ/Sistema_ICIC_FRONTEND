import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip,
} from "@heroui/react";
import { CalendarIcon, PhoneIcon, EnvelopeIcon, IdentificationIcon } from "@heroicons/react/24/outline";

interface InstructorDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructor: any;
}

export default function InstructorDetalleModal({ isOpen, onClose, instructor }: InstructorDetalleModalProps) {
  if (!instructor) return null;

  const formatFecha = (fecha: string) => {
    if (!fecha) return "No especificada";
    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"   // ← el body hace scroll, header y footer quedan fijos
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 border-b border-default-100">
              <h2 className="text-xl font-bold">Detalle del Instructor</h2>
            </ModalHeader>

            {/* Todo el contenido variable va aquí — hace scroll cuando es largo */}
            <ModalBody className="py-5 space-y-6">

              {/* Información personal */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">INFORMACIÓN PERSONAL</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                      {instructor.nombre?.charAt(0)}{instructor.apellidoPaterno?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-lg font-semibold">
                        {instructor.nombre} {instructor.apellidoPaterno} {instructor.apellidoMaterno || ""}
                      </p>
                      <p className="text-sm text-gray-500">Instructor</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Fecha de nacimiento</p>
                        <p className="text-sm font-medium">{formatFecha(instructor.fechaNacimiento)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contacto */}
              {(instructor.celular || instructor.correo) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">CONTACTO</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                    {instructor.celular && (
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Teléfono</p>
                          <p className="text-sm font-medium">{instructor.celular}</p>
                        </div>
                      </div>
                    )}
                    {instructor.correo && (
                      <div className="flex items-center gap-2">
                        <EnvelopeIcon className="w-4 h-4 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Correo electrónico</p>
                          <p className="text-sm font-medium">{instructor.correo}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* RFC */}
              {instructor.rfc && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">DATOS FISCALES</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <IdentificationIcon className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">RFC</p>
                        <p className="text-sm font-medium font-mono">{instructor.rfc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cursos asignados */}
              {instructor.cursos && instructor.cursos.length > 0 ? (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">CURSOS ASIGNADOS</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="space-y-2">
                      {instructor.cursos.map((curso: any) => (
                        <div key={curso.id}
                          className="flex justify-between items-center p-2 border-b border-default-100 last:border-0">
                          <div className="min-w-0 mr-3">
                            <p className="font-medium text-sm truncate">{curso.nombre}</p>
                            <p className="text-xs text-gray-500">{curso.horario}</p>
                          </div>
                          <Chip size="sm" variant="flat" color={curso.activo ? "success" : "default"} className="shrink-0">
                            {curso.activo ? "Activo" : "Inactivo"}
                          </Chip>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400 text-sm">
                  No tiene cursos asignados
                </div>
              )}

            </ModalBody>

            {/* Footer fijo — no se desplaza con el contenido */}
            <ModalFooter className="border-t border-default-100">
              <Button color="danger" variant="light" onPress={onClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}