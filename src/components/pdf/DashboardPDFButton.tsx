// components/pdf/DashboardPDFButton.tsx
import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { DashboardPDF } from './DashboardPDF';
import { Button } from '@heroui/react';
import { DocumentTextIcon } from '@heroicons/react/24/solid';
import { dashboardService } from '../../services/dashboardService';

interface DashboardPDFButtonProps {
  onError?: (error: Error) => void;
  buttonText?: string;
}

export const DashboardPDFButton: React.FC<DashboardPDFButtonProps> = ({
  onError,
  buttonText = 'Exportar Dashboard a PDF',
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Obtener datos del dashboard
      const dashboardData = await dashboardService.getDashboardData();
      
      // Preparar datos para el PDF (solo los gráficos)
      const pdfData = {
        inscripcionesPorMes: dashboardData.inscripcionesPorMes || [],
        distribucionCursos: dashboardData.distribucionCursos || [],
        saldoFecapPorMes: (dashboardData as any).saldoFecapPorMes || [],
        horasHombrePorMes: (dashboardData as any).horasHombrePorMes || [],
      };
      
      const fechaGeneracion = new Date().toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      
      const blob = await pdf(<DashboardPDF dashboardData={pdfData} fechaGeneracion={fechaGeneracion} />).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard_icic_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generando PDF del dashboard:', error);
      onError?.(error as Error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      color="primary"
      variant="solid"
      onPress={generatePDF}
      isLoading={isGenerating}
      startContent={!isGenerating && <DocumentTextIcon className="w-4 h-4" />}
    >
      {isGenerating ? 'Generando PDF...' : buttonText}
    </Button>
  );
};

export default DashboardPDFButton;