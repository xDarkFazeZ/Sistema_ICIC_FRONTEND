// components/pdf/PDFDownloadButton.tsx
import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { AsistenciaCursoPDF } from './AsistenciaCursoPDF';
import { Button } from '@heroui/react';
import { Download } from 'lucide-react';

interface PDFDownloadButtonProps {
  cursoData: any;
  onError?: (error: Error) => void;
  buttonText?: string;
  variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "ghost";
  color?: "primary" | "secondary" | "success" | "warning" | "danger" | "default";
}

export const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({
  cursoData,
  onError,
  buttonText = 'Descargar Reporte PDF',
  variant = "solid",
  color = "primary",
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const formattedData = transformCursoData(cursoData);
      const blob = await pdf(<AsistenciaCursoPDF curso={formattedData} />).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const nombreLimpio = cursoData.nombre
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      link.download = `${nombreLimpio}-Lista.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generando PDF:', error);
      onError?.(error as Error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      color={color}
      variant={variant}
      onPress={generatePDF}
      isLoading={isGenerating}
      startContent={!isGenerating && <Download size={18} />}
    >
      {isGenerating ? 'Generando PDF...' : buttonText}
    </Button>
  );
};

const transformCursoData = (cursoData: any): any => {
  const inscripciones = cursoData.inscripciones || [];

  // Mapeo de métodos de pago con sus labels
  const metodosPagoMap: Record<string, string> = {
    EFECTIVO: 'Efectivo',
    TRANSFERENCIA: 'Transferencia',
    FECAP: 'FECAP',
    FINANCIAMIENTO: 'Financiamiento',
    SIN_COSTO: 'Sin Costo',
    VALE_AFILIACION: 'Vale Afiliación',
  };

  // Inicializar acumuladores
  const acumuladores: Record<string, number> = {};

  // Procesar cada inscripción
  const participantes = inscripciones.map((inscripcion: any) => {
    const participante = inscripcion.participante || {};
    const empresa = inscripcion.empresa || participante.empresa || {};

    const metodoPago = inscripcion.metodoPago || 'SIN_COSTO';

    let montoFinal = 0;
    if (metodoPago === 'SIN_COSTO') {
      montoFinal = 0;
    } else {
      montoFinal = inscripcion.montoFinal || inscripcion.montoEsperado || 0;
    }

    // Acumular por método de pago
    if (!acumuladores[metodoPago]) {
      acumuladores[metodoPago] = 0;
    }
    acumuladores[metodoPago] += montoFinal;

    const nombreCompleto = [
      participante.nombre,
      participante.apellidoPaterno,
      participante.apellidoMaterno
    ].filter(Boolean).join(' ');

    return {
      rfc: participante.rfc || '',
      nombreCompleto: nombreCompleto || '---',
      rfcEmpresa: empresa.rfc || '',
      empresa: empresa.nombre || 'SIN EMPRESA',
      metodoPago: metodoPago,
      importe: montoFinal,
      cdcf: montoFinal,
    };
  });

  // Construir resumen SOLO con métodos que tienen monto > 0
  const resumenPagos = Object.entries(acumuladores)
    .filter(([_, monto]) => monto > 0)
    .map(([metodo, monto]) => ({
      metodo,
      label: metodosPagoMap[metodo] || metodo,
      monto,
    }));

  // Calcular total
  const total = resumenPagos.reduce((sum, item) => sum + item.monto, 0);

  // Obtener nombre del instructor
  let instructorNombre = '';
  if (cursoData.instructor) {
    if (typeof cursoData.instructor === 'string') {
      instructorNombre = cursoData.instructor;
    } else if (cursoData.instructor.nombre) {
      instructorNombre = [
        cursoData.instructor.nombre,
        cursoData.instructor.apellidoPaterno,
        cursoData.instructor.apellidoMaterno
      ].filter(Boolean).join(' ');
      if (!instructorNombre) instructorNombre = '';
    }
  }

  return {
    id: cursoData.id,
    nombre: cursoData.nombre,
    nivelGerencial: cursoData.nivelGerencial,
    fechaInicio: cursoData.fechaInicio,
    fechaFin: cursoData.fechaFin,
    duracion: cursoData.duracion,
    horario: cursoData.horario,
    aula: cursoData.aula,
    instructor: instructorNombre,
    participantes,
    resumenPagos,
    total,
  };
};

export default PDFDownloadButton;