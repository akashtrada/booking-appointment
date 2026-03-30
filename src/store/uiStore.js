import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useUiStore = create(devtools((set) => ({
  isPanelOpen: false,
  panelMode: null,
  selectedBookingId: null,

  openPanel: (mode, bookingId = null) =>
    set({ isPanelOpen: true, panelMode: mode, selectedBookingId: bookingId }),

  closePanel: () =>
    set({ isPanelOpen: false, panelMode: null, selectedBookingId: null }),

  pendingBooking: null,

  openCreateDrawer: () =>
    set({ pendingBooking: null, isPanelOpen: true, panelMode: 'create', selectedBookingId: null }),

  closeCreateDrawer: () =>
    set({ pendingBooking: null, isPanelOpen: false, panelMode: null, selectedBookingId: null }),

  openEditDrawer: (bookingId) =>
    set({ isPanelOpen: true, panelMode: 'edit', selectedBookingId: bookingId }),

  closeEditDrawer: () =>
    set({ isPanelOpen: false, panelMode: null, selectedBookingId: null }),

  toast: null,

  showToast: (message, severity = 'info') =>
    set({ toast: { message, severity } }),

  clearToast: () => set({ toast: null }),
}), { name: 'uiStore' }));

export default useUiStore;