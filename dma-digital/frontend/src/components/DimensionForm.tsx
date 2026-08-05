import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  TextField,
  Collapse,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { api, API_URL } from '../services/api';
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

type SaveState = 'saving' | 'saved' | 'error';

const AUTO_SAVE_DELAY = 800;

export const DimensionForm = ({
  dimension,
  evaluationId,
  onUpdate,
}: DimensionFormProps) => {
  const [values, setValues] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const [loading, setLoading] = useState(true);
  const [openHelp, setOpenHelp] = useState<Record<string, boolean>>({});

  // Refs espejo del estado para que los timers lean siempre el valor más reciente
  const valuesRef = useRef(values);
  const notesRef = useRef(notes);
  const savedRef = useRef<Record<string, { value: number; notes: string }>>({});
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const statusTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const setSaveState = (id: string, state?: SaveState) => {
    setSaveStates((prev) => {
      const next = { ...prev };
      if (state) {
        next[id] = state;
      } else {
        delete next[id];
      }
      return next;
    });
  };

  // dimensionId se pasa explícitamente: al cambiar de dimensión los guardados
  // pendientes deben apuntar a la dimensión donde se hizo el cambio
  const performSave = async (subcriterionId: string, dimensionId: string) => {
    const value = valuesRef.current[subcriterionId];
    if (value === undefined) return;
    const note = notesRef.current[subcriterionId] ?? '';

    const last = savedRef.current[subcriterionId];
    if (last && last.value === value && last.notes === note) return;

    setSaveState(subcriterionId, 'saving');
    try {
      await api.put(`/responses/evaluations/${evaluationId}/responses`, {
        subcriterionId,
        dimensionId,
        value,
        notes: note,
      });
      savedRef.current[subcriterionId] = { value, notes: note };
      setSaveState(subcriterionId, 'saved');
      onUpdateRef.current();

      clearTimeout(statusTimersRef.current[subcriterionId]);
      statusTimersRef.current[subcriterionId] = setTimeout(
        () => setSaveState(subcriterionId, undefined),
        2500
      );
    } catch (error) {
      console.error('Error auto-guardando respuesta:', error);
      setSaveState(subcriterionId, 'error');
    }
  };

  const performSaveRef = useRef(performSave);
  performSaveRef.current = performSave;

  const scheduleSave = (subcriterionId: string) => {
    if (valuesRef.current[subcriterionId] === undefined) return;
    clearTimeout(timersRef.current[subcriterionId]);
    const dimensionId = dimension.id;
    timersRef.current[subcriterionId] = setTimeout(() => {
      delete timersRef.current[subcriterionId];
      performSaveRef.current(subcriterionId, dimensionId);
    }, AUTO_SAVE_DELAY);
  };

  const flushPendingSaves = () => {
    Object.entries(timersRef.current).forEach(([subcriterionId, timer]) => {
      clearTimeout(timer);
      performSaveRef.current(subcriterionId, dimension.id);
    });
    timersRef.current = {};
  };

  // Flush con keepalive al cerrar/ocultar la pestaña: fetch sobrevive al unload
  // (a diferencia de axios, que se cancelaría)
  const flushOnPageHide = () => {
    const pendingIds = Object.keys(timersRef.current);
    if (pendingIds.length === 0) return;

    const token = localStorage.getItem('token');
    Object.values(timersRef.current).forEach(clearTimeout);
    timersRef.current = {};

    pendingIds.forEach((subcriterionId) => {
      const value = valuesRef.current[subcriterionId];
      if (value === undefined) return;
      const note = notesRef.current[subcriterionId] ?? '';
      const last = savedRef.current[subcriterionId];
      if (last && last.value === value && last.notes === note) return;

      fetch(`${API_URL}/responses/evaluations/${evaluationId}/responses`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subcriterionId,
          dimensionId: dimension.id,
          value,
          notes: note,
        }),
        keepalive: true,
      }).catch(() => {});
    });
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushOnPageHide();
      }
    };
    window.addEventListener('pagehide', flushOnPageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('pagehide', flushOnPageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [evaluationId, dimension.id]);

  useEffect(() => {
    loadResponses();
    // Al cambiar de dimensión: guardar lo pendiente antes de recargar
    return () => {
      flushPendingSaves();
    };
  }, [dimension.id, evaluationId]);

  useEffect(
    () => () => {
      Object.values(statusTimersRef.current).forEach(clearTimeout);
    },
    []
  );

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
      valuesRef.current = newValues;
      notesRef.current = newNotes;
      savedRef.current = Object.fromEntries(
        Object.entries(newValues).map(([id, value]) => [
          id,
          { value, notes: newNotes[id] ?? '' },
        ])
      );
      setSaveStates({});
    } catch (error) {
      console.error('Error loading responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (subcriterionId: string, value: number) => {
    setValues((prev) => {
      const next = { ...prev, [subcriterionId]: value };
      valuesRef.current = next;
      return next;
    });
    scheduleSave(subcriterionId);
  };

  const handleNotesChange = (subcriterionId: string, text: string) => {
    setNotes((prev) => {
      const next = { ...prev, [subcriterionId]: text };
      notesRef.current = next;
      return next;
    });
    scheduleSave(subcriterionId);
  };

  const toggleHelp = (subcriterionId: string) => {
    setOpenHelp((prev) => ({ ...prev, [subcriterionId]: !prev[subcriterionId] }));
  };

  const renderSaveIndicator = (subcriterionId: string) => {
    const state = saveStates[subcriterionId];
    if (!state) return null;

    if (state === 'saving') {
      return (
        <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
          <CircularProgress size={14} />
          <Typography variant="caption">Guardando…</Typography>
        </Box>
      );
    }
    if (state === 'saved') {
      return (
        <Box display="flex" alignItems="center" gap={0.5} color="success.main">
          <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption">Guardado</Typography>
        </Box>
      );
    }
    return (
      <Box display="flex" alignItems="center" gap={0.5} color="error.main">
        <ErrorOutlineIcon sx={{ fontSize: 16 }} />
        <Typography variant="caption">Error al guardar</Typography>
      </Box>
    );
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
      <Box display="flex" alignItems="baseline" justifyContent="space-between" mb={1}>
        <Typography variant="h5">
          {dimension.code}: {dimension.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Los cambios se guardan automáticamente
        </Typography>
      </Box>

      {dimension.subcriteria.map((subcriterion) => {
        const help = SUBCRITERIA_HELP[subcriterion.code];
        const isHelpOpen = openHelp[subcriterion.id] ?? false;

        return (
          <Card key={subcriterion.id} sx={{ mb: 3 }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              {/* Cabecera: código + nombre + estado guardado + botón ayuda */}
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="h6">
                  {subcriterion.code}: {subcriterion.name}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  {renderSaveIndicator(subcriterion.id)}
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
                onChange={(e) => handleNotesChange(subcriterion.id, e.target.value)}
              />
              {values[subcriterion.id] === undefined &&
                (notes[subcriterion.id] || '').trim() !== '' && (
                  <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 0.5 }}>
                    Las notas se guardarán cuando asignes una calificación
                  </Typography>
                )}
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};
