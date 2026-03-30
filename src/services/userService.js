import api from './api';
import dayjs from 'dayjs';

export function fetchAllClients() {
  const start = dayjs().subtract(5, 'year').format('YYYY-MM-DD');
  const end = dayjs().add(5, 'year').format('YYYY-MM-DD');
  return api
    .get('/users', {
      params: {
        pagination: 1,
        daterange: `${start} / ${end}`,
      },
    })
    .then((res) => {
      const list =
        res.data?.data?.data?.list ||
        res.data?.data?.list ||
        {};
      return list.users || list.clients || [];
    });
}
