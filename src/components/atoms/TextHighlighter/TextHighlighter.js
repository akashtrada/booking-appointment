import { useMemo } from 'react';
import { Typography } from '@mui/material';

export default function TextHighlighter(props) {
  const { value = '', variant = 'body2', searchWords = [], style = {} } = props;

  const parts = useMemo(() => {
    if (!searchWords.length || !value) return null;
    const regex = new RegExp(`(${searchWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    return value.split(regex);
  }, [value, searchWords]);

  if (!parts) {
    return (
      <Typography variant={variant} style={style}>
        {value}
      </Typography>
    );
  }

  const lowerWords = searchWords.map((w) => w.toLowerCase());

  return (
    <Typography variant={variant} style={style}>
      {parts.map((part, i) =>
        lowerWords.includes(part.toLowerCase()) ? (
          <mark key={i} style={{ backgroundColor: '#fff176', padding: 0 }}>{part}</mark>
        ) : (
          part
        )
      )}
    </Typography>
  );
}