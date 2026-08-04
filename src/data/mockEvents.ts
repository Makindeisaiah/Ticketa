import { EventItem, Order, PromoCode } from '../types';

export const EVENT_IMAGE_OVERRIDE_MAP: Record<string, string> = {};

export const INITIAL_EVENTS: EventItem[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_PROMOS: PromoCode[] = [
  {
    code: 'TICKETA10',
    discountPercentage: 10,
    usedCount: 0,
    active: true
  },
  {
    code: 'VIP20',
    discountPercentage: 20,
    usedCount: 0,
    active: true
  }
];

