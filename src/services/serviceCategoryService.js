import api from './api';
import { OUTLET_ID, OUTLET_TYPE, PANEL } from '../constants/constantsPlus';

export function fetchServiceCategories() {
  return api
    .get('/service-category', {
      params: {
        outlet_type: OUTLET_TYPE,
        outlet: OUTLET_ID,
        pagination: 0,
        panel: PANEL,
      },
    })
    .then((res) => res.data?.data?.data?.list?.category || res.data?.data?.list?.category || []);
}