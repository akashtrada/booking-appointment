import {useCallback, useMemo, useState} from "react";
import dayjs from "dayjs";
import {Box} from "@mui/material";
import SubHeader from "../components/template/SubHeader";
import Calendar from "../components/template/Calendar";
import FilterModel from "../components/template/FilterModel";
import useTherapistStore, {mergeTherapistsWithTimings} from "../store/therapistStore";
import useBookingStore from "../store/bookingStore";
import useFilterStore from "../store/filterStore";
import useUiStore from "../store/uiStore";
import useTherapistsData from "../hooks/useTherapistsData";
import useBookingsData from "../hooks/useBookingsData";
import useRoomsData from "../hooks/useRoomsData";
import useAuth from "../hooks/useAuth";
import {updateBooking} from "../services/bookingCreateService";
import CreateBookingDrawer from "../components/template/CreateBookingDrawer";

export default function HomePage()
{
  useAuth();
  useRoomsData();
  const {
    fetchNextPage: fetchNextTherapistPage,
    hasNextPage: hasNextTherapistPage,
    isFetchingNextPage: isFetchingNextTherapistPage
  } = useTherapistsData();
  const {fetchNextPage, hasNextPage, isFetchingNextPage} = useBookingsData();

  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  const selectedDate = useFilterStore((s) => s.selectedDate);
  const setSelectedDate = useFilterStore((s) => s.setSelectedDate);
  const genderFilter = useFilterStore((s) => s.genderFilter);
  const statusFilters = useFilterStore((s) => s.statusFilters);
  const selectedTherapistIds = useFilterStore((s) => s.selectedTherapistIds);
  const resourceFilters = useFilterStore((s) => s.resourceFilters);

  const therapists = useTherapistStore((s) => s.therapists);
  const timings = useTherapistStore((s) => s.timings);
  const isLoadingTherapists = useTherapistStore((s) => s.isLoading);

  const bookingsByTherapist = useBookingStore((s) => s.bookingsByTherapist);
  const rawBookings = useBookingStore((s) => s.bookings);
  const updateBookingInStore = useBookingStore((s) => s.updateBooking);
  const isLoadingBookings = useBookingStore((s) => s.isLoading);

  const mergedTherapists = useMemo(
    () => mergeTherapistsWithTimings(therapists, timings, selectedDate),
    [therapists, timings, selectedDate]
  );

  const filteredTherapists = useMemo(() =>
  {
    let result = mergedTherapists;
    if(genderFilter !== "all")
    {
      result = result.filter((t) => t.gender?.toLowerCase() === genderFilter);
    }
    if(selectedTherapistIds.length > 0 && selectedTherapistIds.length < therapists.length)
    {
      result = result.filter((t) => selectedTherapistIds.includes(t.id));
    }
    return result;
  }, [mergedTherapists, genderFilter, selectedTherapistIds, therapists.length]);

  const filteredBookingsByTherapist = useMemo(() =>
  {
    const hasStatusFilter = statusFilters.length > 0;
    const hasResourceFilter = resourceFilters.length > 0;
    if(!hasStatusFilter && !hasResourceFilter)
    {
      return bookingsByTherapist;
    }

    const result = {};
    Object.entries(bookingsByTherapist).forEach(([tid, bookings]) =>
    {
      const filtered = bookings.filter((b) =>
      {
        if(hasStatusFilter && statusFilters.includes(b.status))
        {
          return false;
        }
        if(hasResourceFilter)
        {
          const roomItemTypes = (b.roomItems || []).map(
            (ri) => ri.item || ri.item_type || ri.type
          );
          const hasMatch = roomItemTypes.some((t) => resourceFilters.includes(t));
          if(!hasMatch)
          {
            return false;
          }
        }
        return true;
      });
      if(filtered.length > 0)
      {
        result[tid] = filtered;
      }
    });
    return result;
  }, [bookingsByTherapist, statusFilters, resourceFilters]);

  const openCreateDrawer = useUiStore((s) => s.openCreateDrawer);
  const openEditDrawer = useUiStore((s) => s.openEditDrawer);
  const showToast = useUiStore((s) => s.showToast);

  const handleDateChange = (date) => setSelectedDate(dayjs(date).format("YYYY-MM-DD"));
  const handleSearch = (query) =>
  {
  };
  const handleFilterClick = (e) => setFilterAnchorEl(e.currentTarget);
  const handleCellClick = ({therapistId, slotStartMinute}) =>
  {
  };
  const handleTodayClick = () => openCreateDrawer();
  const handleDateLabelClick = () => openCreateDrawer();

  const handleBookingDoubleClick = useCallback((booking) =>
  {
    openEditDrawer(booking.bookingId);
  }, [openEditDrawer]);

  const handleBookingDrop = useCallback(async({booking, newStartMinute}) =>
  {
    const rawBooking = rawBookings.find((b) => b.id === booking.bookingId);
    if(!rawBooking)
    {
      return;
    }

    const newStartH = Math.floor(newStartMinute / 60);
    const newStartM = newStartMinute % 60;
    const newStartStr = `${String(newStartH).padStart(2, "0")}:${String(newStartM).padStart(2, "0")}`;
    const newEndMin = newStartMinute + booking.duration;
    const newEndStr = `${String(Math.floor(newEndMin / 60) % 24).padStart(2, "0")}:${String(newEndMin % 60)
    .padStart(2, "0")}`;

    const rawItems = Object.values(rawBooking.booking_item || {}).flat();
    const customer = {id: rawBooking.user_id, name: rawBooking.customer_name};
    const service_at = `${rawBooking.service_date} ${newStartStr}`;

    const formItems = rawItems.map((item) => ({
      bookingItemId: item.id,
      service: {id: item.service_id, name: item.service, duration: item.duration, price: item.price || 0},
      therapist: item.therapist_id ? {id: item.therapist_id} : null,
      start_time: item.id === booking.itemId ? newStartStr : item.start_time?.substring(0, 5),
      end_time: item.id === booking.itemId ? newEndStr : item.end_time?.substring(0, 5),
      duration: item.duration,
      room: item.room_items?.[0]
        ? {room_id: item.room_items[0].room_id, room_name: item.room_items[0].room_name, items: item.room_items}
        : null,
      service_request: item.service_request || ""
    }));

    try
    {
      await updateBooking(rawBooking.id, {
        customer,
        items: formItems,
        source: rawBooking.source || "",
        note: rawBooking.note || "",
        service_at
      });

      const updatedBookingItem = {};
      Object.keys(rawBooking.booking_item).forEach((key) =>
      {
        updatedBookingItem[key] = rawBooking.booking_item[key].map((item) =>
          item.id === booking.itemId
            ? {...item, start_time: `${newStartStr}:00`, end_time: `${newEndStr}:00`}
            : item
        );
      });
      updateBookingInStore(rawBooking.id, {booking_item: updatedBookingItem});
      showToast("Booking rescheduled", "success");
    }
    catch(err)
    {
      showToast(err?.message || "Failed to reschedule booking", "error");
    }
  }, [rawBookings, updateBookingInStore, showToast]);

  return (
    <>
      <Box style={{display: "flex", flexDirection: "column", height: "100%"}}>
        <SubHeader
          onDateChange={handleDateChange}
          onSearch={handleSearch}
          onFilterClick={handleFilterClick}
          onTodayClick={handleTodayClick}
          onDateLabelClick={handleDateLabelClick}
        />
        <Box style={{flex: 1, overflow: "hidden"}}>
          <Calendar
            therapists={filteredTherapists}
            bookingsByTherapist={filteredBookingsByTherapist}
            isLoadingTherapists={isLoadingTherapists}
            isLoadingBookings={isLoadingBookings}
            onBookingDoubleClick={handleBookingDoubleClick}
            onBookingDrop={handleBookingDrop}
            onCellClick={handleCellClick}
            onLoadMore={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMoreTherapists={fetchNextTherapistPage}
            hasNextTherapistPage={hasNextTherapistPage}
            isFetchingNextTherapistPage={isFetchingNextTherapistPage}
          />
        </Box>
      </Box>
      <CreateBookingDrawer />
      <FilterModel anchorEl={filterAnchorEl} onClose={() => setFilterAnchorEl(null)} />
    </>
  );
}
