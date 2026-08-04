import { EventItem, Order, PromoCode } from '../types';

export const EVENT_IMAGE_OVERRIDE_MAP: Record<string, string> = {};

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'evt-afro-nation-2026',
    title: 'Afro Nation Festival 2026',
    category: 'Concerts',
    organizerName: 'Smade Entertainment',
    organizerId: 'org-smade-001',
    currency: 'NGN',
    country: 'Nigeria',
    date: 'Dec 18, 2026',
    time: '16:00 WAT',
    location: 'Eko Atlantic City, Lagos, Nigeria',
    venueName: 'Eko Atlantic Festival Grounds',
    address: 'Eko Atlantic City, Victoria Island, Lagos',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    description: 'The world\'s biggest Afrobeats festival returns to Lagos with world-class headliners, vibrant beach vibes, and unforgettable live performances.',
    featured: true,
    tags: ['Afrobeats', 'Live Music', 'Festival', 'Lagos'],
    expectations: ['International & Local Superstars', 'Multi-Stage Performances', 'VIP Beach Lounges', 'Food & Culture Village'],
    refundPolicy: 'Non-refundable except event cancellation.',
    importantInfo: ['Gates open at 3:00 PM', 'E-Pass QR code required for entry'],
    ticketTiers: [
      {
        id: 'tier-afro-gen',
        name: 'General Admission Pass',
        price: 25000,
        availableQuantity: 2000,
        soldQuantity: 450,
        maxPerOrder: 6,
        description: 'Full access to main stage festival grounds & food court'
      },
      {
        id: 'tier-afro-vip',
        name: 'VIP Front Stage Pass',
        price: 75000,
        availableQuantity: 500,
        soldQuantity: 120,
        maxPerOrder: 4,
        description: 'Exclusive front stage access, fast-track entrance & private bar'
      }
    ]
  },
  {
    id: 'evt-tech-ai-summit-2026',
    title: 'Africa Tech & AI Founders Summit',
    category: 'Tech',
    organizerName: 'Techpoint Africa',
    organizerId: 'org-techpoint-002',
    currency: 'NGN',
    country: 'Nigeria',
    date: 'Nov 12, 2026',
    time: '09:00 WAT',
    location: 'Landmark Event Centre, Victoria Island, Lagos',
    venueName: 'Landmark Convention Center',
    address: 'Plot 2 & 3, Water Corporation Dr, Victoria Island, Lagos',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    description: 'Gathering 1,500+ tech founders, investors, product managers, and AI researchers across Africa to shape the future of technology.',
    featured: true,
    tags: ['Tech', 'AI', 'Startups', 'Networking'],
    expectations: ['Keynote Talks by VC Founders', 'Startup Pitch Competitions', 'Exhibition Booths', 'Networking Dinner'],
    refundPolicy: 'Refunds available up to 7 days before event.',
    importantInfo: ['Badge printing opens at 8:00 AM', 'Bring valid photo ID'],
    ticketTiers: [
      {
        id: 'tier-tech-standard',
        name: 'Delegate Pass',
        price: 15000,
        availableQuantity: 1000,
        soldQuantity: 310,
        maxPerOrder: 5,
        description: 'Access to all keynote sessions, workshops & startup expo'
      },
      {
        id: 'tier-tech-investor',
        name: 'VIP Investor & Founder Pass',
        price: 50000,
        availableQuantity: 200,
        soldQuantity: 45,
        maxPerOrder: 2,
        description: 'VIP lounge access, speed networking with VCs & cocktail reception'
      }
    ]
  },
  {
    id: 'evt-lagos-comedy-fest-2026',
    title: 'Lagos Comedy & Arts Extravaganza',
    category: 'Comedy',
    organizerName: 'Basketmouth Live',
    organizerId: 'org-basketmouth-003',
    currency: 'NGN',
    country: 'Nigeria',
    date: 'Oct 04, 2026',
    time: '18:00 WAT',
    location: 'Muson Centre, Onikan, Lagos',
    venueName: 'Agip Recital Hall, Muson Centre',
    address: '8/9 Marina Road, Onikan, Lagos Island',
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1000&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80',
    description: 'An evening of non-stop laughter featuring top West African comedians, musical guests, and live theatrical acts.',
    featured: false,
    tags: ['Comedy', 'Standup', 'Entertainment', 'Lagos'],
    expectations: ['Top Standup Comedians', 'Surprise Guest Performances', 'Cocktail Bar'],
    refundPolicy: 'Non-refundable.',
    importantInfo: ['Strictly 18+', 'Red carpet starts at 5:00 PM'],
    ticketTiers: [
      {
        id: 'tier-com-reg',
        name: 'Regular Seating',
        price: 10000,
        availableQuantity: 800,
        soldQuantity: 210,
        maxPerOrder: 4,
        description: 'Standard auditorium seating'
      },
      {
        id: 'tier-com-table',
        name: 'VIP Table for 5',
        price: 150000,
        availableQuantity: 30,
        soldQuantity: 12,
        maxPerOrder: 1,
        description: 'Front row table with champagne & complimentary snacks'
      }
    ]
  }
];

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

