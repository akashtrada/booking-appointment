import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

function normalizeByTherapist(rawBookings) {
  const map = {};
  rawBookings.forEach((booking) => {
    const items = Object.values(booking.booking_item).flat();
    items.forEach((item) => {
      const tid = item.therapist_id;
      if (!map[tid]) map[tid] = [];
      map[tid].push({
        bookingId: booking.id,
        itemId: item.id,
        therapistId: tid,
        therapistName: item.therapist,
        status: booking.status,
        service: item.service,
        serviceId: item.service_id,
        startTime: item.start_time,
        endTime: item.end_time,
        duration: item.duration,
        customerId: booking.customer_id,
        customerName: booking.customer_name,
        mobileNumber: booking.mobile_number,
        notes: booking.notes,
        source: booking.source,
        requestedPerson: item.requested_person,
        requestedRoom: item.requested_room,
        serviceRequest: item.service_request,
        roomItems: item.room_items,
      });
    });
  });
  return map;
}

const useBookingStore = create(devtools((set) => ({
  bookings: [],
  bookingsByTherapist: {},
  isLoading: false,
  error: null,

  setBookings: (rawBookings) =>
    set({
      bookings: rawBookings,
      bookingsByTherapist: normalizeByTherapist(rawBookings),
    }),

  addBooking: (booking) =>
    set((state) => {
      const updated = [...state.bookings, booking];
      return { bookings: updated, bookingsByTherapist: normalizeByTherapist(updated) };
    }),

  updateBooking: (id, updates) =>
    set((state) => {
      const updated = state.bookings.map((b) => (b.id === id ? { ...b, ...updates } : b));
      return { bookings: updated, bookingsByTherapist: normalizeByTherapist(updated) };
    }),

  removeBooking: (id) =>
    set((state) => {
      const updated = state.bookings.filter((b) => b.id !== id);
      return { bookings: updated, bookingsByTherapist: normalizeByTherapist(updated) };
    }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}), { name: 'bookingStore' }));

export default useBookingStore;
