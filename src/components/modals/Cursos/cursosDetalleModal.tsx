// El mismo código que antes, pero asegurando que los datos del curso se pasen correctamente
import { useEffect, useState } from "react";
import ModalForm from "../../common/modalForm";
import { Card, CardBody, Chip, Divider, Spinner, Button } from "@heroui/react";
import {
  BookOpen, User, CalendarDays, Clock,
  MapPin, GraduationCap, FileText, Users,
} from "lucide-react";
import { obtenerInscripcionesPorCurso } from "../../../services/inscripcionService";
import { PDFDownloadButton } from "../../../components/pdf/PDFDownloadButton";

interface CursoDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  curso?: any;
}

const estadoColor: Record<string, "success" | "warning" | "danger" | "default"> = {
  PAGADO: "success",
  PENDIENTE: "warning",
  CANCELADO: "danger",
  REEMBOLSADO: "default",
};

export default function CursoDetalleModal({ isOpen, onClose, curso }: CursoDetalleModalProps) {
  const [inscritos, setInscritos] = useState<any[]>([]);
  const [loadingInscritos, setLoadingInscritos] = useState(false);
  const [cursoCompleto, setCursoCompleto] = useState<any>(null);

  useEffect(() => {
    if (!isOpen || !curso?.id) return;

    const cargarDatosCompletos = async () => {
      setLoadingInscritos(true);
      try {
        const inscripcionesRes = await obtenerInscripcionesPorCurso(curso.id);
        const inscripciones = inscripcionesRes.data ?? [];
        setInscritos(inscripciones);

        // Construir objeto con SOLO los campos de la BD
        const cursoConInscripciones = {
          id: curso.id,
          nombre: curso.nombre,
          descripcion: curso.descripcion,
          nivelGerencial: curso.nivelGerencial,
          fechaInicio: curso.fechaInicio,
          fechaFin: curso.fechaFin,
          duracion: curso.duracion,
          horario: curso.horario,
          aula: curso.aula,
          instructor: curso.instructor,
          inscripciones: inscripciones.map((ins: any) => ({
            ...ins,
            participante: ins.participante,
            empresa: ins.participante?.empresa || null,
            metodoPago: ins.metodoPago,
            montoFinal: ins.montoFinal,
            montoEsperado: ins.montoEsperado,
          }))
        };
        setCursoCompleto(cursoConInscripciones);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingInscritos(false);
      }
    };

    cargarDatosCompletos();
  }, [isOpen, curso]);

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
      size="4xl"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="light" onPress={onClose}>
            Cerrar
          </Button>
          {cursoCompleto && (
            <PDFDownloadButton
              cursoData={cursoCompleto}
              buttonText="Descargar Reporte PDF"
              variant="solid"
              color="primary"
              onError={(error) => console.error('Error PDF:', error)}
            />
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Resto del contenido igual... */}
        <Card shadow="sm">
          <CardBody className="flex gap-3">
            <BookOpen className="text-danger" />
            <div>
              <p className="text-xs text-default-500">Nombre del curso</p>
              <p className="font-semibold text-lg">{curso.nombre}</p>
            </div>
          </CardBody>
        </Card>

        {curso.descripcion && (
          <Card shadow="sm">
            <CardBody className="flex gap-3">
              <FileText className="text-primary" />
              <div>
                <p className="text-xs text-default-500">Descripción</p>
                <p className="text-sm leading-relaxed">{curso.descripcion}</p>
              </div>
            </CardBody>
          </Card>
        )}

        <Divider />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card shadow="sm">
            <CardBody className="flex gap-3 items-center">
              <User className="text-success" />
              <div>
                <p className="text-xs text-default-500">Instructor</p>
                <p className="font-medium">
                  {curso.instructor
                    ? `${curso.instructor.nombre} ${curso.instructor.apellidoPaterno}`
                    : "Sin instructor asignado"}
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
                  {new Date(curso.fechaInicio).toLocaleDateString("es-MX", {
                    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC"
                  })}
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
                  {new Date(curso.fechaFin).toLocaleDateString("es-MX", {
                    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC"
                  })}
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
                <p className="font-medium">{curso.aula ?? "—"}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="flex items-center gap-3">
          <GraduationCap className="text-danger" />
          <div>
            <p className="text-xs text-default-500">Nivel Gerencial</p>
            <Chip color="danger" variant="flat">{curso.nivelGerencial}</Chip>
          </div>
        </div>

        <Divider />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-primary" />
              <h3 className="font-semibold text-default-700">Participantes inscritos</h3>
            </div>
            {!loadingInscritos && (
              <Chip color="primary" variant="flat" size="sm">
                {inscritos.length} {inscritos.length === 1 ? "participante" : "participantes"}
              </Chip>
            )}
          </div>

          {loadingInscritos ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" color="primary" />
            </div>
          ) : inscritos.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-default-400">
              <Users size={32} className="mb-2 opacity-30" />
              <p className="text-sm">Sin participantes inscritos aún</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {inscritos.map((ins: any, i: number) => {
                const p = ins.participante;
                const nombreCompleto = [p?.nombre, p?.apellidoPaterno, p?.apellidoMaterno]
                  .filter(Boolean).join(" ");
                return (
                  <div key={ins.id}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-default-50 border border-default-200 hover:bg-default-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600 flex-shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-default-800">{nombreCompleto}</p>
                        {p?.correo && (
                          <p className="text-xs text-default-400">{p.correo}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={estadoColor[ins.estadoPago] ?? "default"}
                      >
                        {ins.estadoPago}
                      </Chip>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-default-200">
          {cursoCompleto && (
            <PDFDownloadButton
              cursoData={cursoCompleto}
              buttonText="Descargar Reporte PDF"
              variant="solid"
              color="primary"
              onError={(error) => console.error('Error PDF:', error)}
            />
          )}
        </div>
      </div>
    </ModalForm>
  );
}