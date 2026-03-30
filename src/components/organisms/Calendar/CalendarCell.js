import { useMemo } from 'react';
import { Box } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import BookingBlock from '../../molecules/BookingBlock/BookingBlock';
import { px } from '../../../utils/appPlus';

const COL_WIDTH = 120;
const ROW_HEIGHT = 26;

export default function CalendarCell(props) {
  const { therapistId, slotIndex, slotStartMinute, bookings, onBookingClick, onBookingDoubleClick, onCellClick } = props;

  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${therapistId}-${slotIndex}`,
    data: { therapistId, slotIndex, slotStartMinute },
  });

  const slotBookings = useMemo(() => {
    return bookings.filter((b) => {
      const [h, m] = b.startTime.split(':').map(Number);
      return h * 60 + m === slotStartMinute;
    });
  }, [bookings, slotStartMinute]);

  const styles = useMemo(() => ({
    cell: {
      width: px(COL_WIDTH),
      minWidth: px(COL_WIDTH),
      height: px(ROW_HEIGHT),
      position: 'relative',
      borderRight: '1px solid #f0f0f0',
      backgroundColor: isOver ? '#e3f2fd' : 'transparent',
      flexShrink: 0,
      cursor: 'pointer',
      overflow: 'visible',
      transition: 'background-color 0.15s',
    },
  }), [isOver]);

  return (
    <Box
      ref={setNodeRef}
      style={styles.cell}
      onClick={() => onCellClick?.({ therapistId, slotStartMinute })}
    >
      {slotBookings.map((booking) => (
        <BookingBlock
          key={booking.itemId}
          booking={booking}
          onBookingClick={onBookingClick}
          onBookingDoubleClick={onBookingDoubleClick}
        />
      ))}
    </Box>
  );
}
