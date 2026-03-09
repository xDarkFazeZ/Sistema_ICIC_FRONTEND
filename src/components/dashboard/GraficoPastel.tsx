// src/components/dashboard/GraficoPastel.tsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: Array<{ nombre: string; total: number }>;
}

const COLORS = [
  "#ef4444", "#3b82f6", "#10b981", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#f97316",
  "#84cc16", "#14b8a6", "#a855f7", "#fb923c",
];

// Tooltip personalizado
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const { nombre, total } = payload[0].payload;
    const pct = payload[0].payload.__pct;
    return (
      <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg border border-gray-700 max-w-[200px]">
        <p className="font-semibold leading-snug mb-1">{nombre}</p>
        <p className="text-gray-300">
          {total} inscripción{total !== 1 ? "es" : ""}
        </p>
        <p className="text-red-400 font-semibold">{pct}%</p>
      </div>
    );
  }
  return null;
};

export default function GraficoPastel({ data }: Props) {
  const total = data.reduce((sum, item) => sum + item.total, 0);

  // Inyectar el porcentaje en cada dato para usarlo en el tooltip
  const enriched = data.map(item => ({
    ...item,
    __pct: total > 0 ? ((item.total / total) * 100).toFixed(1) : "0",
  }));

  return (
    <div className="flex flex-col md:flex-row gap-6 items-center w-full">

      {/* ── Donut ── */}
      <div className="w-full md:w-1/2 h-56 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={enriched}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={96}
              paddingAngle={3}
              dataKey="total"
              nameKey="nombre"
            >
              {enriched.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="transparent"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ── Leyenda ── */}
      <div className="w-full md:w-1/2 flex flex-col gap-2 overflow-y-auto max-h-56 pr-1">
        {enriched.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            {/* Dot */}
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            {/* Nombre del curso */}
            <span className="text-xs text-gray-700 dark:text-gray-300 flex-1 leading-tight">
              {item.nombre}
            </span>
            {/* Porcentaje y conteo */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {item.__pct}%
              </span>
              <span className="text-[11px] text-gray-400 dark:text-gray-500">
                ({item.total})
              </span>
            </div>
          </div>
        ))}

        {/* Total */}
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400">
          <span>Total</span>
          <span>{total} inscripción{total !== 1 ? "es" : ""}</span>
        </div>
      </div>

    </div>
  );
}