import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import useFilterStore from '../store/filterStore';
import useBookingStore from '../store/bookingStore';
import useAuthStore from '../store/authStore';
import useUiStore from '../store/uiStore';
import { fetchBookings } from '../services/bookingService';

export default function useBookingsData() {
  const selectedDate = useFilterStore((s) => s.selectedDate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Fix the fetch date to the initial value — date picker changes should not re-fetch
  const fetchDateRef = useRef(selectedDate);
  const setBookings = useBookingStore((s) => s.setBookings);
  const setLoading = useBookingStore((s) => s.setLoading);
  const setError = useBookingStore((s) => s.setError);
  const showToast = useUiStore((s) => s.showToast);

  const bookingsQuery = useInfiniteQuery({
    queryKey: ['bookings', fetchDateRef.current],
    queryFn: ({ pageParam }) => fetchBookings(fetchDateRef.current, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, lastPage: totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (bookingsQuery.data?.pages) {
      const allBookings = bookingsQuery.data.pages.flatMap((p) => p.bookings);
      setBookings(allBookings);
    }
  }, [bookingsQuery.data, setBookings]);

  useEffect(() => {
    setLoading(bookingsQuery.isPending && bookingsQuery.isFetching);
  }, [bookingsQuery.isPending, bookingsQuery.isFetching, setLoading]);

  useEffect(() => {
    if (bookingsQuery.isError) {
      const msg = bookingsQuery.error?.message || 'Failed to load bookings';
      setError(msg);
      showToast(msg, 'error');
    }
  }, [bookingsQuery.isError, bookingsQuery.error, setError, showToast]);

  return {
    fetchNextPage: bookingsQuery.fetchNextPage,
    hasNextPage: bookingsQuery.hasNextPage,
    isFetchingNextPage: bookingsQuery.isFetchingNextPage,
  };
}