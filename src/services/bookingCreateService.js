import api from './api';
import useAuthStore from '../store/authStore';
import {
  COMPANY_ID,
  OUTLET_ID,
  OUTLET_TYPE,
  BOOKING_TYPE,
  CREATED_BY,
  PANEL,
  CURRENCY,
  PAYMENT_TYPE,
} from '../constants/constantsPlus';

function toTimeWithSeconds(t) {
  if (!t) return t;
  return t.length === 5 ? `${t}:00` : t;
}

function buildItemsPayload(customer, items) {
  return items.map((item, index) => {
    const entry = {
      service: item.service.id,
      quantity: 1,
      price: item.service.price || 0,
      customer_name: customer.name,
      item_number: index + 1,
      start_time: toTimeWithSeconds(item.start_time),
      end_time: toTimeWithSeconds(item.end_time),
      therapist: item.therapist?.id || null,
      room: item.room?.items?.[0]?.item_id || null,
      duration: item.duration,
      requested_person: null,
      requested_room: null,
      service_request: item.service_request || null,
    };
    if (item.bookingItemId) entry.id = item.bookingItemId;
    return entry;
  });
}

function buildBody(customer, items, source, note, service_at) {
  const userId = useAuthStore.getState().user?.id || parseInt(localStorage.getItem('user_id'), 10) || CREATED_BY;
  return {
    company: COMPANY_ID,
    outlet: OUTLET_ID,
    outlet_type: OUTLET_TYPE,
    booking_type: BOOKING_TYPE,
    customer: customer.id,
    membership: 0,
    created_by: CREATED_BY,
    updated_by: userId,
    items: buildItemsPayload(customer, items),
    currency: CURRENCY,
    source,
    payment_type: PAYMENT_TYPE,
    service_at,
    note: note || null,
    sales_note: null,
    panel: PANEL,
  };
}

export function createBooking(payload) {
  const { customer, items, source, note, service_at } = payload;
  return api.post('/bookings/create', buildBody(customer, items, source, note, service_at));
}

export function updateBooking(id, payload) {
  const { customer, items, source, note, service_at } = payload;
  return api.post(`/bookings/${id}`, buildBody(customer, items, source, note, service_at));
}

export function updateBookingStatus(bookingId, status) {
  return api.post('/bookings/update/payment-status', {
    company: COMPANY_ID,
    id: bookingId,
    status,
    panel: PANEL,
    outlet_type: OUTLET_TYPE,
  });
}

export function cancelBooking(bookingId) {
  return api.post('/bookings/item/cancel', {
    company: COMPANY_ID,
    id: bookingId,
    type: 'normal',
    panel: PANEL,
  });
}

export function deleteBooking(bookingId) {
  return api.delete(`/bookings/destroy/${bookingId}`);
}