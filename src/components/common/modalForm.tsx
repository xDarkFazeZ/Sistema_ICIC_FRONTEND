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
  title: string | React.ReactNode;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
  isLoading?: boolean;
  formId?: string;
  hideFooter?: boolean;
  hideCancelButton?: boolean;
  submitText?: string;
  onSubmit?: () => void;
  customFooter?: React.ReactNode;
  hideCloseButton?: boolean;
  headerClassName?: string;
  className?: string;
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
  className = "",
}: ModalFormProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      scrollBehavior="inside"
      hideCloseButton
      classNames={{
        // ✅ Fondo sólido tanto en light como en dark — sin opacidad
        base: `bg-white dark:bg-gray-900 ${className}`,
        header: "border-b border-default-200 dark:border-default-700",
        body: "bg-white dark:bg-gray-900",
        footer: "border-t border-default-200 dark:border-default-700 bg-white dark:bg-gray-900",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className={`flex items-center justify-between bg-white dark:bg-gray-900 ${headerClassName}`}>
              <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                {title}
              </div>
              {!hideCloseButton && (
                <Button
                  isIconOnly
                  variant="light"
                  onPress={onClose}
                  className="text-default-400 hover:text-default-600 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="w-5 h-5" />
                </Button>
              )}
            </ModalHeader>

            <ModalBody className="py-6 bg-white dark:bg-gray-900">
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