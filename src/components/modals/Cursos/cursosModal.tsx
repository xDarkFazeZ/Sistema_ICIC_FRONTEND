import {
  Input,
  Textarea,
  Autocomplete,
  AutocompleteItem,
  Switch,
  Select,
  SelectItem,
  Card,
  CardBody,
  Divider,
  Chip,
  Button,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { sileo } from "sileo";
import {
  buscarInstructores,
  obtenerInstructorPorId,
} from "../../../services/instructorService";
import ModalForm from "../../common/modalForm";
import InstructorModal from "../Instructor/instructorModal";
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  MapPinIcon,
  DocumentTextIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";

interface CursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  cursoToEdit?: any;
  isLoading?: boolean;
}

const NIVELES_GERENCIALES = [
  { key: "Operativo", label: "Operativo", description: "Supervisores y coordinadores" },
  { key: "Medio", label: "Medio", description: "Jefes de área y gerentes" },
  { key: "Directivo", label: "Directivo", description: "Directores y alta dirección" },
];

type InstructorMode = "buscar" | "crear" | "despues";

const FORM_INITIAL: Record<string, any> = {
  nombre: "",
  descripcion: "",
  precioAfiliado: "",
  precioPublico: "",
  precioEstudiante: "",
  duracion: "",
  horario: "",
  fechaInicio: "",
  fechaFin: "",
  aula: "",
  nivelGerencial: "",
  activo: true,
  instructorId: null as number | null,
};

