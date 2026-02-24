import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | React.ReactNode; // ✅ Ahora acepta ReactNode para títulos con iconos
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
  isLoading?: boolean;
  formId?: string;
  // ✅ Nuevas props para personalizar el footer
  hideFooter?: boolean; // Para ocultar el footer por completo
  hideCancelButton?: boolean; // Para ocultar solo el botón cancelar
  submitText?: string; // Texto personalizado para el botón submit
  onSubmit?: () => void; // Para manejar submit sin form
  customFooter?: React.ReactNode; // Footer completamente personalizado
  // ✅ Personalización del header
  hideCloseButton?: boolean; // Para ocultar el botón de cerrar
  headerClassName?: string; // Clases personalizadas para el header
}

export default function ModalForm({
  isOpen,
  onClose,
  title,
  children,
  size = "2xl",
  isLoading = false,
  formId = "modal-form",
  hideFooter = false,
  hideCancelButton = false,
  submitText = "Guardar",
  onSubmit,
  customFooter,
  hideCloseButton = false,
  headerClassName = "",
}: ModalFormProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      scrollBehavior="inside"
      classNames={{
        base: "bg-gradient-to-br from-default-50 to-default-100 dark:from-default-900/50 dark:to-default-800/50", // ✅ Gradiente global
        header: "border-b border-default-200 dark:border-default-800", // ✅ Línea separadora
        footer: "border-t border-default-200 dark:border-default-800", // ✅ Línea separadora
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className={`flex items-center justify-between ${headerClassName}`}>
              <div className="flex items-center gap-2">
                {title}
              </div>
              {!hideCloseButton && (
                <Button 
                  isIconOnly 
                  variant="light" 
                  onPress={onClose}
                  className="text-default-400 hover:text-default-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </Button>
              )}
            </ModalHeader>

            <ModalBody className="py-6">
              {children}
            </ModalBody>

            {!hideFooter && (
              <ModalFooter className="flex justify-end gap-3">
                {customFooter ? (
                  customFooter
                ) : (
                  <>
                    {!hideCancelButton && (
                      <Button 
                        variant="light" 
                        onPress={onClose}
                        className="font-medium"
                      >
                        Cancelar
                      </Button>
                    )}
                    <Button
                      type={onSubmit ? "button" : "submit"}
                      form={onSubmit ? undefined : formId}
                      onPress={onSubmit}
                      color="danger"
                      isLoading={isLoading}
                      className="font-medium px-6"
                    >
                      {submitText}
                    </Button>
                  </>
                )}
              </ModalFooter>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
}