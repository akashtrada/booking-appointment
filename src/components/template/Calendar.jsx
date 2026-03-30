import {useCallback, useMemo, useRef, useState} from "react";
import {Box, LinearProgress} from "@mui/material";
import {useVirtualizer} from "@tanstack/react-virtual";
import {DndContext, DragOverlay, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import EmptyState from "../atoms/EmptyState";
import CalendarHeader from "../organisms/calendar/CalendarHeader";
import CalendarRow from "../organisms/calendar/CalendarRow";
import BookingBlock from "../molecules/BookingBlock";
import {px} from "../../utils/utilPlus";

const CORNER_WIDTH = 80;
const COL_WIDTH = 120;
const ROW_HEIGHT = 26;
const SLOT_MINUTES = 15;

function generateTimeSlots(startHour, endHour)
{
  const slots = [];
  for(let h = startHour; h < endHour; h++)
  {
    for(let m = 0; m < 60; m += SLOT_MINUTES)
    {
      slots.push({
        label: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
        minute: h * 60 + m,
        isHourMark: m === 0
      });
    }
  }
  return slots;
}

export default function Calendar(props)
{
  const {
    therapists = [],
    bookingsByTherapist = {},
    startHour = 9,
    endHour = 21,
    isLoadingTherapists = false,
    isLoadingBookings = false,
    onBookingClick,
    onBookingDoubleClick,
    onBookingDrop,
    onCellClick,
    onLoadMore,
    hasNextPage = false,
    isFetchingNextPage = false,
    onLoadMoreTherapists,
    hasNextTherapistPage = false,
    isFetchingNextTherapistPage = false
  } = props;

  const timeSlots = useMemo(() => generateTimeSlots(startHour, endHour), [startHour, endHour]);
  const startMinute = useMemo(() => startHour * 60, [startHour]);

  const headerRef = useRef(null);
  const [scrollEl, setScrollEl] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [isGrabbing, setIsGrabbing] = useState(false);

  const gridRefCallback = useCallback((el) => setScrollEl(el), []);

  const rowVirtualizer = useVirtualizer({
    count: timeSlots.length,
    getScrollElement: () => scrollEl,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5
  });

  const colVirtualizer = useVirtualizer({
    count: therapists.length,
    getScrollElement: () => scrollEl,
    estimateSize: () => COL_WIDTH,
    horizontal: true,
    overscan: 3
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {activationConstraint: {distance: 5}})
  );

  const handleGridScroll = useCallback(() =>
    {
      if(headerRef.current && scrollEl)
      {
        headerRef.current.scrollLeft = scrollEl.scrollLeft;
      }
      if(scrollEl && hasNextPage && !isFetchingNextPage && onLoadMore)
      {
        const {scrollTop, scrollHeight, clientHeight} = scrollEl;
        if(scrollHeight - scrollTop - clientHeight < 300)
        {
          onLoadMore();
        }
      }
      if(scrollEl && hasNextTherapistPage && !isFetchingNextTherapistPage && onLoadMoreTherapists)
      {
        const {scrollLeft, scrollWidth, clientWidth} = scrollEl;
        if(scrollWidth - scrollLeft - clientWidth < 300)
        {
          onLoadMoreTherapists();
        }
      }
    },
    [
      scrollEl,
      hasNextPage,
      isFetchingNextPage,
      onLoadMore,
      hasNextTherapistPage,
      isFetchingNextTherapistPage,
      onLoadMoreTherapists
    ]);

  const handleDragStart = useCallback((event) =>
  {
    setActiveBooking(event.active.data.current?.booking ?? null);
  }, []);

  const handleDragEnd = useCallback((event) =>
  {
    setActiveBooking(null);
    const {active, over} = event;
    if(!over || !active)
    {
      return;
    }
    const booking = active.data.current?.booking;
    const target = over.data.current;
    if(!booking || !target)
    {
      return;
    }
    if(target.therapistId !== booking.therapistId)
    {
      return;
    }
    const snappedMinute = Math.round(target.slotStartMinute / SLOT_MINUTES) * SLOT_MINUTES;
    onBookingDrop?.({booking, newStartMinute: snappedMinute, therapistId: target.therapistId});
  }, [onBookingDrop]);

  const totalContentWidth = CORNER_WIDTH + colVirtualizer.getTotalSize();
  const totalContentHeight = rowVirtualizer.getTotalSize();

  const virtualRows = rowVirtualizer.getVirtualItems();
  const virtualColumns = scrollEl ? colVirtualizer.getVirtualItems() : [];

  const hasNoBookings =
    !isLoadingBookings && Object.keys(bookingsByTherapist).length === 0 && therapists.length > 0;

  const styles = useMemo(() => ({
    container: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden",
      backgroundColor: "#ffffff"
    },
    scrollContainer: {
      flex: 1,
      overflow: "auto",
      position: "relative",
      cursor: isGrabbing ? "grabbing" : "grab"
    },
    innerContainer: {
      position: "relative",
      width: px(totalContentWidth),
      height: px(totalContentHeight)
    },
    bookingEmpty: {
      position: "absolute",
      top: "40%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 10
    }
  }), [totalContentWidth, totalContentHeight, isGrabbing]);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Box style={styles.container}>
        <CalendarHeader
          therapists={therapists}
          virtualColumns={virtualColumns}
          totalColWidth={colVirtualizer.getTotalSize()}
          headerRef={headerRef}
          isLoading={isLoadingTherapists}
        />
        {(isLoadingBookings || isFetchingNextPage) && <LinearProgress />}
        <Box
          ref={gridRefCallback}
          style={styles.scrollContainer}
          onScroll={handleGridScroll}
          onMouseDown={() => setIsGrabbing(true)}
          onMouseUp={() => setIsGrabbing(false)}
          onMouseLeave={() => setIsGrabbing(false)}
        >
          {scrollEl && (
            <Box style={styles.innerContainer}>
              {hasNoBookings && (
                <Box style={styles.bookingEmpty}>
                  <EmptyState message="No bookings available for this date" />
                </Box>
              )}
              {virtualRows.map((virtualRow) => (
                <CalendarRow
                  key={virtualRow.key}
                  virtualRow={virtualRow}
                  timeSlot={timeSlots[virtualRow.index]}
                  therapists={therapists}
                  virtualColumns={virtualColumns}
                  bookingsByTherapist={bookingsByTherapist}
                  onBookingClick={onBookingClick}
                  onBookingDoubleClick={onBookingDoubleClick}
                  onCellClick={onCellClick}
                  startMinute={startMinute}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
      <DragOverlay dropAnimation={null}>
        {activeBooking ? <BookingBlock booking={activeBooking} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