export default function CursoModal({
  isOpen,
  onClose,
  onSubmit,
  cursoToEdit,
  isLoading = false,
}: CursoModalProps) {
  const [form, setForm] = useState<Record<string, any>>({ ...FORM_INITIAL });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [instructorMode, setInstructorMode] = useState<InstructorMode | null>(null);
  const [instructorSearch, setInstructorSearch] = useState("");
  const [debouncedSearch] = useDebounce(instructorSearch, 400);
  const [instructores, setInstructores] = useState<any[]>([]);
  const [isLoadingInstructores, setIsLoadingInstructores] = useState(false);
  const [instructorSeleccionado, setInstructorSeleccionado] = useState<any | null>(null);
  const [modalInstructorAbierto, setModalInstructorAbierto] = useState(false);

  // ── Reset al cerrar ──────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setForm({ ...FORM_INITIAL });
      setInstructorSearch("");
      setInstructores([]);
      setErrors({});
      setInstructorMode(null);
      setInstructorSeleccionado(null);
    }
  }, [isOpen]);

  // ── Modo edición ─────────────────────────────────────────────
  useEffect(() => {
    if (cursoToEdit && isOpen) {
      setForm({
        nombre: cursoToEdit.nombre ?? "",
        descripcion: cursoToEdit.descripcion ?? "",
        precioAfiliado: String(cursoToEdit.precioAfiliado ?? ""),
        precioPublico: String(cursoToEdit.precioPublico ?? ""),
        precioEstudiante: String(cursoToEdit.precioEstudiante ?? ""),
        duracion: String(cursoToEdit.duracion ?? ""),
        horario: cursoToEdit.horario ?? "",
        fechaInicio: cursoToEdit.fechaInicio?.substring(0, 10) ?? "",
        fechaFin: cursoToEdit.fechaFin?.substring(0, 10) ?? "",
        aula: cursoToEdit.aula ?? "",
        nivelGerencial: cursoToEdit.nivelGerencial ?? "",
        activo: cursoToEdit.activo ?? true,
        instructorId: cursoToEdit.instructorId ?? null,
      });
      setInstructorMode("buscar");
    }
  }, [cursoToEdit, isOpen]);

  // ── Cargar instructor en edición ─────────────────────────────
  useEffect(() => {
    const loadInstructor = async () => {
      if (cursoToEdit?.instructorId && isOpen) {
        const inst = await obtenerInstructorPorId(cursoToEdit.instructorId);
        setInstructorSearch(
          `${inst.nombre} ${inst.apellidoPaterno} ${inst.apellidoMaterno ?? ""}`.trim()
        );
        setInstructores([inst]);
        setInstructorSeleccionado(inst);
      }
    };
    loadInstructor();
  }, [cursoToEdit, isOpen]);

  // ── Buscar instructores con debounce ─────────────────────────
  useEffect(() => {
    const fetchInstructores = async () => {
      if (instructorMode !== "buscar") return;
      if (!debouncedSearch || debouncedSearch.length < 2) {
        setInstructores([]);
        return;
      }
      try {
        setIsLoadingInstructores(true);
        const data = await buscarInstructores(debouncedSearch);
        setInstructores(data);
      } finally {
        setIsLoadingInstructores(false);
      }
    };
    fetchInstructores();
  }, [debouncedSearch, instructorMode]);

  // ── Helpers ──────────────────────────────────────────────────
  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleModeChange = (mode: InstructorMode) => {
    if (mode === instructorMode && mode !== "crear") return;
    setInstructorMode(mode);
    if (mode !== "buscar") {
      handleChange("instructorId", null);
      setInstructorSearch("");
      setInstructores([]);
      setInstructorSeleccionado(null);
    }
    if (errors.instructorId) setErrors((prev) => ({ ...prev, instructorId: "" }));
    if (mode === "crear") setModalInstructorAbierto(true);
  };

  // ── Instructor creado desde modal anidado ────────────────────
  const handleInstructorCreado = (instructor: any) => {
    handleChange("instructorId", instructor.id);
    setInstructorSeleccionado(instructor);
    setInstructorSearch(
      `${instructor.nombre} ${instructor.apellidoPaterno} ${instructor.apellidoMaterno ?? ""}`.trim()
    );
    setInstructores([instructor]);
    setInstructorMode("buscar");
    setModalInstructorAbierto(false);
    sileo.success({
      title: "¡Instructor asignado!",
      description: `${instructor.nombre} ${instructor.apellidoPaterno} fue creado y asignado al curso.`,
    });
  };

  // ── Validación ───────────────────────────────────────────────
  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.nombre || form.nombre.trim().length < 3)
      e.nombre = "El nombre debe tener al menos 3 caracteres";
    if (!form.aula) e.aula = "Aula requerida";
    if (!form.nivelGerencial) e.nivelGerencial = "Nivel gerencial requerido";
    if (!form.horario) e.horario = "Horario requerido";

    const pA = Number(form.precioAfiliado);
    const pP = Number(form.precioPublico);
    const pE = Number(form.precioEstudiante);
    if (form.precioAfiliado === "" || isNaN(pA)) e.precioAfiliado = "Precio inválido";
    if (form.precioPublico === "" || isNaN(pP)) e.precioPublico = "Precio inválido";
    if (form.precioEstudiante === "" || isNaN(pE)) e.precioEstudiante = "Precio inválido";
    if (!e.precioAfiliado && !e.precioPublico && pA > pP)
      e.precioAfiliado = "Precio afiliado debe ser ≤ precio público";

    if (!form.fechaInicio) e.fechaInicio = "Fecha inicio requerida";
    if (!form.fechaFin) e.fechaFin = "Fecha fin requerida";
    if (form.fechaInicio && form.fechaFin && form.fechaFin <= form.fechaInicio)
      e.fechaFin = "Fecha fin debe ser posterior a fecha inicio";

    if (instructorMode === "buscar" && !form.instructorId)
      e.instructorId = "Selecciona un instructor de la lista";

    return e;
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      sileo.warning({
        title: "Campos incompletos",
        description: "Revisa los campos marcados antes de continuar.",
      });
      return;
    }

    try {
      await onSubmit({
        ...form,
        precioAfiliado: Number(form.precioAfiliado),
        precioPublico: Number(form.precioPublico),
        precioEstudiante: Number(form.precioEstudiante),
        duracion: form.duracion ? Number(form.duracion) : undefined,
        instructorId: instructorMode === "despues" ? undefined : form.instructorId,
      });

      sileo.success({
        title: cursoToEdit ? "¡Curso actualizado!" : "¡Curso creado!",
        description: cursoToEdit
          ? `"${form.nombre}" se actualizó correctamente.`
          : `"${form.nombre}" se creó correctamente.`,
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Error desconocido";
      sileo.error({
        title: "Error al guardar",
        description: typeof msg === "string" ? msg : "No se pudo guardar el curso.",
      });
    }
  };

  return (
    <>
      <ModalForm
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2">
            <AcademicCapIcon className="w-6 h-6 text-danger" />
            <span>{cursoToEdit ? "Editar Curso" : "Nuevo Curso"}</span>
          </div>
        }
        size="3xl"
        isLoading={isLoading}
        className="bg-gradient-to-br from-default-50 to-default-100 dark:from-default-900/50 dark:to-default-800/50"
      >
        <form id="modal-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-danger" />
              <h3 className="text-lg font-semibold text-default-800">Información básica</h3>
            </div>
            <Divider className="bg-danger/20" />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre del curso"
                value={form.nombre}
                onValueChange={(v) => handleChange("nombre", v)}
                isRequired
                isInvalid={!!errors.nombre}
                errorMessage={errors.nombre}
                className="col-span-2"
                classNames={{
                  input: "text-base",
                  label: "font-medium",
                }}
                placeholder="Ej: Liderazgo transformacional"
                startContent={<AcademicCapIcon className="w-4 h-4 text-default-400" />}
                size="lg"
              />
              
              <Textarea
                label="Descripción"
                value={form.descripcion}
                onValueChange={(v) => handleChange("descripcion", v)}
                className="col-span-2"
                minRows={3}
                placeholder="Describe el contenido y objetivos del curso..."
                classNames={{
                  label: "font-medium",
                }}
              />
            </div>
          </div>

          {/* Precios y duración */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-danger" />
              <h3 className="text-lg font-semibold text-default-800">Precios y duración</h3>
            </div>
            <Divider className="bg-danger/20" />
            
            <div className="grid grid-cols-3 gap-4">
              <Input
                type="number"
                label="Precio Afiliado"
                value={form.precioAfiliado}
                onValueChange={(v) => handleChange("precioAfiliado", v)}
                isRequired
                isInvalid={!!errors.precioAfiliado}
                errorMessage={errors.precioAfiliado}
                startContent={<span className="text-default-400 text-sm font-medium">$</span>}
                min={0}
                classNames={{
                  label: "font-medium",
                }}
                size="lg"
              />
              
              <Input
                type="number"
                label="Precio Público"
                value={form.precioPublico}
                onValueChange={(v) => handleChange("precioPublico", v)}
                isRequired
                isInvalid={!!errors.precioPublico}
                errorMessage={errors.precioPublico}
                startContent={<span className="text-default-400 text-sm font-medium">$</span>}
                min={0}
                classNames={{
                  label: "font-medium",
                }}
                size="lg"
              />
              
              <Input
                type="number"
                label="Precio Estudiante"
                value={form.precioEstudiante}
                onValueChange={(v) => handleChange("precioEstudiante", v)}
                isRequired
                isInvalid={!!errors.precioEstudiante}
                errorMessage={errors.precioEstudiante}
                startContent={<span className="text-default-400 text-sm font-medium">$</span>}
                min={0}
                classNames={{
                  label: "font-medium",
                }}
                size="lg"
              />

              <Input
                type="number"
                label="Duración (horas)"
                value={form.duracion}
                onValueChange={(v) => handleChange("duracion", v)}
                min={1}
                classNames={{
                  label: "font-medium",
                }}
                size="lg"
                placeholder="40"
                endContent={<span className="text-default-400 text-sm">hrs</span>}
              />
            </div>
          </div>

          {/* Horario y ubicación */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-danger" />
              <h3 className="text-lg font-semibold text-default-800">Horario y ubicación</h3>
            </div>
            <Divider className="bg-danger/20" />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Horario"
                value={form.horario}
                onValueChange={(v) => handleChange("horario", v)}
                placeholder="09:00 - 14:00"
                isRequired
                isInvalid={!!errors.horario}
                errorMessage={errors.horario}
                classNames={{
                  label: "font-medium",
                }}
                size="lg"
                startContent={<ClockIcon className="w-4 h-4 text-default-400" />}
              />
              
              <Input
                label="Aula"
                value={form.aula}
                onValueChange={(v) => handleChange("aula", v)}
                isRequired
                isInvalid={!!errors.aula}
                errorMessage={errors.aula}
                classNames={{
                  label: "font-medium",
                }}
                size="lg"
                startContent={<MapPinIcon className="w-4 h-4 text-default-400" />}
                placeholder="Ej: Auditorio A"
              />
              
              <Input
                type="date"
                label="Fecha de inicio"
                value={form.fechaInicio}
                onValueChange={(v) => handleChange("fechaInicio", v)}
                isRequired
                isInvalid={!!errors.fechaInicio}
                errorMessage={errors.fechaInicio}
                labelPlacement="outside"
                placeholder=" "
                classNames={{
                  label: "font-medium",
                }}
                size="lg"
              />
              
              <Input
                type="date"
                label="Fecha de fin"
                value={form.fechaFin}
                onValueChange={(v) => handleChange("fechaFin", v)}
                isRequired
                isInvalid={!!errors.fechaFin}
                errorMessage={errors.fechaFin}
                labelPlacement="outside"
                placeholder=" "
                classNames={{
                  label: "font-medium",
                }}
                size="lg"
              />
            </div>
          </div>

          {/* Nivel gerencial y estado */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Nivel gerencial"
              selectedKeys={form.nivelGerencial ? new Set([form.nivelGerencial]) : new Set()}
              onSelectionChange={(keys) => {
                const val = Array.from(keys)[0] as string;
                handleChange("nivelGerencial", val ?? "");
              }}
              isRequired
              isInvalid={!!errors.nivelGerencial}
              errorMessage={errors.nivelGerencial}
              classNames={{
                label: "font-medium",
              }}
              size="lg"
              placeholder="Selecciona un nivel"
              startContent={<ChevronDownIcon className="w-4 h-4 text-default-400" />}
            >
              {NIVELES_GERENCIALES.map((n) => (
                <SelectItem key={n.key} description={n.description}>
                  {n.label}
                </SelectItem>
              ))}
            </Select>

            <div className="flex items-center h-full pt-2">
              <Switch
                isSelected={form.activo}
                onValueChange={(v) => handleChange("activo", v)}
                color="success"
                size="lg"
                classNames={{
                  label: "font-medium",
                }}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{form.activo ? "Activo" : "Inactivo"}</span>
                  <span className="text-xs text-default-400">
                    {form.activo ? "Curso disponible" : "Curso no visible"}
                  </span>
                </div>
              </Switch>
            </div>
          </div>

          {/* ═══ SECCIÓN INSTRUCTOR ═══ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UserPlusIcon className="w-5 h-5 text-danger" />
              <h3 className="text-lg font-semibold text-default-800">Instructor</h3>
              <Chip size="sm" variant="flat" color="default" className="ml-2">
                Opcional
              </Chip>
            </div>
            <Divider className="bg-danger/20" />
            
            <div className="grid grid-cols-3 gap-3">
              <Card
                isPressable
                onPress={() => handleModeChange("buscar")}
                className={`cursor-pointer border-2 transition-all duration-300 hover:scale-[1.02] ${
                  instructorMode === "buscar"
                    ? "border-danger bg-danger-50 dark:bg-danger-900/20 shadow-lg shadow-danger/20"
                    : "border-default-200 hover:border-danger/50 hover:shadow-md"
                }`}
              >
                <CardBody className="flex flex-col items-center gap-2 py-4 text-center">
                  <div className={`p-2 rounded-full transition-all ${
                    instructorMode === "buscar" ? "bg-danger/10" : "bg-default-100"
                  }`}>
                    <MagnifyingGlassIcon
                      className={`w-6 h-6 ${
                        instructorMode === "buscar" ? "text-danger" : "text-default-500"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      instructorMode === "buscar" ? "text-danger" : "text-default-600"
                    }`}
                  >
                    Buscar existente
                  </span>
                  <span className="text-xs text-default-400">
                    Selecciona de la base
                  </span>
                </CardBody>
              </Card>

              <Card
                isPressable
                onPress={() => handleModeChange("crear")}
                className={`cursor-pointer border-2 transition-all duration-300 hover:scale-[1.02] ${
                  instructorMode === "crear"
                    ? "border-danger bg-danger-50 dark:bg-danger-900/20 shadow-lg shadow-danger/20"
                    : "border-default-200 hover:border-danger/50 hover:shadow-md"
                }`}
              >
                <CardBody className="flex flex-col items-center gap-2 py-4 text-center">
                  <div className={`p-2 rounded-full transition-all ${
                    instructorMode === "crear" ? "bg-danger/10" : "bg-default-100"
                  }`}>
                    <UserPlusIcon
                      className={`w-6 h-6 ${
                        instructorMode === "crear" ? "text-danger" : "text-default-500"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      instructorMode === "crear" ? "text-danger" : "text-default-600"
                    }`}
                  >
                    Crear nuevo
                  </span>
                  <span className="text-xs text-default-400">
                    Registrar instructor
                  </span>
                </CardBody>
              </Card>

              <Card
                isPressable
                onPress={() => handleModeChange("despues")}
                className={`cursor-pointer border-2 transition-all duration-300 hover:scale-[1.02] ${
                  instructorMode === "despues"
                    ? "border-warning bg-warning-50 dark:bg-warning-900/20 shadow-lg shadow-warning/20"
                    : "border-default-200 hover:border-warning/50 hover:shadow-md"
                }`}
              >
                <CardBody className="flex flex-col items-center gap-2 py-4 text-center">
                  <div className={`p-2 rounded-full transition-all ${
                    instructorMode === "despues" ? "bg-warning/10" : "bg-default-100"
                  }`}>
                    <ClockIcon
                      className={`w-6 h-6 ${
                        instructorMode === "despues" ? "text-warning" : "text-default-500"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      instructorMode === "despues" ? "text-warning" : "text-default-600"
                    }`}
                  >
                    Asignar después
                  </span>
                  <span className="text-xs text-default-400">
                    Pendiente
                  </span>
                </CardBody>
              </Card>
            </div>

            {instructorMode === "buscar" && (
              <div className="mt-4 animate-fade-in">
                {instructorSeleccionado && form.instructorId ? (
                  <div className="flex items-center gap-3 rounded-xl bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 p-4">
                    <div className="p-1.5 bg-success-100 dark:bg-success-900/40 rounded-full">
                      <CheckCircleIcon className="w-5 h-5 text-success-600 dark:text-success-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-success-700 dark:text-success-300">
                        <span className="font-semibold">
                          {instructorSeleccionado.nombre} {instructorSeleccionado.apellidoPaterno}
                        </span>{" "}
                        seleccionado como instructor
                      </p>
                      {instructorSeleccionado.email && (
                        <p className="text-xs text-success-600 dark:text-success-400 mt-1">
                          {instructorSeleccionado.email}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="light"
                      color="success"
                      onPress={() => {
                        handleChange("instructorId", null);
                        setInstructorSeleccionado(null);
                        setInstructorSearch("");
                        setInstructores([]);
                      }}
                      className="font-medium"
                    >
                      Cambiar
                    </Button>
                  </div>
                ) : (
                  <Autocomplete
                    label="Buscar instructor"
                    inputValue={instructorSearch}
                    onInputChange={(val) => {
                      setInstructorSearch(val);
                      if (!val) {
                        handleChange("instructorId", null);
                        setInstructorSeleccionado(null);
                      }
                    }}
                    items={instructores}
                    selectedKey={form.instructorId ? String(form.instructorId) : null}
                    onSelectionChange={(key) => {
                      if (!key) {
                        handleChange("instructorId", null);
                        setInstructorSeleccionado(null);
                        return;
                      }
                      const found = instructores.find((i) => String(i.id) === String(key));
                      handleChange("instructorId", Number(key));
                      setInstructorSeleccionado(found ?? null);
                    }}
                    isLoading={isLoadingInstructores}
                    placeholder="Escribe el nombre del instructor..."
                    isInvalid={!!errors.instructorId}
                    errorMessage={errors.instructorId}
                    size="lg"
                    classNames={{
                      label: "font-medium",
                    }}
                    startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
                  >
                    {(item: any) => (
                      <AutocompleteItem
                        key={String(item.id)}
                        textValue={`${item.nombre} ${item.apellidoPaterno} ${item.apellidoMaterno ?? ""}`.trim()}
                        description={item.email}
                      >
                        {item.nombre} {item.apellidoPaterno} {item.apellidoMaterno ?? ""}
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                )}
              </div>
            )}

            {instructorMode === "crear" && !form.instructorId && (
              <div className="flex items-start gap-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 p-4 mt-4">
                <div className="p-1.5 bg-primary-100 dark:bg-primary-900/40 rounded-full">
                  <InformationCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    Creando nuevo instructor
                  </p>
                  <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                    Completa el formulario del instructor que se abrirá. Al guardarlo se asignará automáticamente a este curso.
                  </p>
                </div>
              </div>
            )}

            {instructorMode === "despues" && (
              <div className="flex items-start gap-3 rounded-xl bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 p-4 mt-4">
                <div className="p-1.5 bg-warning-100 dark:bg-warning-900/40 rounded-full">
                  <ExclamationTriangleIcon className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-warning-700 dark:text-warning-300">
                    Instructor pendiente
                  </p>
                  <p className="text-xs text-warning-600 dark:text-warning-400 mt-1">
                    El curso se guardará sin instructor. Recuerda asignarlo desde el detalle del curso antes de que inicie.
                  </p>
                </div>
              </div>
            )}

            {!instructorMode && (
              <p className="text-sm text-default-400 text-center py-4 italic">
                Selecciona una opción para continuar con la asignación del instructor
              </p>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t border-default-200 dark:border-default-800">
            <Button
              color="default"
              variant="light"
              onPress={onClose}
              size="lg"
              className="font-medium"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              color="danger"
              size="lg"
              isLoading={isLoading}
              className="font-medium px-8"
              startContent={!isLoading && <AcademicCapIcon className="w-5 h-5" />}
            >
              {cursoToEdit ? "Actualizar curso" : "Crear curso"}
            </Button>
          </div>
        </form>
      </ModalForm>

      <InstructorModal
        isOpen={modalInstructorAbierto}
        onClose={() => {
          setModalInstructorAbierto(false);
          if (!form.instructorId) setInstructorMode(null);
        }}
        onSuccess={handleInstructorCreado}
      />
    </>
  );
}