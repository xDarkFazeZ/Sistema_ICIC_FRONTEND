// src/components/dashboard/CalendarioCursos.tsx
import { useState } from "react";
import Calendar from "react-calendar";
import { Chip, ScrollShadow } from "@heroui/react";
import {
  MapPinIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import "./calendario.css";

interface Participante {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
}

interface Curso {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  horario?: string;
  estado: "PROXIMO" | "EN_CURSO" | "TERMINADO";
  aula?: string;
  instructor?: {
    nombre: string;
    apellidoPaterno: string;
  };
  inscritos: number;
  participantes?: Participante[];
}

interface Props {
  cursos: Curso[];
}

function getCursosDelDia(cursos: Curso[], date: Date): Curso[] {
  return cursos.filter((curso) => {
    const inicio = new Date(curso.fechaInicio);
    const fin = new Date(curso.fechaFin);
    const d = new Date(date);
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(23, 59, 59, 999);
    d.setHours(0, 0, 0, 0);
    return d >= inicio && d <= fin;
  });
}

const ESTADO_CONFIG = {
  PROXIMO:   { label: "Próximo",   color: "primary" as const,  emoji: "🕐" },
  EN_CURSO:  { label: "En curso",  color: "success" as const,  emoji: "▶️" },
  TERMINADO: { label: "Terminado", color: "default" as const,  emoji: "✅" },
};

const ESTADO_STYLES = {
  PROXIMO:   { bg: "bg-blue-50 dark:bg-blue-900/20",   border: "border-blue-200 dark:border-blue-800",   icon: "🕐", text: "text-blue-600 dark:text-blue-400"   },
  EN_CURSO:  { bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800", icon: "▶️", text: "text-green-600 dark:text-green-400" },
  TERMINADO: { bg: "bg-gray-50 dark:bg-gray-700/40",   border: "border-gray-200 dark:border-gray-600",   icon: "✅", text: "text-gray-500 dark:text-gray-400"   },
};

// ── CursoCard ────────────────────────────────────────────

function CursoCard({ curso }: { curso: Curso }) {
  const [showParticipantes, setShowParticipantes] = useState(false);
  const cfg = ESTADO_CONFIG[curso.estado];

  return (
    <div className="border border-default-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between p-4 pb-2">
        <h5 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug flex-1 pr-3">
          {curso.nombre}
        </h5>
        <Chip size="sm" color={cfg.color} variant="flat" className="shrink-0 text-xs">
          {cfg.emoji} {cfg.label}
        </Chip>
      </div>

      <div className="px-4 pb-4 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <CalendarDaysIcon className="w-3.5 h-3.5 shrink-0" />
          <span>
            {new Date(curso.fechaInicio).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
            {" — "}
            {new Date(curso.fechaFin).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>

        {curso.horario && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <ClockIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{curso.horario}</span>
          </div>
        )}

        {curso.aula && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
            <span>Aula: {curso.aula}</span>
          </div>
        )}

        {curso.instructor && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <AcademicCapIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{curso.instructor.nombre} {curso.instructor.apellidoPaterno}</span>
          </div>
        )}

        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowParticipantes((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline"
          >
            <UserGroupIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{curso.inscritos} participante{curso.inscritos !== 1 ? "s" : ""}</span>
            <span className="text-default-400">{showParticipantes ? "▲" : "▼"}</span>
          </button>

          {showParticipantes && (
            <ScrollShadow className="mt-2 max-h-32">
              <div className="space-y-1">
                {curso.participantes && curso.participantes.length > 0 ? (
                  curso.participantes.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-default-50 dark:bg-gray-700/50">
                      <span className="text-[10px] text-default-400 w-4 text-right shrink-0">{i + 1}.</span>
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        {p.nombre} {p.apellidoPaterno} {p.apellidoMaterno || ""}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-default-400 italic pl-2">Sin participantes registrados</p>
                )}
              </div>
            </ScrollShadow>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────

export default function CalendarioCursos({ cursos }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const cursosDelDia = getCursosDelDia(cursos, selectedDate);

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;
    const lista = getCursosDelDia(cursos, date);
    if (lista.length === 0) return null;
    const tieneEnCurso = lista.some((c) => c.estado === "EN_CURSO");
    const tieneProximo = lista.some((c) => c.estado === "PROXIMO");
    if (tieneEnCurso) return "tiene-curso en-curso";
    if (tieneProximo) return "tiene-curso proximo";
    return "tiene-curso terminado";
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;
    const lista = getCursosDelDia(cursos, date);
    if (lista.length === 0) return null;
    const tieneEnCurso = lista.some((c) => c.estado === "EN_CURSO");
    const tieneProximo = lista.some((c) => c.estado === "PROXIMO");
    const dotColor = tieneEnCurso ? "#22c55e" : tieneProximo ? "#3b82f6" : "#9ca3af";
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "1px" }}>
        <span style={{
          width: "5px", height: "5px", borderRadius: "50%",
          background: dotColor, display: "inline-block",
        }} />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Fila 1: Calendario + Cursos del día ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Calendario */}
        <div className="lg:col-span-2 p-4 rounded-xl border border-default-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          <Calendar
            onChange={(val) => setSelectedDate(val as Date)}
            value={selectedDate}
            tileClassName={tileClassName}
            tileContent={tileContent}
            locale="es-MX"
            prev2Label={null}
            next2Label={null}
            formatShortWeekday={(_, date) =>
              date.toLocaleDateString("es-MX", { weekday: "narrow" })
            }
          />
        </div>

        {/* Cursos del día */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm border-b border-default-200 dark:border-gray-700 pb-2 capitalize">
            📅 {selectedDate.toLocaleDateString("es-MX", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}
          </h4>

          {cursosDelDia.length > 0 ? (
            <ScrollShadow className="max-h-72">
              <div className="space-y-3 pr-1">
                {cursosDelDia.map((curso) => (
                  <CursoCard key={curso.id} curso={curso} />
                ))}
              </div>
            </ScrollShadow>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-default-200 dark:border-gray-700 bg-default-50 dark:bg-gray-800/30">
              <CalendarDaysIcon className="w-12 h-12 text-default-300 dark:text-gray-600 mb-3" />
              <p className="text-default-500 dark:text-gray-400 font-medium text-sm">Sin cursos este día</p>
              <p className="text-xs text-default-400 dark:text-gray-500 mt-1">Selecciona otro día</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Fila 2: Estado + Resumen ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Estado de cursos */}
        <div className="p-5 rounded-xl border border-default-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
            Estado de cursos
          </p>
          <div className="grid grid-cols-3 gap-3">
            {(["PROXIMO", "EN_CURSO", "TERMINADO"] as const).map((estado) => {
              const cfg = ESTADO_CONFIG[estado];
              const styles = ESTADO_STYLES[estado];
              const count = cursos.filter((c) => c.estado === estado).length;
              return (
                <div key={estado} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border ${styles.bg} ${styles.border}`}>
                  <span className="text-2xl">{styles.icon}</span>
                  <p className={`text-3xl font-extrabold ${styles.text}`}>{count}</p>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center leading-tight">
                    {cfg.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumen general */}
        <div className="p-5 rounded-xl border border-default-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
            Resumen general
          </p>
          <div className="grid grid-cols-2 gap-3">

            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="p-2.5 rounded-lg bg-red-100 dark:bg-red-900/40 shrink-0">
                <CalendarDaysIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-red-600 dark:text-red-400">{cursos.length}</p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">Total cursos</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
              <div className="p-2.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 shrink-0">
                <UserGroupIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {cursos.reduce((sum, c) => sum + c.inscritos, 0)}
                </p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">Total inscritos</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 shrink-0">
                <ClockIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                  {getCursosDelDia(cursos, new Date()).length}
                </p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">Cursos hoy</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
              <div className="p-2.5 rounded-lg bg-teal-100 dark:bg-teal-900/40 shrink-0">
                <AcademicCapIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">
                  {new Set(
                    cursos
                      .filter(c => c.instructor)
                      .map(c => `${c.instructor!.nombre} ${c.instructor!.apellidoPaterno}`)
                  ).size}
                </p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">Instructores</p>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}