// src/components/dashboard/GraficoBarras.tsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LabelList,
} from "recharts";

interface Props {
  data: Array<{ mes: string; total: number }>;
}

const BAR_MIN_WIDTH = 60;

// Tooltip personalizado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg border border-gray-700">
        <p className="font-semibold mb-0.5">{label}</p>
        <p className="text-red-400">
          {payload[0].value} inscripción{payload[0].value !== 1 ? "es" : ""}
        </p>
      </div>
    );
  }
  return null;
};

export default function GraficoBarras({ data }: Props) {
  // Formatear "2025-03" → "mar 25"
const formattedData = data.map(item => ({
  ...item,
  mes: new Date(item.mes + "-02T12:00:00Z")
    .toLocaleDateString("es-MX", { month: "short", year: "2-digit" }),
}));

  const dynamicMinWidth = Math.max(formattedData.length * BAR_MIN_WIDTH, 300);

  return (
    <div className="h-72 w-full overflow-x-auto">
      <div style={{ minWidth: `${dynamicMinWidth}px`, height: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{ top: 24, right: 24, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-gray-200 dark:stroke-gray-700"
              vertical={false}
            />
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 11 }}
              className="text-xs text-gray-600 dark:text-gray-400"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11 }}
              className="text-xs text-gray-600 dark:text-gray-400"
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(239,68,68,0.07)" }} />
            <Bar
              dataKey="total"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            >
              {/* Número encima de cada barra */}
              <LabelList
                dataKey="total"
                position="top"
                style={{ fontSize: 11, fill: "#6b7280", fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}