import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Button, Input, Card, CardBody,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Chip, Pagination, Tooltip,
  Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
  Skeleton, Select, SelectItem, Autocomplete, AutocompleteItem,
  Popover, PopoverTrigger, PopoverContent, Divider, Badge,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
} from "@heroui/react";
import {
  PlusIcon, MagnifyingGlassIcon, EllipsisVerticalIcon, FunnelIcon, XMarkIcon,
} from "@heroicons/react/24/solid";
import {
  EnvelopeIcon, PhoneIcon, BuildingOfficeIcon,
  CheckCircleIcon, ClockIcon, XCircleIcon, ArrowPathIcon,
  UserGroupIcon, AcademicCapIcon, BanknotesIcon, StarIcon, TrashIcon,
} from "@heroicons/react/24/outline";
import { Eye } from "lucide-react";
import { sileo } from "sileo";

import Sidebar from "../../components/common/Sidebar";
import ParticipanteModal from "../../components/modals/Participante/participanteModal";
import ParticipanteDetalleModal from "../../components/modals/Participante/participanteDetalleModal";
import SiguientePasoModal, { type SiguientePasoOpcion } from "../../components/common/siguientePasoModal";
import { apiClient } from "../../services/api/client";
import { buscarEmpresas } from "../../services/empresaService";
import { listarCursos } from "../../services/cursoService";
import { usePermissions } from "../../hooks/usePermissions";

// ── Ícono inline ──────────────────────────────────────────────────────────────
const IcoUsuario = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const getInitials = (nombre: string, apellido: string) =>
  `${nombre?.[0] ?? ""}${apellido?.[0] ?? ""}`.toUpperCase();

const AVATAR_COLORS = [
  "bg-red-500","bg-rose-500","bg-pink-500","bg-orange-500",
  "bg-amber-500","bg-blue-500","bg-indigo-500","bg-violet-500","bg-teal-500",
];
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const ESTADO_CONFIG: Record<string, {
  label: string; color: "success"|"warning"|"danger"|"default"; Icon: any;
}> = {
  PAGADO:      { label: "Pagado",     color: "success", Icon: CheckCircleIcon },
  PENDIENTE:   { label: "Pendiente",  color: "warning", Icon: ClockIcon },
  CANCELADO:   { label: "Cancelado",  color: "danger",  Icon: XCircleIcon },
  REEMBOLSADO: { label: "Reembolso",  color: "default", Icon: ArrowPathIcon },
};

// ── Servicios ─────────────────────────────────────────────────────────────────
const fetchParticipantes = async () => {
  const res = await apiClient.get("/participantes");
  return res.data?.data ?? [];
};
const deleteParticipante = async (id: number) => {
  await apiClient.delete(`/participantes/${id}`);
};

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Filtros {
  tipo: string;
  estadoPago: string;
  empresaId: string;
  cursoId: string;
}
const FILTROS_VACÍOS: Filtros = { tipo: "todos", estadoPago: "todos", empresaId: "", cursoId: "" };

