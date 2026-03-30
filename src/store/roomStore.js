import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useRoomStore = create(devtools((set) => ({
  rooms: [],
  resourceOptions: [],

  setRooms: (rooms) => {
    const seen = new Set();
    const resourceOptions = [];
    rooms.forEach((room) => {
      (room.items || []).forEach((item) => {
        const type = item.item || item.item_type || item.type;
        if (type && !seen.has(type)) {
          seen.add(type);
          resourceOptions.push({ label: type, value: type });
        }
      });
    });
    set({ rooms, resourceOptions });
  },
}), { name: 'roomStore' }));

export default useRoomStore;
