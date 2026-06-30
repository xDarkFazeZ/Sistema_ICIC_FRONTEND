// components/pdf/DashboardPDF.tsx
import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
    Image,
} from '@react-pdf/renderer';

// Registrar fuentes
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helvetica/v1/Helvetica.ttf' },
        { src: 'https://fonts.gstatic.com/s/helvetica/v1/Helvetica-Bold.ttf', fontWeight: 'bold' },
    ],
});

// Paleta de colores
const colors = {
    primaryRed: '#8B0000',
    secondaryRed: '#C62828',
    lightRed: '#FFEBEE',
    accentRed: '#D32F2F',
    textDark: '#333333',
    textLight: '#FFFFFF',
    border: '#E0E0E0',
};

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 8,
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: colors.primaryRed,
        paddingBottom: 8,
    },
    logoLeft: {
        width: 60,
        height: 'auto',
    },
    logoRight: {
        width: 60,
        height: 'auto',
    },
    headerTextContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primaryRed,
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.textDark,
        textAlign: 'center',
    },
    dateText: {
        fontSize: 8,
        color: colors.textDark,
        textAlign: 'center',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 6,
        backgroundColor: colors.lightRed,
        color: colors.primaryRed,
        padding: 4,
        borderLeftWidth: 3,
        borderLeftColor: colors.secondaryRed,
    },
    chartContainer: {
        marginBottom: 15,
        padding: 8,
        borderWidth: 0.5,
        borderColor: colors.border,
        borderRadius: 4,
    },
    chartTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        marginBottom: 6,
        color: colors.textDark,
    },
    chartSubtitle: {
        fontSize: 7,
        color: '#666666',
        marginBottom: 8,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    statCard: {
        alignItems: 'center',
        padding: 6,
        backgroundColor: colors.lightRed,
        borderRadius: 4,
        minWidth: 80,
    },
    statValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.accentRed,
    },
    statLabel: {
        fontSize: 7,
        color: colors.textDark,
        marginTop: 2,
    },
    kpiContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 12,
    },
    kpiItem: {
        flex: 1,
        alignItems: 'center',
        padding: 6,
        backgroundColor: '#F5F5F5',
        borderRadius: 4,
        marginHorizontal: 4,
    },
    kpiValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.accentRed,
    },
    kpiLabel: {
        fontSize: 7,
        color: colors.textDark,
    },
    table: {
        marginTop: 5,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.secondaryRed,
        paddingVertical: 4,
        paddingHorizontal: 6,
    },
    tableHeaderCell: {
        color: colors.textLight,
        fontSize: 7,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.3,
        borderBottomColor: colors.border,
        paddingVertical: 4,
        paddingHorizontal: 6,
    },
    tableCell: {
        fontSize: 7,
        color: colors.textDark,
    },
    colCurso: { width: '70%' },
    colTotal: { width: '30%', textAlign: 'right' },
    pageNumber: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 7,
        color: colors.primaryRed,
    },
    footer: {
        marginTop: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: colors.primaryRed,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 7,
        color: '#666666',
        textAlign: 'center',
    },
});

interface DashboardPDFProps {
    dashboardData: {
        inscripcionesPorMes: Array<{ mes: string; total: number }>;
        distribucionCursos: Array<{ nombre: string; total: number }>;
        saldoFecapPorMes: Array<{ mes: string; ingreso: number; gasto: number }>;
        horasHombrePorMes: Array<{ mes: string; total: number }>;
        ingresosPorMesEfectivoTransferencia: Array<{ mes: string; total: number }>;
        ingresosCursosCerradosPorMes: Array<{ mes: string; total: number }>;
    };
    fechaGeneracion: string;
}

const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
};

const formatMes = (mesKey: string): string => {
    const meses: Record<string, string> = {
        '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
        '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
        '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
    };
    const [year, month] = mesKey.split('-');
    return `${meses[month] || month} ${year}`;
};

// Componente para gráfico de barras
const BarChartSimulator = ({
    data,
    color,
}: {
    data: Array<{ label: string; value: number }>;
    color: string;
    label?: string;
}) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <View>
            {data.map((item, idx) => (
                <View key={idx} style={{ marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                        <Text style={{ fontSize: 7 }}>{item.label}</Text>
                        <Text style={{ fontSize: 7, fontWeight: 'bold', color }}>
                            {item.value.toLocaleString('es-MX')}
                        </Text>
                    </View>
                    <View style={{ backgroundColor: '#E0E0E0', height: 8, borderRadius: 4 }}>
                        <View
                            style={{
                                backgroundColor: color,
                                width: `${(item.value / maxValue) * 100}%`,
                                height: 8,
                                borderRadius: 4,
                            }}
                        />
                    </View>
                </View>
            ))}
        </View>
    );
};

