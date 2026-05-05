import { useEffect, useState } from "react";
import {
  Button, Input, Textarea, Select, SelectItem, Switch,
  DateRangePicker, Autocomplete, AutocompleteItem,
  Card, CardBody, Divider, Chip, Progress,
} from "@heroui/react";
import { useDebounce } from "use-debounce";
import { parseDate } from "@internationalized/date";
import { sileo } from "sileo";
import {
  BuildingOffice2Icon, MagnifyingGlassIcon, PlusCircleIcon,
  AcademicCapIcon, CurrencyDollarIcon, CalendarIcon, MapPinIcon,
  DocumentTextIcon, ClockIcon, ChevronDownIcon, UserPlusIcon,
  CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon,
  UsersIcon, CalculatorIcon, UserIcon,
} from "@heroicons/react/24/outline";

import { buscarInstructores }        from "../../../services/instructorService";
import { buscarEmpresas }            from "../../../services/empresaService";
import { crearParticipante }         from "../../../services/participanteService";
import { crearInscripcionCursoCerrado } from "../../../services/inscripcionService";
import { actualizarCurso }            from "../../../services/cursoService";
import { apiClient }                 from "../../../services/api/client";
import InstructorModal               from "../Instructor/instructorModal";
import EmpresaModal                  from "../Empresa/empresaModal";
import { EmpresaModalProvider }      from "../Empresa/EmpresaModalContext";
import ModalForm                     from "../../common/modalForm";
import { useCamposCurso }            from "../../../hooks/UseCamposCurso";

interface CursoCerradoModalProps {
  isOpen:        boolean;
  onClose:       () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCursoCreado: (curso: any) => Promise<any>;
  isLoading?:    boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cursoToEdit?:  any;
}

const NIVELES = [
  { key: "Operativo", label: "Operativo", description: "Supervisores y coordinadores" },
  { key: "Medio",     label: "Medio",     description: "Jefes de área y gerentes"     },
  { key: "Directivo", label: "Directivo", description: "Directores y alta dirección"  },
];

type InstructorMode = "buscar" | "crear" | "despues";
type EmpresaMode    = "buscar" | "crear";

const CURSO_INITIAL = {
  nombre: "", descripcion: "", duracion: "",
  horario: "", fechaInicio: "", fechaFin: "",
  aula: "", nivelGerencial: "", activo: true,
  instructorId: null as number | null,
};

const PARTICIPANTE_INITIAL = {
  nombre: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  fechaNacimiento: "",
  correo: "",
  celular: "",
  esAfiliado: false,
};

