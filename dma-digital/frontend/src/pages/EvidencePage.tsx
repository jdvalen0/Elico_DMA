import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  IconButton,
} from '@mui/material';
import { Upload, Delete, PhotoLibrary, ArrowBack } from '@mui/icons-material';
import { api } from '../services/api';

interface Evidence {
  id: string;
  type: string;
  description: string;
  filePath: string;
  fileSize: bigint;
  mimeType: string;
  createdAt: string;
  url?: string;
  createdBy?: {
    id: string;
    name: string;
  };
}

export const EvidencePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceType, setEvidenceType] = useState('PHOTO');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      loadEvidence();
    }
  }, [id]);

  const loadEvidence = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await api.get(`/evidence/evaluations/${id}/evidence`);
      setEvidence(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al cargar evidencias');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !id) {
      setError('Selecciona un archivo');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', evidenceType);
      formData.append('description', description);

      await api.post(`/evidence/evaluations/${id}/evidence`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFile(null);
      setDescription('');
      setEvidenceType('PHOTO');
      await loadEvidence();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al subir evidencia');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (evidenceId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta evidencia?')) {
      return;
    }

    try {
      await api.delete(`/evidence/${evidenceId}`);
      await loadEvidence();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al eliminar evidencia');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4">Evidencias</Typography>
        </Box>
        {id && (
          <Button
            variant="outlined"
            onClick={() => navigate(`/evaluations/${id}`)}
          >
            Ver Evaluación
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Subir Nueva Evidencia
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<Upload />}
                fullWidth
              >
                Seleccionar Archivo
                <input
                  type="file"
                  hidden
                  onChange={handleFileSelect}
                  accept="image/*,application/pdf,.doc,.docx"
                />
              </Button>
              {file && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Tipo"
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value)}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="PHOTO">Foto</option>
                <option value="DOCUMENT">Documento</option>
                <option value="EMAIL">Correo</option>
                <option value="OTHER">Otro</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción de la evidencia"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<Upload />}
                onClick={handleUpload}
                disabled={!file || uploading}
              >
                {uploading ? 'Subiendo...' : 'Subir Evidencia'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {evidence.length === 0 ? (
          <Grid item xs={12}>
            <Box textAlign="center" py={4}>
              <PhotoLibrary sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No hay evidencias
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sube fotos, documentos o correos como evidencia
              </Typography>
            </Box>
          </Grid>
        ) : (
          evidence.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {item.type}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                  {item.description && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {item.description}
                    </Typography>
                  )}
                  {item.url && (
                    <Box sx={{ mb: 2 }}>
                      {item.mimeType?.startsWith('image/') ? (
                        <img
                          src={item.url}
                          alt={item.description || 'Evidencia'}
                          style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      ) : (
                        <Button
                          variant="outlined"
                          fullWidth
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ver Archivo
                        </Button>
                      )}
                    </Box>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {(Number(item.fileSize) / 1024).toFixed(2)} KB
                  </Typography>
                  {item.createdBy && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      Por: {item.createdBy.name}
                    </Typography>
                  )}
                  <Typography variant="caption" display="block" color="text.secondary">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};
