// frontend/src/components/dashboard/GraficoIngresosMensuales.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface IngresoPorMes {
  mes: string;
  total: number;
}

interface Props {
  data: IngresoPorMes[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  
  // Formatear manualmente el mes en español
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {formatMonth(label)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          <span className="font-medium">Ingresos:</span>{' '}
          <span className="text-green-600 dark:text-green-400 font-bold">
            {formatCurrency(payload[0].value)}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default function GraficoIngresosMensuales({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
        <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm">No hay datos de ingresos por mes</p>
        <p className="text-xs mt-1">No se encontraron inscripciones pagadas con efectivo o transferencia</p>
      </div>
    );
  }

  // Ordenar datos por mes (más reciente primero para mejor visualización)
  const sortedData = [...data].sort((a, b) => a.mes.localeCompare(b.mes));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={sortedData}
        margin={{ top: 20, right: 30, left: 60, bottom: 70 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
        <XAxis
          dataKey="mes"
          tickFormatter={formatMonth}
          angle={-45}
          textAnchor="end"
          height={70}
          interval={0}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          className="dark:fill-gray-400"
        />
        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          className="dark:fill-gray-400"
          width={80}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: 20 }}
          formatter={() => 'Ingresos (Efectivo + Transferencia)'}
        />
        <Bar
          dataKey="total"
          name="Ingresos"
          fill="#10b981"
          radius={[8, 8, 0, 0]}
          maxBarSize={80}
          animationDuration={1000}
          animationEasing="ease-in-out"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}