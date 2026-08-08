import { EventItem, Order, PromoCode } from '../types';

export const EVENT_IMAGE_OVERRIDE_MAP: Record<string, string> = {};

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'evt-001',
    title: 'Davido Live at Crystal Palace Arena',
    organizerName: '30BG Entertainment & Ticketa Global',
    organizerId: 'org-30bg',
    currency: 'NGN',
    country: 'Nigeria',
    category: 'Concerts',
    date: '2026-11-20',
    time: '19:00',
    location: 'Lagos, Nigeria',
    venueName: 'Eko Convention Centre',
    address: 'Plot 1415 Adetokunbo Ademola Street, Victoria Island, Lagos',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    description: 'Experience Davido live in Lagos for his groundbreaking world tour! Featuring high-energy performances, guest star appearances, state-of-the-art stage lighting, and exclusive VIP hospitality packages.',
    featured: true,
    tags: ['Afrobeats', 'Live Concert', '30BG', 'VIP Experience'],
    expectations: [
      '3-Hour Live Band Performance by Davido',
      'Special Guest Appearances',
      'Exclusive VIP Lounge Access',
      'High-Definition LED Visuals & Pyrotechnics'
    ],
    refundPolicy: 'Refunds are available up to 7 days before event date.',
    importantInfo: [
      'Doors open at 5:00 PM',
      'Digital or printed QR pass required for gate scan',
      'Strict security screening at all entrance gates'
    ],
    ticketTiers: [
      {
        id: 'tier-001-reg',
        name: 'Regular Access',
        price: 15000,
        description: 'Standard standing area access with clear view of the main stage.',
        availableQuantity: 500,
        soldQuantity: 120,
        maxPerOrder: 10,
        perks: ['Main floor access', 'Standard bar access']
      },
      {
        id: 'tier-001-vip',
        name: 'VIP Front Row',
        price: 50000,
        description: 'Front stage VIP section with fast-track entry and express bar.',
        availableQuantity: 150,
        soldQuantity: 65,
        maxPerOrder: 6,
        perks: ['Fast-track VIP Gate #1', 'Front-stage standing area', 'Complimentary welcome drink']
      },
      {
        id: 'tier-001-vvip',
        name: 'VVIP Gold Table (Per Seat)',
        price: 150000,
        description: 'Reserved elevated lounge table with premium champagne service and dedicated waiter.',
        availableQuantity: 30,
        soldQuantity: 18,
        maxPerOrder: 4,
        perks: ['Dedicated VVIP Gate', 'Elevated table view', 'Champagne & finger food included', 'Dedicated waiter service']
      }
    ]
  },
  {
    id: 'evt-002',
    title: 'Burna Boy Spaceship World Tour 2026',
    organizerName: 'Spaceship Collective',
    organizerId: 'org-spaceship',
    currency: 'NGN',
    country: 'Nigeria',
    category: 'Concerts',
    date: '2026-12-15',
    time: '20:00',
    location: 'Lagos, Nigeria',
    venueName: 'Tafawa Balewa Square (TBS Stadium)',
    address: '45 Commercial Avenue, Lagos Island, Lagos',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    description: 'Grammy Award-winning superstar Burna Boy brings the Spaceship World Tour to Lagos Stadium! An unforgettable night of Afro-fusion anthems and electric production.',
    featured: true,
    tags: ['Burna Boy', 'AfroFusion', 'Stadium Tour', 'Lagos'],
    expectations: [
      'Live Orchestra & Band Performance',
      'Unreleased Song Previews',
      'World-Class Fireworks Display'
    ],
    refundPolicy: 'Non-refundable. Ticket transfers permitted via Ticketa Pass.',
    importantInfo: [
      'Gates open at 4:00 PM',
      'Parking available at designated arena lots'
    ],
    ticketTiers: [
      {
        id: 'tier-002-gen',
        name: 'General Admission',
        price: 20000,
        description: 'Full stadium general admission area.',
        availableQuantity: 1000,
        soldQuantity: 340,
        maxPerOrder: 10,
        perks: ['Stadium floor access']
      },
      {
        id: 'tier-002-vip',
        name: 'VIP Deck',
        price: 75000,
        description: 'Elevated VIP view deck with private bar and seating.',
        availableQuantity: 200,
        soldQuantity: 92,
        maxPerOrder: 6,
        perks: ['Elevated view', 'Express entry', 'VIP restroom access']
      }
    ]
  },
  {
    id: 'evt-003',
    title: 'Lagos Tech & Startup Expo 2026',
    organizerName: 'Techpoint & Innovation Africa',
    organizerId: 'org-techpoint',
    currency: 'USD',
    country: 'Nigeria',
    category: 'Tech',
    date: '2026-10-05',
    time: '09:00',
    location: 'Lagos, Nigeria',
    venueName: 'Landmark Event Centre',
    address: 'Water Corporation Drive, Victoria Island, Lagos',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
    description: 'West Africa\'s largest technology gathering bringing together founders, investors, product managers, and developers. Featuring keynote speeches, investor pitch competitions, and developer workshops.',
    featured: false,
    tags: ['Technology', 'Startups', 'VC Pitch', 'AI & Web3'],
    expectations: [
      '100+ Startup Exhibition Booths',
      'VC Pitch Sessions with Top Investors',
      'Networking After-Party'
    ],
    refundPolicy: 'Full refund up to 14 days prior to event.',
    importantInfo: [
      'Badge pick-up starts at 8:00 AM',
      'Wi-Fi provided throughout event hall'
    ],
    ticketTiers: [
      {
        id: 'tier-003-pass',
        name: 'Attendee Pass',
        price: 25,
        description: 'Access to exhibition hall, keynotes, and breakout stages.',
        availableQuantity: 800,
        soldQuantity: 210,
        maxPerOrder: 5,
        perks: ['Exhibition floor pass', 'Keynote stage access', 'Digital swag bag']
      },
      {
        id: 'tier-003-inv',
        name: 'Investor & Founder Pass',
        price: 150,
        description: 'Full access including VIP Deal Room and Investor Dinner.',
        availableQuantity: 100,
        soldQuantity: 45,
        maxPerOrder: 2,
        perks: ['VIP Deal Room Access', '1-on-1 Investor Speed Dating', 'VIP Founder Dinner']
      }
    ]
  },
  {
    id: 'evt-004',
    title: 'Basketmouth Unprovoked Comedy Live',
    organizerName: 'Barons World Entertainment',
    organizerId: 'org-barons',
    currency: 'GHS',
    country: 'Ghana',
    category: 'Comedy',
    date: '2026-11-28',
    time: '18:30',
    location: 'Accra, Ghana',
    venueName: 'Accra International Conference Centre',
    address: 'Castle Road, Accra, Ghana',
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    description: 'Africa\'s comedy king Basketmouth delivers a hilarious night of unvarnished stand-up comedy alongside top comedians from Ghana, Nigeria, and Kenya.',
    featured: false,
    tags: ['Comedy', 'Basketmouth', 'Accra Events', 'Standup'],
    expectations: [
      '2.5 Hours of Non-Stop Stand-Up Comedy',
      'Musical Interludes'
    ],
    refundPolicy: 'No refunds once ticket is issued.',
    importantInfo: [
      'Age restriction: 18+',
      'No video recording during live performance'
    ],
    ticketTiers: [
      {
        id: 'tier-004-reg',
        name: 'Standard Seating',
        price: 200,
        description: 'Auditorium standard seats with great acoustics.',
        availableQuantity: 400,
        soldQuantity: 150,
        maxPerOrder: 6,
        perks: ['Standard seating']
      },
      {
        id: 'tier-004-vip',
        name: 'VIP Front Table',
        price: 500,
        description: 'Front row seats with drink voucher and photo op.',
        availableQuantity: 80,
        soldQuantity: 38,
        maxPerOrder: 4,
        perks: ['Front-row seating', 'Free cocktail', 'Meet & Greet Photo Op']
      }
    ]
  },
  {
    id: 'evt-005',
    title: "Afrochella Music & Cultural Festival",
    organizerName: 'Culture Management Group',
    organizerId: 'org-afrochella',
    currency: 'GHS',
    country: 'Ghana',
    category: 'Festival',
    date: '2026-12-28',
    time: '14:00',
    location: 'Accra, Ghana',
    venueName: 'El-Wak Stadium',
    address: 'Burma Camp Road, Accra',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    description: 'Celebrate African culture, art, fashion, food, and music at Afrochella Festival in Accra! Featuring top international headliners, art installations, and culinary experiences.',
    featured: true,
    tags: ['Afrochella', 'Festival', 'Accra', 'Culture'],
    expectations: [
      'Multiple Music Stages',
      'African Fashion Exhibition',
      'Art Installations & Food Court'
    ],
    refundPolicy: 'Non-refundable event pass.',
    importantInfo: ['2-Day Festival wristband scan required'],
    ticketTiers: [
      {
        id: 'tier-005-day',
        name: '2-Day General Pass',
        price: 600,
        description: 'Full 2-day pass for all main stages and art villages.',
        availableQuantity: 1200,
        soldQuantity: 450,
        maxPerOrder: 8,
        perks: ['2-Day access', 'Festival wristband']
      },
      {
        id: 'tier-005-vip',
        name: 'VIP Sky Deck Pass',
        price: 1800,
        description: 'Elevated VIP deck, air-conditioned lounges, and express bar.',
        availableQuantity: 150,
        soldQuantity: 88,
        maxPerOrder: 4,
        perks: ['VIP Sky Deck view', 'AC Lounge access', 'Exclusive VIP entrance']
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
