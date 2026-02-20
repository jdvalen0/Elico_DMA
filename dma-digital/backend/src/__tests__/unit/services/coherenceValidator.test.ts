import { validateCoherence } from '../../../services/coherenceValidator';

describe('CoherenceValidator', () => {
  describe('validateCoherence', () => {
    it('debe detectar riesgo crítico cuando Ciberseguridad < 2.0', async () => {
      const dimensionMaturity = {
        D1: 3.0,
        D2: 3.0,
        D3: 3.0,
        D4: 3.0,
        D5: 1.5, // Ciberseguridad por debajo del mínimo
        D6: 3.0,
        D7: 3.0,
        D8: 3.0,
        D9: 3.0,
        D10: 3.0,
        D11: 3.0,
        D12: 3.0,
      };

      const result = await validateCoherence('test-eval-id', dimensionMaturity);

      expect(result.status).toBe('critical');
      expect(result.alerts).toHaveLength(1);
      expect(result.alerts[0].type).toBe('critical');
      expect(result.alerts[0].rule).toBe('RN-006');
    });

    it('debe detectar incoherencia alta entre Arquitectura OT/IT y Redes Industriales', async () => {
      const dimensionMaturity = {
        D1: 3.0,
        D2: 3.0,
        D3: 3.5, // Arquitectura OT/IT > 3.0
        D4: 2.0, // Redes Industriales <= 2.5
        D5: 3.0,
        D6: 3.0,
        D7: 3.0,
        D8: 3.0,
        D9: 3.0,
        D10: 3.0,
        D11: 3.0,
        D12: 3.0,
      };

      const result = await validateCoherence('test-eval-id', dimensionMaturity);

      expect(result.status).toBe('incoherent');
      expect(result.alerts.some((a) => a.rule === 'RN-007')).toBe(true);
    });

    it('debe detectar incoherencia alta entre Automatización y Procesos', async () => {
      const dimensionMaturity = {
        D1: 3.0,
        D2: 3.0,
        D3: 3.0,
        D4: 3.0,
        D5: 3.0,
        D6: 3.0,
        D7: 2.5, // Procesos <= 3.0
        D8: 4.2, // Automatización > 4.0
        D9: 3.0,
        D10: 3.0,
        D11: 3.0,
        D12: 3.0,
      };

      const result = await validateCoherence('test-eval-id', dimensionMaturity);

      expect(result.status).toBe('incoherent');
      expect(result.alerts.some((a) => a.rule === 'RN-008')).toBe(true);
    });

    it('debe detectar incoherencia media cuando Estrategia > 3.0 pero pocas dimensiones operativas > 2.5', async () => {
      const dimensionMaturity = {
        D1: 3.5, // Estrategia > 3.0
        D2: 3.0,
        D3: 3.0,
        D4: 3.0,
        D5: 3.0,
        D6: 3.0,
        D7: 2.0, // Operativa <= 2.5
        D8: 2.0, // Operativa <= 2.5
        D9: 2.0, // Operativa <= 2.5
        D10: 2.0, // Operativa <= 2.5
        D11: 2.0, // Operativa <= 2.5
        D12: 3.0,
      };

      const result = await validateCoherence('test-eval-id', dimensionMaturity);

      // La regla RN-009 genera una alerta de tipo 'medium', pero el status puede ser 'coherent' o 'incoherent'
      // dependiendo del score de coherencia. Verificamos que la alerta existe.
      expect(result.alerts.some((a) => a.rule === 'RN-009')).toBe(true);
      expect(result.alerts.some((a) => a.type === 'medium')).toBe(true);
    });

    it('debe retornar coherent cuando no hay incoherencias', async () => {
      const dimensionMaturity = {
        D1: 3.0,
        D2: 3.0,
        D3: 3.0,
        D4: 3.0,
        D5: 3.0, // Ciberseguridad >= 2.0
        D6: 3.0,
        D7: 3.5, // Procesos > 3.0
        D8: 3.5, // Automatización <= 4.0
        D9: 3.0,
        D10: 3.0,
        D11: 3.0,
        D12: 3.0,
      };

      const result = await validateCoherence('test-eval-id', dimensionMaturity);

      expect(result.status).toBe('coherent');
      expect(result.alerts).toHaveLength(0);
    });

    it('debe calcular score de coherencia correctamente', async () => {
      const dimensionMaturity = {
        D1: 3.0,
        D2: 3.0,
        D3: 3.0,
        D4: 3.0,
        D5: 3.0,
        D6: 3.0,
        D7: 3.0,
        D8: 3.0,
        D9: 3.0,
        D10: 3.0,
        D11: 3.0,
        D12: 3.0,
      };

      const result = await validateCoherence('test-eval-id', dimensionMaturity);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });
  });
});
