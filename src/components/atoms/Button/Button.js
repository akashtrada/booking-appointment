import { useMemo } from 'react';
import { Button as MuiButton } from '@mui/material';
import { borderClr } from '../../../theme/theme';

export default function Button(props) {
  const {
    label,
    onClick,
    icon,
    iconPosition = 'left',
    variant = 'outlined',
    disabled = false,
    size = 'medium',
    sx = {},
  } = props;

  const styles = useMemo(() => ({
    button: {
      borderRadius: '3px',
      borderColor: borderClr,
      height: '30px',
      ...sx,
    },
  }), [sx]);

  return (
    <MuiButton
      onClick={onClick}
      variant={variant}
      disabled={disabled}
      size={size}
      startIcon={icon && iconPosition === 'left' ? icon : undefined}
      endIcon={icon && iconPosition === 'right' ? icon : undefined}
      sx={styles.button}
    >
      {label}
    </MuiButton>
  );
}