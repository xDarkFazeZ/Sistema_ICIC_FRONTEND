// src/components/dashboard/CalendarioCursos.tsx
import { useState } from 'react';
import Calendar from 'react-calendar';
import { Card, Chip } from "@heroui/react";
import { Calendar as CalendarIcon, MapPin, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

interface Curso {
    id: number;
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    estado: 'PROXIMO' | 'EN_CURSO' | 'TERMINADO';
    aula?: string;
    instructor?: {
        nombre: string;
        apellidoPaterno: string;
    };
    inscritos: number;
}

interface Props {
    cursos: Curso[];
}

export default function CalendarioCursos({ cursos }: Props) {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const getCursosDelDia = (date: Date) => {
        return cursos.filter(curso => {
            const inicio = new Date(curso.fechaInicio);
            const fin = new Date(curso.fechaFin);
            inicio.setHours(0, 0, 0, 0);
            fin.setHours(23, 59, 59, 999);
            const dateCopy = new Date(date);
            dateCopy.setHours(0, 0, 0, 0);
            return dateCopy >= inicio && dateCopy <= fin;
        });
    };

    const tileClassName = ({ date, view }: { date: Date; view: string }) => {
        if (view === 'month') {
            const cursosDia = getCursosDelDia(date);
            if (cursosDia.length > 0) {
                const tieneProximo = cursosDia.some(c => c.estado === 'PROXIMO');
                const tieneEnCurso = cursosDia.some(c => c.estado === 'EN_CURSO');

                if (tieneEnCurso) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-medium';
                if (tieneProximo) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-medium';
                return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 font-medium';
            }
        }
        return null;
    };

    const tileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view === 'month') {
            const cursosDia = getCursosDelDia(date);
            if (cursosDia.length > 0) {
                return (
                    <div className="flex justify-center mt-0.5">
                        <span className="text-[10px] font-bold bg-white/50 dark:bg-black/50 px-1.5 py-0.5 rounded-full">
                            {cursosDia.length}
                        </span>
                    </div>
                );
            }
        }
        return null;
    };

    const cursosSeleccionados = getCursosDelDia(selectedDate);

    return (
        <Card className="p-6 bg-white dark:bg-gray-900">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Calendar
                        onChange={setSelectedDate}
                        value={selectedDate}
                        tileClassName={tileClassName}
                        tileContent={tileContent}
                        locale="es-MX"
                        prevLabel={<ChevronLeft className="w-5 h-5" />}
                        nextLabel={<ChevronRight className="w-5 h-5" />}
                        prev2Label={null}
                        next2Label={null}
                        formatMonthYear={(locale, date) => {
                            return date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
                        }}
                        formatShortWeekday={(locale, date) => {
                            return date.toLocaleDateString('es-MX', { weekday: 'narrow' });
                        }}
                        className="rounded-lg border-none shadow-sm w-full"
                    />

                    <div className="mt-6 space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            📌 Estado de cursos:
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Próximos a iniciar</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg shadow-green-500/30"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">En curso</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-gray-500 shadow-lg shadow-gray-500/30"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Terminados</span>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-blue-100 dark:border-gray-700">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">
                            📊 Resumen rápido
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {cursos.filter(c => c.estado === 'PROXIMO').length}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Próximos</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                    {cursos.filter(c => c.estado === 'EN_CURSO').length}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">En curso</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-600 dark:text-gray-400">
                                    {cursos.filter(c => c.estado === 'TERMINADO').length}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Terminados</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg border-b border-gray-200 dark:border-gray-700 pb-2">
                        {selectedDate.toLocaleDateString('es-MX', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </h4>

                    {cursosSeleccionados.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 
                          [&::-webkit-scrollbar]:w-1.5
                          [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:dark:bg-gray-800
                          [&::-webkit-scrollbar-track]:rounded-full
                          [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:dark:bg-gray-600
                          [&::-webkit-scrollbar-thumb]:rounded-full
                          [&::-webkit-scrollbar-thumb:hover]:bg-gray-400 [&::-webkit-scrollbar-thumb:hover]:dark:bg-gray-500">
                            {cursosSeleccionados.map(curso => (
                                <div
                                    key={curso.id}
                                    className="group p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800/50 hover:border-red-300 dark:hover:border-red-800"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h5 className="font-semibold text-gray-900 dark:text-white text-lg">
                                            {curso.nombre}
                                        </h5>
                                        <Chip
                                            size="sm"
                                            className={
                                                curso.estado === 'PROXIMO'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-medium px-3'
                                                    : curso.estado === 'EN_CURSO'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 font-medium px-3'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 font-medium px-3'
                                            }
                                        >
                                            {curso.estado === 'PROXIMO' ? '🕐 Próximo' :
                                                curso.estado === 'EN_CURSO' ? '▶️ En curso' : '✅ Terminado'}
                                        </Chip>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        {curso.instructor && (
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                <span className="text-lg">👨‍🏫</span>
                                                <span>{curso.instructor.nombre} {curso.instructor.apellidoPaterno}</span>
                                            </div>
                                        )}

                                        {curso.aula && (
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                <MapPin className="w-4 h-4" />
                                                <span>Aula: {curso.aula}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Users className="w-4 h-4" />
                                            <span>{curso.inscritos} participantes</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 md:col-span-2">
                                            <CalendarIcon className="w-4 h-4" />
                                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                                                {new Date(curso.fechaInicio).toLocaleDateString('es-MX', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })} - {new Date(curso.fechaFin).toLocaleDateString('es-MX', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                            <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                                No hay cursos programados
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                Selecciona otra fecha para ver más opciones
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}