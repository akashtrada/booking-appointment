import {useMemo} from "react";
import {Box, Typography} from "@mui/material";
import {textSecondaryClr} from "../../theme/theme";
import {px} from "../../utils/utilPlus";

export default function EmptyState({message})
{
  const styles = useMemo(() => ({
    container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: px(16),
      width: "100%"
    },
    text: {
      fontSize: "12px",
      color: textSecondaryClr,
      fontStyle: "italic"
    }
  }), []);

  return (
    <Box style={styles.container}>
      <Typography style={styles.text}>{message}</Typography>
    </Box>
  );
}
