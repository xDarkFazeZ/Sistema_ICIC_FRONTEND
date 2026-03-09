import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Button, Input, Card, CardBody,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Chip, Pagination,
  Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
  Skeleton,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
} from "@heroui/react";
import {
  Plus, Search, MoreVertical, Trash2,
  Mail, Phone, BookOpen, Users, GraduationCap, Eye,
} from "lucide-react";
import { sileo } from "sileo";

import InstructorModal from "../../components/modals/Instructor/instructorModal";
import InstructorDetalleModal from "../../components/modals/Instructor/instructorDetalleModal";
import CursoModal from "../../components/modals/Cursos/cursosModal";
import SiguientePasoModal, {
  type SiguientePasoOpcion,
} from "../../components/common/siguientePasoModal";
import Sidebar from "../../components/common/Sidebar";
import { apiClient } from "../../services/api/client";
import { usePermissions } from "../../hooks/usePermissions";

// ── Icono inline ──────────────────────────────────────────────────────────────
const IcoCurso = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const getInitials = (nombre: string, apellido: string) =>
  `${nombre?.[0] ?? ""}${apellido?.[0] ?? ""}`.toUpperCase();

const AVATAR_COLORS = [
  "bg-red-500", "bg-rose-500", "bg-pink-500", "bg-orange-500",
  "bg-amber-500", "bg-blue-500", "bg-indigo-500", "bg-violet-500", "bg-teal-500",
];
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const formatFecha = (fecha: string) => {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-MX", {
    year: "numeric", month: "short", day: "numeric",
  });
};

// ── Servicios ─────────────────────────────────────────────────────────────────
const fetchInstructores = async () => {
  const res = await apiClient.get("/instructores", { params: { limit: 100 } });
  return res.data?.data ?? [];
};