// Componente para gráfico FECAP
const LineChartSimulator = ({
    data,
}: {
    data: Array<{ label: string; ingreso: number; gasto: number }>;
}) => {
    const maxValue = Math.max(...data.flatMap(d => [d.ingreso, d.gasto]), 1);

    return (
        <View>
            <View style={{ flexDirection: 'row', marginBottom: 10, justifyContent: 'center', gap: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 12, height: 3, backgroundColor: '#22c55e', marginRight: 5 }} />
                    <Text style={{ fontSize: 6 }}>Saldo ingresado</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 12, height: 3, backgroundColor: '#ef4444', marginRight: 5 }} />
                    <Text style={{ fontSize: 6 }}>Saldo usado</Text>
                </View>
            </View>
            {data.map((item, idx) => (
                <View key={idx} style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 7, fontWeight: 'bold', marginBottom: 4 }}>{item.label}</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 6, color: '#22c55e' }}>
                                Ingreso: {formatCurrency(item.ingreso)}
                            </Text>
                            <View style={{ backgroundColor: '#E0E0E0', height: 6, borderRadius: 3, marginTop: 2 }}>
                                <View
                                    style={{
                                        backgroundColor: '#22c55e',
                                        width: `${(item.ingreso / maxValue) * 100}%`,
                                        height: 6,
                                        borderRadius: 3,
                                    }}
                                />
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 6, color: '#ef4444' }}>
                                Gasto: {formatCurrency(item.gasto)}
                            </Text>
                            <View style={{ backgroundColor: '#E0E0E0', height: 6, borderRadius: 3, marginTop: 2 }}>
                                <View
                                    style={{
                                        backgroundColor: '#ef4444',
                                        width: `${(item.gasto / maxValue) * 100}%`,
                                        height: 6,
                                        borderRadius: 3,
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
};

export const DashboardPDF: React.FC<DashboardPDFProps> = ({ dashboardData, fechaGeneracion }) => {
    // ── Estadísticas generales ──────────────────────────────────────────────
    const totalInscripciones = dashboardData.inscripcionesPorMes.reduce((sum, m) => sum + m.total, 0);
    const totalCursos = dashboardData.distribucionCursos.length;
    const totalHorasHombre = dashboardData.horasHombrePorMes.reduce((sum, m) => sum + m.total, 0);
    const promedioHH = totalHorasHombre / (dashboardData.horasHombrePorMes.length || 1);

    // ── Datos para gráficos ─────────────────────────────────────────────────
    const inscripcionesData = dashboardData.inscripcionesPorMes.map(item => ({
        label: formatMes(item.mes),
        value: item.total,
    }));

    const fecapData = dashboardData.saldoFecapPorMes.map(item => ({
        label: formatMes(item.mes),
        ingreso: item.ingreso,
        gasto: item.gasto,
    }));

    const horasHombreData = dashboardData.horasHombrePorMes.map(item => ({
        label: formatMes(item.mes),
        value: item.total,
    }));

    const ingresosData = dashboardData.ingresosPorMesEfectivoTransferencia.map(item => ({
        label: formatMes(item.mes),
        value: item.total,
    }));
    const totalIngresos = dashboardData.ingresosPorMesEfectivoTransferencia
        .reduce((sum, m) => sum + m.total, 0);

    const ingresosCerradosData = dashboardData.ingresosCursosCerradosPorMes.map(item => ({
        label: formatMes(item.mes),
        value: item.total,
    }));
    const totalIngresosCerrados = dashboardData.ingresosCursosCerradosPorMes
        .reduce((sum, m) => sum + m.total, 0);

    return (
        <Document>
            <Page size="LETTER" orientation="portrait" style={styles.page}>

                {/* ── Header ──────────────────────────────────────────────────── */}
                <View style={styles.headerContainer}>
                    <Image src="/images/logoCMIC.png" style={styles.logoLeft} />
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.title}>
                            Instituto de Capacitación de la Industria de la Construcción
                        </Text>
                        <Text style={styles.subtitle}>
                            Reporte de Dashboard - Resumen Estadistico
                        </Text>
                        <Text style={styles.dateText}>
                            Generado: {fechaGeneracion}
                        </Text>
                    </View>
                    <Image src="/images/logoICIC.png" style={styles.logoRight} />
                </View>

                {/* ── KPIs ────────────────────────────────────────────────────── */}
                <View style={styles.kpiContainer}>
                    <View style={styles.kpiItem}>
                        <Text style={styles.kpiValue}>{totalInscripciones}</Text>
                        <Text style={styles.kpiLabel}>Total Inscripciones</Text>
                    </View>
                    <View style={styles.kpiItem}>
                        <Text style={styles.kpiValue}>{totalCursos}</Text>
                        <Text style={styles.kpiLabel}>Cursos Activos</Text>
                    </View>
                    <View style={styles.kpiItem}>
                        <Text style={styles.kpiValue}>{totalHorasHombre.toLocaleString('es-MX')}</Text>
                        <Text style={styles.kpiLabel}>Horas Hombre (HH)</Text>
                    </View>
                    <View style={styles.kpiItem}>
                        <Text style={styles.kpiValue}>{Math.round(promedioHH).toLocaleString('es-MX')}</Text>
                        <Text style={styles.kpiLabel}>HH Promedio/Mes</Text>
                    </View>
                </View>

                {/* ── Gráfico 1: Inscripciones por Mes ────────────────────────── */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Inscripciones por Mes</Text>
                    <Text style={styles.chartSubtitle}>Agrupado por fecha de inicio del curso</Text>
                    <BarChartSimulator data={inscripcionesData} color={colors.accentRed} />
                </View>

                {/* ── Gráfico 2: Distribución de Cursos ───────────────────────── */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Distribucion por Curso</Text>
                    <Text style={styles.chartSubtitle}>Participantes inscritos por curso</Text>
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderCell, styles.colCurso]}>Curso</Text>
                            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Participantes</Text>
                        </View>
                        {dashboardData.distribucionCursos.map((curso, idx) => (
                            <View key={idx} style={styles.tableRow}>
                                <Text style={[styles.tableCell, styles.colCurso]}>{curso.nombre}</Text>
                                <Text style={[styles.tableCell, styles.colTotal]}>{curso.total}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ── Gráfico 3: Saldo FECAP por Mes ──────────────────────────── */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Saldo FECAP por Mes</Text>
                    <Text style={styles.chartSubtitle}>Ingresos vs Gastos de saldo FECAP</Text>
                    <LineChartSimulator data={fecapData} />
                </View>

                {/* ── Gráfico 4: Horas Hombre por Mes ─────────────────────────── */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Horas Hombre por Mes</Text>
                    <Text style={styles.chartSubtitle}>HH = Duracion del curso × Participantes inscritos</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{totalHorasHombre.toLocaleString('es-MX')}</Text>
                            <Text style={styles.statLabel}>HH Totales</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{dashboardData.horasHombrePorMes.length}</Text>
                            <Text style={styles.statLabel}>Meses con Actividad</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{Math.round(promedioHH).toLocaleString('es-MX')}</Text>
                            <Text style={styles.statLabel}>HH Promedio/Mes</Text>
                        </View>
                    </View>
                    <BarChartSimulator data={horasHombreData} color="#6366f1" />
                </View>

                {/* ── Gráfico 5: Ingresos por Mes (Efectivo + Transferencia) ───── */}
                <View style={[styles.chartContainer, { marginTop: 10 }]} wrap={false}>
                    <Text style={styles.chartTitle}>Ingresos por Mes (Cursos Abiertos)</Text>
                    <Text style={styles.chartSubtitle}>
                        Pagos confirmados por Efectivo y Transferencia
                    </Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{formatCurrency(totalIngresos)}</Text>
                            <Text style={styles.statLabel}>Total Recaudado</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>
                                {dashboardData.ingresosPorMesEfectivoTransferencia.length}
                            </Text>
                            <Text style={styles.statLabel}>Meses con Ingresos</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>
                                {formatCurrency(
                                    totalIngresos /
                                    (dashboardData.ingresosPorMesEfectivoTransferencia.length || 1)
                                )}
                            </Text>
                            <Text style={styles.statLabel}>Promedio Mensual</Text>
                        </View>
                    </View>
                    <BarChartSimulator data={ingresosData} color="#22c55e" />
                </View>

                {/* ── Gráfico 6: Ingresos por Cursos Cerrados ─────────────────── */}
                <View style={[styles.chartContainer, { marginTop: 10 }]} wrap={false}>
                    <Text style={styles.chartTitle}>Ingresos por Cursos Cerrados</Text>
                    <Text style={styles.chartSubtitle}>
                        Precio por participante × número de participantes, agrupado por mes de inicio del curso
                    </Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{formatCurrency(totalIngresosCerrados)}</Text>
                            <Text style={styles.statLabel}>Total Facturado</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>
                                {dashboardData.ingresosCursosCerradosPorMes.length}
                            </Text>
                            <Text style={styles.statLabel}>Meses con Cursos</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>
                                {formatCurrency(
                                    totalIngresosCerrados /
                                    (dashboardData.ingresosCursosCerradosPorMes.length || 1)
                                )}
                            </Text>
                            <Text style={styles.statLabel}>Promedio Mensual</Text>
                        </View>
                    </View>
                    <BarChartSimulator data={ingresosCerradosData} color="#8b5cf6" />
                </View>

                <Text
                    style={styles.pageNumber}
                    render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} de ${totalPages}`}
                    fixed
                />
            </Page>
        </Document>
    );
};

export default DashboardPDF;