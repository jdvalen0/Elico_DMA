import PDFDocument from 'pdfkit';
import { Prisma } from '@prisma/client';
import { DIMENSION_TEMPLATES } from './roadmapGenerator';

// pdfkit exporta la clase como valor; derivar el tipo instancia
type PDFDoc = InstanceType<typeof PDFDocument>;

interface RoadmapImprovement {
  title: string;
  dimensions: string[];
  effort: { months: number; cost: number };
  roi: { estimated: number; paybackMonths: number; annualValue: number };
}

interface RoadmapData {
  phases: Array<{
    phase: string;
    duration: string;
    improvements: RoadmapImprovement[];
    currency?: string;
  }>;
  totalROI: number | null;
  totalInvestment: number | null;
  totalAnnualValue: number | null;
  parameters?: { currency?: string; companySize?: string } | null;
}

function formatMoney(value: number, currency: string): string {
  return `${currency} ${Math.round(value).toLocaleString('es-CO')}`;
}

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
        generateExecutiveReport(doc, evaluation, responses, options?.roadmap as RoadmapData | null);
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
  doc: PDFDoc,
  evaluation: EvaluationWithDimensions,
  responses: ResponseWithSubcriterion[],
  roadmap?: RoadmapData | null
) {
  // Resumen Ejecutivo
  doc.fontSize(16).text('Resumen Ejecutivo', { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(
    `La evaluación de madurez digital muestra un nivel ${evaluation.classification || 'No calculado'} ` +
    `con una madurez global de ${evaluation.globalMaturity?.toFixed(2) || 'N/A'} sobre 5.0.`
  );
  doc.moveDown();

  const totalSubcriteria = evaluation.dimensions.reduce((acc, d) => acc + d.subcriteria.length, 0);
  const coveragePct = totalSubcriteria > 0 ? Math.round((responses.length / totalSubcriteria) * 100) : 0;
  doc.text(
    `Cobertura: ${responses.length} de ${totalSubcriteria} subcriterios evaluados (${coveragePct}%). ` +
    (coveragePct < 100
      ? 'Las conclusiones aplican solo a los subcriterios respondidos; completar la evaluación mejora la fiabilidad del resultado.'
      : 'Evaluación completa.')
  );
  doc.moveDown();
  doc.text(
    `Esta evaluación analiza ${evaluation.dimensions.length} dimensiones críticas de transformación digital industrial, ` +
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

  // Fortalezas relativas
  const strengths = evaluation.dimensions
    .filter((d) => d.maturity !== null)
    .sort((a, b) => (b.maturity || 0) - (a.maturity || 0))
    .slice(0, 3);

  if (strengths.length > 0) {
    doc.moveDown();
    doc.fontSize(13).text('Fortalezas Relativas');
    doc.moveDown(0.5);
    strengths.forEach((d, i) => {
      doc.fontSize(11).text(
        `${i + 1}. ${d.code}: ${d.name} — ${(d.maturity || 0).toFixed(2)} / 5.0`,
        { indent: 20 }
      );
    });
    doc.fontSize(9).text(
      'Dimensiones con mayor madurez actual; son la base sobre la que apoyar el plan de mejora.',
      { color: 'gray' } as any
    );
  }

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
      } as any)
      .text(`   Gap: ${gap.gap.toFixed(2)} puntos`, {
        indent: 30,
        color: 'red',
      } as any);
    doc.moveDown(0.5);
  });

  doc.addPage();

  // Recomendaciones Estratégicas con acciones concretas del catálogo por dimensión
  doc.fontSize(16).text('Recomendaciones Estratégicas Prioritarias', { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(
    'Para las dimensiones con mayor gap, el catálogo base del modelo sugiere estas acciones iniciales:'
  );
  doc.moveDown();

  gaps.slice(0, 3).forEach((gap, index) => {
    const template = DIMENSION_TEMPLATES[gap.code];
    doc.fontSize(12).text(
      `${index + 1}. ${gap.name} (${gap.code}) — madurez ${gap.maturity.toFixed(2)}, gap ${gap.gap.toFixed(2)}`,
      { indent: 20 }
    );
    if (template) {
      template.actions.slice(0, 3).forEach((action) => {
        doc.fontSize(10).text(`   • ${action}`, { indent: 30 });
      });
    }
    doc.moveDown(0.5);
  });

  // Plan de inversión (si existe roadmap generado)
  doc.addPage();
  doc.fontSize(16).text('Plan de Inversión (Roadmap)', { underline: true });
  doc.moveDown();

  if (roadmap && Array.isArray(roadmap.phases)) {
    const currency =
      roadmap.phases.find((p) => p.currency)?.currency ||
      roadmap.parameters?.currency ||
      'USD';

    doc.fontSize(12).text(
      `Inversión total estimada: ${formatMoney(roadmap.totalInvestment || 0, currency)}`
    );
    doc.text(`Valor anual estimado: ${formatMoney(roadmap.totalAnnualValue || 0, currency)}`);
    doc.text(`ROI promedio ponderado: ${((roadmap.totalROI || 0) * 100).toFixed(0)}%`);
    doc.moveDown();
    doc.fontSize(9).text(
      'Estimaciones referenciales calculadas con los parámetros del roadmap (tamaño de empresa y configuración económica). No constituyen una cotización.',
      { color: 'gray' } as any
    );
    doc.moveDown();

    const allImprovements = roadmap.phases.flatMap((p) =>
      p.improvements.map((imp) => ({ ...imp, phase: p.phase, duration: p.duration }))
    );
    const top = allImprovements
      .sort((a, b) => b.roi.estimated - a.roi.estimated)
      .slice(0, 3);

    if (top.length > 0) {
      doc.fontSize(13).text('Iniciativas Destacadas por ROI');
      doc.moveDown(0.5);
      top.forEach((imp, i) => {
        doc.fontSize(11).text(`${i + 1}. ${imp.title}`, { indent: 20 });
        doc.fontSize(10).text(
          `   ${imp.phase} (${imp.duration}) | Costo: ${formatMoney(imp.effort.cost, currency)} | ` +
          `ROI: ${(imp.roi.estimated * 100).toFixed(0)}% | Payback: ${imp.roi.paybackMonths.toFixed(1)} meses`,
          { indent: 30 }
        );
        doc.moveDown(0.4);
      });
    }
  } else {
    doc.fontSize(11).text(
      'Aún no se ha generado el roadmap de esta evaluación. Genérelo desde el Dashboard (pestaña Roadmap) ' +
      'para incluir aquí el plan de inversión, fases y ROI estimado.'
    );
  }
}

function generateTechnicalReport(
  doc: PDFDoc,
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
      .text(`Madurez: ${maturity} / 5.0 (${classification})`, { color: 'blue' } as any);
    doc.fontSize(9).text(
      `Peso en el índice global: ${(dimension.weight * 100).toFixed(0)}%`,
      { color: 'gray' } as any
    );
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
          } as any);
        doc.fontSize(8).text(
          `   Respondido por: ${response.answeredBy.name} — ${response.updatedAt.toLocaleString('es-CO')}`,
          { indent: 30, color: 'gray' } as any
        );

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
          } as any);
      }

      doc.moveDown(0.5);
    });

    doc.addPage();
  });

  // Análisis Técnico
  doc.fontSize(16).text('Análisis Técnico', { underline: true });
  doc.moveDown();

  // 1. Cobertura y distribución de madurez por dimensión
  doc.fontSize(13).text('1. Cobertura y Distribución de Madurez');
  doc.moveDown(0.5);

  const dimStats = evaluation.dimensions.map((dim) => {
    const subIds = new Set(dim.subcriteria.map((s) => s.id));
    const dimResponses = responses.filter((r) => subIds.has(r.subcriterion.id));
    const values = dimResponses.map((r) => r.value);
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
    const min = values.length ? Math.min(...values) : null;
    const max = values.length ? Math.max(...values) : null;
    const stdDev =
      values.length > 1
        ? Math.sqrt(
            values.reduce((acc, v) => acc + Math.pow(v - (avg || 0), 2), 0) / values.length
          )
        : null;
    return {
      dim,
      answered: values.length,
      total: dim.subcriteria.length,
      avg,
      min,
      max,
      stdDev,
      maturity: dim.maturity,
      gap: dim.maturity != null ? 5 - dim.maturity : null,
    };
  });

  dimStats.forEach((s) => {
    const coverage = s.total > 0 ? ((s.answered / s.total) * 100).toFixed(0) : '0';
    doc
      .fontSize(11)
      .text(`${s.dim.code}: ${s.dim.name}`, { indent: 20, continued: true })
      .text(`   ${s.maturity != null ? s.maturity.toFixed(2) : 'N/A'} / 5.0`, { align: 'right' });
    doc.fontSize(10).text(
      `   Gap a excelencia: ${s.gap != null ? s.gap.toFixed(2) : 'N/A'} | Cobertura: ${s.answered}/${s.total} subcriterios (${coverage}%)`,
      { indent: 30 }
    );
    doc.moveDown(0.4);
  });

  doc.addPage();

  // 2. Estadísticas por dimensión
  doc.fontSize(13).text('2. Estadísticas por Dimensión (valores de subcriterios)');
  doc.moveDown(0.5);
  doc.fontSize(10).text('Dim | Promedio | Mín | Máx | Desv. estándar', { indent: 20 });
  doc.moveDown(0.3);

  dimStats.forEach((s) => {
    doc.fontSize(10).text(
      `${s.dim.code.padEnd(5)} | ` +
        `${s.avg != null ? s.avg.toFixed(2) : 'N/A'} | ` +
        `${s.min != null ? s.min.toFixed(1) : 'N/A'} | ` +
        `${s.max != null ? s.max.toFixed(1) : 'N/A'} | ` +
        `${s.stdDev != null ? s.stdDev.toFixed(2) : 'N/A'}`,
      { indent: 20 }
    );
  });

  doc.moveDown();
  doc.fontSize(9).text(
    'Una desviación estándar alta dentro de una dimensión indica respuestas heterogéneas ' +
      'entre sus subcriterios (posibles fortalezas y debilidades mezcladas).',
    { color: 'gray' } as any
  );

  // 3. Coherencia tecnológica
  doc.addPage();
  doc.fontSize(13).text('3. Coherencia entre Dimensiones Tecnológicas (D03–D06)');
  doc.moveDown(0.5);

  const techCodes = ['D03', 'D04', 'D05', 'D06'];
  const techMaturities = evaluation.dimensions
    .filter((d) => techCodes.includes(d.code) && d.maturity != null)
    .map((d) => ({ code: d.code, maturity: d.maturity as number }));

  if (techMaturities.length >= 2) {
    const mean =
      techMaturities.reduce((acc, t) => acc + t.maturity, 0) / techMaturities.length;
    const variance =
      techMaturities.reduce((acc, t) => acc + Math.pow(t.maturity - mean, 2), 0) /
      techMaturities.length;
    const std = Math.sqrt(variance);

    doc.fontSize(11).text(`Dimensiones consideradas: ${techMaturities.map((t) => t.code).join(', ')}`);
    doc.text(`Madurez promedio tecnológica: ${mean.toFixed(2)} / 5.0`);
    doc.text(`Desviación estándar: ${std.toFixed(2)}`);
    doc.moveDown(0.5);

    const interpretation =
      std < 0.5
        ? 'Las dimensiones tecnológicas avanzan de forma uniforme.'
        : std < 1.0
        ? 'Dispersión moderada: revisar que la dimensión más rezagada no limite a las demás.'
        : 'Dispersión alta: hay dimensiones tecnológicas muy rezagadas respecto a otras; ' +
          'la menos madura suele convertirse en cuello de botella (p. ej. redes o ciberseguridad).';
    doc.fontSize(10).text(`Interpretación: ${interpretation}`);
  } else {
    doc.fontSize(10).text('No hay suficientes dimensiones tecnológicas evaluadas para este análisis.');
  }

  // 4. Top 10 subcriterios con mayor gap
  doc.addPage();
  doc.fontSize(13).text('4. Top 10 Subcriterios con Mayor Gap');
  doc.moveDown(0.5);

  const subGaps = responses
    .map((r) => ({
      code: r.subcriterion.code,
      name: r.subcriterion.name,
      value: r.value,
      gap: 5 - r.value,
    }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 10);

  if (subGaps.length === 0) {
    doc.fontSize(10).text('No hay respuestas registradas.');
  } else {
    subGaps.forEach((s, index) => {
      doc.fontSize(10).text(
        `${index + 1}. ${s.code}: ${s.name} — valor ${s.value.toFixed(1)}, gap ${s.gap.toFixed(1)}`,
        { indent: 20 }
      );
      doc.moveDown(0.3);
    });
  }

  // 5. Contribución ponderada al índice global
  doc.addPage();
  doc.fontSize(13).text('5. Contribución Ponderada al Índice Global');
  doc.moveDown(0.5);
  doc.fontSize(10).text('Dim | Peso | Madurez | Aporte | Aporte máximo', { indent: 20 });
  doc.moveDown(0.3);

  let totalWeight = 0;
  let totalContribution = 0;
  evaluation.dimensions.forEach((d) => {
    const contribution = d.weight * (d.maturity || 0);
    totalWeight += d.weight;
    totalContribution += contribution;
    doc.fontSize(10).text(
      `${d.code.padEnd(5)} | ${(d.weight * 100).toFixed(0)}% | ` +
        `${d.maturity != null ? d.maturity.toFixed(2) : 'N/A'} | ` +
        `${contribution.toFixed(3)} | ${(d.weight * 5).toFixed(2)}`,
      { indent: 20 }
    );
  });

  doc.moveDown();
  doc.fontSize(11).text(
    `Aporte total ponderado: ${totalContribution.toFixed(2)} de un máximo teórico de ${(totalWeight * 5).toFixed(2)}. ` +
    `Índice oficial de la evaluación: ${evaluation.globalMaturity?.toFixed(2) || 'N/A'} / 5.0.`
  );
  doc.moveDown(0.5);
  doc.fontSize(9).text(
    'El aporte de cada dimensión es peso × madurez; el índice global es la suma de aportes. ' +
    `Nota metodológica: los pesos configurados suman ${(totalWeight * 100).toFixed(0)}% (no 100%), ` +
    'por lo que el máximo teórico supera 5.0 y la comparación entre evaluaciones debe hacerse con el mismo modelo de pesos.',
    { color: 'gray' } as any
  );
}

