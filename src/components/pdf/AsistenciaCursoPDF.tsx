// components/pdf/AsistenciaCursoPDF.tsx
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

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helvetica/v1/Helvetica.ttf' },
    { src: 'https://fonts.gstatic.com/s/helvetica/v1/Helvetica-Bold.ttf', fontWeight: 'bold' },
  ],
});

// Paleta de colores rojos profesional
const colors = {
  primaryRed: '#8B0000',      // Rojo oscuro (DarkRed) - para bordes principales
  secondaryRed: '#C62828',    // Rojo medio - para headers de tabla
  lightRed: '#FFEBEE',        // Rojo muy claro - para fondos de sección
  accentRed: '#D32F2F',       // Rojo acento - para totales y destacados
  textDark: '#333333',        // Texto oscuro
  textLight: '#FFFFFF',       // Texto claro
  border: '#E0E0E0',          // Bordes suaves
  hoverRed: '#EF5350',        // Rojo más claro para hover (si aplica)
};

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 8,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.primaryRed,
    paddingBottom: 5,
  },
  logoLeft: {
    width: 50,
    height: 'auto',
  },
  logoRight: {
    width: 50,
    height: 'auto',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primaryRed,
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.textDark,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: colors.lightRed,
    color: colors.primaryRed,
    padding: 3,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondaryRed,
  },
  infoContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  infoColumn: {
    flex: 1,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 2,
    borderBottomWidth: 0.3,
    borderBottomColor: colors.border,
    paddingBottom: 2,
  },
  infoLabel: {
    width: '40%',
    fontWeight: 'bold',
    fontSize: 7,
    color: colors.textDark,
  },
  infoValue: {
    width: '60%',
    fontSize: 7,
    color: colors.textDark,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
    borderBottomWidth: 0.3,
    borderBottomColor: colors.border,
    paddingBottom: 2,
  },
  summaryLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  summaryValue: {
    fontSize: 7,
    color: colors.accentRed,
    fontWeight: 'bold',
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: colors.secondaryRed,
    backgroundColor: colors.lightRed,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  summaryTotalLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: colors.primaryRed,
  },
  summaryTotalValue: {
    fontSize: 7,
    fontWeight: 'bold',
    color: colors.accentRed,
  },
  table: {
    marginTop: 8,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.secondaryRed,
    paddingVertical: 3,
    paddingHorizontal: 2,
  },
  tableHeaderCell: {
    color: colors.textLight,
    fontSize: 6,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.3,
    borderBottomColor: colors.border,
    paddingVertical: 3,
    paddingHorizontal: 2,
    alignItems: 'center',
    minHeight: 18,
  },
  tableRowAlternate: {
    flexDirection: 'row',
    borderBottomWidth: 0.3,
    borderBottomColor: colors.border,
    paddingVertical: 3,
    paddingHorizontal: 2,
    alignItems: 'center',
    minHeight: 18,
    backgroundColor: colors.lightRed,
  },
  tableCell: {
    fontSize: 6,
    textAlign: 'center',
    color: colors.textDark,
  },
  colRFC: { width: '7%' },
  colParticipante: { width: '20%' },
  colRFCempresa: { width: '9%' },
  colEmpresa: { width: '25%' },
  colMetodoPago: { width: '8%' },
  colImporte: { width: '7%' },
  colCdcf: { width: '6%' },
  colFirma: { width: '8%' },
  footer: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.primaryRed,
    paddingTop: 10,
  },
  signatureSection: {
    width: '45%',
  },
  signatureTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 35,
    textAlign: 'center',
    color: colors.primaryRed,
  },
  signatureLine: {
    marginTop: 5,
    borderTopWidth: 0.5,
    borderTopColor: colors.textDark,
    width: '100%',
  },
  signatureText: {
    fontSize: 6,
    textAlign: 'center',
    marginTop: 3,
    color: colors.textDark,
  },
  signatureName: {
    fontSize: 7,
    textAlign: 'center',
    marginTop: 3,
    fontStyle: 'italic',
    color: colors.accentRed,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 6,
    color: colors.primaryRed,
  },
});

interface ParticipanteData {
  rfc: string;
  nombreCompleto: string;
  rfcEmpresa: string;
  empresa: string;
  metodoPago: string;
  importe: number;
  cdcf: number;
}

interface CursoData {
  id: number;
  nombre: string;
  nivelGerencial: string;
  fechaInicio: string;
  fechaFin: string;
  duracion: number;
  horario: string;
  aula: string | null;
  instructor: string;
  participantes: ParticipanteData[];
  resumenPagos: Array<{
    metodo: string;
    label: string;
    monto: number;
  }>;
  total: number;
}

interface AsistenciaCursoPDFProps {
  curso: CursoData;
}

const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const getMetodoPagoLabel = (metodo: string): string => {
  const labels: Record<string, string> = {
    EFECTIVO: 'Efectivo',
    TRANSFERENCIA: 'Transferencia',
    FECAP: 'FECAP',
    FINANCIAMIENTO: 'Financiamiento',
    SIN_COSTO: 'Sin Costo',
    VALE_AFILIACION: 'Vale Afiliación',
  };
  return labels[metodo] || metodo;
};

