import { useState, useRef, useEffect } from "react";
import {
  Input,
  Button,
  Autocomplete,
  AutocompleteItem,
  Switch,
  Chip,
  Avatar,
  Spinner,
  Card,
  CardBody,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { DatePicker } from "@heroui/react";
import { CalendarDate, parseDate } from "@internationalized/date";
import { sileo } from "sileo";
import ModalForm from "../../common/modalForm";
import InscripcionModal from "../Inscripcion/inscripcionModal";
import InscripcionCerradaModal from "../Inscripcion/InscripcionCerradaModal";
import EmpresaModal from "../../modals/Empresa/empresaModal";
import { useEmpresaModal } from "../../modals/Empresa/EmpresaModalContext";
import {
  buscarEmpresas,
  obtenerEmpresa,
} from "../../../services/empresaService";
import {
  listarCursos,
  obtenerCursoPorId,
} from "../../../services/cursoService";
import {
  crearParticipante,
  actualizarParticipante,
} from "../../../services/participanteService";
import {
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  CurrencyDollarIcon,
  UserIcon,
  ExclamationTriangleIcon as ExclamationOutline,
  ArrowPathIcon,
  BookOpenIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon as CheckCircleSolid,
} from "@heroicons/react/24/solid";

// ── Iconos inline ─────────────────────────────────────────────────────────────
const Ic = {
  User: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  MapPin: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Receipt: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M14 8H8M16 12H8M13 16H8" />
    </svg>
  ),
  Building: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  Book: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  AlertCircle: () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Info: () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

// ── Tipos ─────────────────────────────────────────────────────────────────────
type EmpresaMode = "buscar" | "crear" | "despues" | null;
type CursoMode = "buscar" | "despues" | null;

// ── Componentes auxiliares ────────────────────────────────────────────────────
function RequiredLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <span>
      {label}
      {required ? (
        <span className="text-rose-500 ml-0.5">*</span>
      ) : (
        <span className="text-slate-400 dark:text-gray-500 text-[10px] ml-1.5 font-normal">(opcional)</span>
      )}
    </span>
  );
}

function FieldOk({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="text-emerald-500 dark:text-emerald-400">
      <Ic.Check />
    </span>
  ) : null;
}

function OptionalBanner({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 mb-3">
      <span className="text-slate-400 dark:text-gray-500 flex-shrink-0">
        <Ic.Info />
      </span>
      <p className="text-[11px] text-slate-500 dark:text-gray-400">{text}</p>
    </div>
  );
}

