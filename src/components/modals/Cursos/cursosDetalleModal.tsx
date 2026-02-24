import ModalForm from "../../common/modalForm";

interface CursoDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  curso?: any;
}

export default function CursoDetalleModal({
  isOpen,
  onClose,
  curso,
}: CursoDetalleModalProps) {
  if (!curso) return null;

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle del Curso"
      size="3xl"
    >
      <div className="space-y-3 text-sm">
        <p><strong>Nombre:</strong> {curso.nombre}</p>
        <p><strong>Descripción:</strong> {curso.descripcion}</p>
        <p><strong>Instructor:</strong> {curso.instructor?.nombre} {curso.instructor?.apellidoPaterno}</p>
        <p><strong>Horario:</strong> {curso.horario}</p>
        <p><strong>Fecha Inicio:</strong> {new Date(curso.fechaInicio).toLocaleDateString()}</p>
        <p><strong>Fecha Fin:</strong> {new Date(curso.fechaFin).toLocaleDateString()}</p>
        <p><strong>Duración:</strong> {curso.duracion} horas</p>
        <p><strong>Aula:</strong> {curso.aula}</p>
        <p><strong>Nivel Gerencial:</strong> {curso.nivelGerencial}</p>
      </div>
    </ModalForm>
  );
}