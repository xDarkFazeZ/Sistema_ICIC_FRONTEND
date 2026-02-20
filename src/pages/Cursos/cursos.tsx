import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Spinner,
  Card,
  CardBody,
} from "@heroui/react";

import { EllipsisVerticalIcon, PlusIcon } from "@heroicons/react/24/solid";

import CursoModal from "../../components/modals/Cursos/cursosModal";
import CursoDetalleModal from "../../components/modals/Cursos/cursosDetalleModal";

import {
  listarCursos,
  crearCurso,
  eliminarCurso,
  activarCurso,
  desactivarCurso,
} from "../../services/cursoService";

export default function Cursos() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [modalCursoAbierto, setModalCursoAbierto] = useState(false);
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<any | null>(null);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const res = await listarCursos({
        page,
        limit: 10,
        search: search || undefined,
      });
      setCursos(res.data);
      setTotalPages(res.pagination.pages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCursos();
  }, [page, search]);

  const handleCrearCurso = async (data: any) => {
    try {
      setModalLoading(true);
      await crearCurso(data);
      setModalCursoAbierto(false);
      cargarCursos();
    } catch (error) {
      console.error("Error al crear curso:", error);
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
    if (curso.activo) {
      await desactivarCurso(curso.id);
    } else {
      await activarCurso(curso.id);
    }
    cargarCursos();
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-danger">Cursos</h1>
        <Button
          color="danger"
          startContent={<PlusIcon className="w-4 h-4" />}
          onPress={() => setModalCursoAbierto(true)}
        >
          Nuevo Curso
        </Button>
      </div>

      {/* BUSCADOR */}
      <Card>
        <CardBody>
          <Input
            placeholder="Buscar curso..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            isClearable
          />
        </CardBody>
      </Card>

      {/* TABLA */}
      <Card>
        <CardBody>
          <Table
            aria-label="Tabla de cursos"
            bottomContent={
              <div className="flex w-full justify-center">
                <Pagination
                  page={page}
                  total={totalPages}
                  onChange={(page) => setPage(page)}
                  showControls
                  color="danger"
                />
              </div>
            }
          >
            <TableHeader>
              <TableColumn>Nombre</TableColumn>
              <TableColumn>Instructor</TableColumn>
              <TableColumn>Fecha Inicio</TableColumn>
              <TableColumn>Estado</TableColumn>
              <TableColumn align="center">Acciones</TableColumn>
            </TableHeader>

            <TableBody
              items={cursos}
              isLoading={loading}
              loadingContent={<Spinner label="Cargando cursos..." />}
              emptyContent="No hay cursos registrados"
            >
              {(curso) => (
                <TableRow key={curso.id}>
                  <TableCell
                    className="cursor-pointer font-medium"
                    onClick={() => {
                      setCursoSeleccionado(curso);
                      setDetalleAbierto(true);
                    }}
                  >
                    {curso.nombre}
                  </TableCell>

                  <TableCell>
                    {curso.instructor?.nombre}{" "}
                    {curso.instructor?.apellidoPaterno}
                  </TableCell>

                  <TableCell>
                    {new Date(curso.fechaInicio).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    <Chip
                      color={curso.activo ? "success" : "default"}
                      variant="flat"
                    >
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
                          <DropdownItem
                            key="detalle"
                            onPress={() => {
                              setCursoSeleccionado(curso);
                              setDetalleAbierto(true);
                            }}
                          >
                            Ver detalle
                          </DropdownItem>

                          <DropdownItem
                            key="toggle"
                            onPress={() => handleToggleEstado(curso)}
                          >
                            {curso.activo ? "Desactivar" : "Activar"}
                          </DropdownItem>

                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            onPress={() => handleEliminar(curso.id)}
                          >
                            Eliminar
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* MODALES */}
      <CursoModal
        isOpen={modalCursoAbierto}
        onClose={() => setModalCursoAbierto(false)}
        onSubmit={handleCrearCurso}
        isLoading={modalLoading}
      />

      <CursoDetalleModal
        isOpen={detalleAbierto}
        onClose={() => setDetalleAbierto(false)}
        curso={cursoSeleccionado}
      />
    </div>
  );
}