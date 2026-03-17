import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

interface DataPoint {
    mes: string;
    ingreso: number;
    gasto: number;
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

const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0,
    }).format(val);

export default function GraficoFecap({ data }: Props) {
    if (!data || data.length === 0) return null;

    const dataFormateada = data.map((d) => ({
        ...d,
        mesLabel: formatMes(d.mes),
    }));

    return (
        <ResponsiveContainer width="100%" height={280}>
            <LineChart
                data={dataFormateada}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                    dataKey="mesLabel"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={false}
                    width={55}
                />
                <Tooltip
                    formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === "ingreso" ? "Saldo ingresado" : "Saldo usado en cursos",
                    ]}
                    labelFormatter={(label) => `Mes: ${label}`}
                    contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        fontSize: "12px",
                    }}
                />
                <Legend
                    formatter={(value) =>
                        value === "ingreso" ? "Saldo ingresado (cargas)" : "Saldo usado en cursos"
                    }
                    wrapperStyle={{ fontSize: "12px" }}
                />
                <Line
                    type="monotone"
                    dataKey="ingreso"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#22c55e" }}
                    activeDot={{ r: 6 }}
                />
                <Line
                    type="monotone"
                    dataKey="gasto"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#ef4444" }}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}