function ModeCard({
  active,
  color = "danger",
  icon,
  label,
  description,
  onPress,
  disabled = false,
}: {
  active: boolean;
  color?: "danger" | "warning" | "success";
  icon: React.ReactNode;
  label: string;
  description: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const activeClass =
    color === "danger"
      ? "border-danger bg-danger-50 dark:bg-danger-900/20 shadow-lg shadow-danger/20"
      : color === "success"
        ? "border-success bg-success-50 dark:bg-success-900/20 shadow-lg shadow-success/20"
        : "border-warning bg-warning-50 dark:bg-warning-900/20 shadow-lg shadow-warning/20";

  const iconColor =
    color === "danger" ? "text-danger" : color === "success" ? "text-success" : "text-warning";
  const textColor =
    color === "danger" ? "text-danger" : color === "success" ? "text-success" : "text-warning";

  return (
    <Card
      isPressable={!disabled}
      onPress={disabled ? undefined : onPress}
      className={`border-2 transition-all duration-300 bg-white dark:bg-gray-700 ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:scale-[1.02]"
      } ${
        active
          ? activeClass
          : "border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400 hover:shadow-md"
      }`}
    >
      <CardBody className="flex flex-col items-center gap-2 py-4 text-center">
        <div className={`p-2 rounded-full ${active ? `bg-${color}/10` : "bg-gray-100 dark:bg-gray-600"}`}>
          <span className={active ? iconColor : "text-gray-500 dark:text-gray-300"}>{icon}</span>
        </div>
        <span className={`text-sm font-semibold ${active ? textColor : "text-gray-600 dark:text-gray-200"}`}>
          {label}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-400">{description}</span>
      </CardBody>
    </Card>
  );
}

// ── Modal de duplicado ────────────────────────────────────────────────────────
function DuplicadoModal({
  isOpen,
  participante,
  cursoSeleccionado,
  onUsarExistente,
  onCrearNuevo,
  onCancel,
  isLoading,
}: {
  isOpen: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  participante: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cursoSeleccionado: any | null;
  onUsarExistente: () => void;
  onCrearNuevo: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  if (!participante) return null;

  const nombreCompleto = [participante.nombre, participante.apellidoPaterno, participante.apellidoMaterno]
    .filter(Boolean)
    .join(" ");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cursosAnteriores: any[] = participante.inscripciones ?? [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      size="md"
      backdrop="blur"
      classNames={{
        base: "border border-warning-200 dark:border-warning-700 bg-gray-50 dark:bg-gray-800",
        header: "bg-warning-50 dark:bg-warning-900/30 border-b border-warning-200 dark:border-warning-700",
        body: "bg-gray-50 dark:bg-gray-800",
        footer: "bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600",
      }}
    >
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-warning-600 dark:text-warning-400" />
            <span className="text-warning-700 dark:text-warning-300 font-semibold text-base">
              Participante ya registrado
            </span>
          </div>
        </ModalHeader>

        <ModalBody className="py-5 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Encontramos un participante con datos similares. ¿Qué deseas hacer?
          </p>

          <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-100/60 dark:bg-gray-700/50 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{nombreCompleto}</p>
                <div className="mt-1 space-y-0.5">
                  {participante.correo && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{participante.correo}</p>
                  )}
                  {participante.celular && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tel: {participante.celular}</p>
                  )}
                  {participante.empresa && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Empresa: {participante.empresa.nombre}</p>
                  )}
                </div>
              </div>
              {participante.esAfiliado && (
                <Chip size="sm" color="warning" variant="flat">Afiliado</Chip>
              )}
            </div>

            {cursosAnteriores.length > 0 && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                  <BookOpenIcon className="w-3.5 h-3.5" />
                  Cursos anteriores ({cursosAnteriores.length})
                </p>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {cursosAnteriores.map((ins: any) => (
                    <div
                      key={ins.id}
                      className="flex items-center justify-between text-xs px-2 py-1 rounded-lg bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600"
                    >
                      <span className="text-gray-700 dark:text-gray-200 font-medium truncate">
                        {ins.curso?.nombre ?? "—"}
                      </span>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          ins.estadoPago === "PAGADO"
                            ? "success"
                            : ins.estadoPago === "CANCELADO"
                              ? "danger"
                              : "warning"
                        }
                        className="ml-2 flex-shrink-0"
                      >
                        {ins.estadoPago}
                      </Chip>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {cursoSeleccionado &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cursosAnteriores.some((i: any) => i.cursoId === cursoSeleccionado.id) && (
              <div className="flex items-start gap-2 rounded-xl bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-700 p-3">
                <ExclamationOutline className="w-4 h-4 text-danger-600 dark:text-danger-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-danger-700 dark:text-danger-300 font-medium">
                  Este participante ya está inscrito en{" "}
                  <strong>{cursoSeleccionado.nombre}</strong>.
                </p>
              </div>
            )}

          <div className="grid grid-cols-1 gap-2 pt-1">
            <button
              onClick={onUsarExistente}
              disabled={isLoading}
              className="flex items-center gap-3 p-3 rounded-xl border-2 border-success-300 dark:border-success-700 bg-success-50 dark:bg-success-900/20 hover:bg-success-100 dark:hover:bg-success-900/30 transition-all text-left group"
            >
              <div className="p-1.5 bg-success-100 dark:bg-success-900/40 rounded-full group-hover:scale-110 transition-transform">
                <CheckCircleSolid className="w-5 h-5 text-success-600 dark:text-success-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-success-700 dark:text-success-300">
                  Usar el participante existente
                </p>
                <p className="text-xs text-success-600 dark:text-success-400">
                  Conserva su historial y{" "}
                  {cursoSeleccionado ? "continúa a la inscripción" : "lo selecciona directamente"}
                </p>
              </div>
            </button>

            <button
              onClick={onCrearNuevo}
              disabled={isLoading}
              className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-left group"
            >
              <div className="p-1.5 bg-gray-100 dark:bg-gray-600 rounded-full group-hover:scale-110 transition-transform">
                <ArrowPathIcon className="w-5 h-5 text-gray-500 dark:text-gray-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                  Crear de todas formas
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Son personas distintas con datos similares
                </p>
              </div>
            </button>
          </div>
        </ModalBody>

        <ModalFooter className="border-t border-gray-200 dark:border-gray-600 pt-3">
          <Button
            variant="light"
            size="sm"
            onPress={onCancel}
            isDisabled={isLoading}
            className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Volver al formulario
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface ParticipanteModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess?: (participante: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  participanteToEdit?: any;
  cursoIdParaAsignar?: number | null;
  /** Cuando viene de un curso cerrado, la empresa queda fija y no se puede cambiar */
  empresaIdPreasignada?: number | null;
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function ParticipanteModal({
  isOpen,
  onClose,
  onSuccess,
  participanteToEdit,
  cursoIdParaAsignar,
  empresaIdPreasignada,
}: ParticipanteModalProps) {
  const { setOrigen } = useEmpresaModal();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [form, setForm] = useState<Record<string, any>>({ esAfiliado: false });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [duplicadoDetectado, setDuplicadoDetectado] = useState<any | null>(null);

  const [inscripcionModalOpen, setInscripcionModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [inscripcionData, setInscripcionData] = useState<any>(null);
  const [empresaModalOpen, setEmpresaModalOpen] = useState(false);

  const [empresaMode, setEmpresaMode] = useState<EmpresaMode>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [empresaSearch, setEmpresaSearch] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [empresaCompleta, setEmpresaCompleta] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [empresaCreada, setEmpresaCreada] = useState<any | null>(null);

  const [cursoMode, setCursoMode] = useState<CursoMode>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cursos, setCursos] = useState<any[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [cursoSearch, setCursoSearch] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cursoSeleccionado, setCursoSeleccionado] = useState<any | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timeouts = useRef<Record<string, any>>({});

  // ── ¿Viene de curso cerrado? ──────────────────────────────────────────────
  const empresaFija = !!empresaIdPreasignada;

  // ── Reset / pre-carga al abrir ────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setForm({ esAfiliado: false });
      setErrors({});
      setTouched({});
      setSubmitError(null);
      setDuplicadoDetectado(null);
      setEmpresaMode(null);
      setEmpresas([]);
      setEmpresaSearch("");
      setEmpresaSeleccionada(null);
      setEmpresaCompleta(null);
      setEmpresaCreada(null);
      setCursoMode(null);
      setCursos([]);
      setCursoSearch("");
      setCursoSeleccionado(null);
      setInscripcionModalOpen(false);
      setInscripcionData(null);
      setEmpresaModalOpen(false);
      return;
    }

    // ── Caso: empresa pre-asignada desde curso cerrado ────────────────────
    if (empresaIdPreasignada) {
      setEmpresaMode("buscar"); // modo buscar pero bloqueado
      obtenerEmpresa(empresaIdPreasignada)
        .then((emp) => {
          setEmpresaCompleta(emp);
          setEmpresaSeleccionada(emp);
          setForm((prev) => ({ ...prev, empresaId: emp.id }));
        })
        .catch(console.error);
    }

    if (participanteToEdit) {
      setForm({
        ...participanteToEdit,
        fechaNacimiento: participanteToEdit.fechaNacimiento
          ? participanteToEdit.fechaNacimiento.split("T")[0]
          : null,
      });
      if (participanteToEdit.empresaId && !empresaIdPreasignada) {
        setEmpresaMode("buscar");
        obtenerEmpresa(participanteToEdit.empresaId)
          .then((emp) => {
            setEmpresaCompleta(emp);
            setEmpresaSeleccionada(emp);
          })
          .catch(console.error);
      }
      if (participanteToEdit.cursoId) {
        setCursoMode("buscar");
        obtenerCursoPorId(participanteToEdit.cursoId)
          .then((curso) => {
            setCursoSeleccionado(curso);
            setCursoSearch(curso.nombre);
            setCursos([curso]);
          })
          .catch(console.error);
      }
      return;
    }

    if (cursoIdParaAsignar) {
      setCursoMode("buscar");
      obtenerCursoPorId(cursoIdParaAsignar)
        .then((curso) => {
          setCursoSeleccionado(curso);
          setForm((prev) => ({ ...prev, cursoId: curso.id }));
          setCursoSearch(curso.nombre);
          setCursos([curso]);
        })
        .catch(console.error);
    }
  }, [isOpen, participanteToEdit, cursoIdParaAsignar, empresaIdPreasignada]);

  useEffect(() => {
    if (form.empresaId && !empresaCompleta) {
      obtenerEmpresa(form.empresaId).then(setEmpresaCompleta).catch(console.error);
    }
  }, [form.empresaId, empresaCompleta]);

  // ── Búsquedas con debounce ────────────────────────────────────────────────
  const buscarEmpresasDebounced = (value: string) => {
    setEmpresaSearch(value);
    clearTimeout(timeouts.current["emp"]);
    if (!value || value.trim().length < 2) { setEmpresas([]); return; }
    timeouts.current["emp"] = setTimeout(async () => {
      try {
        setLoadingEmpresas(true);
        setEmpresas(await buscarEmpresas(value));
      } finally {
        setLoadingEmpresas(false);
      }
    }, 350);
  };

  const buscarCursosDebounced = (value: string) => {
    setCursoSearch(value);
    clearTimeout(timeouts.current["cur"]);
    if (!value || value.trim().length < 2) { setCursos([]); return; }
    timeouts.current["cur"] = setTimeout(async () => {
      try {
        setLoadingCursos(true);
        const res = await listarCursos({ search: value, limit: 20 });
        setCursos(res.data ?? []);
      } finally {
        setLoadingCursos(false);
      }
    }, 350);
  };

  // ── Handlers de modo ─────────────────────────────────────────────────────
  const handleEmpresaMode = (mode: EmpresaMode) => {
    // Bloquear cambio si la empresa viene pre-asignada
    if (empresaFija) return;
    if (mode === empresaMode) return;
    setEmpresaMode(mode);
    setEmpresas([]);
    setEmpresaSearch("");
    setEmpresaSeleccionada(null);
    setEmpresaCompleta(null);
    setEmpresaCreada(null);
    handleChange("empresaId", null);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEmpresaCreada = (empresa: any) => {
    setEmpresaCreada(empresa);
    setEmpresaCompleta(empresa);
    handleChange("empresaId", empresa.id);
    setEmpresaModalOpen(false);
  };

  const handleCursoMode = (mode: CursoMode) => {
    if (mode === cursoMode) return;
    setCursoMode(mode);
    setCursos([]);
    setCursoSearch("");
    setCursoSeleccionado(null);
    handleChange("cursoId", null);
  };

  // ── Handlers de campo ────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (field: string, value: any) => {
    const v = value === "" ? null : value;
    setForm((prev) => ({ ...prev, [field]: v }));
  };

  const handleBlur = (field: string) => {
    setTouched((p) => ({ ...p, [field]: true }));
  };

  const resetParticipantFormForNext = () => {
    setForm((prev) => ({
      esAfiliado: false,
      empresaId: prev.empresaId,
      cursoId: prev.cursoId,
    }));
    setErrors({});
    setTouched({});
    setSubmitError(null);
    setDuplicadoDetectado(null);
    setInscripcionData(null);
  };

  const handleInscripcionModalClose = () => {
    setInscripcionModalOpen(false);
    setInscripcionData(null);
    if (!empresaIdPreasignada) onClose();
  };

  const handleInscripcionSuccess = () => {
    setInscripcionModalOpen(false);
    setInscripcionData(null);
    if (empresaIdPreasignada) {
      resetParticipantFormForNext();
    } else {
      onClose();
    }
    onSuccess?.(inscripcionData?.participante);
  };

  // ── Payload ──────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildPayload = (extras: Record<string, any> = {}) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = {
      esAfiliado: form.esAfiliado ?? false,
      ...extras,
    };
    const campos = [
      "nombre", "apellidoPaterno", "apellidoMaterno", "fechaNacimiento",
      "celular", "correo", "curp", "rfc", "calle", "colonia", "cp",
    ];
    for (const campo of campos) {
      if (form[campo] !== null && form[campo] !== undefined && form[campo] !== "") {
        payload[campo] = form[campo];
      }
    }
    // Empresa: si viene pre-asignada tiene prioridad, si no usa la del form
    const empId = empresaIdPreasignada ?? form.empresaId;
    if (empId) payload.empresaId = Number(empId);
    return payload;
  };

  // ── Post-guardado ────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const afterParticipante = (participante: any) => {
    if (cursoMode === "buscar" && cursoSeleccionado) {
      setInscripcionData({ participante, curso: cursoSeleccionado });
      setInscripcionModalOpen(true);
    } else {
      onSuccess?.(participante);
      onClose();
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    // Si la empresa es fija, no validamos el modo empresa (ya está resuelta)
    if (!empresaFija) {
      if (!empresaMode) {
        sileo.warning({
          title: "Sección Empresa incompleta",
          description: "Debes seleccionar una opción: Buscar empresa, Crear empresa o Sin empresa.",
        });
        return;
      }
      if (empresaMode === "buscar" && !form.empresaId) {
        sileo.warning({
          title: "Empresa no seleccionada",
          description: "Buscaste una empresa pero no seleccionaste ninguna.",
        });
        return;
      }
      if (empresaMode === "crear" && !empresaCreada) {
        sileo.warning({
          title: "Empresa sin crear",
          description: 'Haz clic en "Crear empresa" antes de guardar.',
        });
        return;
      }
    }

    if (!cursoMode) {
      sileo.warning({
        title: "Sección Curso incompleta",
        description: "Debes seleccionar una opción: Buscar curso o Inscribir después.",
      });
      return;
    }
    if (cursoMode === "buscar" && !cursoSeleccionado) {
      sileo.warning({
        title: "Curso no seleccionado",
        description: "Buscaste un curso pero no seleccionaste ninguno.",
      });
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      if (participanteToEdit) {
        const response = await actualizarParticipante(participanteToEdit.id, buildPayload());
        sileo.success({ title: "¡Actualizado!", description: "El participante fue actualizado correctamente." });
        onSuccess?.(response);
        onClose();
      } else {
        const response = await crearParticipante(buildPayload());
        sileo.success({ title: "¡Registro exitoso!", description: "El participante fue guardado correctamente." });
        afterParticipante(response.data || response);
      }
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      const status = error?.response?.status;
      const data   = error?.response?.data;

      if (status === 409 && data?.code === "PARTICIPANTE_DUPLICADO") {
        setDuplicadoDetectado(data.data);
        return;
      }
      if (status === 400 && Array.isArray(data?.details)) {
        const backendErrors: Record<string, string> = {};
        for (const e of data.details) {
          if (e.field) backendErrors[e.field] = e.message;
        }
        setErrors(backendErrors);
        setTouched(Object.fromEntries(Object.keys(backendErrors).map((k) => [k, true])));
        sileo.warning({ title: "Datos inválidos", description: "Revisa los campos marcados." });
        return;
      }

      const msg = data?.message ?? data?.error ?? error?.message ?? "Error desconocido";
      setSubmitError(typeof msg === "string" ? msg : JSON.stringify(msg, null, 2));
      sileo.error({ title: "Error al registrar", description: "Revisa los datos e inténtalo de nuevo." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Duplicado ────────────────────────────────────────────────────────────
  const handleUsarExistente = () => {
    const p = duplicadoDetectado;
    setDuplicadoDetectado(null);
    sileo.success({ title: "Participante seleccionado", description: `${p.nombre} ${p.apellidoPaterno} fue seleccionado.` });
    afterParticipante(p);
  };

  const handleForzarCreacion = async () => {
    setDuplicadoDetectado(null);
    setIsSubmitting(true);
    try {
      const response = await crearParticipante(buildPayload({ forzar: true }));
      sileo.success({ title: "¡Registro exitoso!", description: "El participante fue guardado correctamente." });
      afterParticipante(response.data || response);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.response?.data?.message ?? (err as any)?.message ?? "Error desconocido";
      setSubmitError(typeof msg === "string" ? msg : "Error al crear participante");
      sileo.error({ title: "Error al registrar", description: "Revisa los datos e inténtalo de nuevo." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Estilos reutilizables ────────────────────────────────────────────────
  const inputCN = {
    inputWrapper: [
      "border border-slate-200 dark:border-gray-600",
      "bg-white dark:bg-gray-700",
      "shadow-sm transition-all duration-200",
      "hover:border-indigo-300 dark:hover:border-indigo-500",
      "focus-within:border-indigo-500 dark:focus-within:border-indigo-400",
      "focus-within:shadow-md focus-within:shadow-indigo-100/60 dark:focus-within:shadow-indigo-900/40",
      "data-[invalid=true]:border-rose-400 data-[invalid=true]:bg-rose-50/30",
      "dark:data-[invalid=true]:border-rose-500 dark:data-[invalid=true]:bg-rose-900/20",
    ].join(" "),
    label: "text-slate-600 dark:text-gray-300 text-xs font-medium",
    input: "text-slate-800 dark:text-gray-100 text-sm font-medium placeholder:text-slate-300 dark:placeholder:text-gray-500",
    errorMessage: "text-rose-500 dark:text-rose-400 text-[11px] font-medium mt-1",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inp = (field: string, label: string, required = false, extra: any = {}) => ({
    label: (<RequiredLabel label={label} required={required} />) as never,
    size: "sm" as const,
    variant: "bordered" as const,
    radius: "lg" as const,
    isInvalid: !!(touched[field] && errors[field]),
    errorMessage: touched[field] ? (errors[field] ?? undefined) : undefined,
    onBlur: () => handleBlur(field),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange(field, e.target.value),
    classNames: inputCN,
    ...extra,
  });

  const acCN = {
    base: "w-full",
    listboxWrapper: "shadow-2xl rounded-2xl border border-slate-100 dark:border-gray-600 overflow-hidden",
    selectorButton: "text-slate-400 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors",
  };

  const acInp = {
    classNames: {
      inputWrapper: [
        "border border-slate-200 dark:border-gray-600",
        "bg-white dark:bg-gray-700",
        "shadow-sm",
        "hover:border-indigo-300 dark:hover:border-indigo-500",
        "focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:shadow-md",
        "data-[invalid=true]:border-rose-400 dark:data-[invalid=true]:border-rose-500",
      ].join(" "),
      label: "text-slate-600 dark:text-gray-300 text-xs font-medium",
      input: "text-slate-800 dark:text-gray-100 text-sm font-medium",
    },
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <ModalForm
        isOpen={isOpen}
        onClose={onClose}
        title={participanteToEdit ? "Editar Participante" : "Nuevo Participante"}
        size="3xl"
        isLoading={isSubmitting}
        onSubmit={handleSubmit}
        submitText={participanteToEdit ? "Actualizar participante" : "Crear participante"}
      >
        <div className="space-y-6 px-1">

          {/* Banner de error del servidor */}
          {submitError && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
              <span className="text-rose-500 dark:text-rose-400 flex-shrink-0 mt-0.5">
                <Ic.AlertCircle />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">Error del servidor</p>
                <pre className="text-xs text-rose-600 dark:text-rose-400 mt-0.5 whitespace-pre-wrap break-words font-mono">
                  {submitError}
                </pre>
              </div>
              <button
                onClick={() => setSubmitError(null)}
                className="text-rose-400 hover:text-rose-600 dark:text-rose-500 dark:hover:text-rose-300"
              >
                <Ic.X />
              </button>
            </div>
          )}

          {/* ══ 1. DATOS PERSONALES ══ */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-200 flex items-center gap-2">
              <Ic.User /> Datos personales
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                {...inp("nombre", "Nombre", true)}
                value={form.nombre ?? ""}
                endContent={<FieldOk ok={!!form.nombre && !errors.nombre} />}
              />
              <Input
                {...inp("apellidoPaterno", "Apellido Paterno", true)}
                value={form.apellidoPaterno ?? ""}
                endContent={<FieldOk ok={!!form.apellidoPaterno && !errors.apellidoPaterno} />}
              />
              <Input
                {...inp("apellidoMaterno", "Apellido Materno")}
                value={form.apellidoMaterno ?? ""}
              />
              <DatePicker
                label={(<RequiredLabel label="Fecha de Nacimiento" required />) as never}
                size="sm"
                variant="bordered"
                radius="lg"
                value={form.fechaNacimiento ? parseDate(form.fechaNacimiento) : null}
                onChange={(date: CalendarDate | null) => {
                  handleChange("fechaNacimiento", date ? date.toString() : null);
                  setTouched((p) => ({ ...p, fechaNacimiento: true }));
                }}
                isInvalid={!!(touched.fechaNacimiento && errors.fechaNacimiento)}
                errorMessage={touched.fechaNacimiento ? errors.fechaNacimiento : undefined}
                showMonthAndYearPickers
                granularity="day"
                dateInput={{ locale: "es-MX", inputProps: { placeholder: "dd/mm/aaaa" } }}
                classNames={{ ...inputCN, selectorButton: "text-danger" }}
                maxValue={parseDate(new Date().toISOString().split("T")[0])}
              />
              <Input
                {...inp("celular", "Celular")}
                value={form.celular ?? ""}
                maxLength={10}
                type="tel"
                description="10 dígitos"
                endContent={form.celular && !errors.celular ? <FieldOk ok /> : null}
              />
              <Input
                {...inp("correo", "Correo electrónico")}
                value={form.correo ?? ""}
                type="email"
                endContent={form.correo && !errors.correo ? <FieldOk ok /> : null}
              />
            </div>

            {/* Toggle afiliado */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-indigo-50/80 to-blue-50/60 dark:from-indigo-900/20 dark:to-blue-900/10 border border-indigo-100/60 dark:border-indigo-800/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white">
                  <Ic.Star />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-gray-200">Participante Afiliado</p>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400">
                    {form.esAfiliado ? "Requerirá seleccionar empresa" : "Actívalo si aplica"}
                  </p>
                </div>
              </div>
              <Switch
                isSelected={form.esAfiliado}
                onValueChange={(val) => handleChange("esAfiliado", val)}
                size="sm"
                color="primary"
              />
            </div>
          </div>

          {/* ══ 2. DIRECCIÓN ══ */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-200 flex items-center gap-2">
              <Ic.MapPin /> Dirección{" "}
              <span className="text-[10px] font-normal text-slate-400 dark:text-gray-500">(opcional)</span>
            </h3>
            <OptionalBanner text="Todos los campos de dirección son opcionales." />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  {...inp("calle", "Calle")}
                  value={form.calle ?? ""}
                  endContent={form.calle && !errors.calle ? <FieldOk ok /> : null}
                />
              </div>
              <Input
                {...inp("colonia", "Colonia")}
                value={form.colonia ?? ""}
                endContent={form.colonia && !errors.colonia ? <FieldOk ok /> : null}
              />
              <Input
                {...inp("cp", "Código Postal")}
                value={form.cp ?? ""}
                maxLength={5}
                description="5 dígitos"
                endContent={form.cp && !errors.cp ? <FieldOk ok /> : null}
              />
            </div>
          </div>

          {/* ══ 3. DATOS FISCALES ══ */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-200 flex items-center gap-2">
              <Ic.Receipt /> Datos fiscales{" "}
              <span className="text-[10px] font-normal text-slate-400 dark:text-gray-500">(opcional)</span>
            </h3>
            <OptionalBanner text="CURP y RFC opcionales. Se validará el formato si los proporcionas." />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                {...inp("curp", "CURP")}
                value={form.curp ?? ""}
                description="18 caracteres"
                maxLength={18}
                onChange={(e) =>
                  handleChange("curp", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                }
                endContent={form.curp && !errors.curp ? <FieldOk ok /> : null}
              />
              <Input
                {...inp("rfc", "RFC")}
                value={form.rfc ?? ""}
                description="12-13 caracteres"
                maxLength={13}
                onChange={(e) =>
                  handleChange("rfc", e.target.value.toUpperCase().replace(/[^A-ZÑ&0-9]/g, ""))
                }
                endContent={form.rfc && !errors.rfc ? <FieldOk ok /> : null}
              />
            </div>
          </div>

          {/* ══ 4. EMPRESA ══ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Ic.Building />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-200">Empresa</h3>
              {/* Indicador especial cuando viene pre-asignada */}
              {empresaFija ? (
                <Chip
                  size="sm" variant="flat" color="primary" className="ml-2"
                  startContent={<LockClosedIcon className="w-3 h-3" />}
                >
                  Asignada por curso cerrado
                </Chip>
              ) : form.esAfiliado ? (
                <Chip size="sm" variant="flat" color="warning" className="ml-2">
                  Requerido para afiliados
                </Chip>
              ) : (
                <Chip size="sm" variant="flat" color="default" className="ml-2">
                  Opcional
                </Chip>
              )}
            </div>
            <Divider className="bg-gray-200 dark:bg-gray-600" />

            {/* Empresa fija desde curso cerrado: solo mostrar info, sin controles */}
            {empresaFija ? (
              empresaCompleta ? (
                <div className="flex items-center gap-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 p-4">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/40 rounded-full">
                    <LockClosedIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                      {empresaCompleta.nombre}
                    </p>
                    <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">
                      RFC: {empresaCompleta.rfc}
                    </p>
                    {empresaCompleta.saldoFecapDisponible !== undefined && (
                      <p className="text-xs text-primary-500 mt-0.5">
                        Saldo FECAP: ${empresaCompleta.saldoFecapDisponible.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <Chip size="sm" variant="flat" color="primary">Fija</Chip>
                </div>
              ) : (
                <div className="flex justify-center py-4">
                  <Spinner size="sm" color="primary" />
                </div>
              )
            ) : (
              /* Controles normales cuando NO viene pre-asignada */
              <>
                {form.esAfiliado && (
                  <div className="flex items-start gap-3 rounded-xl bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-700 p-3">
                    <ExclamationTriangleIcon className="w-4 h-4 text-warning-600 dark:text-warning-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-warning-700 dark:text-warning-400 font-medium">
                      El participante es afiliado — debes asociarle una empresa.
                    </p>
                  </div>
                )}

                {empresaCompleta && (
                  <Card className="bg-primary-50/30 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800">
                    <CardBody className="flex flex-row items-center gap-4">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        <CurrencyDollarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800 dark:text-gray-100">{empresaCompleta.nombre}</p>
                        <div className="flex gap-4 mt-1 text-xs">
                          <span className="text-primary-600 dark:text-primary-400">
                            Saldo FECAP: ${empresaCompleta.saldoFecapDisponible?.toFixed(2) ?? "0.00"}
                          </span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <ModeCard
                    active={empresaMode === "buscar"}
                    color="danger"
                    icon={<MagnifyingGlassIcon className="w-6 h-6" />}
                    label="Buscar empresa"
                    description="Selecciona de la base"
                    onPress={() => handleEmpresaMode("buscar")}
                  />
                  <ModeCard
                    active={empresaMode === "crear"}
                    color="success"
                    icon={<PlusCircleIcon className="w-6 h-6" />}
                    label="Crear empresa"
                    description="Registra una nueva"
                    onPress={() => handleEmpresaMode("crear")}
                  />
                  <ModeCard
                    active={empresaMode === "despues"}
                    color="warning"
                    icon={<ClockIcon className="w-6 h-6" />}
                    label="Sin empresa"
                    description="No aplica"
                    onPress={() => handleEmpresaMode("despues")}
                  />
                </div>

                {empresaMode === "buscar" && (
                  <div className="mt-3">
                    {empresaSeleccionada && form.empresaId ? (
                      <div className="flex items-center gap-3 rounded-xl bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-700 p-4">
                        <CheckCircleIcon className="w-5 h-5 text-success-600 dark:text-success-400 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-success-700 dark:text-success-300 font-semibold">
                            {empresaSeleccionada.nombre}
                          </p>
                          {empresaSeleccionada.rfc && (
                            <p className="text-xs text-success-600 dark:text-success-400 mt-0.5">
                              RFC: {empresaSeleccionada.rfc}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="light"
                          color="success"
                          onPress={() => {
                            setEmpresaSeleccionada(null);
                            setEmpresaCompleta(null);
                            handleChange("empresaId", null);
                            setEmpresaSearch("");
                            setEmpresas([]);
                          }}
                        >
                          Cambiar
                        </Button>
                      </div>
                    ) : (
                      <Autocomplete
                        label={(<RequiredLabel label="Buscar empresa" required={form.esAfiliado} />) as never}
                        size="sm"
                        variant="bordered"
                        radius="lg"
                        inputValue={empresaSearch}
                        isInvalid={!!(touched.empresaId && errors.empresaId)}
                        errorMessage={touched.empresaId ? (errors.empresaId ?? undefined) : undefined}
                        onInputChange={buscarEmpresasDebounced}
                        onSelectionChange={(key) => {
                          if (!key) {
                            handleChange("empresaId", null);
                            setEmpresaSeleccionada(null);
                            setEmpresaCompleta(null);
                            return;
                          }
                          const found = empresas.find((e) => String(e.id) === String(key));
                          if (found) {
                            handleChange("empresaId", Number(key));
                            setEmpresaSeleccionada(found);
                            obtenerEmpresa(Number(key)).then(setEmpresaCompleta).catch(console.error);
                          }
                          setTouched((p) => ({ ...p, empresaId: true }));
                        }}
                        isLoading={loadingEmpresas}
                        placeholder="Escribe el nombre de la empresa..."
                        classNames={acCN}
                        inputProps={acInp}
                        listboxProps={{
                          emptyContent: loadingEmpresas ? (
                            <div className="flex justify-center py-5">
                              <Spinner size="sm" color="primary" />
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 dark:text-gray-500 text-center py-4">
                              Sin resultados — escribe para buscar
                            </p>
                          ),
                        }}
                      >
                        {empresas.map((emp) => (
                          <AutocompleteItem key={emp.id} textValue={emp.nombre}>
                            <div className="flex items-center gap-2.5 py-1">
                              <Avatar
                                name={emp.nombre.charAt(0)}
                                size="sm"
                                className="w-7 h-7 text-tiny bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold"
                              />
                              <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-gray-100">{emp.nombre}</p>
                                {emp.rfc && <p className="text-[11px] text-slate-500 dark:text-gray-400">{emp.rfc}</p>}
                              </div>
                            </div>
                          </AutocompleteItem>
                        ))}
                      </Autocomplete>
                    )}
                  </div>
                )}

                {empresaMode === "crear" && (
                  <div className="mt-3">
                    {empresaCreada ? (
                      <div className="flex items-center gap-3 rounded-xl bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-700 p-4">
                        <CheckCircleIcon className="w-5 h-5 text-success-600 dark:text-success-400 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-success-700 dark:text-success-300 font-semibold">
                            {empresaCreada.nombre}
                            <Chip size="sm" color="success" variant="flat" className="ml-2">
                              Creada y asignada
                            </Chip>
                          </p>
                          <p className="text-xs text-success-600 dark:text-success-400 mt-0.5">
                            RFC: {empresaCreada.rfc}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="light"
                          color="success"
                          onPress={() => {
                            setEmpresaCreada(null);
                            setEmpresaCompleta(null);
                            handleChange("empresaId", null);
                          }}
                        >
                          Cambiar
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-900/10 p-4 space-y-3">
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                          <PlusCircleIcon className="w-4 h-4" />
                          Se abrirá un formulario para registrar la nueva empresa
                        </p>
                        <Button
                          color="success"
                          variant="flat"
                          size="sm"
                          startContent={<PlusCircleIcon className="w-4 h-4" />}
                          onPress={() => {
                            setOrigen("participante");
                            setEmpresaModalOpen(true);
                          }}
                          className="w-full font-semibold"
                        >
                          Crear nueva empresa
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {empresaMode === "despues" && (
                  <div className="flex items-start gap-3 rounded-xl bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-700 p-4 mt-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-warning-600 dark:text-warning-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-warning-700 dark:text-warning-300">Sin empresa</p>
                      <p className="text-xs text-warning-600 dark:text-warning-400 mt-1">
                        El participante se guardará sin empresa asociada.
                      </p>
                    </div>
                  </div>
                )}

                {!empresaMode && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                    <ExclamationTriangleIcon className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                    <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">
                      Debes seleccionar una opción para continuar
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ══ 5. CURSO ══ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Ic.Book />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-200">Curso</h3>
              <Chip size="sm" variant="flat" color="default" className="ml-2">
                Opcional
              </Chip>
            </div>
            <Divider className="bg-gray-200 dark:bg-gray-600" />

            <div className="grid grid-cols-2 gap-3">
              <ModeCard
                active={cursoMode === "buscar"}
                color="danger"
                icon={<MagnifyingGlassIcon className="w-6 h-6" />}
                label="Buscar curso"
                description="Selecciona de la base"
                onPress={() => handleCursoMode("buscar")}
              />
              <ModeCard
                active={cursoMode === "despues"}
                color="warning"
                icon={<ClockIcon className="w-6 h-6" />}
                label="Inscribir después"
                description="Pendiente"
                onPress={() => handleCursoMode("despues")}
              />
            </div>

            {cursoMode === "buscar" && (
              <div className="mt-3">
                {cursoSeleccionado && form.cursoId ? (
                  <div className="flex items-center gap-3 rounded-xl bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-700 p-4">
                    <CheckCircleIcon className="w-5 h-5 text-success-600 dark:text-success-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-success-700 dark:text-success-300 font-semibold">
                        {cursoSeleccionado.nombre}
                      </p>
                      {cursoSeleccionado.instructor && (
                        <p className="text-xs text-success-600 dark:text-success-400 mt-0.5">
                          {cursoSeleccionado.instructor?.nombre}{" "}
                          {cursoSeleccionado.instructor?.apellidoPaterno}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="light"
                      color="success"
                      onPress={() => {
                        setCursoSeleccionado(null);
                        handleChange("cursoId", null);
                        setCursoSearch("");
                        setCursos([]);
                      }}
                    >
                      Cambiar
                    </Button>
                  </div>
                ) : (
                  <Autocomplete
                    label="Buscar curso"
                    size="sm"
                    variant="bordered"
                    radius="lg"
                    inputValue={cursoSearch}
                    onInputChange={buscarCursosDebounced}
                    onSelectionChange={(key) => {
                      if (!key) {
                        handleChange("cursoId", null);
                        setCursoSeleccionado(null);
                        return;
                      }
                      const found = cursos.find((c) => String(c.id) === String(key));
                      if (found) {
                        handleChange("cursoId", Number(key));
                        setCursoSeleccionado(found);
                      }
                    }}
                    isLoading={loadingCursos}
                    placeholder="Escribe el nombre del curso..."
                    classNames={acCN}
                    inputProps={acInp}
                    listboxProps={{
                      emptyContent: loadingCursos ? (
                        <div className="flex justify-center py-5">
                          <Spinner size="sm" color="primary" />
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 dark:text-gray-500 text-center py-4">
                          Sin resultados — escribe para buscar
                        </p>
                      ),
                    }}
                  >
                    {cursos.map((curso) => (
                      <AutocompleteItem key={curso.id} textValue={curso.nombre}>
                        <div className="py-0.5">
                          <p className="text-sm font-semibold text-slate-800 dark:text-gray-100">{curso.nombre}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <p className="text-[11px] text-slate-500 dark:text-gray-400">
                              {new Date(curso.fechaInicio).toLocaleDateString("es-MX", {
                                day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
                              })}
                              {" → "}
                              {new Date(curso.fechaFin).toLocaleDateString("es-MX", {
                                day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
                              })}
                            </p>
                            {curso.instructor && (
                              <p className="text-[11px] text-slate-500 dark:text-gray-400">
                                · {curso.instructor.nombre} {curso.instructor.apellidoPaterno}
                              </p>
                            )}
                          </div>
                        </div>
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>
                )}
              </div>
            )}

            {cursoMode === "despues" && (
              <div className="flex items-start gap-3 rounded-xl bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-700 p-4 mt-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-warning-600 dark:text-warning-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-warning-700 dark:text-warning-300">Inscripción pendiente</p>
                  <p className="text-xs text-warning-600 dark:text-warning-400 mt-1">
                    El participante se guardará sin curso. Puedes inscribirlo después.
                  </p>
                </div>
              </div>
            )}

            {!cursoMode && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                <ExclamationTriangleIcon className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">
                  Debes seleccionar una opción para continuar
                </p>
              </div>
            )}
          </div>

        </div>
      </ModalForm>

      {/* Modal: Duplicado */}
      <DuplicadoModal
        isOpen={!!duplicadoDetectado}
        participante={duplicadoDetectado}
        cursoSeleccionado={cursoSeleccionado}
        onUsarExistente={handleUsarExistente}
        onCrearNuevo={handleForzarCreacion}
        onCancel={() => setDuplicadoDetectado(null)}
        isLoading={isSubmitting}
      />

      {/* Modal: Crear empresa (solo si no viene pre-asignada) */}
      {!empresaFija && (
        <EmpresaModal
          isOpen={empresaModalOpen}
          onClose={() => setEmpresaModalOpen(false)}
          onSuccess={handleEmpresaCreada}
        />
      )}

      {/* Modal: Inscripción */}
      {inscripcionData && empresaIdPreasignada ? (
        <InscripcionCerradaModal
          isOpen={inscripcionModalOpen}
          onClose={handleInscripcionModalClose}
          onSuccess={handleInscripcionSuccess}
          participante={inscripcionData.participante}
          curso={inscripcionData.curso}
          empresa={empresaCompleta}
        />
      ) : inscripcionData ? (
        <InscripcionModal
          isOpen={inscripcionModalOpen}
          onClose={handleInscripcionModalClose}
          onSuccess={handleInscripcionSuccess}
          participante={inscripcionData.participante}
          curso={inscripcionData.curso}
          empresa={empresaCompleta}
        />
      ) : null}
    </>
  );
}