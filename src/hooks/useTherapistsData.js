import { useEffect } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import useFilterStore from '../store/filterStore';
import useTherapistStore from '../store/therapistStore';
import useAuthStore from '../store/authStore';
import useUiStore from '../store/uiStore';
import { fetchTherapists, fetchTherapistTimings } from '../services/therapistService';

export default function useTherapistsData() {
  const selectedDate = useFilterStore((s) => s.selectedDate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setTherapists = useTherapistStore((s) => s.setTherapists);
  const setTimings = useTherapistStore((s) => s.setTimings);
  const setLoading = useTherapistStore((s) => s.setLoading);
  const setError = useTherapistStore((s) => s.setError);
  const showToast = useUiStore((s) => s.showToast);

  const therapistsQuery = useInfiniteQuery({
    queryKey: ['therapists', selectedDate],
    queryFn: ({ pageParam }) => fetchTherapists(selectedDate, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, lastPage: totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  const timingsQuery = useQuery({
    queryKey: ['therapist-timings', selectedDate],
    queryFn: () => fetchTherapistTimings(selectedDate),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (therapistsQuery.data?.pages) {
      const allStaffs = therapistsQuery.data.pages.flatMap((p) => p.staffs);
      setTherapists(allStaffs);
    }
  }, [therapistsQuery.data, setTherapists]);

  useEffect(() => {
    if (timingsQuery.data) setTimings(timingsQuery.data);
  }, [timingsQuery.data, setTimings]);

  useEffect(() => {
    const loading =
      (therapistsQuery.isPending && therapistsQuery.isFetching) ||
      (timingsQuery.isPending && timingsQuery.isFetching);
    setLoading(loading);
  }, [
    therapistsQuery.isPending,
    therapistsQuery.isFetching,
    timingsQuery.isPending,
    timingsQuery.isFetching,
    setLoading,
  ]);

  useEffect(() => {
    if (therapistsQuery.isError) {
      const msg = therapistsQuery.error?.message || 'Failed to load therapists';
      setError(msg);
      showToast(msg, 'error');
    }
  }, [therapistsQuery.isError, therapistsQuery.error, setError, showToast]);

  useEffect(() => {
    if (timingsQuery.isError) {
      const msg = timingsQuery.error?.message || 'Failed to load therapist timings';
      setError(msg);
      showToast(msg, 'error');
    }
  }, [timingsQuery.isError, timingsQuery.error, setError, showToast]);

  return {
    fetchNextPage: therapistsQuery.fetchNextPage,
    hasNextPage: therapistsQuery.hasNextPage,
    isFetchingNextPage: therapistsQuery.isFetchingNextPage,
  };
}