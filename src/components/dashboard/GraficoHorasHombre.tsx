import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface DataPoint {
  mes: string;
  total: number;
}

interface Props {
  data: DataPoint[];
}

const MESES: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
};

const formatMes = (clave: string) => {
  const [año, mes] = clave.split("-");
  return `${MESES[mes] ?? mes} ${año}`;
};

export default function GraficoHorasHombre({ data }: Props) {
  if (!data || data.length === 0) return null;

  const dataFormateada = data.map((d) => ({
    ...d,
    mesLabel: formatMes(d.mes),
  }));

  // Total acumulado para mostrar en el tooltip
  const totalGeneral = data.reduce((s, d) => s + d.total, 0);

  return (
    <div className="space-y-2">
      {/* KPI rápido */}
      <div className="flex items-center gap-6 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {totalGeneral.toLocaleString("es-MX")}
          </p>
          <p className="text-xs text-gray-500">HH acumuladas</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
            {data.length}
          </p>
          <p className="text-xs text-gray-500">meses con actividad</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
            {Math.round(totalGeneral / data.length).toLocaleString("es-MX")}
          </p>
          <p className="text-xs text-gray-500">HH promedio/mes</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart
          data={dataFormateada}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorHH" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="mesLabel"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <Tooltip
            formatter={(value: number) => [
              `${value.toLocaleString("es-MX")} HH`,
              "Horas Hombre",
            ]}
            labelFormatter={(label) => `Mes: ${label}`}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              fontSize: "12px",
            }}
          />
          <Legend
            formatter={() => "Horas Hombre (HH)"}
            wrapperStyle={{ fontSize: "12px" }}
          />
          <Area
            type="monotone"
            dataKey="total"
            name="total"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#colorHH)"
            dot={{ r: 4, fill: "#6366f1" }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}