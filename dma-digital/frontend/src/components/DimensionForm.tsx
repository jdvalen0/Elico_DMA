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
} from '@mui/material';
import { api } from '../services/api';

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

  // Cargar respuestas existentes cuando se monta el componente o cambia la dimensión
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
      
      // Mapear respuestas a valores y notas
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

      {dimension.subcriteria.map((subcriterion) => (
        <Card key={subcriterion.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {subcriterion.code}: {subcriterion.name}
            </Typography>

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
      ))}
    </Box>
  );
};
