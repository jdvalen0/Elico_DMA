import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  TextField,
  Button,
  Alert,
  Collapse,
  IconButton,
  Tooltip,
  Divider,
  Chip,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { api } from '../services/api';
import { SUBCRITERIA_HELP } from '../constants/subcriteriaHelp';

interface Subcriterion {
  id: string;
  code: string;
  name: string;
  maturity?: number;
}

interface Dimension {
  id: string;
  code: string;
  name: string;
  subcriteria: Subcriterion[];
}

interface DimensionFormProps {
  dimension: Dimension;
  evaluationId: string;
  onUpdate: () => void;
}

interface Response {
  id: string;
  subcriterionId: string;
  value: number;
  notes: string | null;
}

export const DimensionForm = ({
  dimension,
  evaluationId,
  onUpdate,
}: DimensionFormProps) => {
  const [values, setValues] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openHelp, setOpenHelp] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadResponses();
  }, [dimension.id, evaluationId]);

  const loadResponses = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/responses/evaluations/${evaluationId}/responses?dimensionId=${dimension.id}`
      );
      const responses: Response[] = response.data.data || [];

      const newValues: Record<string, number> = {};
      const newNotes: Record<string, string> = {};

      responses.forEach((resp) => {
        newValues[resp.subcriterionId] = resp.value;
        if (resp.notes) {
          newNotes[resp.subcriterionId] = resp.notes;
        }
      });

      setValues(newValues);
      setNotes(newNotes);
    } catch (error) {
      console.error('Error loading responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (subcriterionId: string, value: number) => {
    setValues((prev) => ({ ...prev, [subcriterionId]: value }));
    setSuccess(false);
  };

  const handleSave = async (subcriterionId: string) => {
    setSaving(true);
    try {
      await api.put(`/responses/evaluations/${evaluationId}/responses`, {
        subcriterionId,
        dimensionId: dimension.id,
        value: values[subcriterionId] || 0,
        notes: notes[subcriterionId] || '',
      });
      setSuccess(true);
      onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving response:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleHelp = (subcriterionId: string) => {
    setOpenHelp((prev) => ({ ...prev, [subcriterionId]: !prev[subcriterionId] }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography>Cargando respuestas...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {dimension.code}: {dimension.name}
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Respuesta guardada exitosamente
        </Alert>
      )}

      {dimension.subcriteria.map((subcriterion) => {
        const help = SUBCRITERIA_HELP[subcriterion.code];
        const isHelpOpen = openHelp[subcriterion.id] ?? false;

        return (
          <Card key={subcriterion.id} sx={{ mb: 3 }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              {/* Cabecera: código + nombre + botón ayuda */}
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="h6">
                  {subcriterion.code}: {subcriterion.name}
                </Typography>
                {help && (
                  <Tooltip title={isHelpOpen ? 'Ocultar ayuda' : 'Ver guía de evaluación'}>
                    <IconButton
                      size="small"
                      onClick={() => toggleHelp(subcriterion.id)}
                      color={isHelpOpen ? 'primary' : 'default'}
                      aria-label={`ayuda-${subcriterion.code}`}
                    >
                      <HelpOutlineIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              {/* Panel de ayuda desplegable */}
              {help && (
                <Collapse in={isHelpOpen}>
                  <Box
                    sx={{
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                      p: 2,
                      mb: 2,
                      borderLeft: '4px solid',
                      borderColor: 'primary.main',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      ¿Qué evaluar?
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {help.whatToEvaluate}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Preguntas clave
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                      {help.keyQuestions.map((q, i) => (
                        <Typography key={i} component="li" variant="body2">
                          {q}
                        </Typography>
                      ))}
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Ejemplos de puntuación
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={0.5}>
                      {help.examples.map((ex, i) => {
                        // Extrae el rango (e.g. "0-1", "2-3", "4-5") para colorear el Chip
                        const rangeMatch = ex.match(/^\*\*(\d+-\d+|\d)\*\*/);
                        const range = rangeMatch ? rangeMatch[1] : '';
                        const text = ex.replace(/^\*\*[\d-]+\*\*:\s*/, '');
                        const chipColor =
                          range.startsWith('4') ? 'success' :
                          range.startsWith('2') || range.startsWith('3') ? 'warning' : 'error';

                        return (
                          <Box key={i} display="flex" alignItems="flex-start" gap={1}>
                            <Chip
                              label={range}
                              size="small"
                              color={chipColor as any}
                              sx={{ mt: 0.25, minWidth: 44, flexShrink: 0 }}
                            />
                            <Typography variant="body2">{text}</Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Collapse>
              )}

              {/* Slider de madurez */}
              <Box sx={{ mb: 2 }}>
                <Typography gutterBottom>
                  Madurez: {values[subcriterion.id]?.toFixed(1) || '0.0'} / 5.0
                </Typography>
                <Slider
                  value={values[subcriterion.id] || 0}
                  onChange={(_, value) =>
                    handleValueChange(subcriterion.id, value as number)
                  }
                  min={0}
                  max={5}
                  step={0.5}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 1, label: '1' },
                    { value: 2, label: '2' },
                    { value: 3, label: '3' },
                    { value: 4, label: '4' },
                    { value: 5, label: '5' },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>

              <TextField
                fullWidth
                label="Notas"
                multiline
                rows={3}
                value={notes[subcriterion.id] || ''}
                onChange={(e) =>
                  setNotes((prev) => ({
                    ...prev,
                    [subcriterion.id]: e.target.value,
                  }))
                }
                sx={{ mb: 2 }}
              />

              <Button
                variant="contained"
                onClick={() => handleSave(subcriterion.id)}
                disabled={saving || values[subcriterion.id] === undefined}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};