// ─────────────────────────────────────────────────────────────────────────────
// StatCard
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// CursosCell
// ─────────────────────────────────────────────────────────────────────────────
function CursosCell({ inscripciones }: { inscripciones: any[] }) {
  const [expanded, setExpanded] = useState(false);
  if (!inscripciones?.length)
    return <span className="text-xs text-default-400 italic">Sin cursos</span>;
  const visibles = expanded ? inscripciones : inscripciones.slice(0, 2);
  const resto    = inscripciones.length - 2;
  return (
    <div className="space-y-1.5 max-w-[280px]">
      {visibles.map((ins: any) => {
        const cfg = ESTADO_CONFIG[ins.estadoPago] ?? ESTADO_CONFIG.PENDIENTE;
        const { Icon } = cfg;
        return (
          <div key={ins.id} className="flex items-center gap-2">
            <p className="text-xs font-medium text-default-700 truncate flex-1 leading-tight">
              {ins.curso?.nombre ?? "—"}
            </p>
            <Chip size="sm" variant="flat" color={cfg.color}
              startContent={<Icon className="w-3 h-3" />}
              className="shrink-0 text-[10px] h-5 px-1.5">
              {cfg.label}
            </Chip>
          </div>
        );
      })}
      {!expanded && resto > 0 && (
        <button onClick={() => setExpanded(true)}
          className="text-[11px] text-primary-500 hover:text-primary-700 font-medium">
          + {resto} más
        </button>
      )}
      {expanded && inscripciones.length > 2 && (
        <button onClick={() => setExpanded(false)}
          className="text-[11px] text-default-400 hover:text-default-600">
          Ver menos
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FiltrosPanel
// ─────────────────────────────────────────────────────────────────────────────
function FiltrosPanel({
  filtros, onChange, onReset,
  cursosFiltro, loadingCursos,
  empresasFiltro, loadingEmpresas, onBuscarEmpresa, empresaLabel,
}: {
  filtros: Filtros;
  onChange: (k: keyof Filtros, v: string) => void;
  onReset: () => void;
  cursosFiltro: any[];
  loadingCursos: boolean;
  empresasFiltro: any[];
  loadingEmpresas: boolean;
  onBuscarEmpresa: (v: string) => void;
  empresaLabel: string;
}) {
  const hayFiltros = filtros.tipo !== "todos" || filtros.estadoPago !== "todos"
    || !!filtros.empresaId || !!filtros.cursoId;
  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-default-700">Filtros avanzados</p>
        {hayFiltros && (
          <Button size="sm" variant="light" color="danger"
            startContent={<XMarkIcon className="w-3.5 h-3.5" />} onPress={onReset}>
            Limpiar
          </Button>
        )}
      </div>
      <Divider />

      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold text-default-500 uppercase tracking-wider">Tipo de participante</p>
        <Select size="sm" aria-label="Tipo"
          selectedKeys={new Set([filtros.tipo])}
          onSelectionChange={k => onChange("tipo", Array.from(k)[0] as string)}>
          <SelectItem key="todos">Todos</SelectItem>
          <SelectItem key="afiliado">Afiliados</SelectItem>
          <SelectItem key="publico">Público general</SelectItem>
        </Select>
      </div>

      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold text-default-500 uppercase tracking-wider">Estado de pago</p>
        <Select size="sm" aria-label="Estado de pago"
          selectedKeys={new Set([filtros.estadoPago])}
          onSelectionChange={k => {
            const val = Array.from(k)[0];
            onChange("estadoPago", val ? String(val) : "todos");
          }}>
          <SelectItem key="todos" textValue="Todos los estados">Todos los estados</SelectItem>
          <SelectItem key="PAGADO" textValue="Pagado">
            <div className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-success-500" />Pagado</div>
          </SelectItem>
          <SelectItem key="PENDIENTE" textValue="Pendiente">
            <div className="flex items-center gap-2"><ClockIcon className="w-4 h-4 text-warning-500" />Pendiente</div>
          </SelectItem>
          <SelectItem key="CANCELADO" textValue="Cancelado">
            <div className="flex items-center gap-2"><XCircleIcon className="w-4 h-4 text-danger-500" />Cancelado</div>
          </SelectItem>
          <SelectItem key="REEMBOLSADO" textValue="Reembolsado">
            <div className="flex items-center gap-2"><ArrowPathIcon className="w-4 h-4 text-default-500" />Reembolsado</div>
          </SelectItem>
        </Select>
      </div>

      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold text-default-500 uppercase tracking-wider">Empresa</p>
        <Autocomplete size="sm" placeholder="Buscar empresa..." aria-label="Empresa"
          inputValue={empresaLabel}
          onInputChange={onBuscarEmpresa}
          isLoading={loadingEmpresas}
          selectedKey={filtros.empresaId || null}
          onSelectionChange={k => onChange("empresaId", k ? String(k) : "")}
          isClearable
          onClear={() => { onChange("empresaId", ""); onBuscarEmpresa(""); }}>
          {empresasFiltro.map(e => (
            <AutocompleteItem key={String(e.id)} textValue={e.nombre}>{e.nombre}</AutocompleteItem>
          ))}
        </Autocomplete>
      </div>

      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold text-default-500 uppercase tracking-wider">Curso inscrito</p>
        <Select size="sm" placeholder="Selecciona un curso" aria-label="Curso"
          isLoading={loadingCursos}
          selectedKeys={filtros.cursoId ? new Set([filtros.cursoId]) : new Set()}
          onSelectionChange={k => onChange("cursoId", Array.from(k)[0] as string ?? "")}>
          {cursosFiltro.map(c => (
            <SelectItem key={String(c.id)}>{c.nombre}</SelectItem>
          ))}
        </Select>
        {filtros.cursoId && (
          <button className="text-[11px] text-danger-500 hover:text-danger-700"
            onClick={() => onChange("cursoId", "")}>
            × Quitar filtro de curso
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────────────────────────
export default function Participantes() {
  const { canCreate, canUpdate, canDelete } = usePermissions();

  const [todos, setTodos]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);
  const rowsPerPage           = 10;

  const [filtros, setFiltros]         = useState<Filtros>({ ...FILTROS_VACÍOS });
  const [filtrosOpen, setFiltrosOpen] = useState(false);

  const [cursosFiltro, setCursosFiltro]       = useState<any[]>([]);
  const [loadingCursos, setLoadingCursos]     = useState(false);
  const [empresasFiltro, setEmpresasFiltro]   = useState<any[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [empresaLabel, setEmpresaLabel]       = useState("");
  const timeoutEmp = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [modalOpen, setModalOpen]         = useState(false);
  const [siguienteOpen, setSiguienteOpen] = useState(false);
  const [nombreCreado, setNombreCreado]   = useState("");
  const [aEditar, setAEditar]             = useState<any | null>(null);

  // ── Modal detalle ─────────────────────────────────────────────────────────
  const [detalleAbierto, setDetalleAbierto]             = useState(false);
  const [participanteDetalle, setParticipanteDetalle]   = useState<any | null>(null);

  // ── Modal eliminar ────────────────────────────────────────────────────────
  const [eliminarModalAbierto, setEliminarModalAbierto]     = useState(false);
  const [participanteAEliminar, setParticipanteAEliminar]   = useState<{ id: number; nombre: string } | null>(null);
  const [eliminando, setEliminando]                         = useState(false);

  // ── Carga inicial ─────────────────────────────────────────────────────────
  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchParticipantes();
      setTodos(data);
      setPage(1);
    } catch (e) {
      console.error(e);
      sileo.error({ title: "Error al cargar los participantes" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingCursos(true);
        const res = await listarCursos({ limit: 100 });
        setCursosFiltro(res.data ?? []);
      } finally { setLoadingCursos(false); }
    })();
  }, []);

  const handleBuscarEmpresa = (val: string) => {
    setEmpresaLabel(val);
    if (timeoutEmp.current) clearTimeout(timeoutEmp.current);
    if (!val || val.length < 2) { setEmpresasFiltro([]); return; }
    timeoutEmp.current = setTimeout(async () => {
      try { setLoadingEmpresas(true); setEmpresasFiltro(await buscarEmpresas(val)); }
      finally { setLoadingEmpresas(false); }
    }, 350);
  };

  const handleFiltro = (key: keyof Filtros, val: string) => {
    setFiltros(prev => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const resetFiltros = () => {
    setFiltros({ ...FILTROS_VACÍOS });
    setEmpresaLabel(""); setEmpresasFiltro([]);
    setPage(1);
  };

  // ── Filtrado client-side ──────────────────────────────────────────────────
  const filtrados = useMemo(() => {
    const q = search.toLowerCase().trim();
    return todos.filter(p => {
      if (q) {
        const txt = [p.nombre, p.apellidoPaterno, p.apellidoMaterno, p.correo, p.celular, p.empresa?.nombre]
          .filter(Boolean).join(" ").toLowerCase();
        if (!txt.includes(q)) return false;
      }
      if (filtros.tipo === "afiliado" && !p.esAfiliado) return false;
      if (filtros.tipo === "publico"  &&  p.esAfiliado) return false;
      if (filtros.empresaId && String(p.empresaId) !== filtros.empresaId) return false;
      if (filtros.cursoId && !p.inscripciones?.some((i: any) => String(i.cursoId) === filtros.cursoId)) return false;
      if (filtros.estadoPago !== "todos" && !p.inscripciones?.some((i: any) => i.estadoPago === filtros.estadoPago)) return false;
      return true;
    });
  }, [todos, search, filtros]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / rowsPerPage));
  const paginados  = filtrados.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const stats = useMemo(() => ({
    total:     todos.length,
    afiliados: todos.filter(p => p.esAfiliado).length,
    conCurso:  todos.filter(p => p.inscripciones?.length > 0).length,
    pagados:   todos.filter(p => p.inscripciones?.some((i: any) => i.estadoPago === "PAGADO")).length,
  }), [todos]);

  const filtrosActivos = [
    filtros.tipo !== "todos",
    filtros.estadoPago !== "todos",
    !!filtros.empresaId,
    !!filtros.cursoId,
  ].filter(Boolean).length;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleVerDetalle = (participante: any) => {
    setParticipanteDetalle(participante);
    setDetalleAbierto(true);
  };

  const handleCreado = (nuevo: any) => {
    const p = nuevo?.data ?? nuevo;
    setNombreCreado([p?.nombre, p?.apellidoPaterno].filter(Boolean).join(" ") || "El participante");
    sileo.success({
      title: "Participante registrado",
      description: [p?.nombre, p?.apellidoPaterno].filter(Boolean).join(" "),
    });
    cargar();
    setTimeout(() => setSiguienteOpen(true), 400);
  };

  const handleEditado = () => {
    setModalOpen(false);
    setAEditar(null);
    sileo.success({ title: "Participante actualizado correctamente" });
    cargar();
  };

  const handleConfirmarEliminar = (p: any) => {
    setParticipanteAEliminar({
      id: p.id,
      nombre: [p.nombre, p.apellidoPaterno].filter(Boolean).join(" "),
    });
    setEliminarModalAbierto(true);
  };

  const handleEliminarConfirmado = async () => {
    if (!participanteAEliminar) return;
    try {
      setEliminando(true);
      await deleteParticipante(participanteAEliminar.id);
      setEliminarModalAbierto(false);
      sileo.success({
        title: "Participante eliminado",
        description: `"${participanteAEliminar.nombre}" ha sido eliminado`,
      });
      cargar();
    } catch (e: any) {
      sileo.error({
        title: "Error al eliminar",
        description: e?.response?.data?.message ?? "No se pudo completar la operación",
      });
    } finally {
      setEliminando(false);
      setParticipanteAEliminar(null);
    }
  };

  const opcionesSiguiente: SiguientePasoOpcion[] = [{
    label: "Registrar otro participante",
    descripcion: "Abre el formulario para dar de alta un nuevo participante",
    icono: <IcoUsuario />,
    color: "from-indigo-500 to-blue-600",
    onClick: () => { setAEditar(null); setModalOpen(true); },
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
            <h1 className="text-2xl font-bold text-danger">Participantes</h1>
            {loading
              ? <Skeleton className="h-3.5 w-48 rounded-lg mt-1" />
              : <p className="text-sm text-default-500 mt-0.5">
                  {todos.length} participante{todos.length !== 1 ? "s" : ""} registrado{todos.length !== 1 ? "s" : ""}
                </p>
            }
          </div>
          {canCreate && (
            <Button color="danger" startContent={<PlusIcon className="w-4 h-4" />}
              onPress={() => { setAEditar(null); setModalOpen(true); }}>
              Nuevo Participante
            </Button>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard Icon={UserGroupIcon}   label="Total registrados" value={stats.total}     colorBg="bg-slate-500"   loading={loading} />
          <StatCard Icon={StarIcon}        label="Afiliados"          value={stats.afiliados} colorBg="bg-amber-500"   loading={loading} />
          <StatCard Icon={AcademicCapIcon} label="Con cursos"         value={stats.conCurso}  colorBg="bg-indigo-500"  loading={loading} />
          <StatCard Icon={BanknotesIcon}   label="Con pago completo"  value={stats.pagados}   colorBg="bg-emerald-500" loading={loading} />
        </div>

        {/* BUSCADOR + FILTROS */}
        <Card>
          <CardBody className="flex flex-col sm:flex-row gap-3">
            <Input className="flex-1"
              placeholder="Buscar por nombre, apellidos, correo, empresa..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              isClearable onClear={() => { setSearch(""); setPage(1); }}
              startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
            />
            <Popover isOpen={filtrosOpen} onOpenChange={setFiltrosOpen} placement="bottom-end" showArrow>
              <PopoverTrigger asChild>
                <Badge content={filtrosActivos || undefined} color="danger" size="sm" isInvisible={filtrosActivos === 0}>
                  <Button
                    onPress={() => setFiltrosOpen(!filtrosOpen)}
                    variant={filtrosActivos > 0 ? "flat" : "bordered"}
                    color={filtrosActivos > 0 ? "danger" : "default"}
                    startContent={<FunnelIcon className="w-4 h-4" />}>
                    Filtros{filtrosActivos > 0 ? ` (${filtrosActivos})` : ""}
                  </Button>
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4">
                <FiltrosPanel
                  filtros={filtros} onChange={handleFiltro} onReset={resetFiltros}
                  cursosFiltro={cursosFiltro} loadingCursos={loadingCursos}
                  empresasFiltro={empresasFiltro} loadingEmpresas={loadingEmpresas}
                  onBuscarEmpresa={handleBuscarEmpresa} empresaLabel={empresaLabel}
                />
              </PopoverContent>
            </Popover>
          </CardBody>
        </Card>

        {/* Chips filtros activos */}
        {filtrosActivos > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-default-500 font-medium">Filtrando por:</span>
            {filtros.tipo !== "todos" && (
              <Chip size="sm" variant="flat" color="primary" onClose={() => handleFiltro("tipo", "todos")}>
                {filtros.tipo === "afiliado" ? "Afiliados" : "Público general"}
              </Chip>
            )}
            {filtros.estadoPago !== "todos" && (
              <Chip size="sm" variant="flat" color={ESTADO_CONFIG[filtros.estadoPago]?.color ?? "default"}
                onClose={() => handleFiltro("estadoPago", "todos")}>
                {ESTADO_CONFIG[filtros.estadoPago]?.label ?? filtros.estadoPago}
              </Chip>
            )}
            {filtros.empresaId && (
              <Chip size="sm" variant="flat" color="default"
                onClose={() => { handleFiltro("empresaId", ""); setEmpresaLabel(""); }}>
                {empresasFiltro.find(e => String(e.id) === filtros.empresaId)?.nombre ?? "Empresa"}
              </Chip>
            )}
            {filtros.cursoId && (
              <Chip size="sm" variant="flat" color="secondary" onClose={() => handleFiltro("cursoId", "")}>
                {cursosFiltro.find(c => String(c.id) === filtros.cursoId)?.nombre ?? "Curso"}
              </Chip>
            )}
            <Button size="sm" variant="light" color="danger"
              onPress={() => { resetFiltros(); setSearch(""); }}>
              Limpiar todo
            </Button>
          </div>
        )}

        {/* TABLA */}
        <Card>
          <CardBody className="p-0">
            <Table
              aria-label="Tabla de participantes"
              removeWrapper
              classNames={{
                th: "bg-default-50 text-default-600 font-semibold text-xs uppercase tracking-wider",
              }}
              bottomContent={
                !loading && totalPages > 1 ? (
                  <div className="flex w-full justify-between items-center px-4 pb-4 pt-2 border-t border-default-100">
                    <p className="text-xs text-default-400">
                      Mostrando {(page-1)*rowsPerPage+1}–{Math.min(page*rowsPerPage, filtrados.length)} de {filtrados.length}
                    </p>
                    <Pagination page={page} total={totalPages} onChange={setPage} showControls color="danger" size="sm" />
                  </div>
                ) : null
              }
            >
              <TableHeader>
                <TableColumn>Participante</TableColumn>
                <TableColumn>Contacto</TableColumn>
                <TableColumn>Empresa</TableColumn>
                <TableColumn>Tipo</TableColumn>
                <TableColumn>Cursos e inscripciones</TableColumn>
                <TableColumn align="center">Acciones</TableColumn>
              </TableHeader>

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
                      <TableCell><Skeleton className="h-3 w-32 rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell><div className="space-y-2"><Skeleton className="h-4 w-52 rounded-lg" /><Skeleton className="h-4 w-40 rounded-lg" /></div></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-lg mx-auto" /></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              ) : paginados.length === 0 ? (
                <TableBody emptyContent={
                  <div className="py-16 flex flex-col items-center gap-3 text-default-400">
                    <UserGroupIcon className="w-12 h-12 opacity-20" />
                    <p className="text-sm font-medium">
                      {filtrosActivos > 0 || search
                        ? "Sin resultados con los filtros aplicados"
                        : "No hay participantes registrados"}
                    </p>
                    {(filtrosActivos > 0 || search) && (
                      <Button size="sm" variant="flat" color="danger"
                        onPress={() => { resetFiltros(); setSearch(""); }}>
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                }>
                  {[]}
                </TableBody>
              ) : (
                <TableBody items={paginados}>
                  {(p: any) => (
                    <TableRow key={p.id} className="hover:bg-default-50/60 transition-colors">

                      {/* Participante — clic en nombre abre detalle */}
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
                            {p.curp && <p className="text-[11px] text-default-400">CURP: {p.curp}</p>}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          {p.correo && (
                            <div className="flex items-center gap-1.5 text-xs text-default-600">
                              <EnvelopeIcon className="w-3.5 h-3.5 text-default-400 shrink-0" />
                              <span className="truncate max-w-[180px]">{p.correo}</span>
                            </div>
                          )}
                          {p.celular && (
                            <div className="flex items-center gap-1.5 text-xs text-default-600">
                              <PhoneIcon className="w-3.5 h-3.5 text-default-400 shrink-0" />
                              <span>{p.celular}</span>
                            </div>
                          )}
                          {!p.correo && !p.celular && (
                            <span className="text-xs text-default-400 italic">Sin contacto</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        {p.empresa ? (
                          <Tooltip content={p.empresa.nombre} delay={500}>
                            <div className="flex items-center gap-1.5 text-sm text-default-700 cursor-default">
                              <BuildingOfficeIcon className="w-4 h-4 text-default-400 shrink-0" />
                              <span className="truncate max-w-[130px]">{p.empresa.nombre}</span>
                            </div>
                          </Tooltip>
                        ) : (
                          <span className="text-xs text-default-400 italic">Sin empresa</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip size="sm" variant="flat" color={p.esAfiliado ? "warning" : "default"}>
                          {p.esAfiliado ? "Afiliado" : "Público"}
                        </Chip>
                      </TableCell>

                      <TableCell>
                        <CursosCell inscripciones={p.inscripciones ?? []} />
                      </TableCell>

                      {/* Acciones */}
                      <TableCell>
                        <div className="flex justify-center">
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light">
                                <EllipsisVerticalIcon className="w-5 h-5" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Acciones del participante">
                              {/* Ver detalles — siempre visible */}
                              <DropdownItem key="ver" onPress={() => handleVerDetalle(p)}>
                                <div className="flex items-center gap-2">
                                  <Eye className="w-4 h-4 text-default-500" />
                                  <span>Ver detalles</span>
                                </div>
                              </DropdownItem>

                              {canUpdate && (
                                <DropdownItem key="editar"
                                  onPress={() => { setAEditar(p); setModalOpen(true); }}>
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
      <ParticipanteDetalleModal
        isOpen={detalleAbierto}
        onClose={() => { setDetalleAbierto(false); setParticipanteDetalle(null); }}
        participante={participanteDetalle}
      />

      {/* MODAL CONFIRMAR ELIMINACIÓN */}
      <Modal
        isOpen={eliminarModalAbierto}
        onClose={() => { setEliminarModalAbierto(false); setParticipanteAEliminar(null); }}
        size="sm"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2 text-danger">
                <TrashIcon className="w-5 h-5" />
                Eliminar participante
              </ModalHeader>
              <ModalBody>
                <p className="text-default-600 text-sm">
                  ¿Estás seguro de que deseas eliminar a{" "}
                  <span className="font-semibold text-foreground">
                    "{participanteAEliminar?.nombre}"
                  </span>
                  ? Esta acción no se puede deshacer.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose} isDisabled={eliminando}>Cancelar</Button>
                <Button color="danger" onPress={handleEliminarConfirmado} isLoading={eliminando}
                  startContent={!eliminando && <TrashIcon className="w-4 h-4" />}>
                  Eliminar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* MODALES */}
      <ParticipanteModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setAEditar(null); }}
        onSuccess={aEditar ? handleEditado : handleCreado}
        participanteToEdit={aEditar}
      />
      <SiguientePasoModal
        isOpen={siguienteOpen}
        onClose={() => setSiguienteOpen(false)}
        subtitulo={nombreCreado}
        opciones={opcionesSiguiente}
      />
    </div>
  );
}