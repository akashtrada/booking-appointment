import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useFilterStore = create(devtools((set) => ({
  selectedDate: new Date().toISOString().split('T')[0],
  genderFilter: 'all',
  statusFilters: [],
  selectedTherapistIds: [],
  resourceFilters: [],

  setSelectedDate: (date) => set({ selectedDate: date }),
  setGenderFilter: (gender) => set({ genderFilter: gender }),
  setStatusFilters: (statuses) => set({ statusFilters: statuses }),
  setSelectedTherapistIds: (ids) => set({ selectedTherapistIds: ids }),
  setResourceFilters: (resources) => set({ resourceFilters: resources }),

  clearFilters: () =>
    set({
      genderFilter: 'all',
      statusFilters: [],
      selectedTherapistIds: [],
      resourceFilters: [],
    }),
}), { name: 'filterStore' }));

export default useFilterStore;