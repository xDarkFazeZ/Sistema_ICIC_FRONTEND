import { useEffect, useState } from "react";
import {
  Button, Input, Textarea, Select, SelectItem, Switch,
  DateRangePicker, Autocomplete, AutocompleteItem,
  Card, CardBody, Divider, Chip,
} from "@heroui/react";
import { useDebounce } from "use-debounce";
import { sileo } from "sileo";
import {
  BuildingOffice2Icon, MagnifyingGlassIcon, PlusCircleIcon,
  AcademicCapIcon, CurrencyDollarIcon, CalendarIcon, MapPinIcon,
  DocumentTextIcon, ClockIcon, ChevronDownIcon, UserPlusIcon,
  CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon,
  UsersIcon, CalculatorIcon,
} from "@heroicons/react/24/outline";

import { buscarInstructores }    from "../../../services/instructorService";
import { buscarEmpresas }        from "../../../services/empresaService";
import InstructorModal           from "../Instructor/instructorModal";
import EmpresaModal              from "../Empresa/empresaModal";
import { EmpresaModalProvider }  from "../Empresa/EmpresaModalContext";
import ModalForm                 from "../../common/modalForm";
import { useCamposCurso }        from "../../../hooks/UseCamposCurso";

interface CursoCerradoModalProps {
  isOpen:        boolean;
  onClose:       () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCursoCreado: (curso: any) => void;
  isLoading?:    boolean;
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

export default function CursoCerradoModal({
  isOpen, onClose, onCursoCreado, isLoading = false,
}: CursoCerradoModalProps) {

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
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
    };
    try { await onCursoCreado(payload); } catch { /* padre maneja */ }
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
            <span>Nuevo Curso Cerrado</span>
            <Chip size="sm" variant="flat" color="warning" className="ml-2">
              Paso {paso} de 3
            </Chip>
          </div>
        }
        size="3xl"
        isLoading={isLoading}
        hideFooter
      >
        <div className="flex items-center gap-2 mb-6">
          {[
            { n: 1, label: "Datos del curso" },
            { n: 2, label: "Empresa" },
            { n: 3, label: "Confirmar" },
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
              {n < 3 && <div className={`h-0.5 flex-1 rounded-full ${paso > n ? "bg-success" : "bg-default-200"}`} />}
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
                Crear Curso Cerrado
              </Button>
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