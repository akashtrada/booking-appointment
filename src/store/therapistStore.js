import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

function normalizeStaffs(staffs) {
  return staffs.map((staff) => ({
    id: staff.therapist_id,
    alias: staff.alias,
    code: staff.code,
    pagerNumber: staff.pager_number,
    gender: staff.gender,
    outletId: staff.outlet_id,
    isAvailable: staff.is_available,
    hasActiveBooking: staff.has_active_booking,
  }));
}

export function mergeTherapistsWithTimings(therapists, timings, selectedDate) {
  const [y, m, d] = selectedDate.split('-');
  const timingKey = `${d}-${m}-${y}`;
  return therapists.map((t) => {
    const dayTimings = timings[t.id]?.[timingKey];
    const entry = dayTimings?.[0];
    return {
      ...t,
      timing: entry
        ? {
            start: entry.checkin,
            end: entry.checkout,
            leave: entry.leave === 1,
            hasBookings: entry.has_current_date_booking,
          }
        : null,
    };
  });
}

const useTherapistStore = create(devtools((set) => ({
  therapists: [],
  timings: {},
  isLoading: false,
  error: null,

  setTherapists: (staffs) => set({ therapists: normalizeStaffs(staffs) }),
  setTimings: (timingsMap) => set({ timings: timingsMap }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}), { name: 'therapistStore' }));

export default useTherapistStore;