import { OrganizerUser, EventItem } from '../types';

export interface CurrencyConfig {
  symbol: string;
  code: string;
  position: 'prefix' | 'suffix';
}

export function getOrganizerCurrencyConfig(organizer?: OrganizerUser | null): CurrencyConfig {
  const country = organizer?.payoutAccount?.country || organizer?.country;
  const currencyCode = organizer?.payoutAccount?.currency;

  if (country === 'Nigeria' || currencyCode === 'NGN') {
    return { symbol: '₦', code: 'NGN', position: 'prefix' };
  }
  if (country === 'Ghana' || currencyCode === 'GHS') {
    return { symbol: '₵', code: 'GHS', position: 'prefix' };
  }
  if (country === "Côte d'Ivoire" || currencyCode === 'XOF' || currencyCode === 'FCFA') {
    return { symbol: 'FCFA', code: 'XOF', position: 'suffix' };
  }

  return { symbol: '₦', code: 'NGN', position: 'prefix' };
}

export function formatOrganizerCurrency(amount: number, organizer?: OrganizerUser | null): string {
  const { symbol, position } = getOrganizerCurrencyConfig(organizer);
  const formattedNumber = Math.round(amount).toLocaleString();
  if (position === 'prefix') {
    return `${symbol}${formattedNumber}`;
  }
  return `${formattedNumber} ${symbol}`;
}

export function getEventCurrencyConfig(
  event?: EventItem | null,
  organizers?: OrganizerUser[] | null,
  currentOrganizer?: OrganizerUser | null
): CurrencyConfig {
  // 1. Explicit event currency if set
  if (event?.currency) {
    if (event.currency === 'NGN') return { symbol: '₦', code: 'NGN', position: 'prefix' };
    if (event.currency === 'GHS') return { symbol: '₵', code: 'GHS', position: 'prefix' };
    if (event.currency === 'XOF' || event.currency === 'FCFA' || event.currency === 'CFA') {
      return { symbol: 'FCFA', code: 'XOF', position: 'suffix' };
    }
  }

  // 2. Explicit event country if set
  if (event?.country) {
    if (event.country === 'Nigeria') return { symbol: '₦', code: 'NGN', position: 'prefix' };
    if (event.country === 'Ghana') return { symbol: '₵', code: 'GHS', position: 'prefix' };
    if (event.country === "Côte d'Ivoire") return { symbol: 'FCFA', code: 'XOF', position: 'suffix' };
  }

  // 3. Match event organizer in organizers list or currentOrganizer
  if (event && (organizers?.length || currentOrganizer)) {
    const matched = (organizers || []).find(
      o => (event.organizerId && o.id === event.organizerId) || 
           (event.organizerName && o.organizationName?.toLowerCase() === event.organizerName?.toLowerCase())
    ) || (currentOrganizer && (currentOrganizer.id === event.organizerId || currentOrganizer.organizationName?.toLowerCase() === event.organizerName?.toLowerCase()) ? currentOrganizer : null);

    if (matched) {
      return getOrganizerCurrencyConfig(matched);
    }
  }

  // 4. Fall back to current organizer if active
  if (currentOrganizer) {
    return getOrganizerCurrencyConfig(currentOrganizer);
  }

  // 5. Infer from event location/address text
  if (event?.location || event?.address || event?.venueName) {
    const loc = `${event.location || ''} ${event.address || ''} ${event.venueName || ''}`.toLowerCase();
    if (loc.includes('côte d\'ivoire') || loc.includes('abidjan') || loc.includes('ivory coast')) {
      return { symbol: 'FCFA', code: 'XOF', position: 'suffix' };
    }
    if (loc.includes('ghana') || loc.includes('accra') || loc.includes('kumasi')) {
      return { symbol: '₵', code: 'GHS', position: 'prefix' };
    }
    if (loc.includes('nigeria') || loc.includes('lagos') || loc.includes('abuja') || loc.includes('ikorodu') || loc.includes('port harcourt')) {
      return { symbol: '₦', code: 'NGN', position: 'prefix' };
    }
  }

  // Fallback to NGN
  return { symbol: '₦', code: 'NGN', position: 'prefix' };
}

export function formatEventCurrency(
  amount: number,
  event?: EventItem | null,
  organizers?: OrganizerUser[] | null,
  currentOrganizer?: OrganizerUser | null
): string {
  const { symbol, position } = getEventCurrencyConfig(event, organizers, currentOrganizer);
  const formattedNumber = Math.round(amount).toLocaleString();
  if (position === 'prefix') {
    return `${symbol}${formattedNumber}`;
  }
  return `${formattedNumber} ${symbol}`;
}
