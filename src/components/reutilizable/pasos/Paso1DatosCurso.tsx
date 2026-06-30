/**
 * Paso1DatosCurso.tsx
 *
 * Paso 1 del wizard: datos básicos e instructor.
 * Sin estado interno — recibe todo por props.
 *
 * Props:
 *  mostrarPrecios (default: true) — cuando es false la sección de costo
 *  se oculta porque los precios van en su propio paso (wizard unificado).
 */

import {
  Button, Card, CardBody, Chip, Divider,
  Input, Select, SelectItem, Switch,
  DateRangePicker, Autocomplete, AutocompleteItem, Textarea,
} from "@heroui/react";
import {
  AcademicCapIcon,
  BuildingOffice2Icon,
  CalculatorIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

import type {
  CursoCerradoForm,
  DateRangeValue,
  InstructorMode,
  InstructorResumen,
  PreciosCerradoForm,
} from "../../../types/cursoCerrado.types";

// ─── Constantes ───────────────────────────────────────────────────────────────

const NIVELES = [
  { key: "Operativo", label: "Operativo", description: "Supervisores y coordinadores" },
  { key: "Medio",     label: "Medio",     description: "Jefes de área y gerentes"     },
  { key: "Directivo", label: "Directivo", description: "Directores y alta dirección"  },
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface Paso1Props {
  // Datos
  form:             CursoCerradoForm;
  errors:           Record<string, string>;
  dateRange:        DateRangeValue | null;
  preciosCerrado:   PreciosCerradoForm;
  costoTotal:       number;
  numP:             number;
  precioPorP:       number;
  // Instructor
  instructorMode:   InstructorMode | null;
  instructorSearch: string;
  instructores:     InstructorResumen[];
  loadingInst:      boolean;
  instructorSel:    InstructorResumen | null;
  /**
   * Cuando es false, la sección "Costo del curso" no se renderiza.
   * Usar false en el wizard unificado (los precios van en PasoPreciosCerrado/Abierto).
   * Por defecto true para compatibilidad con el wizard de cerrado antiguo.
   */
  mostrarPrecios?: boolean;
  // Callbacks
  onChangeForm:             (field: keyof CursoCerradoForm, value: CursoCerradoForm[keyof CursoCerradoForm]) => void;
  onChangeDateRange:        (range: DateRangeValue | null) => void;
  onChangePrecio:           (field: keyof PreciosCerradoForm, value: string) => void;
  onInstructorModeChange:   (mode: InstructorMode) => void;
  onInstructorSearchChange: (value: string) => void;
  onInstructorSelect:       (id: number) => void;
  onClearInstructor:        () => void;
  onOpenModalInstructor:    () => void;
  onSiguiente:              () => void;
  onClose:                  () => void;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Paso1DatosCurso({
  form, errors, dateRange, preciosCerrado, costoTotal, numP, precioPorP,
  instructorMode, instructorSearch, instructores, loadingInst, instructorSel,
  mostrarPrecios = true,
  onChangeForm, onChangeDateRange, onChangePrecio, onInstructorModeChange,
  onInstructorSearchChange, onInstructorSelect, onClearInstructor,
  onOpenModalInstructor, onSiguiente, onClose,
}: Paso1Props) {

  const dateRangeError = errors.fechaInicio || errors.fechaFin;

  return (
    <div className="space-y-6">

      {/* ── Información básica ─────────────────────────────────────────────── */}
      <SectionHeader
        icon={<DocumentTextIcon className="w-5 h-5 text-danger" />}
        title="Información básica"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nombre del curso"
          isRequired
          size="lg"
          className="col-span-2"
          value={form.nombre}
          onValueChange={(v) => onChangeForm("nombre", v)}
          isInvalid={!!errors.nombre}
          errorMessage={errors.nombre}
          placeholder="Ej: Taller de liderazgo empresarial"
          startContent={<AcademicCapIcon className="w-4 h-4 text-default-400" />}
        />
        <Textarea
          label="Descripción"
          className="col-span-2"
          minRows={2}
          value={form.descripcion}
          onValueChange={(v) => onChangeForm("descripcion", v)}
          placeholder="Objetivos y contenido del curso..."
        />
      </div>

      {/* ── Costo del curso — solo cuando mostrarPrecios=true ─────────────── */}
      {mostrarPrecios && (
        <div className="space-y-3">
          <SectionHeader
            icon={<CurrencyDollarIcon className="w-5 h-5 text-danger" />}
            title="Costo del curso"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Precio por participante"
              isRequired
              size="lg"
              value={preciosCerrado.precioPorParticipante}
              onValueChange={(v) => onChangePrecio("precioPorParticipante", v)}
              isInvalid={!!errors.precioPorParticipante}
              errorMessage={errors.precioPorParticipante}
              startContent={<span className="text-default-400 text-sm font-medium">$</span>}
              min={0}
              placeholder="1,200"
            />
            <Input
              type="number"
              label="Número de participantes"
              isRequired
              size="lg"
              value={preciosCerrado.numParticipantes}
              onValueChange={(v) => onChangePrecio("numParticipantes", v)}
              isInvalid={!!errors.numParticipantes}
              errorMessage={errors.numParticipantes}
              startContent={<UsersIcon className="w-4 h-4 text-default-400" />}
              min={1}
              placeholder="20"
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
      )}

      {/* ── Horario y ubicación ───────────────────────────────────────────── */}
      <div className="space-y-3">
        <SectionHeader
          icon={<CalendarIcon className="w-5 h-5 text-danger" />}
          title="Horario y ubicación"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Horario"
            isRequired
            size="lg"
            value={form.horario}
            onValueChange={(v) => onChangeForm("horario", v)}
            isInvalid={!!errors.horario}
            errorMessage={errors.horario}
            placeholder="09:00 - 14:00"
            startContent={<ClockIcon className="w-4 h-4 text-default-400" />}
          />
          <Input
            label="Aula"
            isRequired
            size="lg"
            value={form.aula}
            onValueChange={(v) => onChangeForm("aula", v)}
            isInvalid={!!errors.aula}
            errorMessage={errors.aula}
            placeholder="Ej: Auditorio A"
            startContent={<MapPinIcon className="w-4 h-4 text-default-400" />}
          />
          <DateRangePicker
            label="Periodo del curso"
            isRequired
            size="lg"
            className="col-span-2"
            value={dateRange}
            onChange={onChangeDateRange}
            isInvalid={!!dateRangeError}
            errorMessage={dateRangeError}
            visibleMonths={2}
            pageBehavior="single"
            startContent={<CalendarIcon className="w-4 h-4 text-default-400 flex-shrink-0" />}
          />
          <Input
            type="number"
            label="Duración (horas)"
            size="lg"
            value={form.duracion}
            onValueChange={(v) => onChangeForm("duracion", v)}
            min={1}
            placeholder="40"
            endContent={<span className="text-default-400 text-sm">hrs</span>}
          />
          <Select
            label="Nivel gerencial"
            isRequired
            size="lg"
            selectedKeys={form.nivelGerencial ? new Set([form.nivelGerencial]) : new Set()}
            onSelectionChange={(keys) =>
              onChangeForm("nivelGerencial", (Array.from(keys)[0] as string) ?? "")
            }
            isInvalid={!!errors.nivelGerencial}
            errorMessage={errors.nivelGerencial}
            placeholder="Selecciona un nivel"
            startContent={<ChevronDownIcon className="w-4 h-4 text-default-400" />}
          >
            {NIVELES.map((n) => (
              <SelectItem key={n.key} description={n.description}>
                {n.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="pt-1">
          <Switch
            isSelected={form.activo}
            onValueChange={(v) => onChangeForm("activo", v)}
            color="success"
            size="lg"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium">{form.activo ? "Activo" : "Inactivo"}</span>
              <span className="text-xs text-default-400">{form.activo ? "Visible" : "Oculto"}</span>
            </div>
          </Switch>
        </div>
      </div>

      {/* ── Instructor ───────────────────────────────────────────────────── */}
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
          {(["buscar", "crear", "despues"] as InstructorMode[]).map((mode) => (
            <ModeCard
              key={mode}
              active={instructorMode === mode}
              color={mode === "despues" ? "warning" : "danger"}
              onPress={() => {
                onInstructorModeChange(mode);
                if (mode === "crear") onOpenModalInstructor();
              }}
              icon={
                mode === "buscar"  ? <MagnifyingGlassIcon className="w-6 h-6" />
                : mode === "crear" ? <UserPlusIcon className="w-6 h-6" />
                : <ClockIcon className="w-6 h-6" />
              }
              label={
                mode === "buscar"  ? "Buscar existente"
                : mode === "crear" ? "Crear nuevo"
                : "Asignar después"
              }
              desc={
                mode === "buscar"  ? "Selecciona de la base"
                : mode === "crear" ? "Registrar instructor"
                : "Pendiente"
              }
            />
          ))}
        </div>

        {instructorMode === "buscar" && (
          instructorSel && form.instructorId ? (
            <InstructorSeleccionado
              instructor={instructorSel}
              onClear={onClearInstructor}
            />
          ) : (
            <InstructorBuscador
              search={instructorSearch}
              instructores={instructores}
              loading={loadingInst}
              instructorIdSel={form.instructorId}
              error={errors.instructorId}
              onSearchChange={(v) => {
                onInstructorSearchChange(v);
                if (!v) onClearInstructor();
              }}
              onSelect={(key) => {
                if (key) onInstructorSelect(Number(key));
                else onClearInstructor();
              }}
            />
          )
        )}

        {instructorMode === "despues" && (
          <InfoBanner
            color="warning"
            icon={<ExclamationTriangleIcon className="w-5 h-5" />}
            title="Instructor pendiente"
            desc="El curso se creará sin instructor. Recuerda asignarlo después."
          />
        )}

        {instructorMode === "crear" && !form.instructorId && (
          <InfoBanner
            color="primary"
            icon={<InformationCircleIcon className="w-5 h-5" />}
            title="Creando instructor"
            desc="Completa el formulario. Al guardarlo se asignará automáticamente."
          />
        )}

        {!instructorMode && (
          <p className="text-sm text-default-400 text-center py-3 italic">
            Selecciona una opción para la asignación del instructor
          </p>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="flex justify-end gap-3 pt-4 border-t border-default-200">
        <Button variant="light" onPress={onClose} size="lg">
          Cancelar
        </Button>
        <Button
          color="danger"
          size="lg"
          onPress={onSiguiente}
          startContent={<BuildingOffice2Icon className="w-5 h-5" />}
        >
          Siguiente: Precios
        </Button>
      </div>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <>
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-lg font-semibold text-default-800">{title}</h3>
      </div>
      <Divider className="bg-danger/20" />
    </>
  );
}

function ModeCard({
  active, color, onPress, icon, label, desc,
}: {
  active: boolean;
  color: "danger" | "warning";
  onPress: () => void;
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  const activeClass = color === "danger"
    ? "border-danger bg-danger-50 shadow-danger/20"
    : "border-warning bg-warning-50 shadow-warning/20";
  const activeText = color === "danger" ? "text-danger" : "text-warning";
  const activeBg   = color === "danger" ? "bg-danger/10" : "bg-warning/10";

  return (
    <Card
      isPressable
      onPress={onPress}
      className={`cursor-pointer border-2 transition-all duration-200 hover:scale-[1.02] ${
        active ? `${activeClass} shadow-lg` : "border-default-200 hover:border-default-300"
      }`}
    >
      <CardBody className="flex flex-col items-center gap-2 py-4 text-center">
        <div className={`p-2 rounded-full ${active ? activeBg : "bg-default-100"}`}>
          <span className={active ? activeText : "text-default-500"}>{icon}</span>
        </div>
        <span className={`text-sm font-semibold ${active ? activeText : "text-default-600"}`}>
          {label}
        </span>
        <span className="text-xs text-default-400">{desc}</span>
      </CardBody>
    </Card>
  );
}

function InstructorSeleccionado({
  instructor,
  onClear,
}: {
  instructor: InstructorResumen;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-success-50 border border-success-200 p-4">
      <CheckCircleIcon className="w-5 h-5 text-success-600 shrink-0" />
      <span className="text-sm text-success-700 flex-1 font-semibold">
        {instructor.nombre} {instructor.apellidoPaterno}
      </span>
      <Button size="sm" variant="light" color="success" onPress={onClear}>
        Cambiar
      </Button>
    </div>
  );
}

function InstructorBuscador({
  search,
  instructores,
  loading,
  instructorIdSel,
  error,
  onSearchChange,
  onSelect,
}: {
  search: string;
  instructores: InstructorResumen[];
  loading: boolean;
  instructorIdSel: number | null;
  error?: string;
  onSearchChange: (v: string) => void;
  onSelect: (key: React.Key | null) => void;
}) {
  return (
    <Autocomplete
      label="Buscar instructor"
      size="lg"
      inputValue={search}
      onInputChange={onSearchChange}
      items={instructores}
      selectedKey={instructorIdSel ? String(instructorIdSel) : null}
      onSelectionChange={onSelect}
      isLoading={loading}
      isInvalid={!!error}
      errorMessage={error}
      placeholder="Escribe el nombre del instructor..."
      startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
    >
      {(item: InstructorResumen) => (
        <AutocompleteItem
          key={String(item.id)}
          textValue={`${item.nombre} ${item.apellidoPaterno}`}
        >
          {item.nombre} {item.apellidoPaterno} {item.apellidoMaterno ?? ""}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}

function InfoBanner({
  color, icon, title, desc,
}: {
  color: "primary" | "warning";
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  const cls     = color === "primary"
    ? "bg-primary-50 border-primary-200 text-primary-700"
    : "bg-warning-50 border-warning-200 text-warning-700";
  const iconCls = color === "primary" ? "text-primary-600" : "text-warning-600";

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${cls}`}>
      <span className={`${iconCls} shrink-0`}>{icon}</span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs mt-1 opacity-80">{desc}</p>
      </div>
    </div>
  );
}