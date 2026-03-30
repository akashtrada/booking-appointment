import api from './api';
import dayjs from 'dayjs';

export function fetchBookings(dateStr, page = 1) {
  const formatted = dayjs(dateStr).format('DD-MM-YYYY');
  const dateRange = `${formatted} / ${formatted}`;
  return api
    .get('/bookings/outlet/booking/list', {
      params: {
        pagination: 1,
        daterange: dateRange,
        outlet: 1,
        panel: 'outlet',
        view_type: 'calendar',
        page,
      },
    })
    .then((res) => {
      const list = res.data.data.data.list;
      return {
        bookings: list.bookings || [],
        pagination: list.pagination,
      };
    });
}