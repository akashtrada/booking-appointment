import api from './api';
import dayjs from 'dayjs';
import { PANEL } from '../constants/constantsPlus';

export function fetchRooms(dateStr, duration) {
  return api
    .get('/room-bookings/outlet/1', {
      params: {
        date: dayjs(dateStr).format('DD-MM-YYYY'),
        panel: PANEL,
        duration,
      },
    })
    .then((res) => res.data?.data || []);
}