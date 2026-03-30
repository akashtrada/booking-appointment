import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';

export default function StatusIcon(props) {
  const { letter, bgColor = 'rgba(255,255,255,0.3)' } = props;

  const styles = useMemo(() => ({
    circle: {
      width: '14px',
      height: '14px',
      borderRadius: '50%',
      backgroundColor: bgColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    letter: {
      fontSize: '8px',
      fontWeight: 700,
      color: '#ffffff',
      lineHeight: 1,
    },
  }), [bgColor]);

  return (
    <Box style={styles.circle}>
      <Typography style={styles.letter}>{letter}</Typography>
    </Box>
  );
}
