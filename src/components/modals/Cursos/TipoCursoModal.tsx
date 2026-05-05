/**
 * TipoCursoModal.tsx
 * Modal pequeño que aparece al presionar "Nuevo Curso"
 * para elegir entre Abierto o Cerrado.
 */

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Card,
  CardBody,
} from "@heroui/react";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { Users, Building2, Globe } from "lucide-react";

interface TipoCursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (tipo: "ABIERTO" | "CERRADO") => void;
}

export default function TipoCursoModal({ isOpen, onClose, onSelect }: TipoCursoModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" placement="center">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex items-center gap-2 pb-2">
              <AcademicCapIcon className="w-5 h-5 text-danger" />
              <span>¿Qué tipo de curso deseas crear?</span>
            </ModalHeader>
            <ModalBody className="pb-6 pt-2">
              <p className="text-sm text-default-500 mb-4">
                Elige el tipo de curso antes de continuar con el registro.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {/* ABIERTO */}
                <Card
                  isPressable
                  onPress={() => onSelect("ABIERTO")}
                  className="border-2 border-default-200 hover:border-danger hover:shadow-lg hover:shadow-danger/20 transition-all duration-200 hover:scale-[1.03] group"
                >
                  <CardBody className="flex flex-col items-center gap-3 py-6 text-center">
                    <div className="p-3 rounded-full bg-primary-50 group-hover:bg-danger-50 transition-colors">
                      <Globe className="w-7 h-7 text-primary-500 group-hover:text-danger transition-colors" />
                    </div>
                    <div>
                      <p className="font-bold text-default-800 text-base">Abierto</p>
                      <p className="text-xs text-default-400 mt-1 leading-snug">
                        Inscripciones individuales, sin empresa asignada
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 mt-1 text-left w-full">
                      {["Múltiples empresas o público", "Precio por participante", "Inscripciones independientes"].map((t) => (
                        <p key={t} className="text-xs text-default-500 flex items-center gap-1">
                          <span className="text-success">✓</span> {t}
                        </p>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                {/* CERRADO */}
                <Card
                  isPressable
                  onPress={() => onSelect("CERRADO")}
                  className="border-2 border-default-200 hover:border-danger hover:shadow-lg hover:shadow-danger/20 transition-all duration-200 hover:scale-[1.03] group"
                >
                  <CardBody className="flex flex-col items-center gap-3 py-6 text-center">
                    <div className="p-3 rounded-full bg-warning-50 group-hover:bg-danger-50 transition-colors">
                      <Building2 className="w-7 h-7 text-warning-500 group-hover:text-danger transition-colors" />
                    </div>
                    <div>
                      <p className="font-bold text-default-800 text-base">Cerrado</p>
                      <p className="text-xs text-default-400 mt-1 leading-snug">
                        Exclusivo para una empresa, con costo grupal
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 mt-1 text-left w-full">
                      {["Una empresa asignada", "Costo × participantes", "Participantes de la empresa"].map((t) => (
                        <p key={t} className="text-xs text-default-500 flex items-center gap-1">
                          <span className="text-success">✓</span> {t}
                        </p>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}