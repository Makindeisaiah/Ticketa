import { OrganizerUser } from '../types';

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
  if (country === "Côte d'Ivoire" || currencyCode === 'XOF') {
    return { symbol: 'FCFA', code: 'XOF', position: 'suffix' };
  }

  // Default fallback to Nigeria NGN
  if (country === 'Nigeria') {
    return { symbol: '₦', code: 'NGN', position: 'prefix' };
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
