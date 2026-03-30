import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../store/authStore';
import useRoomStore from '../store/roomStore';
import { fetchRooms } from '../services/roomService';

export default function useRoomsData() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setRooms = useRoomStore((s) => s.setRooms);

  const query = useQuery({
    queryKey: ['rooms'],
    queryFn: () => fetchRooms(new Date().toISOString().split('T')[0], 60),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data) setRooms(query.data);
  }, [query.data, setRooms]);
}
