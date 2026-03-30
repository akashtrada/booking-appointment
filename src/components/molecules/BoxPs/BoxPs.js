import {useMemo} from "react";
import {Avatar, Box, Skeleton} from "@mui/material";
import TextHighlighter from "../../atoms/TextHighlighter/TextHighlighter";
import {px} from "../../../utils/appPlus";
import {gapHalf, textPrimaryClr, textSecondaryClr} from "../../../theme/theme";
import {PENDING_BOOKING_COLOR} from "../../../constants/constantsPlus";

function getInitials(name = "")
{
  return name
  .split(" ")
  .map((w) => w[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();
}

export default function BoxPs({name = "", phone = "", searchWords = [], onClick, skeleton})
{
  const initials = useMemo(() => getInitials(name), [name]);

  const styles = useMemo(() => ({
    container: {
      display: "flex",
      alignItems: "center",
      gap: px(gapHalf),
      padding: `${px(8)} ${px(10)}`,
      cursor: onClick ? "pointer" : "default",
      borderRadius: px(4)
    },
    avatar: {
      width: px(34),
      height: px(34),
      fontSize: "12px",
      fontWeight: 700,
      backgroundColor: PENDING_BOOKING_COLOR,
      color: "#ffffff",
      flexShrink: 0
    },
    textGroup: {
      display: "flex",
      flexDirection: "column",
      gap: px(2),
      overflow: "hidden",
      flex: 1
    },
    primary: {
      fontSize: "13px",
      fontWeight: 600,
      lineHeight: 1.3,
      color: textPrimaryClr
    },
    secondary: {
      fontSize: "11px",
      lineHeight: 1.3,
      color: textSecondaryClr
    }
  }), [onClick]);

  if(skeleton)
  {
    return (
      <Box style={{display: "flex", alignItems: "center", gap: px(gapHalf), padding: `${px(8)} ${px(10)}`}}>
        <Skeleton variant="circular" width={34} height={34} />
        <Box>
          <Skeleton variant="text" width={110} height={16} />
          <Skeleton variant="text" width={80} height={13} />
        </Box>
      </Box>
    );
  }

  return (
    <Box style={styles.container} onClick={onClick}>
      <Avatar style={styles.avatar}>{initials}</Avatar>
      <Box style={styles.textGroup}>
        <TextHighlighter value={name} searchWords={searchWords} style={styles.primary} />
        <TextHighlighter value={phone} searchWords={searchWords} style={styles.secondary} />
      </Box>
    </Box>
  );
}
