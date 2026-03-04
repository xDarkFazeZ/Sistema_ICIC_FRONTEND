import { useEffect, useState } from "react";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Input, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
  Pagination, Card, CardBody, Tooltip, Skeleton,
} from "@heroui/react";
import { EllipsisVerticalIcon, PlusIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

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

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const res = await listarCursos({ page, limit: 10, search: search || undefined });
      setCursos(res.data);
      setTotalPages(res.pagination.pages);
    } catch (error) {
      console.error(error);
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
      setOpcionesSiguientePaso([
        {
          label: "Asignar participantes",
          descripcion: "Agrega participantes a este curso ahora",
          icono: <UserPlusIcon className="w-5 h-5 text-white" />,
          color: "from-indigo-500 to-indigo-600",
          onClick: () => setModalParticipanteAbierto(true),
        },
        {
          label: "Ver detalle del curso",
          descripcion: "Revisa la información del curso creado",
          icono: <CheckCircleIcon className="w-5 h-5 text-white" />,
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
    setOpcionesSiguientePaso([
      {
        label: "Sí, asignar otro",
        descripcion: "Agregar un nuevo participante al mismo curso",
        icono: <UserPlusIcon className="w-5 h-5 text-white" />,
        color: "from-emerald-400 to-teal-500",
        onClick: () => setModalParticipanteAbierto(true),
      },
      {
        label: "No, finalizar",
        descripcion: "Volver a la lista de cursos",
        icono: <CheckCircleIcon className="w-5 h-5 text-white" />,
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
    } catch (error) {
      console.error("Error al actualizar curso:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este curso?")) return;
    await eliminarCurso(id);
    cargarCursos();
  };

  const handleToggleEstado = async (curso: any) => {
    if (curso.activo) await desactivarCurso(curso.id);
    else await activarCurso(curso.id);
    cargarCursos();
  };

  const sinInstructor = (curso: any) =>
    !curso.instructor || curso.instructor.nombre === INSTRUCTOR_PLACEHOLDER;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black flex">

      <Sidebar />

      <main className="flex-1 p-6 space-y-6 overflow-y-auto min-w-0">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-danger">Cursos</h1>
            {loading
              ? <Skeleton className="h-3.5 w-40 rounded-lg mt-1" />
              : <p className="text-sm text-default-500 mt-0.5">{cursos.length} curso{cursos.length !== 1 ? "s" : ""} registrado{cursos.length !== 1 ? "s" : ""}</p>
            }
          </div>
          <Button color="danger" startContent={<PlusIcon className="w-4 h-4" />}
            onPress={() => { setCursoAEditar(null); setModalCursoAbierto(true); }}>
            Nuevo Curso
          </Button>
        </div>

        {/* BUSCADOR */}
        <Card>
          <CardBody>
            <Input
              placeholder="Buscar curso..."
              value={search}
              onChange={e => { setPage(1); setSearch(e.target.value); }}
              isClearable
              onClear={() => { setPage(1); setSearch(""); }}
            />
          </CardBody>
        </Card>

        {/* TABLA */}
        <Card>
          <CardBody>
            <Table
              aria-label="Tabla de cursos"
              bottomContent={
                !loading && totalPages > 1 ? (
                  <div className="flex w-full justify-center">
                    <Pagination page={page} total={totalPages} onChange={p => setPage(p)} showControls color="danger" />
                  </div>
                ) : null
              }
            >
              <TableHeader>
                <TableColumn>Nombre</TableColumn>
                <TableColumn>Instructor</TableColumn>
                <TableColumn>Fecha Inicio</TableColumn>
                <TableColumn>Estado</TableColumn>
                <TableColumn align="center">Acciones</TableColumn>
              </TableHeader>

              {loading ? (
                // MODO SKELETON
                <TableBody items={Array.from({ length: SKELETON_COUNT }, (_, i) => ({ id: i }))}>
                  {(item) => (
                    <TableRow key={`sk-${item.id}`}>
                      <TableCell><Skeleton className="h-4 w-48 rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24 rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-lg mx-auto" /></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              ) : cursos.length === 0 ? (
                // MODO VACÍO
                <TableBody emptyContent="No hay cursos registrados">
                  {[]}
                </TableBody>
              ) : (
                // MODO DATOS
                <TableBody items={cursos}>
                  {(curso: any) => (
                    <TableRow key={curso.id}>
                      <TableCell
                        className="cursor-pointer font-medium"
                        onClick={() => { setCursoSeleccionado(curso); setDetalleAbierto(true); }}
                      >
                        {curso.nombre}
                      </TableCell>

                      <TableCell>
                        {sinInstructor(curso) ? (
                          <Tooltip content="Este curso aún no tiene instructor asignado" color="warning">
                            <Chip color="warning" variant="flat" size="sm"
                              startContent={<ExclamationTriangleIcon className="w-3 h-3" />}
                              className="cursor-default">
                              Sin asignar
                            </Chip>
                          </Tooltip>
                        ) : (
                          <span>{curso.instructor?.nombre} {curso.instructor?.apellidoPaterno}</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {new Date(curso.fechaInicio).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <Chip color={curso.activo ? "success" : "default"} variant="flat">
                          {curso.activo ? "Activo" : "Inactivo"}
                        </Chip>
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-center">
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light">
                                <EllipsisVerticalIcon className="w-5 h-5" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Acciones del curso">
                              <DropdownItem key="editar"
                                onPress={() => { setCursoAEditar(curso); setModalCursoAbierto(true); }}>
                                Editar
                              </DropdownItem>
                              <DropdownItem key="detalle"
                                onPress={() => { setCursoSeleccionado(curso); setDetalleAbierto(true); }}>
                                Ver detalle
                              </DropdownItem>
                              <DropdownItem key="toggle" onPress={() => handleToggleEstado(curso)}>
                                {curso.activo ? "Desactivar" : "Activar"}
                              </DropdownItem>
                              <DropdownItem key="delete" className="text-danger" color="danger"
                                onPress={() => handleEliminar(curso.id)}>
                                Eliminar
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