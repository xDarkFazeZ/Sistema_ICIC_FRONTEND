interface InscripcionModalProps {
  isOpen: boolean;
  onClose: () => void;
  curso?: any;
  participante?: any;
}

export default function InscripcionModal({ isOpen, onClose }: InscripcionModalProps) {
  return (
    <div>InscripcionModal</div>
  );
}