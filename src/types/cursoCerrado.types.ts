/**
 * cursoCerrado.types.ts
 *
 * Tipos del FRONTEND para el wizard de curso cerrado.
 * Repos separados → NO importamos de @prisma/client.
 * Los tipos reflejan lo que los endpoints devuelven como JSON,
 * no el schema de Prisma directamente.
 *
 * Regla clave:
 *   Prisma DateTime  →  string  (el JSON viaja como ISO string)
 *   Prisma Float     →  number
 *   Prisma Int       →  number
 *   Prisma Boolean   →  boolean
 *   Prisma String?   →  string | null
 */

import type { CalendarDate } from "@internationalized/date";

// ─── Enums (duplicados del backend, pero son literales — bajo riesgo de drift) ─

export type TipoCurso  = "ABIERTO" | "CERRADO";
export type TipoPrecio = "AFILIADO" | "PUBLICO_GENERAL" | "ESTUDIANTE";
export type MetodoPago =
  | "EFECTIVO"
  | "TRANSFERENCIA"
  | "FECAP"
  | "FINANCIAMIENTO"
  | "SIN_COSTO"
  | "VALE_AFILIACION";
export type EstadoPago = "PENDIENTE" | "PAGADO" | "CANCELADO" | "REEMBOLSADO";
export type Periodicidad = "SEMANAL" | "QUINCENAL" | "MENSUAL";

// ─── Entidades tal como llegan del backend (JSON) ────────────────────────────

/** GET /instructores/:id  o  incluido en curso */
export interface InstructorResumen {
  id:              number;
  nombre:          string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  correo:          string | null;
}

/** GET /empresas/:id  o  incluida en curso */
export interface EmpresaResumen {
  id:                   number;
  nombre:               string;
  rfc:                  string;
  direccion:            string;
  saldoFecapDisponible: number;
}

/** Participante mínimo para la lista del paso 4 */
export interface ParticipanteResumen {
  id:              number;
  nombre:          string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  correo:          string | null;
  celular:         string | null;
  esAfiliado:      boolean | null;
  empresaId:       number | null;
}

/**
 * Curso cerrado tal como lo devuelve GET /cursos/:id
 * fechaInicio y fechaFin son ISO strings en JSON, no objetos Date.
 */
export interface CursoCerradoDetalle {
  id:               number;
  nombre:           string;
  descripcion:      string | null;
  horario:          string;
  fechaInicio:      string;   // ISO string, ej: "2025-06-01T00:00:00.000Z"
  fechaFin:         string;   // ISO string
  duracion:         number;
  aula:             string | null;
  nivelGerencial:   string;
  activo:           boolean;
  instructorId:     number | null;
  empresaId:        number | null;
  tipoCurso:        TipoCurso;
  numParticipantes: number | null;
  precioAfiliado:   number;
  precioPublico:    number;
  precioEstudiante: number;
  // Relaciones incluidas por el endpoint
  instructor:       InstructorResumen | null;
  empresa:          EmpresaResumen | null;
  // Campo virtual del endpoint (include: { _count: { select: { inscripciones: true } } })
  _count?:          { inscripciones: number };
}

// ─── Formularios internos del wizard (estado local, no viajan al backend) ─────

/** Estado del formulario del paso 1 */
export interface CursoCerradoForm {
  nombre:          string;
  descripcion:     string;
  duracion:        string;   // string en el form, Number() antes de enviar
  horario:         string;
  fechaInicio:     string;   // "YYYY-MM-DD"
  fechaFin:        string;   // "YYYY-MM-DD"
  aula:            string;
  nivelGerencial:  string;
  activo:          boolean;
  instructorId:    number | null;
}

/** Estado del sub-form de precios (manejado por useCamposCurso) */
export interface PreciosCerradoForm {
  precioPorParticipante: string;  // string en el input
  numParticipantes:      string;  // string en el input
}

/** Estado del formulario de participante (paso 4) */
export interface ParticipanteNuevoForm {
  nombre:           string;
  apellidoPaterno:  string;
  apellidoMaterno:  string;
  fechaNacimiento:  string;   // "YYYY-MM-DD"
  correo:           string;
  celular:          string;
  esAfiliado:       boolean;
}

// ─── Modos de selección ───────────────────────────────────────────────────────

export type InstructorMode = "buscar" | "crear" | "despues";
export type EmpresaMode    = "buscar" | "crear";

// ─── Payloads que se envían al backend (body del POST/PUT) ────────────────────

/** Body para POST /cursos  y  PUT /cursos/:id */
export interface CursoCerradoPayload {
  nombre:           string;
  descripcion:      string;
  duracion?:        number;
  horario:          string;
  fechaInicio:      string;
  fechaFin:         string;
  aula:             string;
  nivelGerencial:   string;
  activo:           boolean;
  instructorId:     number | null;
  tipoCurso:        Extract<TipoCurso, "CERRADO">;
  empresaId:        number;
  precioAfiliado:   number;
  precioPublico:    number;
  precioEstudiante: number;
  numParticipantes: number;
}

/** Body para POST /participantes */
export interface ParticipantePayload {
  nombre:           string;
  apellidoPaterno:  string;
  apellidoMaterno?: string;
  fechaNacimiento:  string;
  correo?:          string;
  celular?:         string;
  esAfiliado:       boolean;
  empresaId:        number;
}

/** Body para POST /inscripciones/cerrado */
export interface InscripcionCerradaPayload {
  participanteId:     number;
  cursoId:            number | undefined;
  tipoPrecioAplicado: TipoPrecio;
  metodoPago:         Extract<MetodoPago, "EFECTIVO">;
  montoEsperado:      number;
  montoFinal:         number;
  montoDescuento:     number;
  estadoPago:         Extract<EstadoPago, "PAGADO">;
  montoPagado:        number;
  notas:              string;
}

// ─── Respuestas genéricas del backend ────────────────────────────────────────

/** Envelope estándar de éxito */
export interface ApiResponse<T> {
  success: true;
  data:    T;
  message?: string;
}

/** Envelope de lista paginada */
export interface PaginatedResponse<T> {
  success:    true;
  data:       T[];
  pagination: {
    page:  number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ─── Estado del wizard (para referencia, no se instancia directamente) ────────

export type WizardPaso = 1 | 2 | 3 | 4;

// ─── DateRangePicker de HeroUI ────────────────────────────────────────────────

export interface DateRangeValue {
  start: CalendarDate;
  end:   CalendarDate;
}