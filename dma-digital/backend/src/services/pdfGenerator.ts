import PDFDocument from 'pdfkit';
import { Prisma } from '@prisma/client';

type EvaluationWithDimensions = Prisma.EvaluationGetPayload<{
  include: {
    dimensions: {
      include: {
        subcriteria: true;
      };
    };
  };
}>;

type ResponseWithSubcriterion = Prisma.ResponseGetPayload<{
  include: {
    subcriterion: {
      select: {
        id: true;
        code: true;
        name: true;
        dimensionId: true;
      };
    };
    answeredBy: {
      select: {
        name: true;
        email: true;
      };
    };
  };
}>;

export async function generatePDFReport(
  evaluation: EvaluationWithDimensions,
  responses: ResponseWithSubcriterion[],
  type: 'executive' | 'technical' | 'regulatory',
  options: any
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Títulos según el tipo
      const reportTitles = {
        executive: 'Reporte Ejecutivo',
        technical: 'Reporte Técnico',
        regulatory: 'Reporte Normativo',
      };

      // Portada
      doc.fontSize(24).text('DMA Digital ELICO 4.0', { align: 'center' });
      doc.moveDown();
      doc.fontSize(18).text(reportTitles[type], { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Empresa: ${evaluation.company}`, { align: 'center' });
      doc.fontSize(12).text(`Evaluación: ${evaluation.name}`, { align: 'center' });
      doc.fontSize(12).text(`Fecha: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.addPage();

      // Generar contenido según el tipo
      if (type === 'executive') {
        generateExecutiveReport(doc, evaluation, responses);
      } else if (type === 'technical') {
        generateTechnicalReport(doc, evaluation, responses);
      } else if (type === 'regulatory') {
        generateRegulatoryReport(doc, evaluation, responses);
      }

      // Pie de página
      doc.addPage();
      doc.fontSize(10)
        .text('Este reporte fue generado automáticamente por DMA Digital ELICO 4.0', {
          align: 'center',
        })
        .text(`Fecha de generación: ${new Date().toLocaleString()}`, {
          align: 'center',
        })
        .text(`Tipo de reporte: ${reportTitles[type]}`, {
          align: 'center',
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function generateExecutiveReport(
  doc: PDFDocument,
  evaluation: EvaluationWithDimensions,
  responses: ResponseWithSubcriterion[]
) {
  // Resumen Ejecutivo
  doc.fontSize(16).text('Resumen Ejecutivo', { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(
    `La evaluación de madurez digital muestra un nivel ${evaluation.classification || 'No calculado'} ` +
    `con una madurez global de ${evaluation.globalMaturity?.toFixed(2) || 'N/A'} sobre 5.0.`
  );
  doc.moveDown();
  doc.text(
    `Esta evaluación analiza 12 dimensiones críticas de transformación digital industrial, ` +
    `proporcionando una visión completa del estado actual y las oportunidades de mejora.`
  );
  doc.addPage();

  // Madurez por Dimensión (tabla resumida)
  doc.fontSize(16).text('Madurez por Dimensión', { underline: true });
  doc.moveDown();

  evaluation.dimensions.forEach((dimension) => {
    const maturity = dimension.maturity?.toFixed(2) || 'N/A';
    const classification = getMaturityClassification(dimension.maturity || 0);
    
    doc.fontSize(12)
      .text(`${dimension.code}: ${dimension.name}`, { continued: true })
      .text(` - ${maturity} (${classification})`, { align: 'right' });
    doc.moveDown(0.5);
  });

  doc.addPage();

  // Top 5 Gaps
  doc.fontSize(16).text('Top 5 Gaps Críticos', { underline: true });
  doc.moveDown();

  const gaps = evaluation.dimensions
    .filter((d) => d.maturity !== null)
    .map((d) => ({
      code: d.code,
      name: d.name,
      gap: 5 - (d.maturity || 0),
      maturity: d.maturity || 0,
    }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 5);

  gaps.forEach((gap, index) => {
    doc.fontSize(12).text(`${index + 1}. ${gap.code}: ${gap.name}`, {
      indent: 20,
    });
    doc.fontSize(10)
      .text(`   Madurez actual: ${gap.maturity.toFixed(2)} / 5.0`, {
        indent: 30,
        color: 'red',
      })
      .text(`   Gap: ${gap.gap.toFixed(2)} puntos`, {
        indent: 30,
        color: 'red',
      });
    doc.moveDown(0.5);
  });

  doc.addPage();

  // Recomendaciones Estratégicas
  doc.fontSize(16).text('Recomendaciones Estratégicas Prioritarias', { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(
    'Basado en la evaluación realizada, se recomienda priorizar las siguientes acciones estratégicas:'
  );
  doc.moveDown();

  gaps.slice(0, 3).forEach((gap, index) => {
    doc.fontSize(12).text(`${index + 1}. Mejorar ${gap.name}`, {
      indent: 20,
    });
    doc.fontSize(10).text(
      `   Enfoque estratégico en cerrar el gap de ${gap.gap.toFixed(2)} puntos ` +
      `para alcanzar un nivel de madurez adecuado y mejorar la competitividad.`,
      { indent: 30 }
    );
    doc.moveDown(0.5);
  });
}

function generateTechnicalReport(
  doc: PDFDocument,
  evaluation: EvaluationWithDimensions,
  responses: ResponseWithSubcriterion[]
) {
  // Resumen Técnico
  doc.fontSize(16).text('Resumen Técnico', { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(
    `Evaluación técnica detallada de la madurez digital. ` +
    `Madurez global: ${evaluation.globalMaturity?.toFixed(2) || 'N/A'} / 5.0 ` +
    `(${evaluation.classification || 'No calculado'}).`
  );
  doc.moveDown();
  doc.text(
    `Este reporte incluye el análisis detallado de cada dimensión, subcriterio, ` +
    `valores de madurez, notas técnicas y observaciones realizadas durante la evaluación.`
  );
  doc.addPage();

  // Detalle por Dimensión
  evaluation.dimensions.forEach((dimension) => {
    const maturity = dimension.maturity?.toFixed(2) || 'N/A';
    const classification = getMaturityClassification(dimension.maturity || 0);
    
    doc.fontSize(14).text(`${dimension.code}: ${dimension.name}`, { underline: true });
    doc.fontSize(11)
      .text(`Madurez: ${maturity} / 5.0 (${classification})`, { color: 'blue' });
    doc.moveDown();

    // Subcriterios de esta dimensión
    dimension.subcriteria.forEach((subcriterion) => {
      // Buscar respuesta para este subcriterio
      const response = responses.find(
        (r) => r.subcriterion.id === subcriterion.id
      );

      doc.fontSize(11).text(`${subcriterion.code}: ${subcriterion.name}`, {
        indent: 20,
      });

      if (response) {
        doc.fontSize(10)
          .text(`   Valor: ${response.value.toFixed(2)} / 5.0`, {
            indent: 30,
            color: 'green',
          });

        if (response.notes && response.notes.trim()) {
          doc.moveDown(0.3);
          doc.fontSize(9)
            .text('   Notas:', {
              indent: 30,
              underline: true,
            });
          // Dividir notas largas en líneas
          const notesLines = wrapText(response.notes, 80);
          notesLines.forEach((line) => {
            doc.fontSize(9)
              .text(`   ${line}`, {
                indent: 30,
              });
          });
        }
      } else {
        doc.fontSize(10)
          .text('   Sin respuesta registrada', {
            indent: 30,
            color: 'gray',
          });
      }

      doc.moveDown(0.5);
    });

    doc.addPage();
  });

  // Análisis Técnico
  doc.fontSize(16).text('Análisis Técnico', { underline: true });
  doc.moveDown();
  doc.fontSize(12).text('Distribución de Madurez por Dimensión:');
  doc.moveDown();

  const sortedDimensions = [...evaluation.dimensions]
    .filter((d) => d.maturity !== null)
    .sort((a, b) => (b.maturity || 0) - (a.maturity || 0));

  sortedDimensions.forEach((dim, index) => {
    const maturity = dim.maturity || 0;
    const percentage = (maturity / 5) * 100;
    
    doc.fontSize(11).text(`${index + 1}. ${dim.code}: ${dim.name}`, {
      indent: 20,
    });
    doc.fontSize(10)
      .text(`   Madurez: ${maturity.toFixed(2)} / 5.0 (${percentage.toFixed(1)}%)`, {
        indent: 30,
      });
    doc.moveDown(0.3);
  });
}

function generateRegulatoryReport(
  doc: PDFDocument,
  evaluation: EvaluationWithDimensions,
  responses: ResponseWithSubcriterion[]
) {
  // Resumen Normativo
  doc.fontSize(16).text('Resumen Normativo', { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(
    `Este reporte evalúa el cumplimiento normativo y la alineación con estándares ` +
    `internacionales de transformación digital industrial.`
  );
  doc.moveDown();
  doc.text(
    `Madurez global: ${evaluation.globalMaturity?.toFixed(2) || 'N/A'} / 5.0 ` +
    `(${evaluation.classification || 'No calculado'}).`
  );
  doc.addPage();

  // Estándares y Normativas
  doc.fontSize(16).text('Estándares y Normativas Relevantes', { underline: true });
  doc.moveDown();
  doc.fontSize(12).text('La evaluación considera los siguientes estándares:');
  doc.moveDown();
  
  const standards = [
    'IEC 62443 - Seguridad Cibernética para Sistemas de Automatización Industrial',
    'ISO/IEC 27001 - Sistemas de Gestión de Seguridad de la Información',
    'IEC 61508 - Seguridad Funcional de Sistemas Eléctricos/Electrónicos/Programables',
    'ISO 50001 - Sistemas de Gestión de la Energía',
    'IEC 61850 - Comunicaciones en Subestaciones',
    'OPC UA - Arquitectura de Comunicación Industrial',
  ];

  standards.forEach((standard, index) => {
    doc.fontSize(11).text(`${index + 1}. ${standard}`, {
      indent: 20,
    });
    doc.moveDown(0.3);
  });

  doc.addPage();

  // Cumplimiento por Dimensión
  doc.fontSize(16).text('Cumplimiento Normativo por Dimensión', { underline: true });
  doc.moveDown();

  evaluation.dimensions.forEach((dimension) => {
    const maturity = dimension.maturity || 0;
    const complianceLevel = getComplianceLevel(maturity);
    
    doc.fontSize(12).text(`${dimension.code}: ${dimension.name}`, {
      indent: 20,
    });
    doc.fontSize(10)
      .text(`   Nivel de cumplimiento: ${complianceLevel}`, {
        indent: 30,
        color: complianceLevel === 'Alto' ? 'green' : complianceLevel === 'Medio' ? 'orange' : 'red',
      })
      .text(`   Madurez: ${maturity.toFixed(2)} / 5.0`, {
        indent: 30,
      });
    doc.moveDown(0.5);
  });

  doc.addPage();

  // Recomendaciones Normativas
  doc.fontSize(16).text('Recomendaciones para Cumplimiento Normativo', { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(
    'Para mejorar el cumplimiento normativo, se recomienda:'
  );
  doc.moveDown();

  const lowMaturityDimensions = evaluation.dimensions
    .filter((d) => (d.maturity || 0) < 2.5)
    .sort((a, b) => (a.maturity || 0) - (b.maturity || 0))
    .slice(0, 5);

  lowMaturityDimensions.forEach((dim, index) => {
    doc.fontSize(11).text(`${index + 1}. ${dim.code}: ${dim.name}`, {
      indent: 20,
    });
    doc.fontSize(10).text(
      `   Priorizar mejoras en esta dimensión para alcanzar niveles mínimos de cumplimiento normativo. ` +
      `Madurez actual: ${(dim.maturity || 0).toFixed(2)} / 5.0`,
      { indent: 30 }
    );
    doc.moveDown(0.5);
  });
}

function getMaturityClassification(maturity: number): string {
  if (maturity < 1.0) return 'Reactivo';
  if (maturity < 2.0) return 'Inicial';
  if (maturity < 3.0) return 'Estructurado';
  if (maturity < 4.0) return 'Integrado';
  if (maturity < 4.5) return 'Optimizado';
  return 'Predictivo/Inteligente';
}

function getComplianceLevel(maturity: number): string {
  if (maturity >= 4.0) return 'Alto';
  if (maturity >= 2.5) return 'Medio';
  return 'Bajo';
}

function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    if ((currentLine + word).length <= maxWidth) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}
