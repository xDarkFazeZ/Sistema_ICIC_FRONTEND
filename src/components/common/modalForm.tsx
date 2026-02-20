import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
  isLoading?: boolean;
}

export default function ModalForm({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = "2xl",
  isLoading = false 
}: ModalFormProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size={size}
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{title}</h2>
              <Button isIconOnly variant="light" onPress={onClose}>
                <XMarkIcon className="w-5 h-5" />
              </Button>
            </ModalHeader>
            <ModalBody>
              {children}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancelar
              </Button>
              <Button type="submit" form="modal-form" color="danger" isLoading={isLoading}>
                Guardar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}