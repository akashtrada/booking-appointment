import api from './api';
import dayjs from 'dayjs';

export function fetchTherapists(dateStr, page = 1) {
  const serviceAt = dayjs(dateStr).format('DD-MM-YYYY') + ' 00:00:00';
  return api
    .get('/therapists', {
      params: {
        availability: 1,
        outlet: 1,
        status: 1,
        leave: 0,
        pagination: 1,
        page,
        panel: 'outlet',
        service_at: serviceAt,
        services: 1,
      },
    })
    .then((res) => {
      const list = res.data.data.data.list;
      return {
        staffs: list.staffs || [],
        pagination: list.pagination || { currentPage: page, lastPage: 1 },
      };
    });
}

export function fetchTherapistTimings(dateStr) {
  const formatted = dayjs(dateStr).format('DD-MM-YYYY');
  return api
    .get('/therapist-timings', {
      params: {
        outlet: 1,
        panel: 'outlet',
        start_date: formatted,
        end_date: formatted,
      },
    })
    .then((res) => res.data.data.list);
}