const deleteInstructor = async (id: number) => {
  await apiClient.delete(`/instructores/${id}`);
};

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ Icon, label, value, colorBg, loading }: {
  Icon: any; label: string; value: number; colorBg: string; loading: boolean;
}) {
  return (
    <Card className="border border-default-100 shadow-sm hover:shadow-md transition-shadow">
      <CardBody className="flex flex-row items-center gap-4 py-4 px-5">
        <div className={`p-2.5 rounded-xl ${colorBg} shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          {loading ? (
            <>
              <Skeleton className="h-6 w-10 rounded-lg mb-1.5" />
              <Skeleton className="h-2.5 w-20 rounded-lg" />
            </>
          ) : (
            <>
              <p className="text-xl font-bold text-default-800 leading-tight">{value}</p>
              <p className="text-xs text-default-500 mt-0.5 truncate">{label}</p>
            </>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// ── CursosCell ────────────────────────────────────────────────────────────────
function CursosCell({ cursos }: { cursos: any[] }) {
  const [expanded, setExpanded] = useState(false);
  if (!cursos?.length)
    return <span className="text-xs text-default-400 italic">Sin cursos</span>;
  const visibles = expanded ? cursos : cursos.slice(0, 2);
  const resto = cursos.length - 2;
  return (
    <div className="space-y-1.5 max-w-[260px]">
      {visibles.map((c: any) => (
        <div key={c.id} className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-default-400 shrink-0" />
          <p className="text-xs font-medium text-default-700 truncate flex-1 leading-tight">
            {c.nombre ?? "—"}
          </p>
        </div>
      ))}
      {!expanded && resto > 0 && (
        <button onClick={() => setExpanded(true)}
          className="text-[11px] text-primary-500 hover:text-primary-700 font-medium">
          + {resto} más
        </button>
      )}
      {expanded && cursos.length > 2 && (
        <button onClick={() => setExpanded(false)}
          className="text-[11px] text-default-400 hover:text-default-600">
          Ver menos
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────────────────────────
export default function Instructores() {
  const { canCreate, canUpdate, canDelete } = usePermissions();

  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // ── Modales ──────────────────────────────────────────────────────────────
  const [modalInstructorAbierto, setModalInstructorAbierto] = useState(false);
  const [modalCursoAbierto, setModalCursoAbierto] = useState(false);
  const [siguientePasoAbierto, setSiguientePasoAbierto] = useState(false);
  const [aEditar, setAEditar] = useState<any | null>(null);
  const [instructorNombre, setInstructorNombre] = useState("");

  // ── Modal detalle ─────────────────────────────────────────────────────────
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [instructorDetalle, setInstructorDetalle] = useState<any | null>(null);

  // ── Modal eliminar ───────────────────────────────────────────────────────
  const [eliminarModalAbierto, setEliminarModalAbierto] = useState(false);
  const [instructorAEliminar, setInstructorAEliminar] = useState<{ id: number; nombre: string } | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // ── Carga ────────────────────────────────────────────────────────────────
  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchInstructores();
      setTodos(data);
      setPage(1);
    } catch (e) {
      console.error(e);
      sileo.error({ title: "Error al cargar los instructores" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // ── Filtrado client-side ──────────────────────────────────────────────────
  const filtrados = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return todos;
    return todos.filter(p => {
      const txt = [p.nombre, p.apellidoPaterno, p.apellidoMaterno, p.correo, p.celular, p.rfc]
        .filter(Boolean).join(" ").toLowerCase();
      return txt.includes(q);
    });
  }, [todos, search]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / rowsPerPage));
  const paginados = filtrados.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const stats = useMemo(() => ({
    total: todos.length,
    conCursos: todos.filter(p => p.cursos?.length > 0).length,
  }), [todos]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleVerDetalle = (instructor: any) => {
    setInstructorDetalle(instructor);
    setDetalleAbierto(true);
  };

  const handleCreado = (nuevo: any) => {
    const p = nuevo?.data ?? nuevo;
    const nombre = [p?.nombre, p?.apellidoPaterno].filter(Boolean).join(" ");
    setInstructorNombre(nombre || "El instructor");
    sileo.success({
      title: "Instructor registrado",
      description: nombre || "El instructor ha sido registrado correctamente",
    });
    cargar();
    setTimeout(() => setSiguientePasoAbierto(true), 400);
  };

  const handleEditado = () => {
    setModalInstructorAbierto(false);
    setAEditar(null);
    sileo.success({ title: "Instructor actualizado correctamente" });
    cargar();
  };

  const handleConfirmarEliminar = (p: any) => {
    setInstructorAEliminar({
      id: p.id,
      nombre: [p.nombre, p.apellidoPaterno].filter(Boolean).join(" "),
    });
    setEliminarModalAbierto(true);
  };

  const handleEliminarConfirmado = async () => {
    if (!instructorAEliminar) return;
    try {
      setEliminando(true);
      await deleteInstructor(instructorAEliminar.id);
      setEliminarModalAbierto(false);
      sileo.success({
        title: "Instructor eliminado",
        description: `"${instructorAEliminar.nombre}" ha sido eliminado`,
      });
      cargar();
    } catch (e: any) {
      sileo.error({
        title: "Error al eliminar",
        description: e?.response?.data?.message ?? "No se pudo completar la operación",
      });
    } finally {
      setEliminando(false);
      setInstructorAEliminar(null);
    }
  };

  const opcionesSiguientePaso: SiguientePasoOpcion[] = [{
    label: "Asignar a un curso",
    descripcion: "Vincula a este instructor con un curso existente o crea uno nuevo",
    icono: <IcoCurso />,
    color: "from-red-500 to-rose-600",
    onClick: () => setModalCursoAbierto(true),
  }];

  const SKELETON_COUNT = 7;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black flex">
      <Sidebar />

      <main className="flex-1 p-6 space-y-6 overflow-y-auto min-w-0">

        {/* HEADER */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-danger">Instructores</h1>
            {loading
              ? <Skeleton className="h-3.5 w-48 rounded-lg mt-1" />
              : <p className="text-sm text-default-500 mt-0.5">
                {todos.length} instructor{todos.length !== 1 ? "es" : ""} registrado{todos.length !== 1 ? "s" : ""}
              </p>
            }
          </div>
          {canCreate && (
            <Button color="danger" startContent={<Plus className="w-4 h-4" />}
              onPress={() => { setAEditar(null); setModalInstructorAbierto(true); }}>
              Nuevo Instructor
            </Button>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <StatCard Icon={Users} label="Total registrados" value={stats.total} colorBg="bg-slate-500" loading={loading} />
          <StatCard Icon={GraduationCap} label="Con cursos" value={stats.conCursos} colorBg="bg-indigo-500" loading={loading} />
        </div>

        {/* BUSCADOR */}
        <Card>
          <CardBody>
            <Input
              placeholder="Buscar por nombre, correo, RFC, celular..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              isClearable
              onClear={() => { setSearch(""); setPage(1); }}
              startContent={<Search className="w-4 h-4 text-default-400" />}
            />
          </CardBody>
        </Card>

        {/* TABLA */}
        <Card>
          <CardBody className="p-0">
            <Table
              aria-label="Tabla de instructores"
              removeWrapper
              classNames={{
                th: "bg-default-50 text-default-600 font-semibold text-xs uppercase tracking-wider",
              }}
              bottomContent={
                !loading && totalPages > 1 ? (
                  <div className="flex w-full justify-between items-center px-4 pb-4 pt-2 border-t border-default-100">
                    <p className="text-xs text-default-400">
                      Mostrando {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filtrados.length)} de {filtrados.length}
                    </p>
                    <Pagination page={page} total={totalPages} onChange={setPage} showControls color="danger" size="sm" />
                  </div>
                ) : null
              }
            >
              <TableHeader>
                <TableColumn>Instructor</TableColumn>
                <TableColumn>Contacto</TableColumn>
                <TableColumn>RFC</TableColumn>
                <TableColumn>Fecha de nacimiento</TableColumn>
                <TableColumn>Cursos asignados</TableColumn>
                <TableColumn align="center">Acciones</TableColumn>
              </TableHeader>

              {/* SKELETON */}
              {loading ? (
                <TableBody items={Array.from({ length: SKELETON_COUNT }, (_, i) => ({ id: i }))}>
                  {(item) => (
                    <TableRow key={`sk-${item.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-3 w-36 rounded-lg" />
                            <Skeleton className="h-2.5 w-24 rounded-lg" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><div className="space-y-2"><Skeleton className="h-3 w-40 rounded-lg" /><Skeleton className="h-3 w-24 rounded-lg" /></div></TableCell>
                      <TableCell><Skeleton className="h-3 w-28 rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-3 w-24 rounded-lg" /></TableCell>
                      <TableCell><div className="space-y-2"><Skeleton className="h-4 w-48 rounded-lg" /><Skeleton className="h-4 w-36 rounded-lg" /></div></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-lg mx-auto" /></TableCell>
                    </TableRow>
                  )}
                </TableBody>

                /* VACÍO */
              ) : paginados.length === 0 ? (
                <TableBody emptyContent={
                  <div className="py-16 flex flex-col items-center gap-3 text-default-400">
                    <Users className="w-12 h-12 opacity-20" />
                    <p className="text-sm font-medium">
                      {search ? "Sin resultados para la búsqueda" : "No hay instructores registrados"}
                    </p>
                    {search && (
                      <Button size="sm" variant="flat" color="danger" onPress={() => setSearch("")}>
                        Limpiar búsqueda
                      </Button>
                    )}
                  </div>
                }>
                  {[]}
                </TableBody>

                /* DATOS */
              ) : (
                <TableBody items={paginados}>
                  {(p: any) => (
                    <TableRow key={p.id} className="hover:bg-default-50/60 transition-colors">

                      {/* Instructor — clic en nombre abre detalle */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${avatarColor(p.id)}`}>
                            {getInitials(p.nombre, p.apellidoPaterno)}
                          </div>
                          <div>
                            <button
                              onClick={() => handleVerDetalle(p)}
                              className="font-semibold text-sm text-default-800 hover:text-danger transition-colors text-left leading-snug cursor-pointer"
                            >
                              {p.nombre} {p.apellidoPaterno}{p.apellidoMaterno ? ` ${p.apellidoMaterno}` : ""}
                            </button>
                            <Chip size="sm" variant="flat" color="danger" className="mt-0.5 text-[10px] h-4">
                              Instructor
                            </Chip>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contacto */}
                      <TableCell>
                        <div className="space-y-1">
                          {p.correo && (
                            <div className="flex items-center gap-1.5 text-xs text-default-600">
                              <Mail className="w-3.5 h-3.5 text-default-400 shrink-0" />
                              <span className="truncate max-w-[180px]">{p.correo}</span>
                            </div>
                          )}
                          {p.celular && (
                            <div className="flex items-center gap-1.5 text-xs text-default-600">
                              <Phone className="w-3.5 h-3.5 text-default-400 shrink-0" />
                              <span>{p.celular}</span>
                            </div>
                          )}
                          {!p.correo && !p.celular && (
                            <span className="text-xs text-default-400 italic">Sin contacto</span>
                          )}
                        </div>
                      </TableCell>

                      {/* RFC */}
                      <TableCell>
                        {p.rfc
                          ? <span className="text-xs font-mono text-default-700 bg-default-100 px-2 py-0.5 rounded">{p.rfc}</span>
                          : <span className="text-xs text-default-400 italic">Sin RFC</span>
                        }
                      </TableCell>

                      {/* Fecha nacimiento */}
                      <TableCell>
                        <span className="text-xs text-default-600">{formatFecha(p.fechaNacimiento)}</span>
                      </TableCell>

                      {/* Cursos */}
                      <TableCell>
                        <CursosCell cursos={p.cursos ?? []} />
                      </TableCell>

                      {/* Acciones */}
                      <TableCell>
                        <div className="flex justify-center">
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light">
                                <MoreVertical className="w-5 h-5" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Acciones del instructor">
                              {/* Ver detalles — siempre visible */}
                              <DropdownItem key="ver" onPress={() => handleVerDetalle(p)}>
                                <div className="flex items-center gap-2">
                                  <Eye className="w-4 h-4 text-default-500" />
                                  <span>Ver detalles</span>
                                </div>
                              </DropdownItem>

                              {canUpdate && (
                                <DropdownItem key="editar"
                                  onPress={() => { setAEditar(p); setModalInstructorAbierto(true); }}>
                                  Editar
                                </DropdownItem>
                              )}

                              {canDelete && (
                                <DropdownItem key="delete" className="text-danger" color="danger"
                                  onPress={() => handleConfirmarEliminar(p)}>
                                  Eliminar
                                </DropdownItem>
                              )}
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

      {/* MODAL DETALLE */}
      <InstructorDetalleModal
        isOpen={detalleAbierto}
        onClose={() => { setDetalleAbierto(false); setInstructorDetalle(null); }}
        instructor={instructorDetalle}
      />

      {/* MODAL CONFIRMAR ELIMINACIÓN */}
      <Modal
        isOpen={eliminarModalAbierto}
        onClose={() => { setEliminarModalAbierto(false); setInstructorAEliminar(null); }}
        size="sm"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2 text-danger">
                <Trash2 className="w-5 h-5" />
                Eliminar instructor
              </ModalHeader>
              <ModalBody>
                <p className="text-default-600 text-sm">
                  ¿Estás seguro de que deseas eliminar a{" "}
                  <span className="font-semibold text-foreground">
                    "{instructorAEliminar?.nombre}"
                  </span>
                  ? Esta acción no se puede deshacer.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose} isDisabled={eliminando}>Cancelar</Button>
                <Button color="danger" onPress={handleEliminarConfirmado} isLoading={eliminando}
                  startContent={!eliminando && <Trash2 className="w-4 h-4" />}>
                  Eliminar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* MODALES */}
      <InstructorModal
        isOpen={modalInstructorAbierto}
        onClose={() => { setModalInstructorAbierto(false); setAEditar(null); }}
        onSuccess={aEditar ? handleEditado : handleCreado}
        instructorToEdit={aEditar}
      />
      <SiguientePasoModal
        isOpen={siguientePasoAbierto}
        onClose={() => setSiguientePasoAbierto(false)}
        subtitulo={instructorNombre}
        opciones={opcionesSiguientePaso}
      />
      <CursoModal
        isOpen={modalCursoAbierto}
        onClose={() => setModalCursoAbierto(false)}
        onSuccess={(curso) => {
          console.log("Curso asignado desde Instructores:", curso);
          setModalCursoAbierto(false);
        }}
      />
    </div>
  );
}