interface ParticipanteDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  participante?: any;
}

export default function ParticipanteDetalleModal({ isOpen, onClose }: ParticipanteDetalleModalProps) {
  return (
    <div>ParticipanteDetalleModal</div>
  );
}