import {
  Input,
  Textarea,
  Autocomplete,
  AutocompleteItem,
  Switch,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import {
  buscarInstructores,
  obtenerInstructorPorId,
} from "../../../services/instructorService";
import ModalForm from "../../common/modalForm";

interface CursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  cursoToEdit?: any;
  isLoading?: boolean;
}

export default function CursoModal({
  isOpen,
  onClose,
  onSubmit,
  cursoToEdit,
  isLoading = false,
}: CursoModalProps) {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precioAfiliado: "",
    precioPublico: "",
    duracion: "",
    horario: "",
    fechaInicio: "",
    fechaFin: "",
    aula: "",
    nivelGerencial: "",
    activo: true,
    instructorId: null as number | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [instructorSearch, setInstructorSearch] = useState("");
  const [debouncedSearch] = useDebounce(instructorSearch, 400);
  const [instructores, setInstructores] = useState<any[]>([]);
  const [isLoadingInstructores, setIsLoadingInstructores] = useState(false);

  // Reset al cerrar
  useEffect(() => {
    if (!isOpen) {
      setForm({
        nombre: "", descripcion: "", precioAfiliado: "", precioPublico: "",
        duracion: "", horario: "", fechaInicio: "", fechaFin: "",
        aula: "", nivelGerencial: "", activo: true, instructorId: null,
      });
      setInstructorSearch("");
      setInstructores([]);
      setErrors({});
    }
  }, [isOpen]);

  // Edit mode
  useEffect(() => {
    if (cursoToEdit && isOpen) {
      setForm({
        nombre: cursoToEdit.nombre ?? "",
        descripcion: cursoToEdit.descripcion ?? "",
        precioAfiliado: String(cursoToEdit.precioAfiliado ?? ""),
        precioPublico: String(cursoToEdit.precioPublico ?? ""),
        duracion: String(cursoToEdit.duracion ?? ""),
        horario: cursoToEdit.horario ?? "",
        fechaInicio: cursoToEdit.fechaInicio?.substring(0, 10) ?? "",
        fechaFin: cursoToEdit.fechaFin?.substring(0, 10) ?? "",
        aula: cursoToEdit.aula ?? "",
        nivelGerencial: cursoToEdit.nivelGerencial ?? "",
        activo: cursoToEdit.activo ?? true,
        instructorId: cursoToEdit.instructorId ?? null,
      });
    }
  }, [cursoToEdit, isOpen]);

  // Cargar nombre instructor en edit
  useEffect(() => {
    const loadInstructor = async () => {
      if (cursoToEdit?.instructorId && isOpen) {
        const inst = await obtenerInstructorPorId(cursoToEdit.instructorId);
        setInstructorSearch(
          `${inst.nombre} ${inst.apellidoPaterno} ${inst.apellidoMaterno}`
        );
        setInstructores([inst]);
      }
    };
    loadInstructor();
  }, [cursoToEdit, isOpen]);

  // Buscar instructores con debounce
  useEffect(() => {
    const fetchInstructores = async () => {
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
  }, [debouncedSearch]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.nombre || form.nombre.trim().length < 3)
      newErrors.nombre = "Nombre muy corto";
    if (!form.aula)
      newErrors.aula = "Aula requerida";
    if (!form.nivelGerencial)
      newErrors.nivelGerencial = "Nivel requerido";
    if (form.precioAfiliado === "" || isNaN(Number(form.precioAfiliado)))
      newErrors.precioAfiliado = "Precio inválido";
    if (form.precioPublico === "" || isNaN(Number(form.precioPublico)))
      newErrors.precioPublico = "Precio inválido";
    if (Number(form.precioAfiliado) > Number(form.precioPublico))
      newErrors.precioAfiliado = "Precio afiliado debe ser ≤ precio público";
    if (!form.fechaInicio)
      newErrors.fechaInicio = "Fecha inicio requerida";
    if (!form.fechaFin)
      newErrors.fechaFin = "Fecha fin requerida";
    if (form.fechaInicio && form.fechaFin && form.fechaFin <= form.fechaInicio)
      newErrors.fechaFin = "Fecha fin debe ser posterior a fecha inicio";
    if (!form.instructorId)
      newErrors.instructorId = "Selecciona un instructor";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const payload = {
      ...form,
      precioAfiliado: Number(form.precioAfiliado),
      precioPublico: Number(form.precioPublico),
      duracion: form.duracion ? Number(form.duracion) : undefined,
    };
    onSubmit(payload);
  };

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title={cursoToEdit ? "Editar Curso" : "Nuevo Curso"}
      size="2xl"
      isLoading={isLoading}
    >
      <form id="modal-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <Input
          label="Nombre"
          value={form.nombre}
          onValueChange={(v) => handleChange("nombre", v)}
          isRequired
          isInvalid={!!errors.nombre}
          errorMessage={errors.nombre}
        />

        <Input
          label="Aula"
          value={form.aula}
          onValueChange={(v) => handleChange("aula", v)}
          isRequired
          isInvalid={!!errors.aula}
          errorMessage={errors.aula}
        />

        <Input
          type="number"
          label="Precio Afiliado"
          value={form.precioAfiliado}
          onValueChange={(v) => handleChange("precioAfiliado", v)}
          isRequired
          isInvalid={!!errors.precioAfiliado}
          errorMessage={errors.precioAfiliado}
          startContent={<span className="text-default-400 text-sm">$</span>}
        />

        <Input
          type="number"
          label="Precio Público"
          value={form.precioPublico}
          onValueChange={(v) => handleChange("precioPublico", v)}
          isRequired
          isInvalid={!!errors.precioPublico}
          errorMessage={errors.precioPublico}
          startContent={<span className="text-default-400 text-sm">$</span>}
        />

        <Input
          type="number"
          label="Duración (horas)"
          value={form.duracion}
          onValueChange={(v) => handleChange("duracion", v)}
        />

        <Input
          label="Horario"
          value={form.horario}
          onValueChange={(v) => handleChange("horario", v)}
          placeholder="09:00 - 14:00"
        />

        <Input
          type="date"
          label="Fecha Inicio"
          value={form.fechaInicio}
          onValueChange={(v) => handleChange("fechaInicio", v)}
          isRequired
          isInvalid={!!errors.fechaInicio}
          errorMessage={errors.fechaInicio}
          labelPlacement="outside"
          placeholder=" "
        />

        <Input
          type="date"
          label="Fecha Fin"
          value={form.fechaFin}
          onValueChange={(v) => handleChange("fechaFin", v)}
          isRequired
          isInvalid={!!errors.fechaFin}
          errorMessage={errors.fechaFin}
          labelPlacement="outside"
          placeholder=" "
        />

        <Input
          label="Nivel Gerencial"
          value={form.nivelGerencial}
          onValueChange={(v) => handleChange("nivelGerencial", v)}
          isRequired
          isInvalid={!!errors.nivelGerencial}
          errorMessage={errors.nivelGerencial}
          placeholder="Básico / Intermedio / Avanzado"
        />

        <div className="flex items-center">
          <Switch
            isSelected={form.activo}
            onValueChange={(v) => handleChange("activo", v)}
          >
            Activo
          </Switch>
        </div>

        <div className="col-span-2">
          <Textarea
            label="Descripción"
            value={form.descripcion}
            onValueChange={(v) => handleChange("descripcion", v)}
          />
        </div>

        <div className="col-span-2">
          <Autocomplete
            label="Instructor"
            inputValue={instructorSearch}
            onInputChange={(val) => {
              setInstructorSearch(val);
              if (!val) handleChange("instructorId", null);
            }}
            items={instructores}
            selectedKey={form.instructorId ? String(form.instructorId) : null}
            onSelectionChange={(key) => {
              if (!key) { handleChange("instructorId", null); return; }
              handleChange("instructorId", Number(key));
            }}
            isLoading={isLoadingInstructores}
            placeholder="Escribe el nombre del instructor..."
            isRequired
            isInvalid={!!errors.instructorId}
            errorMessage={errors.instructorId}
          >
            {(item: any) => (
              <AutocompleteItem
                key={String(item.id)}
                textValue={`${item.nombre} ${item.apellidoPaterno} ${item.apellidoMaterno}`}
              >
                {item.nombre} {item.apellidoPaterno} {item.apellidoMaterno}
              </AutocompleteItem>
            )}
          </Autocomplete>
        </div>
      </form>
    </ModalForm>
  );
}