export const AsistenciaCursoPDF: React.FC<AsistenciaCursoPDFProps> = ({ curso }) => (
  <Document>
    <Page size="LETTER" orientation="landscape" style={styles.page}>
      {/* Header con logos */}
      <View style={styles.headerContainer}>
        <Image src="/images/logoCMIC.png" style={styles.logoLeft} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>
            Instituto de Capacitación de la Industria de la Construcción
          </Text>
          <Text style={styles.subtitle}>
            Reporte de Asistencia y Evaluaciones por Curso
          </Text>
        </View>
        <Image src="/images/logoICIC.png" style={styles.logoRight} />
      </View>

      {/* Información del Curso con dos columnas */}
      <View>
        <Text style={styles.sectionTitle}>INFORMACIÓN DEL CURSO</Text>
        <View style={styles.infoContainer}>
          {/* Columna Izquierda - Datos del Curso */}
          <View style={styles.infoColumn}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>ID:</Text>
              <Text style={styles.infoValue}>{curso.id}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>CURSO:</Text>
              <Text style={styles.infoValue}>{curso.nombre}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>NIVEL:</Text>
              <Text style={styles.infoValue}>{curso.nivelGerencial}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>FECHA INICIO:</Text>
              <Text style={styles.infoValue}>{formatDate(curso.fechaInicio)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>FECHA FIN:</Text>
              <Text style={styles.infoValue}>{formatDate(curso.fechaFin)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>DURACIÓN:</Text>
              <Text style={styles.infoValue}>{curso.duracion} HORAS</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>HORARIO:</Text>
              <Text style={styles.infoValue}>{curso.horario}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>AULA:</Text>
              <Text style={styles.infoValue}>{curso.aula || '—'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>INSTRUCTOR:</Text>
              <Text style={styles.infoValue}>{curso.instructor}</Text>
            </View>
          </View>

          {/* Columna Derecha - Resumen por Método de Pago (solo los usados) */}
          <View style={styles.infoColumn}>
            {curso.resumenPagos.map((item, index) => (
              <View key={index} style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{item.label}:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(item.monto)}</Text>
              </View>
            ))}
            <View style={styles.summaryTotal}>
              <Text style={styles.summaryTotalLabel}>TOTAL:</Text>
              <Text style={styles.summaryTotalValue}>{formatCurrency(curso.total)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tabla de Participantes con filas alternadas */}
      <View style={styles.table}>
        <Text style={styles.sectionTitle}>PARTICIPANTES</Text>
        
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.colRFC]}>RFC</Text>
          <Text style={[styles.tableHeaderCell, styles.colParticipante]}>PARTICIPANTE</Text>
          <Text style={[styles.tableHeaderCell, styles.colRFCempresa]}>RFC EMPRESA</Text>
          <Text style={[styles.tableHeaderCell, styles.colEmpresa]}>EMPRESA</Text>
          <Text style={[styles.tableHeaderCell, styles.colMetodoPago]}>MÉTODO PAGO</Text>
          <Text style={[styles.tableHeaderCell, styles.colImporte]}>IMPORTE</Text>
          <Text style={[styles.tableHeaderCell, styles.colCdcf]}>C.D.C.F.</Text>
          <Text style={[styles.tableHeaderCell, styles.colFirma]}>FIRMA</Text>
        </View>

        {curso.participantes.map((participante, index) => (
          <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}>
            <Text style={[styles.tableCell, styles.colRFC]}>{participante.rfc || '---'}</Text>
            <Text style={[styles.tableCell, styles.colParticipante]}>
              {participante.nombreCompleto}
            </Text>
            <Text style={[styles.tableCell, styles.colRFCempresa]}>{participante.rfcEmpresa || '---'}</Text>
            <Text style={[styles.tableCell, styles.colEmpresa]}>
              {participante.empresa.length > 35 
                ? participante.empresa.substring(0, 32) + '...' 
                : participante.empresa}
            </Text>
            <Text style={[styles.tableCell, styles.colMetodoPago]}>{getMetodoPagoLabel(participante.metodoPago)}</Text>
            <Text style={[styles.tableCell, styles.colImporte]}>{formatCurrency(participante.importe)}</Text>
            <Text style={[styles.tableCell, styles.colCdcf]}>{formatCurrency(participante.cdcf)}</Text>
            <Text style={[styles.tableCell, styles.colFirma]} />
          </View>
        ))}
      </View>

      {/* Firmas */}
      <View style={styles.footer}>
        <View style={styles.signatureSection}>
          <Text style={styles.signatureTitle}>INSTRUCTOR</Text>
          <View style={{ height: 35 }} />
          <View style={styles.signatureLine} />
          <Text style={styles.signatureText}>FIRMA DEL INSTRUCTOR</Text>
          <Text style={styles.signatureName}>{curso.instructor}</Text>
        </View>
        
        <View style={styles.signatureSection}>
          <Text style={styles.signatureTitle}>DELEGACIÓN ICIC</Text>
          <View style={{ height: 35 }} />
          <View style={styles.signatureLine} />
          <Text style={styles.signatureText}>FIRMA DEL GERENTE</Text>
          <Text style={styles.signatureName}>Lic. María de los Ángeles Medina Rodríguez</Text>
        </View>
      </View>

      <Text 
        style={styles.pageNumber} 
        render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} 
        fixed 
      />
    </Page>
  </Document>
);

export default AsistenciaCursoPDF;