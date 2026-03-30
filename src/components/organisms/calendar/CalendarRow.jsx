import {useMemo} from "react";
import {Box, Typography} from "@mui/material";
import CalendarCell from "./CalendarCell";
import {px} from "../../../utils/utilPlus";

const TIME_COL_WIDTH = 80;
const COL_WIDTH = 120;
const ROW_HEIGHT = 26;
const SLOT_MINUTES = 15;

function formatTimeLabel(hour, minute)
{
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 || 12;
  return `${String(displayHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
}

export default function CalendarRow(props)
{
  const {
    virtualRow,
    timeSlot,
    therapists,
    virtualColumns,
    bookingsByTherapist,
    onBookingClick,
    onBookingDoubleClick,
    onCellClick,
    startMinute
  } = props;

  const slotStartMinute = startMinute + virtualRow.index * SLOT_MINUTES;

  const formattedLabel = useMemo(() =>
  {
    const h = Math.floor(slotStartMinute / 60);
    const m = slotStartMinute % 60;
    return formatTimeLabel(h, m);
  }, [slotStartMinute]);

  const styles = useMemo(() => ({
    row: {
      position: "absolute",
      top: px(virtualRow.start),
      left: 0,
      width: "100%",
      height: px(ROW_HEIGHT),
      display: "flex",
      borderBottom: timeSlot.isHourMark ? "1px solid #e0e0e0" : "1px solid #f5f5f5"
    },
    timeCell: {
      position: "sticky",
      left: 0,
      width: px(TIME_COL_WIDTH),
      minWidth: px(TIME_COL_WIDTH),
      height: px(ROW_HEIGHT),
      zIndex: 20,
      backgroundColor: "#ffffff",
      borderRight: "1px solid #e0e0e0",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "flex-end",
      paddingTop: "3px",
      paddingRight: "8px",
      flexShrink: 0
    },
    timeText: {
      fontSize: "10px",
      color: "#6b6b6b",
      lineHeight: 1,
      textAlign: "right",
      fontWeight: timeSlot.isHourMark ? 600 : 400
    },
    cellsArea: {
      position: "relative",
      flex: 1,
      height: px(ROW_HEIGHT)
    },
    cell: {
      position: "absolute",
      top: 0,
      height: px(ROW_HEIGHT),
      width: px(COL_WIDTH)
    }
  }), [virtualRow.start, timeSlot.isHourMark]);

  return (
    <Box style={styles.row}>
      <Box style={styles.timeCell}>
        {timeSlot.isHourMark && (
          <Typography style={styles.timeText}>{formattedLabel}</Typography>
        )}
      </Box>
      <Box style={styles.cellsArea}>
        {virtualColumns.map((virtualCol) =>
        {
          const therapist = therapists[virtualCol.index];
          if(!therapist)
          {
            return null;
          }
          return (
            <Box key={virtualCol.key} style={{...styles.cell, left: px(virtualCol.start)}}>
              <CalendarCell
                therapistId={therapist.id}
                slotIndex={virtualRow.index}
                slotStartMinute={slotStartMinute}
                bookings={bookingsByTherapist[therapist.id] || []}
                onBookingClick={onBookingClick}
                onBookingDoubleClick={onBookingDoubleClick}
                onCellClick={onCellClick}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
