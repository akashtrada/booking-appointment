import {useMemo} from "react";
import {Box} from "@mui/material";
import {useDraggable} from "@dnd-kit/core";
import StatusIcon from "../../atoms/StatusIcon/StatusIcon";
import TextHighlighter from "../../atoms/TextHighlighter/TextHighlighter";
import {gapHalf, gapQuarter, STATUS_COLORS, textPrimaryClr, textSecondaryClr} from "../../../theme/theme";
import {ICON_COLORS, SLOT_HEIGHT, STR_CANCELLED, STR_NO_SHOW} from "../../../constants/constantsPlus";
import {px} from "../../../utils/appPlus";

export default function BookingBlock(props)
{
  const {booking, onBookingClick, onBookingDoubleClick, searchWords = []} = props;

  const isCancelled = booking.status === STR_CANCELLED || booking.status === STR_NO_SHOW;

  const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
    id: `booking-${booking.itemId}`,
    data: {booking},
    disabled: isCancelled
  });

  const blockHeight = useMemo(() => (booking.duration / 15) * SLOT_HEIGHT, [booking.duration]);
  const bgColor = useMemo(() => STATUS_COLORS[booking.status] || STATUS_COLORS.Cancelled, [booking.status]);

  const styles = useMemo(() => ({
    block: {
      position: "absolute",
      top: "1px",
      left: px(gapHalf),
      right: px(gapHalf),
      height: `${blockHeight - 2}px`,
      backgroundColor: bgColor,
      borderRadius: px(gapQuarter),
      padding: "3px 5px",
      zIndex: isDragging ? 100 : 2,
      cursor: isCancelled ? "pointer" : "grab",
      opacity: isDragging ? 0.75 : 1,
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.2)" : "0 1px 2px rgba(0,0,0,0.08)"
    },
    service: {
      color: textSecondaryClr,
      fontWeight: 600,
      fontSize: "10px",
      lineHeight: 1.3,
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden"
    },
    detailGroup: {
      marginTop: px(10),
      display: "flex",
      flexDirection: "column"
    },
    phone: {
      color: textPrimaryClr,
      fontSize: "10px",
      lineHeight: 1.2
    },
    customerName: {
      color: textPrimaryClr,
      fontWeight: 600,
      fontSize: "10px",
      lineHeight: 1.2,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    },
    spacer: {
      flex: 1
    },
    iconsRow: {
      display: "flex",
      gap: "3px",
      alignItems: "center",
      flexWrap: "wrap",
      marginTop: "2px"
    }
  }), [blockHeight, bgColor, isDragging, isCancelled, transform]);

  return (
    <Box
      ref={setNodeRef}
      style={styles.block}
      {...listeners}
      {...attributes}
      onClick={(e) => { e.stopPropagation(); onBookingClick?.(booking); }}
      onDoubleClick={(e) => { e.stopPropagation(); onBookingDoubleClick?.(booking); }}
    >
      <TextHighlighter value={booking.service} searchWords={searchWords} style={styles.service} />
      <Box style={styles.detailGroup}>
        <TextHighlighter value={booking.customerId ? String(booking.customerId) : ''} searchWords={searchWords} style={styles.phone} />
        <TextHighlighter value={booking.customerName} searchWords={searchWords} style={styles.customerName} />
      </Box>
      <Box style={styles.spacer} />
      {!isCancelled && (
        <Box style={styles.iconsRow}>
          <StatusIcon letter="C" bgColor={ICON_COLORS.c} />
          <StatusIcon letter="H" bgColor={ICON_COLORS.h} />
          {booking.requestedPerson === 1 && <StatusIcon letter="T" bgColor={ICON_COLORS.t} />}
          {booking.requestedRoom && <StatusIcon letter="R" bgColor={ICON_COLORS.r} />}
        </Box>
      )}
    </Box>
  );
}