function generateRegulatoryReport(
  doc: PDFDoc,
  evaluation: EvaluationWithDimensions,
  responses: ResponseWithSubcriterion[]
) {
  // Resumen Normativo
  doc.fontSize(16).text('Resumen Normativo', { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(
    `Este reporte relaciona la madurez de cada dimensión evaluada con los estándares ` +
    `y normativas que le aplican, indicando el nivel de cumplimiento referencial de cada una.`
  );
  doc.moveDown();
  doc.text(
    `Madurez global: ${evaluation.globalMaturity?.toFixed(2) || 'N/A'} / 5.0 ` +
    `(${evaluation.classification || 'No calculado'}).`
  );
  doc.moveDown();
  doc.fontSize(9).text(
    'Nota: los niveles de cumplimiento se derivan de la madurez evaluada (Alto >= 4.0, Medio >= 2.5, Bajo < 2.5). ' +
    'Son orientativos y no sustituyen una auditoría formal de certificación.',
    { color: 'gray' } as any
  );
  doc.addPage();

  // Matriz Dimensión -> Normas
  doc.fontSize(16).text('Cumplimiento por Dimensión y Normas Aplicables', { underline: true });
  doc.moveDown();

  evaluation.dimensions.forEach((dimension) => {
    const maturity = dimension.maturity || 0;
    const complianceLevel = getComplianceLevel(maturity);
    const norms = DIMENSION_NORMS[dimension.code] || [];

    doc.fontSize(12).text(`${dimension.code}: ${dimension.name}`, {
      indent: 20,
    });
    doc.fontSize(10)
      .text(`   Nivel de cumplimiento: ${complianceLevel}`, {
        indent: 30,
        color: complianceLevel === 'Alto' ? 'green' : complianceLevel === 'Medio' ? 'orange' : 'red',
      } as any)
      .text(`   Madurez: ${maturity.toFixed(2)} / 5.0`, {
        indent: 30,
      });

    if (norms.length > 0) {
      doc.fontSize(10).text('   Normas y estándares de referencia:', {
        indent: 30,
      });
      norms.forEach((norm) => {
        doc.fontSize(9).text(`   • ${norm}`, { indent: 40 });
      });
    } else {
      doc.fontSize(9).text('   • Sin normativa específica asociada a esta dimensión.', {
        indent: 40,
        color: 'gray',
      } as any);
    }

    if (maturity < 2.5) {
      const action = DIMENSION_COMPLIANCE_ACTIONS[dimension.code];
      doc.fontSize(9).text(
        `   Acción prioritaria: ${action || 'Formalizar y documentar las prácticas de esta dimensión.'}`,
        { indent: 30, color: 'red' } as any
      );
    } else if (maturity < 4.0) {
      doc.fontSize(9).text(
        '   Acción sugerida: consolidar evidencias de cumplimiento y formalizar auditorías internas periódicas.',
        { indent: 30, color: 'orange' } as any
      );
    }
    doc.moveDown(0.5);
  });

  doc.addPage();

  // Recomendaciones Normativas
  doc.fontSize(16).text('Prioridades de Cumplimiento', { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(
    'Dimensiones con madurez baja (< 2.5) cuyas normas asociadas deberían atenderse primero:'
  );
  doc.moveDown();

  const lowMaturityDimensions = evaluation.dimensions
    .filter((d) => (d.maturity || 0) < 2.5)
    .sort((a, b) => (a.maturity || 0) - (b.maturity || 0))
    .slice(0, 5);

  if (lowMaturityDimensions.length === 0) {
    doc.fontSize(11).text('Todas las dimensiones superan el umbral mínimo de 2.5.');
  } else {
    lowMaturityDimensions.forEach((dim, index) => {
      const norms = DIMENSION_NORMS[dim.code] || [];
      doc.fontSize(11).text(`${index + 1}. ${dim.code}: ${dim.name}`, {
        indent: 20,
      });
      doc.fontSize(10).text(
        `   Madurez actual: ${(dim.maturity || 0).toFixed(2)} / 5.0. ` +
          (norms.length > 0
            ? `Normas prioritarias: ${norms.join('; ')}.`
            : 'Definir marco de referencia aplicable.'),
        { indent: 30 }
      );
      doc.moveDown(0.5);
    });
  }

  // Detalle normativo por subcriterio de D12 (cada subcriterio mapea a normas colombianas específicas)
  const d12 = evaluation.dimensions.find((d) => d.code === 'D12');
  if (d12) {
    doc.addPage();
    doc.fontSize(16).text('Detalle Normativo por Subcriterio (D12)', { underline: true });
    doc.moveDown();
    doc.fontSize(10).text(
      'Cada subcriterio de la dimensión de cumplimiento normativo colombiano se relaciona con ' +
      'la regulación específica que le aplica y su nivel de cumplimiento referencial.'
    );
    doc.moveDown();

    d12.subcriteria.forEach((sub) => {
      const response = responses.find((r) => r.subcriterion.id === sub.id);
      const value = response?.value ?? null;
      const level = value != null ? getComplianceLevel(value) : 'Sin evaluar';
      const norms = D12_SUBCRITERION_NORMS[sub.code] || [];

      doc.fontSize(11).text(`${sub.code}: ${sub.name}`, { indent: 20 });
      doc.fontSize(10).text(
        value != null
          ? `   Valor: ${value.toFixed(2)} / 5.0 — Cumplimiento referencial: ${level}`
          : '   Sin respuesta registrada',
        {
          indent: 30,
          color: level === 'Alto' ? 'green' : level === 'Medio' ? 'orange' : 'red',
        } as any
      );
      norms.forEach((norm) => {
        doc.fontSize(9).text(`   • ${norm}`, { indent: 40 });
      });
      doc.moveDown(0.4);
    });
  }
}

function getMaturityClassification(maturity: number): string {
  if (maturity < 1.0) return 'Reactivo';
  if (maturity < 2.0) return 'Inicial';
  if (maturity < 3.0) return 'Estructurado';
  if (maturity < 4.0) return 'Integrado';
  if (maturity < 4.5) return 'Optimizado';
  return 'Predictivo/Inteligente';
}

// Normas y estándares de referencia por dimensión del modelo DMA
const DIMENSION_NORMS: Record<string, string[]> = {
  D01: ['ISO/IEC 38500 (Gobierno de TI)', 'COSO (marco de control y estrategia)'],
  D02: ['ISO 30414 (Informes de capital humano)', 'ISO 10015 (Gestión de la competencia y desarrollo de personas)'],
  D03: ['IEC 62264 / ISA-95 (Integración empresa-control)', 'OPC UA / IEC 62541 (Comunicación industrial)'],
  D04: ['IEC 62443-3-3 (Seguridad de redes de control industrial)', 'IEC 61850 (Comunicaciones en subestaciones eléctricas)'],
  D05: ['IEC 62443 (Ciberseguridad industrial)', 'ISO/IEC 27001 (Gestión de seguridad de la información)'],
  D06: ['ISO 8000 (Calidad de datos)', 'DAMA-DMBOK (Gobierno de datos)'],
  D07: ['ISO 9001 (Gestión de procesos y calidad)', 'BPM CBOK / ISO 19510 (Gestión de procesos de negocio)'],
  D08: ['IEC 61508 (Seguridad funcional)', 'IEC 61511 (Seguridad funcional en la industria de procesos)'],
  D09: ['ISO 55000 (Gestión de activos)', 'IEC 60721 / EN 13306 (Terminología de mantenimiento)'],
  D10: ['ISO 50001 (Sistemas de gestión de la energía)', 'Ley 1715 de 2014 (Energías renovables y eficiencia, Colombia)'],
  D11: ['ISO 9001 (Sistema de gestión de calidad)', 'ISO 45001 (Seguridad y salud en el trabajo)'],
  D12: ['Ley 1581 de 2012 (Protección de datos personales, Colombia)', 'Decreto 1073 de 2015 (SG-SST, Colombia)', 'Ley 1715 de 2014 (Marco energético, Colombia)'],
};

// Acción prioritaria de cumplimiento por dimensión cuando la madurez es baja (< 2.5)
const DIMENSION_COMPLIANCE_ACTIONS: Record<string, string> = {
  D01: 'Formalizar el gobierno digital: política aprobada, responsable designado y presupuesto documentado.',
  D02: 'Lanzar un plan básico de capacitación digital y designar líderes de cambio por área.',
  D03: 'Documentar la arquitectura OT/IT actual (inventario de sistemas e interfaces) como base de integración.',
  D04: 'Levantar el inventario de la red de planta y segmentar OT/IT como primer paso hacia IEC 62443-3-3.',
  D05: 'Iniciar con inventario de activos OT y análisis de riesgo; definir zonas y conductos (IEC 62443).',
  D06: 'Definir política de gobierno de datos: dueños, calidad y ciclo de vida (DAMA-DMBOK).',
  D07: 'Mapear los procesos críticos y establecer indicadores de desempeño documentados.',
  D08: 'Verificar las funciones de seguridad de los sistemas de control existentes (IEC 61508/61511).',
  D09: 'Implantar gestión de activos: inventario, criticidad y planes de mantenimiento (ISO 55000).',
  D10: 'Realizar un diagnóstico energético de línea base como primer paso de ISO 50001.',
  D11: 'Documentar el sistema de gestión de calidad: procesos, registros y responsables (ISO 9001).',
  D12: 'Verificar obligaciones legales vigentes: SG-SST (Res. 0312), protección de datos (Ley 1581) y licencias ambientales.',
};

// Normativa colombiana específica por subcriterio de D12
const D12_SUBCRITERION_NORMS: Record<string, string[]> = {
  'D12.1': ['Decreto 1073 de 2015', 'Resolución 0312 de 2019 (estándares mínimos SG-SST)'],
  'D12.2': ['Ley 1581 de 2012', 'Decreto 1377 de 2013 (registro de bases de datos)'],
  'D12.3': ['Decreto 1076 de 2015 (licencias y vertimientos)', 'Ley 99 de 1993'],
  'D12.4': ['Ley 1715 de 2014', 'Resoluciones CREG aplicables al sector'],
  'D12.5': ['CONPES 3854 de 2016', 'CONPES 3701 de 2011', 'Ley 1273 de 2009 (delitos informáticos)'],
  'D12.6': ['ISO 22301 (continuidad del negocio, referencia)'],
};

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
