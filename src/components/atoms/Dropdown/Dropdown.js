import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function Dropdown(props) {
  const { value = '', onChange, disabled = false } = props;

  const styles = useMemo(() => ({
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: disabled ? 'default' : 'pointer',
      width: '100%',
      height: '20px',
      padding: '0 2px',
    },
    icon: {
      fontSize: '16px',
      color: '#6b6b6b',
    },
  }), [disabled]);

  return (
    <Box onClick={disabled ? undefined : onChange} style={styles.container}>
      <Typography variant="caption" fontWeight={500} noWrap>
        {value}
      </Typography>
      <ExpandMoreIcon style={styles.icon} />
    </Box>
  );
}