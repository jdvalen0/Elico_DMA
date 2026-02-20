import { Box, Chip, Typography } from '@mui/material';
import { CloudOff, CloudDone, Sync } from '@mui/icons-material';
import { useOfflineSync } from '../hooks/useOfflineSync';

interface OfflineIndicatorProps {
  evaluationId: string;
}

export const OfflineIndicator = ({ evaluationId }: OfflineIndicatorProps) => {
  const { isOnline, syncing, lastSync, syncNow } = useOfflineSync(evaluationId);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      {isOnline ? (
        <Chip
          icon={<CloudDone />}
          label="En línea"
          color="success"
          size="small"
        />
      ) : (
        <Chip
          icon={<CloudOff />}
          label="Sin conexión"
          color="warning"
          size="small"
        />
      )}

      {syncing && (
        <Chip
          icon={<Sync />}
          label="Sincronizando..."
          size="small"
          onClick={syncNow}
          sx={{ cursor: 'pointer' }}
        />
      )}

      {lastSync && (
        <Typography variant="caption" color="text.secondary">
          Última sincronización: {lastSync.toLocaleTimeString()}
        </Typography>
      )}
    </Box>
  );
};
