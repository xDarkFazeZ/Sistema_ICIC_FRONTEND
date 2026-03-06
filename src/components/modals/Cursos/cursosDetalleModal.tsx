import ModalForm from "../../common/modalForm";
import { Card, CardBody, Chip, Divider } from "@heroui/react";

import {
  BookOpen,
  User,
  CalendarDays,
  Clock,
  MapPin,
  GraduationCap,
  FileText
} from "lucide-react";

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
      title={
        <div className="flex items-center gap-2">
          <BookOpen size={20} />
          <span>Detalle del Curso</span>
        </div>
      }
      size="3xl"
      hideFooter
    >
      <div className="space-y-6">

        {/* Nombre del curso */}
        <Card shadow="sm">
          <CardBody className="flex gap-3">
            <BookOpen className="text-danger" />
            <div>
              <p className="text-xs text-default-500">Nombre del curso</p>
              <p className="font-semibold text-lg">{curso.nombre}</p>
            </div>
          </CardBody>
        </Card>

        {/* Descripción */}
        <Card shadow="sm">
          <CardBody className="flex gap-3">
            <FileText className="text-primary" />
            <div>
              <p className="text-xs text-default-500">Descripción</p>
              <p className="text-sm leading-relaxed">
                {curso.descripcion}
              </p>
            </div>
          </CardBody>
        </Card>

        <Divider />

        {/* Información principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Card shadow="sm">
            <CardBody className="flex gap-3 items-center">
              <User className="text-success" />
              <div>
                <p className="text-xs text-default-500">Instructor</p>
                <p className="font-medium">
                  {curso.instructor?.nombre} {curso.instructor?.apellidoPaterno}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card shadow="sm">
            <CardBody className="flex gap-3 items-center">
              <Clock className="text-warning" />
              <div>
                <p className="text-xs text-default-500">Horario</p>
                <p className="font-medium">{curso.horario}</p>
              </div>
            </CardBody>
          </Card>

          <Card shadow="sm">
            <CardBody className="flex gap-3 items-center">
              <CalendarDays className="text-primary" />
              <div>
                <p className="text-xs text-default-500">Fecha Inicio</p>
                <p className="font-medium">
                  {new Date(curso.fechaInicio).toLocaleDateString()}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card shadow="sm">
            <CardBody className="flex gap-3 items-center">
              <CalendarDays className="text-primary" />
              <div>
                <p className="text-xs text-default-500">Fecha Fin</p>
                <p className="font-medium">
                  {new Date(curso.fechaFin).toLocaleDateString()}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card shadow="sm">
            <CardBody className="flex gap-3 items-center">
              <Clock className="text-danger" />
              <div>
                <p className="text-xs text-default-500">Duración</p>
                <p className="font-medium">{curso.duracion} horas</p>
              </div>
            </CardBody>
          </Card>

          <Card shadow="sm">
            <CardBody className="flex gap-3 items-center">
              <MapPin className="text-secondary" />
              <div>
                <p className="text-xs text-default-500">Aula</p>
                <p className="font-medium">{curso.aula}</p>
              </div>
            </CardBody>
          </Card>

        </div>

        <Divider />

        {/* Nivel gerencial */}
        <div className="flex items-center gap-3">
          <GraduationCap className="text-danger" />
          <div>
            <p className="text-xs text-default-500">Nivel Gerencial</p>
            <Chip color="danger" variant="flat">
              {curso.nivelGerencial}
            </Chip>
          </div>
        </div>

      </div>
    </ModalForm>
  );
}