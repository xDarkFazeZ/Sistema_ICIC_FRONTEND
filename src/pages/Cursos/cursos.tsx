import { useEffect, useState } from "react";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Input, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
  Pagination, Card, CardBody, Tooltip, Skeleton, Badge,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
} from "@heroui/react";
import { 
  EllipsisVertical, 
  Plus, 
  UserPlus, 
  CheckCircle, 
  AlertTriangle,
  Search,
  X,
  Calendar,
  User,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Eye,
  Pencil,
  GraduationCap,
  Users
} from "lucide-react";
import { sileo } from "sileo";
import CursoModal from "../../components/modals/Cursos/cursosModal";
import CursoDetalleModal from "../../components/modals/Cursos/cursosDetalleModal";
import ParticipanteModal from "../../components/modals/Participante/participanteModal";
import SiguientePasoModal, { type SiguientePasoOpcion } from "../../components/common/siguientePasoModal";
import Sidebar from "../../components/common/Sidebar";
import {
  listarCursos, crearCurso, actualizarCurso, eliminarCurso,
  activarCurso, desactivarCurso,
} from "../../services/cursoService";

const INSTRUCTOR_PLACEHOLDER = "Por Asignar";
const SKELETON_COUNT = 8;

export default function Cursos() {
  const [cursos, setCursos]         = useState<any[]>([]);
  const [loading, setLoading]       = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]         = useState("");

  const [modalCursoAbierto, setModalCursoAbierto]   = useState(false);
  const [detalleAbierto, setDetalleAbierto]         = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado]   = useState<any | null>(null);
  const [cursoAEditar, setCursoAEditar]             = useState<any | null>(null);

  const [siguientePasoModalAbierto, setSiguientePasoModalAbierto] = useState(false);
  const [modalParticipanteAbierto, setModalParticipanteAbierto]   = useState(false);
  const [cursoActivoId, setCursoActivoId]           = useState<number | null>(null);
  const [cursoRecienCreado, setCursoRecienCreado]   = useState<any | null>(null);
  const [opcionesSiguientePaso, setOpcionesSiguientePaso] = useState<SiguientePasoOpcion[]>([]);
  const [tituloSiguientePaso, setTituloSiguientePaso]     = useState("¿Qué deseas hacer ahora?");
  const [subtituloSiguientePaso, setSubtituloSiguientePaso] = useState<string | undefined>(undefined);

  const [eliminarDialogAbierto, setEliminarDialogAbierto] = useState(false);
  const [cursoAEliminar, setCursoAEliminar] = useState<{ id: number; nombre: string } | null>(null);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const res = await listarCursos({ page, limit: 10, search: search || undefined });
      setCursos(res.data);
      setTotalPages(res.pagination.pages);
    } catch (error) {
      console.error(error);
      sileo.error({ title: "Error al cargar los cursos" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarCursos(); }, [page, search]);

  const handleCrearCurso = async (data: any) => {
    try {
      setModalLoading(true);
      const cursoCreado = await crearCurso(data);
      setModalCursoAbierto(false);
      cargarCursos();
      setCursoRecienCreado(cursoCreado);
      setCursoActivoId(cursoCreado.id);
      setTituloSiguientePaso("¡Curso creado exitosamente!");
      setSubtituloSiguientePaso(cursoCreado.nombre);

      sileo.success({
        title: "Curso creado correctamente",
        description: cursoCreado.nombre,
      });

      setOpcionesSiguientePaso([
        {
          label: "Asignar participantes",
          descripcion: "Agrega participantes a este curso ahora",
          icono: <UserPlus className="w-5 h-5 text-white" />,
          color: "from-indigo-500 to-indigo-600",
          onClick: () => setModalParticipanteAbierto(true),
        },
        {
          label: "Ver detalle del curso",
          descripcion: "Revisa la información del curso creado",
          icono: <CheckCircle className="w-5 h-5 text-white" />,
          color: "from-emerald-400 to-teal-500",
          onClick: () => {
            setCursoSeleccionado(cursoCreado);
            setDetalleAbierto(true);
            setCursoActivoId(null);
            setCursoRecienCreado(null);
          },
        },
      ]);
      setSiguientePasoModalAbierto(true);
    } catch (error) {
      console.error("Error al crear curso:", error);
      sileo.error({
        title: "Error al crear el curso",
        description: "Inténtalo de nuevo más tarde",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleParticipanteCreado = (respuesta: any) => {
    setModalParticipanteAbierto(false);
    const p = respuesta?.data ?? respuesta;
    const nombreCompleto = `${p?.nombre ?? ""} ${p?.apellidoPaterno ?? ""}`.trim();
    setTituloSiguientePaso("¿Asignar otro participante?");
    setSubtituloSiguientePaso(nombreCompleto);

    sileo.success({
      title: "Participante asignado",
      description: nombreCompleto,
    });

    setOpcionesSiguientePaso([
      {
        label: "Sí, asignar otro",
        descripcion: "Agregar un nuevo participante al mismo curso",
        icono: <UserPlus className="w-5 h-5 text-white" />,
        color: "from-emerald-400 to-teal-500",
        onClick: () => setModalParticipanteAbierto(true),
      },
      {
        label: "No, finalizar",
        descripcion: "Volver a la lista de cursos",
        icono: <CheckCircle className="w-5 h-5 text-white" />,
        color: "from-slate-400 to-slate-500",
        onClick: () => { setCursoActivoId(null); setCursoRecienCreado(null); },
      },
    ]);
    setSiguientePasoModalAbierto(true);
  };

  const handleEditarCurso = async (data: any) => {
    try {
      setModalLoading(true);
      await actualizarCurso(cursoAEditar.id, data);
      setModalCursoAbierto(false);
      setCursoAEditar(null);
      cargarCursos();

      sileo.success({ title: "Curso actualizado correctamente" });
    } catch (error) {
      console.error("Error al actualizar curso:", error);
      sileo.error({
        title: "Error al actualizar el curso",
        description: "Inténtalo de nuevo más tarde",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmarEliminar = (curso: any) => {
    setCursoAEliminar({ id: curso.id, nombre: curso.nombre });
    setEliminarDialogAbierto(true);
  };

  const handleEliminarConfirmado = async () => {
    if (!cursoAEliminar) return;

    try {
      setEliminarDialogAbierto(false);
      setLoading(true);

      await eliminarCurso(cursoAEliminar.id);

      sileo.success({
        title: "Curso eliminado satisfactoriamente",
        description: `"${cursoAEliminar.nombre}" ha sido eliminado`,
      });

      cargarCursos();
    } catch (error) {
      console.error("Error al eliminar curso:", error);
      sileo.error({
        title: "Error al eliminar el curso",
        description: "No se pudo completar la operación",
      });
    } finally {
      setLoading(false);
      setCursoAEliminar(null);
    }
  };

  const handleToggleEstado = async (curso: any) => {
    try {
      if (curso.activo) {
        await desactivarCurso(curso.id);
        sileo.info({
          title: "Curso desactivado",
          description: curso.nombre,
        });
      } else {
        await activarCurso(curso.id);
        sileo.success({
          title: "Curso activado",
          description: curso.nombre,
        });
      }
      cargarCursos();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      sileo.error({ title: "Error al cambiar el estado del curso" });
    }
  };

  const sinInstructor = (curso: any) =>
    !curso.instructor || curso.instructor.nombre === INSTRUCTOR_PLACEHOLDER;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 dark:from-background dark:to-black flex">
      <Sidebar />

      <main className="flex-1 p-6 space-y-6 overflow-y-auto min-w-0">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Cursos</h1>
              {loading ? (
                <Skeleton className="h-3.5 w-40 rounded-lg mt-1" />
              ) : (
                <p className="text-sm text-default-500 mt-0.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {cursos.length} curso{cursos.length !== 1 ? "s" : ""} registrado{cursos.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
          <Button
            color="primary"
            variant="shadow"
            startContent={<Plus className="w-4 h-4" />}
            onPress={() => { setCursoAEditar(null); setModalCursoAbierto(true); }}
            className="font-medium"
          >
            Nuevo Curso
          </Button>
        </div>

        {/* BUSCADOR Y FILTROS */}
        <Card className="bg-content1/50 backdrop-blur-sm">
          <CardBody className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Buscar por nombre de curso..."
                value={search}
                onChange={e => { setPage(1); setSearch(e.target.value); }}
                isClearable
                onClear={() => { setPage(1); setSearch(""); }}
                startContent={<Search className="w-4 h-4 text-default-400" />}
                endContent={search && (
                  <Button isIconOnly size="sm" variant="light" onPress={() => { setPage(1); setSearch(""); }}>
                    <X className="w-4 h-4 text-default-400" />
                  </Button>
                )}
                className="flex-1"
              />
            </div>
          </CardBody>
        </Card>

        {/* TABLA */}
        <Card className="bg-content1/50 backdrop-blur-sm">
          <CardBody className="p-0">
            <Table
              aria-label="Tabla de cursos"
              removeWrapper
              bottomContent={
                !loading && totalPages > 1 ? (
                  <div className="flex w-full justify-center py-4">
                    <Pagination
                      page={page}
                      total={totalPages}
                      onChange={p => setPage(p)}
                      showControls
                      color="primary"
                      size="md"
                    />
                  </div>
                ) : null
              }
            >
              <TableHeader>
                <TableColumn className="font-semibold text-default-600">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Nombre
                  </div>
                </TableColumn>
                <TableColumn className="font-semibold text-default-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Instructor
                  </div>
                </TableColumn>
                <TableColumn className="font-semibold text-default-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Fecha Inicio
                  </div>
                </TableColumn>
                <TableColumn className="font-semibold text-default-600">Estado</TableColumn>
                <TableColumn align="center" className="font-semibold text-default-600">Acciones</TableColumn>
              </TableHeader>

              {loading ? (
                <TableBody items={Array.from({ length: SKELETON_COUNT }, (_, i) => ({ id: i }))}>
                  {(item) => (
                    <TableRow key={`sk-${item.id}`} className="hover:bg-default-50/50">
                      <TableCell><Skeleton className="h-4 w-48 rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24 rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-lg mx-auto" /></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              ) : cursos.length === 0 ? (
                <TableBody
                  emptyContent={
                    <div className="py-10 text-center">
                      <GraduationCap className="w-12 h-12 mx-auto text-default-300 mb-3" />
                      <p className="text-default-500">No hay cursos registrados</p>
                      <Button
                        color="primary"
                        variant="flat"
                        size="sm"
                        className="mt-3"
                        startContent={<Plus className="w-4 h-4" />}
                        onPress={() => { setCursoAEditar(null); setModalCursoAbierto(true); }}
                      >
                        Crear primer curso
                      </Button>
                    </div>
                  }
                >
                  {[]}
                </TableBody>
              ) : (
                <TableBody items={cursos}>
                  {(curso: any) => (
                    <TableRow
                      key={curso.id}
                      className="hover:bg-default-50/50 transition-colors cursor-pointer group"
                    >
                      <TableCell
                        className="font-medium text-foreground group-hover:text-primary transition-colors"
                        onClick={() => { setCursoSeleccionado(curso); setDetalleAbierto(true); }}
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            color={curso.activo ? "success" : "default"}
                            variant="flat"
                            size="sm"
                            className="hidden group-hover:flex"
                          />
                          {curso.nombre}
                        </div>
                      </TableCell>

                      <TableCell>
                        {sinInstructor(curso) ? (
                          <Tooltip
                            content="Este curso aún no tiene instructor asignado"
                            color="warning"
                            className="text-xs"
                          >
                            <Chip
                              color="warning"
                              variant="flat"
                              size="sm"
                              startContent={<AlertTriangle className="w-3 h-3" />}
                              className="cursor-default font-medium"
                            >
                              Sin asignar
                            </Chip>
                          </Tooltip>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span className="text-default-600">
                              {curso.instructor?.nombre} {curso.instructor?.apellidoPaterno}
                            </span>
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2 text-default-600">
                          <Calendar className="w-4 h-4 text-default-400" />
                          {new Date(curso.fechaInicio).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Chip
                          color={curso.activo ? "success" : "default"}
                          variant="flat"
                          size="sm"
                          startContent={curso.activo ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                          className="font-medium"
                        >
                          {curso.activo ? "Activo" : "Inactivo"}
                        </Chip>
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-center">
                          <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="hover:bg-default-100 transition-colors"
                              >
                                <EllipsisVertical className="w-5 h-5 text-default-500" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                              aria-label="Acciones del curso"
                              variant="flat"
                              onAction={(key) => {
                                switch (key) {
                                  case "editar":
                                    setCursoAEditar(curso);
                                    setModalCursoAbierto(true);
                                    break;
                                  case "detalle":
                                    setCursoSeleccionado(curso);
                                    setDetalleAbierto(true);
                                    break;
                                  case "toggle":
                                    handleToggleEstado(curso);
                                    break;
                                  case "delete":
                                    handleConfirmarEliminar(curso);
                                    break;
                                }
                              }}
                            >
                              <DropdownItem key="editar">
                                <div className="flex items-center gap-2">
                                  <Pencil className="w-4 h-4 text-default-500" />
                                  <span>Editar</span>
                                </div>
                              </DropdownItem>
                              <DropdownItem key="detalle">
                                <div className="flex items-center gap-2">
                                  <Eye className="w-4 h-4 text-default-500" />
                                  <span>Ver detalle</span>
                                </div>
                              </DropdownItem>
                              <DropdownItem
                                key="toggle"
                                className={curso.activo ? "text-warning" : "text-success"}
                              >
                                <div className="flex items-center gap-2">
                                  {curso.activo ? (
                                    <ToggleLeft className="w-4 h-4 text-warning" />
                                  ) : (
                                    <ToggleRight className="w-4 h-4 text-success" />
                                  )}
                                  <span>{curso.activo ? "Desactivar" : "Activar"}</span>
                                </div>
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
                                className="text-danger"
                              >
                                <div className="flex items-center gap-2">
                                  <Trash2 className="w-4 h-4" />
                                  <span>Eliminar</span>
                                </div>
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              )}
            </Table>
          </CardBody>
        </Card>
      </main>

      {/* ✅ MODAL DE CONFIRMACIÓN - HeroUI */}
      <Modal
        isOpen={eliminarDialogAbierto}
        onClose={() => {
          setEliminarDialogAbierto(false);
          setCursoAEliminar(null);
        }}
        size="sm"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2 text-danger">
                <Trash2 className="w-5 h-5" />
                Eliminar curso
              </ModalHeader>
              <ModalBody>
                <p className="text-default-600 text-sm">
                  ¿Estás seguro de que deseas eliminar el curso{" "}
                  <span className="font-semibold text-foreground">
                    "{cursoAEliminar?.nombre}"
                  </span>
                  ? Esta acción no se puede deshacer.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose} isDisabled={loading}>
                  Cancelar
                </Button>
                <Button
                  color="danger"
                  onPress={handleEliminarConfirmado}
                  isLoading={loading}
                  startContent={!loading && <Trash2 className="w-4 h-4" />}
                >
                  Eliminar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* MODALES */}
      <CursoModal
        isOpen={modalCursoAbierto}
        onClose={() => { setModalCursoAbierto(false); setCursoAEditar(null); }}
        onSubmit={cursoAEditar ? handleEditarCurso : handleCrearCurso}
        cursoToEdit={cursoAEditar}
        isLoading={modalLoading}
      />
      <CursoDetalleModal
        isOpen={detalleAbierto}
        onClose={() => setDetalleAbierto(false)}
        curso={cursoSeleccionado}
      />
      <ParticipanteModal
        isOpen={modalParticipanteAbierto}
        onClose={() => setModalParticipanteAbierto(false)}
        onSuccess={handleParticipanteCreado}
        cursoIdParaAsignar={cursoActivoId}
      />
      <SiguientePasoModal
        isOpen={siguientePasoModalAbierto}
        onClose={() => {
          setSiguientePasoModalAbierto(false);
          setCursoActivoId(null);
          setCursoRecienCreado(null);
        }}
        titulo={tituloSiguientePaso}
        subtitulo={subtituloSiguientePaso}
        opciones={opcionesSiguientePaso}
      />
    </div>
  );
}