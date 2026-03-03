import { useState, useEffect, useCallback } from "react";
import {
  Button, Input, Card, CardBody,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Chip, Pagination, Spinner, Tooltip,
  Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
} from "@heroui/react";
import { PlusIcon, MagnifyingGlassIcon, EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { EnvelopeIcon, PhoneIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";

import ParticipanteModal from "../../components/modals/Participante/participanteModal";
import SiguientePasoModal, {
  type SiguientePasoOpcion,
} from "../../components/common/siguientePasoModal";
import { apiClient } from "../../services/api/client";

// ── Íconos SVG inline ─────────────────────────────────────────────────────────
const IcoCurso = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
);

const IcoUsuario = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const getInitials = (nombre: string, apellido: string) =>
  `${nombre?.[0] ?? ""}${apellido?.[0] ?? ""}`.toUpperCase();

const AVATAR_COLORS = [
  "bg-red-500", "bg-rose-500", "bg-pink-500",
  "bg-orange-500", "bg-amber-500", "bg-blue-500",
  "bg-indigo-500", "bg-violet-500", "bg-teal-500",
];
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

// ── Servicios ─────────────────────────────────────────────────────────────────
const listarParticipantes = async (params?: { search?: string }) => {
  const res = await apiClient.get("/participantes", { params });
  return res.data;
};

const eliminarParticipante = async (id: number) => {
  const res = await apiClient.delete(`/participantes/${id}`);
  return res.data;
};

// ── Componente ────────────────────────────────────────────────────────────────
export default function Participantes() {
  // ── Datos ────────────────────────────────────────────────────────────────
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [loading, setLoading]             = useState(false);
  const [search, setSearch]               = useState("");
  const [page, setPage]                   = useState(1);
  const rowsPerPage                       = 10;

  // ── Modales ──────────────────────────────────────────────────────────────
  const [modalParticipanteAbierto, setModalParticipanteAbierto] = useState(false);
  const [siguientePasoAbierto, setSiguientePasoAbierto]         = useState(false);
  const [participanteNombre, setParticipanteNombre]             = useState("");
  const [participanteAEditar, setParticipanteAEditar]           = useState<any | null>(null);

  // ── Cargar datos ──────────────────────────────────────────────────────────
  const cargarParticipantes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listarParticipantes({ search: search || undefined });
      setParticipantes(res.data ?? []);
      setPage(1);
    } catch (error) {
      console.error("Error al cargar participantes:", error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { cargarParticipantes(); }, [cargarParticipantes]);

  // ── Paginación client-side ────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(participantes.length / rowsPerPage));
  const paginados  = participantes.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // ── Handler: participante creado ──────────────────────────────────────────
const handleParticipanteCreado = (nuevo: any) => {
  const p = nuevo?.data ?? nuevo; // soporta ambas formas por si acaso
  const nombre = [p?.nombre, p?.apellidoPaterno].filter(Boolean).join(" ");
    setParticipanteNombre(nombre || "El participante");
    cargarParticipantes();
    // Pequeño delay para que el modal de creación cierre primero
    setTimeout(() => setSiguientePasoAbierto(true), 400);
  };

  // ── Handler: participante editado ─────────────────────────────────────────
  const handleParticipanteEditado = () => {
    setModalParticipanteAbierto(false);
    setParticipanteAEditar(null);
    cargarParticipantes();
  };

  // ── Handler: eliminar ─────────────────────────────────────────────────────
  const handleEliminar = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este participante?")) return;
    try {
      await eliminarParticipante(id);
      cargarParticipantes();
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? "No se pudo eliminar el participante.";
      alert(msg);
    }
  };

  // ── Opciones del SiguientePasoModal ───────────────────────────────────────
  // Ambas opciones se definen aquí con acceso a los setters del componente
  const opcionesSiguientePaso: SiguientePasoOpcion[] = [
    {
      label: "Registrar otro participante",
      descripcion: "Abre el formulario para dar de alta un nuevo participante",
      icono: <IcoUsuario />,
      color: "from-indigo-500 to-blue-600",
      onClick: () => {
        setParticipanteAEditar(null);
        setModalParticipanteAbierto(true);
      },
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-danger">Participantes</h1>
          <p className="text-sm text-default-500 mt-0.5">
            {participantes.length} participante{participantes.length !== 1 ? "s" : ""} registrado{participantes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          color="danger"
          startContent={<PlusIcon className="w-4 h-4" />}
          onPress={() => {
            setParticipanteAEditar(null);
            setModalParticipanteAbierto(true);
          }}
        >
          Nuevo Participante
        </Button>
      </div>

      {/* BUSCADOR */}
      <Card>
        <CardBody>
          <Input
            placeholder="Buscar por nombre, correo o empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            isClearable
            onClear={() => setSearch("")}
            startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
          />
        </CardBody>
      </Card>

      {/* TABLA */}
      <Card>
        <CardBody>
          <Table
            aria-label="Tabla de participantes"
            bottomContent={
              totalPages > 1 ? (
                <div className="flex w-full justify-center">
                  <Pagination page={page} total={totalPages} onChange={setPage} showControls color="danger" />
                </div>
              ) : null
            }
          >
            <TableHeader>
              <TableColumn>Participante</TableColumn>
              <TableColumn>Contacto</TableColumn>
              <TableColumn>Empresa</TableColumn>
              <TableColumn>Tipo</TableColumn>
              <TableColumn>Cursos</TableColumn>
              <TableColumn align="center">Acciones</TableColumn>
            </TableHeader>

            <TableBody
              items={paginados}
              isLoading={loading}
              loadingContent={<Spinner label="Cargando participantes..." />}
              emptyContent="No hay participantes registrados"
            >
              {(p) => (
                <TableRow key={p.id}>

                  {/* Participante */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${avatarColor(p.id)}`}>
                        {getInitials(p.nombre, p.apellidoPaterno)}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-default-800">
                          {p.nombre} {p.apellidoPaterno} {p.apellidoMaterno ?? ""}
                        </p>
                        {p.curp && <p className="text-xs text-default-400">CURP: {p.curp}</p>}
                      </div>
                    </div>
                  </TableCell>

                  {/* Contacto */}
                  <TableCell>
                    <div className="space-y-1">
                      {p.correo && (
                        <div className="flex items-center gap-1.5 text-xs text-default-600">
                          <EnvelopeIcon className="w-3.5 h-3.5 text-default-400" />
                          <span>{p.correo}</span>
                        </div>
                      )}
                      {p.celular && (
                        <div className="flex items-center gap-1.5 text-xs text-default-600">
                          <PhoneIcon className="w-3.5 h-3.5 text-default-400" />
                          <span>{p.celular}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Empresa */}
                  <TableCell>
                    {p.empresa ? (
                      <div className="flex items-center gap-1.5 text-sm text-default-700">
                        <BuildingOfficeIcon className="w-4 h-4 text-default-400 shrink-0" />
                        <span>{p.empresa.nombre}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-default-400 italic">Sin empresa</span>
                    )}
                  </TableCell>

                  {/* Tipo */}
                  <TableCell>
                    <Chip size="sm" variant="flat" color={p.esAfiliado ? "success" : "default"}>
                      {p.esAfiliado ? "Afiliado" : "Público"}
                    </Chip>
                  </TableCell>

                  {/* Cursos */}
                  <TableCell>
                    {p.inscripciones?.length > 0 ? (
                      <Tooltip
                        content={
                          <div className="p-2 space-y-1 max-w-xs">
                            {p.inscripciones.map((ins: any) => (
                              <p key={ins.id} className="text-xs">• {ins.curso?.nombre ?? "Curso"}</p>
                            ))}
                          </div>
                        }
                      >
                        <Chip size="sm" variant="flat" color="primary" className="cursor-default">
                          {p.inscripciones.length} curso{p.inscripciones.length !== 1 ? "s" : ""}
                        </Chip>
                      </Tooltip>
                    ) : (
                      <span className="text-xs text-default-400 italic">Sin cursos</span>
                    )}
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
                          <DropdownItem
                            key="editar"
                            onPress={() => {
                              setParticipanteAEditar(p);
                              setModalParticipanteAbierto(true);
                            }}
                          >
                            Editar
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            onPress={() => handleEliminar(p.id)}
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

      {/* ════════════════════════ MODALES ════════════════════════ */}

      {/* 1. Crear / Editar participante */}
      <ParticipanteModal
        isOpen={modalParticipanteAbierto}
        onClose={() => {
          setModalParticipanteAbierto(false);
          setParticipanteAEditar(null);
        }}
        onSuccess={participanteAEditar ? handleParticipanteEditado : handleParticipanteCreado}
        participanteToEdit={participanteAEditar}
      />

      {/* 2. Siguiente paso — aparece tras crear exitosamente */}
      <SiguientePasoModal
        isOpen={siguientePasoAbierto}
        onClose={() => setSiguientePasoAbierto(false)}
        subtitulo={participanteNombre}
        opciones={opcionesSiguientePaso}
      />

    </div>
  );
}