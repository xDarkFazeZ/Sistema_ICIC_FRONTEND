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
  // ✅ void puro — nunca Promise, HeroUI no acepta async en onPress
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
      isDismissable={false}
      isKeyboardDismissDisabled
      classNames={{
        base: `bg-gray-50 dark:bg-gray-800 ${className}`,
        header: "border-b border-gray-200 dark:border-gray-600",
        body: "bg-gray-50 dark:bg-gray-800",
        footer:
          "border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader
              className={`flex items-center justify-between bg-gray-50 dark:bg-gray-800 ${headerClassName}`}
            >
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                {title}
              </div>
              {!hideCloseButton && (
                <Button
                  isIconOnly
                  variant="light"
                  onPress={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="w-5 h-5" />
                </Button>
              )}
            </ModalHeader>

            <ModalBody className="py-6 bg-gray-50 dark:bg-gray-800">
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
                        className="font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Cancelar
                      </Button>
                    )}

                    {/*
                     * ✅ FIX DEFINITIVO:
                     * onPress espera (e: PressEvent) => void — nunca Promise.
                     * Envolver con () => { void onSubmit(); } garantiza que
                     * HeroUI recibe exactamente () => void sin importar si
                     * onSubmit es sync o async internamente.
                     */}
                    {onSubmit ? (
                      <Button
                        type="button"
                        onPress={() => { void onSubmit(); }}
                        color="danger"
                        isLoading={isLoading}
                        className="font-medium px-6"
                      >
                        {submitText}
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        form={formId}
                        color="danger"
                        isLoading={isLoading}
                        className="font-medium px-6"
                      >
                        {submitText}
                      </Button>
                    )}
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