export default function CursoCerradoModal({
  isOpen, onClose, onCursoCreado, isLoading = false, cursoToEdit,
}: CursoCerradoModalProps) {

  const isEditMode = !!cursoToEdit;

  const [paso, setPaso] = useState(1);


  const [form, setForm]       = useState({ ...CURSO_INITIAL });
  const [errors, setErrors]   = useState<Record<string, string>>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dateRange, setDateRange] = useState<any>(null);

  const {
    preciosCerrado, setPreciosCerrado,
    costoTotal, numP, precioPorP,
    resetPrecios, buildPreciosPayload, validatePrecios,
  } = useCamposCurso("CERRADO");

  const [instructorMode, setInstructorMode]           = useState<InstructorMode | null>(null);
  const [instructorSearch, setInstructorSearch]       = useState("");
  const [debouncedInstSearch]                         = useDebounce(instructorSearch, 400);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [instructores, setInstructores]               = useState<any[]>([]);
  const [loadingInst, setLoadingInst]                 = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [instructorSel, setInstructorSel]             = useState<any | null>(null);
  const [modalInstructorOpen, setModalInstructorOpen] = useState(false);

  const [empresaMode, setEmpresaMode]             = useState<EmpresaMode>("buscar");
  const [empresaSearch, setEmpresaSearch]         = useState("");
  const [debouncedEmpSearch]                      = useDebounce(empresaSearch, 400);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [empresas, setEmpresas]                   = useState<any[]>([]);
  const [loadingEmp, setLoadingEmp]               = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [empresaSel, setEmpresaSel]               = useState<any | null>(null);
  const [empresaErrors, setEmpresaErrors]         = useState<Record<string, string>>({});
  const [modalEmpresaOpen, setModalEmpresaOpen]   = useState(false);

  // ── Paso 4: Alta de participantes ───────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cursoCreado, setCursoCreado]             = useState<any | null>(null);
  const [participanteForm, setParticipanteForm]   = useState({ ...PARTICIPANTE_INITIAL });
  const [participanteErrors, setParticipanteErrors] = useState<Record<string, string>>({});
  const [participantesRegistrados, setParticipantesRegistrados] = useState(0);
  const [isSubmittingParticipante, setIsSubmittingParticipante] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [participantesLista, setParticipantesLista] = useState<any[]>([]);

  // ── Reset al cerrar ─────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setPaso(1);
      setForm({ ...CURSO_INITIAL });
      setErrors({});
      setDateRange(null);
      resetPrecios();
      setInstructorMode(null);
      setInstructorSearch(""); setInstructores([]); setInstructorSel(null);
      setEmpresaMode("buscar");
      setEmpresaSearch(""); setEmpresas([]); setEmpresaSel(null); setEmpresaErrors({});
      setCursoCreado(null);
      setParticipanteForm({ ...PARTICIPANTE_INITIAL });
      setParticipanteErrors({});
      setParticipantesRegistrados(0);
      setIsSubmittingParticipante(false);
      setParticipantesLista([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Modo edición: pre-cargar datos del curso existente ──
  useEffect(() => {
    if (!isOpen || !cursoToEdit) return;

    const curso = cursoToEdit;

    const fi = curso.fechaInicio ? curso.fechaInicio.split("T")[0] : "";
    const ff = curso.fechaFin ? curso.fechaFin.split("T")[0] : "";

    setForm({
      nombre:          curso.nombre ?? "",
      descripcion:     curso.descripcion ?? "",
      duracion:        curso.duracion?.toString() ?? "",
      horario:         curso.horario ?? "",
      fechaInicio:     fi,
      fechaFin:        ff,
      aula:            curso.aula ?? "",
      nivelGerencial:  curso.nivelGerencial ?? "",
      activo:          curso.activo ?? true,
      instructorId:    curso.instructorId ?? null,
    });

    if (fi && ff) {
      try {
        setDateRange({ start: parseDate(fi), end: parseDate(ff) });
      } catch { /* formato inválido — dejar vacío */ }
    }

    if (curso.instructor) {
      setInstructorSel(curso.instructor);
      setInstructorMode("buscar");
    } else {
      setInstructorMode("despues");
    }

    if (curso.empresa) {
      setEmpresaSel(curso.empresa);
    }

    const precio = curso.precioPublico ?? curso.precioAfiliado ?? 0;
    // _count.inscripciones viene del listado, numParticipantes del modelo
    const inscritosActuales = curso._count?.inscripciones ?? 0;
    const numPart = curso.numParticipantes ?? inscritosActuales ?? 1;
    setPreciosCerrado({
      precioPorParticipante: precio.toString(),
      numParticipantes:      numPart.toString(),
    });

    setCursoCreado(curso);
    setPaso(1);

    apiClient.get(`/cursos/${curso.id}/inscripciones`).then((res) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inscripciones = res.data?.data ?? [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const participantes = inscripciones.map((insc: any) => insc.participante).filter(Boolean);
      setParticipantesLista(participantes);
      setParticipantesRegistrados(participantes.length);
    }).catch(console.error);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, cursoToEdit]);

  useEffect(() => {
    if (instructorMode !== "buscar" || !debouncedInstSearch || debouncedInstSearch.length < 2) {
      setInstructores([]); return;
    }
    setLoadingInst(true);
    buscarInstructores(debouncedInstSearch).then(setInstructores).finally(() => setLoadingInst(false));
  }, [debouncedInstSearch, instructorMode]);

  useEffect(() => {
    if (empresaMode !== "buscar" || !debouncedEmpSearch || debouncedEmpSearch.length < 2) {
      setEmpresas([]); return;
    }
    setLoadingEmp(true);
    buscarEmpresas(debouncedEmpSearch).then(setEmpresas).finally(() => setLoadingEmp(false));
  }, [debouncedEmpSearch, empresaMode]);

  const handleChange = (field: string, value: unknown) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDateRangeChange = (range: any) => {
    setDateRange(range);
    const fi = range?.start ? range.start.toString() : "";
    const ff = range?.end   ? range.end.toString()   : "";
    setForm((p) => ({ ...p, fechaInicio: fi, fechaFin: ff }));
    setErrors((p) => ({ ...p, fechaInicio: "", fechaFin: "" }));
  };

  const validatePaso1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.nombre || form.nombre.trim().length < 3) e.nombre = "Mínimo 3 caracteres";
    if (!form.aula)           e.aula           = "Aula requerida";
    if (!form.nivelGerencial) e.nivelGerencial = "Nivel requerido";
    if (!form.horario)        e.horario        = "Horario requerido";
    if (!form.fechaInicio)    e.fechaInicio    = "Fecha inicio requerida";
    if (!form.fechaFin)       e.fechaFin       = "Fecha fin requerida";
    if (form.fechaInicio && form.fechaFin && form.fechaFin <= form.fechaInicio)
      e.fechaFin = "Fecha fin posterior a fecha inicio";
    if (instructorMode === "buscar" && !form.instructorId)
      e.instructorId = "Selecciona un instructor";

    Object.assign(e, validatePrecios());

    if (Object.keys(e).length > 0) {
      setErrors(e);
      sileo.warning({ title: "Campos incompletos", description: "Revisa los campos marcados." });
      return false;
    }
    return true;
  };

  const validatePaso2 = (): boolean => {
    if (!empresaSel) {
      setEmpresaErrors({ empresa: "Debes seleccionar o crear una empresa" });
      sileo.warning({ title: "Empresa requerida" });
      return false;
    }
    setEmpresaErrors({});
    return true;
  };

  const handleSiguiente = () => {
    if (paso === 1 && !validatePaso1()) return;
    if (paso === 2 && !validatePaso2()) return;
    setPaso((p) => p + 1);
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      ...buildPreciosPayload(),
      tipoCurso:    "CERRADO",
      empresaId:    empresaSel!.id,
      duracion:     form.duracion ? Number(form.duracion) : undefined,
      instructorId: instructorMode === "despues" ? null : form.instructorId,
      numParticipantes: numP,
    };
    try {
      if (isEditMode && cursoToEdit?.id) {
        const cursoActualizado = await actualizarCurso(cursoToEdit.id, payload);
        setCursoCreado(cursoActualizado);
        sileo.success({ title: "Curso actualizado correctamente" });
      } else {
        const curso = await onCursoCreado(payload);
        setCursoCreado(curso);
      }
      setPaso(4);
    } catch (error: unknown) {
      if (!isEditMode) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      sileo.error({
        title: "Error al actualizar",
        description: err?.response?.data?.message || err?.message || "Error inesperado",
      });
    }
  };

  // ── Paso 4: handlers de participantes ───────────────────
  const handleParticipanteChange = (field: string, value: unknown) => {
    setParticipanteForm((p) => ({ ...p, [field]: value }));
    if (participanteErrors[field]) setParticipanteErrors((p) => ({ ...p, [field]: "" }));
  };

  const validateParticipante = (): boolean => {
    const e: Record<string, string> = {};
    if (!participanteForm.nombre || participanteForm.nombre.trim().length < 2)
      e.nombre = "Nombre requerido (mín. 2 caracteres)";
    if (!participanteForm.apellidoPaterno || participanteForm.apellidoPaterno.trim().length < 2)
      e.apellidoPaterno = "Apellido paterno requerido (mín. 2 caracteres)";
    if (!participanteForm.fechaNacimiento)
      e.fechaNacimiento = "Fecha de nacimiento requerida";
    if (Object.keys(e).length > 0) {
      setParticipanteErrors(e);
      sileo.warning({ title: "Campos incompletos", description: "Revisa los campos marcados." });
      return false;
    }
    return true;
  };

  const handleRegistrarParticipante = async () => {
    if (!validateParticipante()) return;
    setIsSubmittingParticipante(true);
    try {
      const cursoId = cursoCreado?.id ?? cursoCreado?.data?.id;
      const participantePayload: Record<string, unknown> = {
        nombre:           participanteForm.nombre.trim(),
        apellidoPaterno:  participanteForm.apellidoPaterno.trim(),
        fechaNacimiento:  participanteForm.fechaNacimiento,
        esAfiliado:       participanteForm.esAfiliado,
        empresaId:        empresaSel!.id,
      };
      if (participanteForm.apellidoMaterno?.trim())
        participantePayload.apellidoMaterno = participanteForm.apellidoMaterno.trim();
      if (participanteForm.correo?.trim())
        participantePayload.correo = participanteForm.correo.trim();
      if (participanteForm.celular?.trim())
        participantePayload.celular = participanteForm.celular.trim();

      const respParticipante = await crearParticipante(participantePayload);
      const participante = respParticipante?.data ?? respParticipante;

      await crearInscripcionCursoCerrado({
        participanteId:     participante.id,
        cursoId,
        tipoPrecioAplicado: participante.esAfiliado ? "AFILIADO" : "PUBLICO_GENERAL",
        metodoPago:         "EFECTIVO",
        montoEsperado:      precioPorP,
        montoFinal:         precioPorP,
        montoDescuento:     0,
        estadoPago:         "PAGADO",
        montoPagado:        precioPorP,
        notas:              "",
      });

      const nuevo = participantesRegistrados + 1;
      setParticipantesRegistrados(nuevo);
      setParticipantesLista((prev) => [...prev, participante]);
      setParticipanteForm({ ...PARTICIPANTE_INITIAL });
      setParticipanteErrors({});

      if (nuevo >= numP) {
        sileo.success({
          title: "¡Carga completa!",
          description: `Se registraron ${numP} participantes para el curso.`,
        });
        onClose();
      } else {
        sileo.success({
          title: `Participante ${nuevo} de ${numP} registrado`,
          description: `${participante.nombre} ${participante.apellidoPaterno}`,
        });
      }
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      const msg = err?.response?.data?.message || err?.message || "Error inesperado";
      sileo.error({ title: "Error al registrar participante", description: msg });
    } finally {
      setIsSubmittingParticipante(false);
    }
  };

  const dateRangeError = errors.fechaInicio || errors.fechaFin;

  return (
    <>
      <ModalForm
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2">
            <AcademicCapIcon className="w-6 h-6 text-danger" />
            <span>{isEditMode ? "Editar Curso Cerrado" : paso <= 3 ? "Nuevo Curso Cerrado" : "Registrar Participantes"}</span>
            <Chip size="sm" variant="flat" color={paso <= 3 ? "warning" : "success"} className="ml-2">
              Paso {paso} de 4
            </Chip>
          </div>
        }
        size="3xl"
        isLoading={isLoading}
        hideFooter
        hideCloseButton={paso === 4 && !isEditMode}
      >
        <div className="flex items-center gap-2 mb-6">
          {[
            { n: 1, label: "Datos del curso" },
            { n: 2, label: "Empresa" },
            { n: 3, label: "Confirmar" },
            { n: 4, label: "Participantes" },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                paso === n ? "bg-danger text-white shadow-lg shadow-danger/40"
                : paso > n ? "bg-success text-white"
                : "bg-default-200 text-default-500"
              }`}>
                {paso > n ? "✓" : n}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${
                paso === n ? "text-danger" : paso > n ? "text-success" : "text-default-400"
              }`}>{label}</span>
              {n < 4 && <div className={`h-0.5 flex-1 rounded-full ${paso > n ? "bg-success" : "bg-default-200"}`} />}
            </div>
          ))}
        </div>

        {paso === 1 && (
          <div className="space-y-6">

            {/* Básicos */}
            <SectionHeader icon={<DocumentTextIcon className="w-5 h-5 text-danger" />} title="Información básica" />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre del curso" isRequired size="lg" className="col-span-2"
                value={form.nombre} onValueChange={(v) => handleChange("nombre", v)}
                isInvalid={!!errors.nombre} errorMessage={errors.nombre}
                placeholder="Ej: Taller de liderazgo empresarial"
                startContent={<AcademicCapIcon className="w-4 h-4 text-default-400" />}
              />
              <Textarea
                label="Descripción" className="col-span-2" minRows={2}
                value={form.descripcion} onValueChange={(v) => handleChange("descripcion", v)}
                placeholder="Objetivos y contenido del curso..."
              />
            </div>

            <div className="space-y-3">
              <SectionHeader icon={<CurrencyDollarIcon className="w-5 h-5 text-danger" />} title="Costo del curso" />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number" label="Precio por participante" isRequired size="lg"
                  value={preciosCerrado.precioPorParticipante}
                  onValueChange={(v) => setPreciosCerrado((p) => ({ ...p, precioPorParticipante: v }))}
                  isInvalid={!!errors.precioPorParticipante} errorMessage={errors.precioPorParticipante}
                  startContent={<span className="text-default-400 text-sm font-medium">$</span>}
                  min={0} placeholder="1,200"
                />
                <Input
                  type="number" label="Número de participantes" isRequired size="lg"
                  value={preciosCerrado.numParticipantes}
                  onValueChange={(v) => setPreciosCerrado((p) => ({ ...p, numParticipantes: v }))}
                  isInvalid={!!errors.numParticipantes} errorMessage={errors.numParticipantes}
                  startContent={<UsersIcon className="w-4 h-4 text-default-400" />}
                  min={1} placeholder="20"
                />
              </div>

              <Card className={`border-2 transition-all duration-300 ${
                costoTotal > 0
                  ? "border-danger/30 bg-gradient-to-r from-danger/5 to-danger/10"
                  : "border-default-200 bg-default-50"
              }`}>
                <CardBody className="flex flex-row items-center justify-between py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${costoTotal > 0 ? "bg-danger/10" : "bg-default-100"}`}>
                      <CalculatorIcon className={`w-5 h-5 ${costoTotal > 0 ? "text-danger" : "text-default-400"}`} />
                    </div>
                    <div>
                      <p className="text-xs text-default-500">Cálculo automático</p>
                      <p className="text-sm text-default-600 font-medium">
                        {numP} participante{numP !== 1 ? "s" : ""}{" "}
                        × ${precioPorP.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-default-400 mb-0.5">Total del curso</p>
                    <p className={`text-2xl font-bold tabular-nums ${costoTotal > 0 ? "text-danger" : "text-default-300"}`}>
                      ${costoTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="space-y-3">
              <SectionHeader icon={<CalendarIcon className="w-5 h-5 text-danger" />} title="Horario y ubicación" />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Horario" isRequired size="lg"
                  value={form.horario} onValueChange={(v) => handleChange("horario", v)}
                  isInvalid={!!errors.horario} errorMessage={errors.horario}
                  placeholder="09:00 - 14:00"
                  startContent={<ClockIcon className="w-4 h-4 text-default-400" />}
                />
                <Input
                  label="Aula" isRequired size="lg"
                  value={form.aula} onValueChange={(v) => handleChange("aula", v)}
                  isInvalid={!!errors.aula} errorMessage={errors.aula}
                  placeholder="Ej: Auditorio A"
                  startContent={<MapPinIcon className="w-4 h-4 text-default-400" />}
                />
                <DateRangePicker
                  label="Periodo del curso" isRequired size="lg" className="col-span-2"
                  value={dateRange} onChange={handleDateRangeChange}
                  isInvalid={!!dateRangeError} errorMessage={dateRangeError}
                  visibleMonths={2} pageBehavior="single"
                  startContent={<CalendarIcon className="w-4 h-4 text-default-400 flex-shrink-0" />}
                />
                <Input
                  type="number" label="Duración (horas)" size="lg"
                  value={form.duracion} onValueChange={(v) => handleChange("duracion", v)}
                  min={1} placeholder="40"
                  endContent={<span className="text-default-400 text-sm">hrs</span>}
                />
                <Select
                  label="Nivel gerencial" isRequired size="lg"
                  selectedKeys={form.nivelGerencial ? new Set([form.nivelGerencial]) : new Set()}
                  onSelectionChange={(keys) => handleChange("nivelGerencial", Array.from(keys)[0] as string ?? "")}
                  isInvalid={!!errors.nivelGerencial} errorMessage={errors.nivelGerencial}
                  placeholder="Selecciona un nivel"
                  startContent={<ChevronDownIcon className="w-4 h-4 text-default-400" />}
                >
                  {NIVELES.map((n) => (
                    <SelectItem key={n.key} description={n.description}>{n.label}</SelectItem>
                  ))}
                </Select>
              </div>
              <div className="pt-1">
                <Switch isSelected={form.activo} onValueChange={(v) => handleChange("activo", v)} color="success" size="lg">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{form.activo ? "Activo" : "Inactivo"}</span>
                    <span className="text-xs text-default-400">{form.activo ? "Visible" : "Oculto"}</span>
                  </div>
                </Switch>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UserPlusIcon className="w-5 h-5 text-danger" />
                <h3 className="text-lg font-semibold text-default-800">Instructor</h3>
                <Chip size="sm" variant="flat" color="default" className="ml-2">Opcional</Chip>
              </div>
              <Divider className="bg-danger/20" />

              <div className="grid grid-cols-3 gap-3">
                {(["buscar", "crear", "despues"] as InstructorMode[]).map((mode) => (
                  <ModeCard
                    key={mode}
                    active={instructorMode === mode}
                    color={mode === "despues" ? "warning" : "danger"}
                    onPress={() => {
                      if (mode === instructorMode && mode !== "crear") return;
                      setInstructorMode(mode);
                      if (mode !== "buscar") {
                        handleChange("instructorId", null);
                        setInstructorSearch(""); setInstructores([]); setInstructorSel(null);
                      }
                      if (mode === "crear") setModalInstructorOpen(true);
                    }}
                    icon={
                      mode === "buscar" ? <MagnifyingGlassIcon className="w-6 h-6" />
                      : mode === "crear" ? <UserPlusIcon className="w-6 h-6" />
                      : <ClockIcon className="w-6 h-6" />
                    }
                    label={mode === "buscar" ? "Buscar existente" : mode === "crear" ? "Crear nuevo" : "Asignar después"}
                    desc={mode === "buscar" ? "Selecciona de la base" : mode === "crear" ? "Registrar instructor" : "Pendiente"}
                  />
                ))}
              </div>

              {instructorMode === "buscar" && (
                instructorSel && form.instructorId ? (
                  <div className="flex items-center gap-3 rounded-xl bg-success-50 border border-success-200 p-4">
                    <CheckCircleIcon className="w-5 h-5 text-success-600" />
                    <span className="text-sm text-success-700 flex-1 font-semibold">
                      {instructorSel.nombre} {instructorSel.apellidoPaterno}
                    </span>
                    <Button size="sm" variant="light" color="success"
                      onPress={() => { handleChange("instructorId", null); setInstructorSel(null); setInstructorSearch(""); setInstructores([]); }}>
                      Cambiar
                    </Button>
                  </div>
                ) : (
                  <Autocomplete
                    label="Buscar instructor" size="lg"
                    inputValue={instructorSearch}
                    onInputChange={(v) => { setInstructorSearch(v); if (!v) { handleChange("instructorId", null); setInstructorSel(null); } }}
                    items={instructores}
                    selectedKey={form.instructorId ? String(form.instructorId) : null}
                    onSelectionChange={(key) => {
                      if (!key) { handleChange("instructorId", null); setInstructorSel(null); return; }
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const found = instructores.find((i: any) => String(i.id) === String(key));
                      handleChange("instructorId", Number(key));
                      setInstructorSel(found ?? null);
                    }}
                    isLoading={loadingInst}
                    isInvalid={!!errors.instructorId} errorMessage={errors.instructorId}
                    placeholder="Escribe el nombre del instructor..."
                    startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
                  >
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(item: any) => (
                      <AutocompleteItem key={String(item.id)} textValue={`${item.nombre} ${item.apellidoPaterno}`}>
                        {item.nombre} {item.apellidoPaterno} {item.apellidoMaterno ?? ""}
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                )
              )}

              {instructorMode === "despues" && (
                <InfoBanner color="warning" icon={<ExclamationTriangleIcon className="w-5 h-5" />}
                  title="Instructor pendiente" desc="El curso se creará sin instructor. Recuerda asignarlo después." />
              )}
              {instructorMode === "crear" && !form.instructorId && (
                <InfoBanner color="primary" icon={<InformationCircleIcon className="w-5 h-5" />}
                  title="Creando instructor" desc="Completa el formulario. Al guardarlo se asignará automáticamente." />
              )}
              {!instructorMode && (
                <p className="text-sm text-default-400 text-center py-3 italic">
                  Selecciona una opción para la asignación del instructor
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-default-200">
              <Button variant="light" onPress={onClose} size="lg">Cancelar</Button>
              <Button color="danger" size="lg" onPress={handleSiguiente}
                startContent={<BuildingOffice2Icon className="w-5 h-5" />}>
                Siguiente: Empresa
              </Button>
            </div>
          </div>
        )}

        {paso === 2 && (
          <div className="space-y-6">
            <InfoBanner color="primary" icon={<BuildingOffice2Icon className="w-5 h-5" />}
              title="Empresa del curso cerrado"
              desc="Todos los participantes inscritos quedarán vinculados a esta empresa." />

            <div className="grid grid-cols-2 gap-3">
              <ModeCard active={empresaMode === "buscar"} color="danger"
                onPress={() => { setEmpresaMode("buscar"); setEmpresaSel(null); setEmpresaSearch(""); setEmpresas([]); }}
                icon={<MagnifyingGlassIcon className="w-6 h-6" />}
                label="Buscar existente" desc="Empresa ya registrada" />
              <ModeCard active={empresaMode === "crear"} color="danger"
                onPress={() => { setEmpresaMode("crear"); setModalEmpresaOpen(true); }}
                icon={<PlusCircleIcon className="w-6 h-6" />}
                label="Crear nueva" desc="Registrar empresa" />
            </div>

            {empresaSel ? (
              <div className="flex items-center gap-3 rounded-xl bg-success-50 border border-success-200 p-4">
                <div className="p-2 bg-success-100 rounded-full">
                  <CheckCircleIcon className="w-5 h-5 text-success-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-success-700">{empresaSel.nombre}</p>
                  <p className="text-xs text-success-600 mt-0.5">RFC: {empresaSel.rfc}</p>
                  {empresaSel.direccion && <p className="text-xs text-success-500 mt-0.5">{empresaSel.direccion}</p>}
                </div>
                <Button size="sm" variant="light" color="success"
                  onPress={() => { setEmpresaSel(null); setEmpresaSearch(""); setEmpresas([]); }}>
                  Cambiar
                </Button>
              </div>
            ) : (
              empresaMode === "buscar" && (
                <Autocomplete
                  label="Buscar empresa" size="lg"
                  inputValue={empresaSearch}
                  onInputChange={(v) => { setEmpresaSearch(v); if (!v) setEmpresaSel(null); }}
                  items={empresas}
                  isLoading={loadingEmp}
                  isInvalid={!!empresaErrors.empresa} errorMessage={empresaErrors.empresa}
                  onSelectionChange={(key) => {
                    if (!key) { setEmpresaSel(null); return; }
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const found = empresas.find((e: any) => String(e.id) === String(key));
                    setEmpresaSel(found ?? null);
                    setEmpresaErrors({});
                  }}
                  placeholder="Nombre o RFC de la empresa..."
                  startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
                >
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(emp: any) => (
                    <AutocompleteItem key={String(emp.id)} textValue={emp.nombre} description={`RFC: ${emp.rfc}`}>
                      {emp.nombre}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              )
            )}

            {!empresaSel && empresaMode === "crear" && (
              <div className="flex items-start gap-3 rounded-xl bg-primary-50 border border-primary-200 p-4">
                <InformationCircleIcon className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary-700">Crear empresa</p>
                  <p className="text-xs text-primary-600 mt-1">Abre el formulario para registrar una nueva empresa.</p>
                  <Button size="sm" color="primary" variant="flat" className="mt-2"
                    onPress={() => setModalEmpresaOpen(true)}
                    startContent={<PlusCircleIcon className="w-4 h-4" />}>
                    Abrir formulario
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-between gap-3 pt-4 border-t border-default-200">
              <Button variant="flat" size="lg" onPress={() => setPaso(1)}>← Anterior</Button>
              <Button color="danger" size="lg" onPress={handleSiguiente}
                startContent={<CheckCircleIcon className="w-5 h-5" />}>
                Siguiente: Confirmar
              </Button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div className="space-y-6">
            <Card className="bg-default-50 border border-default-200">
              <CardBody className="space-y-4">
                <div className="flex items-center gap-2">
                  <AcademicCapIcon className="w-5 h-5 text-danger" />
                  <h3 className="font-semibold text-default-800">Resumen del curso</h3>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
                  <ResumenFila label="Nombre"   value={form.nombre} />
                  <ResumenFila label="Empresa"  value={empresaSel?.nombre ?? "—"} />
                  <ResumenFila label="Horario"  value={form.horario} />
                  <ResumenFila label="Periodo"  value={`${form.fechaInicio}  →  ${form.fechaFin}`} />
                  <ResumenFila label="Aula"     value={form.aula} />
                  <ResumenFila label="Nivel"    value={form.nivelGerencial} />
                  {form.duracion ? <ResumenFila label="Duración" value={`${form.duracion} hrs`} /> : null}
                  {instructorSel ? (
                    <ResumenFila label="Instructor" value={`${instructorSel.nombre} ${instructorSel.apellidoPaterno}`} />
                  ) : null}
                </div>
              </CardBody>
            </Card>

            <Card className="border-2 border-danger/20 bg-gradient-to-br from-danger/5 to-danger/10">
              <CardBody className="space-y-4 py-5">
                <div className="flex items-center gap-2">
                  <CurrencyDollarIcon className="w-5 h-5 text-danger" />
                  <h3 className="font-semibold text-default-800">Resumen de costo</h3>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-white/60 rounded-xl border border-danger/10">
                  <div className="space-y-1">
                    <p className="text-xs text-default-500">Precio / participante</p>
                    <p className="text-xl font-bold text-default-800">
                      ${precioPorP.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <span className="text-2xl text-default-300 font-light">×</span>
                  <div className="space-y-1 text-center">
                    <p className="text-xs text-default-500">Participantes</p>
                    <p className="text-xl font-bold text-default-800">{numP}</p>
                  </div>
                  <span className="text-2xl text-default-300 font-light">=</span>
                  <div className="space-y-1 text-right">
                    <p className="text-xs text-default-500">Total del curso</p>
                    <p className="text-2xl font-bold text-danger">
                      ${costoTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-default-400 text-center">
                  El pago individual de cada participante se captura en su inscripción
                </p>
              </CardBody>
            </Card>

            <div className="flex justify-between gap-3 pt-4 border-t border-default-200">
              <Button variant="flat" size="lg" onPress={() => setPaso(2)}>← Anterior</Button>
              <Button color="danger" size="lg" isLoading={isLoading} onPress={handleSubmit}
                startContent={!isLoading && <AcademicCapIcon className="w-5 h-5" />}>
                {isEditMode ? "Guardar y continuar" : "Crear Curso Cerrado"}
              </Button>
            </div>
          </div>
        )}

        {paso === 4 && (
          <div className="space-y-5">

            {/* Banner: Curso + Empresa */}
            <Card className="border-2 border-success-200 bg-gradient-to-r from-success-50 to-emerald-50">
              <CardBody className="py-4 px-5 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-success-600" />
                  <p className="text-sm font-bold text-success-700">
                    {isEditMode ? "Curso cerrado" : "Curso creado exitosamente"}
                  </p>
                </div>
                <Divider className="bg-success-200" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2 rounded-lg bg-white/70 border border-success-100 p-3">
                    <AcademicCapIcon className="w-4 h-4 text-success-500 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-default-400 font-medium uppercase tracking-wide">Curso</p>
                      <p className="text-sm font-semibold text-default-800 leading-tight truncate">{form.nombre}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg bg-white/70 border border-success-100 p-3">
                    <BuildingOffice2Icon className="w-4 h-4 text-success-500 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-default-400 font-medium uppercase tracking-wide">Empresa</p>
                      <p className="text-sm font-semibold text-default-800 leading-tight truncate">{empresaSel?.nombre ?? "—"}</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Contador de progreso */}
            <Card className={`border-2 transition-all duration-300 ${
              participantesRegistrados >= numP
                ? "border-success-300 bg-success-50"
                : "border-primary-200 bg-gradient-to-r from-primary-50 to-blue-50"
            }`}>
              <CardBody className="py-4 px-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="w-5 h-5 text-primary-600" />
                    <p className="text-sm font-bold text-default-700">Progreso de registro</p>
                  </div>
                  <Chip
                    size="lg"
                    variant="flat"
                    color={participantesRegistrados >= numP ? "success" : "primary"}
                    className="font-bold"
                  >
                    {participantesRegistrados} / {numP}
                  </Chip>
                </div>
                <Progress
                  value={(participantesRegistrados / numP) * 100}
                  color={participantesRegistrados >= numP ? "success" : "primary"}
                  size="md"
                  className="w-full"
                />
                <p className="text-xs text-default-500 text-center">
                  {participantesRegistrados >= numP
                    ? "¡Todos los participantes han sido registrados!"
                    : `Faltan ${numP - participantesRegistrados} participante${numP - participantesRegistrados !== 1 ? "s" : ""} por registrar`
                  }
                </p>
              </CardBody>
            </Card>

            {/* Formulario de participante */}
            {participantesRegistrados < numP && (
              <Card className="border border-default-200">
                <CardBody className="space-y-4 py-5 px-5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary-100 rounded-lg">
                      <UserIcon className="w-4 h-4 text-primary-600" />
                    </div>
                    <h3 className="text-sm font-bold text-default-800">
                      Participante #{participantesRegistrados + 1}
                    </h3>
                    <Chip size="sm" variant="flat" color="default" className="ml-auto">
                      {numP - participantesRegistrados} restante{numP - participantesRegistrados !== 1 ? "s" : ""}
                    </Chip>
                  </div>

                  <Divider />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Nombre(s)"
                      isRequired
                      size="lg"
                      value={participanteForm.nombre}
                      onValueChange={(v) => handleParticipanteChange("nombre", v)}
                      isInvalid={!!participanteErrors.nombre}
                      errorMessage={participanteErrors.nombre}
                      placeholder="Ej: Juan Carlos"
                      autoFocus
                    />
                    <Input
                      label="Apellido Paterno"
                      isRequired
                      size="lg"
                      value={participanteForm.apellidoPaterno}
                      onValueChange={(v) => handleParticipanteChange("apellidoPaterno", v)}
                      isInvalid={!!participanteErrors.apellidoPaterno}
                      errorMessage={participanteErrors.apellidoPaterno}
                      placeholder="Ej: García"
                    />
                    <Input
                      label="Apellido Materno"
                      size="lg"
                      value={participanteForm.apellidoMaterno}
                      onValueChange={(v) => handleParticipanteChange("apellidoMaterno", v)}
                      placeholder="Ej: López"
                    />
                    <Input
                      type="date"
                      label="Fecha de nacimiento"
                      isRequired
                      size="lg"
                      value={participanteForm.fechaNacimiento}
                      onChange={(e) => handleParticipanteChange("fechaNacimiento", e.target.value)}
                      isInvalid={!!participanteErrors.fechaNacimiento}
                      errorMessage={participanteErrors.fechaNacimiento}
                    />
                    <Input
                      label="Correo electrónico"
                      size="lg"
                      type="email"
                      value={participanteForm.correo}
                      onValueChange={(v) => handleParticipanteChange("correo", v)}
                      placeholder="correo@ejemplo.com"
                    />
                    <Input
                      label="Celular"
                      size="lg"
                      value={participanteForm.celular}
                      onValueChange={(v) => handleParticipanteChange("celular", v)}
                      placeholder="614 123 4567"
                    />
                    <div className="flex items-center">
                      <Switch
                        isSelected={participanteForm.esAfiliado}
                        onValueChange={(v) => handleParticipanteChange("esAfiliado", v)}
                        color="success"
                        size="lg"
                      >
                        <span className="text-sm font-medium">
                          {participanteForm.esAfiliado ? "Afiliado" : "No afiliado"}
                        </span>
                      </Switch>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Lista de participantes registrados */}
            {participantesLista.length > 0 && (
              <Card className="border border-default-200">
                <CardBody className="py-3 px-5">
                  <p className="text-xs font-semibold text-default-500 uppercase tracking-wide mb-2">
                    Participantes registrados
                  </p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {participantesLista.map((p, i) => (
                      <div key={p.id ?? i} className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-success-100 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-success-600">{i + 1}</span>
                        </div>
                        <span className="text-default-700">
                          {p.nombre} {p.apellidoPaterno} {p.apellidoMaterno ?? ""}
                        </span>
                        {p.esAfiliado && (
                          <Chip size="sm" color="success" variant="flat" className="ml-auto">Afiliado</Chip>
                        )}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Botones */}
            <div className="flex justify-between gap-3 pt-4 border-t border-default-200">
              {participantesRegistrados < numP ? (
                <>
                  <Button
                    variant="flat"
                    size="lg"
                    color="warning"
                    onPress={() => {
                      sileo.warning({
                        title: "Registro incompleto",
                        description: `Faltan ${numP - participantesRegistrados} participantes. Puedes continuar después desde el detalle del curso.`,
                      });
                      onClose();
                    }}
                  >
                    Terminar después
                  </Button>
                  <Button
                    color="primary"
                    size="lg"
                    isLoading={isSubmittingParticipante}
                    onPress={handleRegistrarParticipante}
                    startContent={!isSubmittingParticipante && <UserPlusIcon className="w-5 h-5" />}
                  >
                    Registrar participante {participantesRegistrados + 1}
                  </Button>
                </>
              ) : (
                <Button
                  color="success"
                  size="lg"
                  className="w-full"
                  onPress={onClose}
                  startContent={<CheckCircleIcon className="w-5 h-5" />}
                >
                  Finalizar
                </Button>
              )}
            </div>
          </div>
        )}
      </ModalForm>

      <InstructorModal
        isOpen={modalInstructorOpen}
        onClose={() => { setModalInstructorOpen(false); if (!form.instructorId) setInstructorMode(null); }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSuccess={(inst: any) => {
          handleChange("instructorId", inst.id);
          setInstructorSel(inst);
          setInstructorSearch(`${inst.nombre} ${inst.apellidoPaterno}`);
          setInstructores([inst]);
          setInstructorMode("buscar");
          setModalInstructorOpen(false);
          sileo.success({ title: "Instructor asignado", description: `${inst.nombre} ${inst.apellidoPaterno}` });
        }}
      />

      <EmpresaModalProvider origen="curso">
        <EmpresaModal
          isOpen={modalEmpresaOpen}
          onClose={() => { setModalEmpresaOpen(false); if (!empresaSel) setEmpresaMode("buscar"); }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onSuccess={(emp: any) => {
            setEmpresaSel(emp);
            setEmpresaErrors({});
            setModalEmpresaOpen(false);
            sileo.success({ title: "Empresa asignada", description: emp.nombre });
          }}
        />
      </EmpresaModalProvider>
    </>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <>
      <div className="flex items-center gap-2">{icon}<h3 className="text-lg font-semibold text-default-800">{title}</h3></div>
      <Divider className="bg-danger/20" />
    </>
  );
}

function ModeCard({ active, color, onPress, icon, label, desc }: {
  active: boolean; color: "danger" | "warning"; onPress: () => void;
  icon: React.ReactNode; label: string; desc: string;
}) {
  const activeClass = color === "danger"
    ? "border-danger bg-danger-50 shadow-danger/20"
    : "border-warning bg-warning-50 shadow-warning/20";
  const activeText  = color === "danger" ? "text-danger" : "text-warning";
  const activeBg    = color === "danger" ? "bg-danger/10" : "bg-warning/10";
  return (
    <Card isPressable onPress={onPress}
      className={`cursor-pointer border-2 transition-all duration-200 hover:scale-[1.02] ${
        active ? `${activeClass} shadow-lg` : "border-default-200 hover:border-default-300"
      }`}>
      <CardBody className="flex flex-col items-center gap-2 py-4 text-center">
        <div className={`p-2 rounded-full ${active ? activeBg : "bg-default-100"}`}>
          <span className={active ? activeText : "text-default-500"}>{icon}</span>
        </div>
        <span className={`text-sm font-semibold ${active ? activeText : "text-default-600"}`}>{label}</span>
        <span className="text-xs text-default-400">{desc}</span>
      </CardBody>
    </Card>
  );
}

function InfoBanner({ color, icon, title, desc }: {
  color: "primary" | "warning"; icon: React.ReactNode; title: string; desc: string;
}) {
  const cls     = color === "primary" ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-warning-50 border-warning-200 text-warning-700";
  const iconCls = color === "primary" ? "text-primary-600" : "text-warning-600";
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${cls}`}>
      <span className={iconCls}>{icon}</span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs mt-1 opacity-80">{desc}</p>
      </div>
    </div>
  );
}

function ResumenFila({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-default-400 text-xs">{label}: </span>
      <span className="font-medium text-default-800">{value}</span>
    </div>
  );
}