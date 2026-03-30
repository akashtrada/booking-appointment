import { useMemo } from 'react';
import { Box, Avatar, Typography, Skeleton } from '@mui/material';
import { px } from '../../../utils/appPlus';

const GENDER_COLOR = {
  male: '#EC4899',
  female: '#3B82F6',
};

export default function BoxAps(props) {
  const { number, gender, primaryText, secondaryText, onClick, skeleton, size, style: styleProp } = props;

  const isSmall = size === 'small';

  const styles = useMemo(() => ({
    container: {
      display: 'flex',
      alignItems: 'center',
      width: isSmall ? 'auto' : px(120),
      height: isSmall ? px(24) : px(32),
      gap: px(isSmall ? 5 : 8),
      cursor: onClick ? 'pointer' : 'default',
      ...styleProp,
    },
    avatar: {
      width: px(isSmall ? 20 : 24),
      height: px(isSmall ? 20 : 24),
      fontSize: isSmall ? '9px' : '11px',
      fontWeight: 600,
      color: '#ffffff',
      backgroundColor: GENDER_COLOR[gender] || GENDER_COLOR.female,
    },
    textGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: px(1),
      overflow: 'hidden',
    },
    primary: {
      fontSize: isSmall ? '11px' : '12px',
      fontWeight: 600,
      lineHeight: 1,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      color: '#1a1a1a',
    },
    secondary: {
      fontSize: isSmall ? '9px' : '10px',
      lineHeight: 1,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      color: '#6b6b6b',
    },
  }), [gender, onClick, isSmall, styleProp]);

  if (skeleton) {
    return (
      <Box style={styles.container}>
        <Skeleton variant="circular" width={isSmall ? 20 : 24} height={isSmall ? 20 : 24} />
        <Box style={styles.textGroup}>
          <Skeleton variant="text" width={isSmall ? 48 : 64} height={isSmall ? 11 : 14} />
          <Skeleton variant="text" width={isSmall ? 32 : 44} height={isSmall ? 9 : 10} />
        </Box>
      </Box>
    );
  }

  return (
    <Box style={styles.container} onClick={onClick}>
      <Avatar style={styles.avatar}>{number}</Avatar>
      <Box style={styles.textGroup}>
        <Typography style={styles.primary}>{primaryText}</Typography>
        <Typography style={styles.secondary}>{secondaryText}</Typography>
      </Box>
    </Box>
  );
}
