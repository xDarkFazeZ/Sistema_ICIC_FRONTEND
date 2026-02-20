interface CursoDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  curso?: any;
}

export default function CursoDetalleModal({ isOpen, onClose }: CursoDetalleModalProps) {
  return (
    <div>CursoDetalleModal</div>
  );
}