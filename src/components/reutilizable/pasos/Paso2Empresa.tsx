/**
 * Paso2Empresa.tsx
 */

import {
  Autocomplete, AutocompleteItem, Button,
  Card, CardBody, Chip, Divider,
} from "@heroui/react";
import {
  MagnifyingGlassIcon, PlusCircleIcon,
  CheckCircleIcon, InformationCircleIcon,
} from "@heroicons/react/24/outline";

import type { EmpresaMode, EmpresaResumen } from "../../../types/cursoCerrado.types";

interface Paso2Props {
  empresaMode:    EmpresaMode;
  empresaSearch:  string;
  empresas:       EmpresaResumen[];
  loadingEmp:     boolean;
  empresaSel:     EmpresaResumen | null;
  empresaErrors:  Record<string, string>;
  onModeChange:   (mode: EmpresaMode) => void;
  onSearchChange: (value: string) => void;
  onEmpresaSelect: (id: number) => void;
  onClearEmpresa:  () => void;
  onOpenModalEmpresa: () => void;
  onSiguiente:     () => void;
  onAnterior:      () => void;
}

export default function Paso2Empresa({
  empresaMode, empresaSearch, empresas, loadingEmp,
  empresaSel, empresaErrors,
  onModeChange, onSearchChange, onEmpresaSelect, onClearEmpresa,
  onOpenModalEmpresa, onSiguiente, onAnterior,
}: Paso2Props) {
  return (
    <div className="space-y-6">
      {/* Banner informativo */}
      <div className="flex items-start gap-3 rounded-xl bg-primary-50 border border-primary-200 p-4">
        <InformationCircleIcon className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-primary-700">Empresa del curso cerrado</p>
          <p className="text-xs text-primary-600 mt-1 opacity-80">
            Todos los participantes inscritos quedarán vinculados a esta empresa.
          </p>
        </div>
      </div>

      {/* Tarjetas de modo */}
      <div className="grid grid-cols-2 gap-3">
        {(["buscar", "crear"] as EmpresaMode[]).map((mode) => {
          const active = empresaMode === mode;
          return (
            <Card
              key={mode}
              isPressable
              onPress={() => onModeChange(mode)}
              className={`cursor-pointer border-2 transition-all hover:scale-[1.02] ${
                active
                  ? "border-danger bg-danger-50 shadow-lg shadow-danger/20"
                  : "border-default-200 hover:border-default-300"
              }`}
            >
              <CardBody className="flex flex-col items-center gap-2 py-4 text-center">
                <span className={active ? "text-danger" : "text-default-500"}>
                  {mode === "buscar"
                    ? <MagnifyingGlassIcon className="w-6 h-6" />
                    : <PlusCircleIcon className="w-6 h-6" />}
                </span>
                <span className={`text-sm font-semibold ${active ? "text-danger" : "text-default-600"}`}>
                  {mode === "buscar" ? "Buscar existente" : "Crear nueva"}
                </span>
                <span className="text-xs text-default-400">
                  {mode === "buscar" ? "Empresa ya registrada" : "Registrar empresa"}
                </span>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Empresa seleccionada */}
      {empresaSel ? (
        <div className="flex items-center gap-3 rounded-xl bg-success-50 border border-success-200 p-4">
          <div className="p-2 bg-success-100 rounded-full">
            <CheckCircleIcon className="w-5 h-5 text-success-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-success-700">{empresaSel.nombre}</p>
            <p className="text-xs text-success-600 mt-0.5">RFC: {empresaSel.rfc}</p>
            {empresaSel.direccion && (
              <p className="text-xs text-success-500 mt-0.5">{empresaSel.direccion}</p>
            )}
          </div>
          <Button size="sm" variant="light" color="success" onPress={onClearEmpresa}>
            Cambiar
          </Button>
        </div>
      ) : empresaMode === "buscar" ? (
        <Autocomplete
          label="Buscar empresa" size="lg"
          inputValue={empresaSearch}
          onInputChange={(v) => {
            onSearchChange(v);
            if (!v) onClearEmpresa();
          }}
          items={empresas}
          isLoading={loadingEmp}
          isInvalid={!!empresaErrors.empresa}
          errorMessage={empresaErrors.empresa}
          onSelectionChange={(key) => {
            if (key) onEmpresaSelect(Number(key));
            else onClearEmpresa();
          }}
          placeholder="Nombre o RFC de la empresa..."
          startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
        >
          {(emp: EmpresaResumen) => (
            <AutocompleteItem
              key={String(emp.id)}
              textValue={emp.nombre}
              description={`RFC: ${emp.rfc}`}
            >
              {emp.nombre}
            </AutocompleteItem>
          )}
        </Autocomplete>
      ) : (
        /* Modo crear */
        <div className="flex items-start gap-3 rounded-xl bg-primary-50 border border-primary-200 p-4">
          <InformationCircleIcon className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-primary-700">Crear empresa</p>
            <p className="text-xs text-primary-600 mt-1">
              Abre el formulario para registrar una nueva empresa.
            </p>
            <Button
              size="sm" color="primary" variant="flat" className="mt-2"
              onPress={onOpenModalEmpresa}
              startContent={<PlusCircleIcon className="w-4 h-4" />}
            >
              Abrir formulario
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between gap-3 pt-4 border-t border-default-200">
        <Button variant="flat" size="lg" onPress={onAnterior}>← Anterior</Button>
        <Button
          color="danger" size="lg" onPress={onSiguiente}
          startContent={<CheckCircleIcon className="w-5 h-5" />}
        >
          Siguiente: Confirmar
        </Button>
      </div>
    </div>
  );
}