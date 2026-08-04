import { EventItem, Order, PromoCode } from '../types';

export const EVENT_IMAGE_OVERRIDE_MAP: Record<string, string> = {};

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'evt-afro-riviera-2026',
    title: 'Afrobeats Riviera Fest 2026',
    organizerName: 'Ticketa Live Productions',
    organizerId: 'org-ticketa-live',
    currency: 'XOF',
    country: "Côte d'Ivoire",
    category: 'Concerts',
    date: '2026-09-18',
    time: '19:00',
    location: "Abidjan, Côte d'Ivoire",
    venueName: 'Palais de la Culture Treichville',
    address: 'Boulevard de Marseille, Treichville, Abidjan',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80',
    description: 'The biggest flagship Afrobeats and urban music festival in West Africa. Join 10,000+ fans for an extraordinary night featuring top chart-topping superstars, live band performances, immersive light shows, and authentic local food stalls.',
    featured: true,
    tags: ['Afrobeats', 'Live Band', 'Music', 'Abidjan', 'Festival'],
    expectations: [
      'Live concert performances by headline artists',
      'VIP lounge access with complimentary drinks & gourmet bites',
      'High-speed RFID & QR gate scanning for seamless entry',
      'Interactive sponsor booths and photo zones'
    ],
    importantInfo: [
      'Doors open at 17:30. Shows start promptly at 19:00.',
      'Digital ticket or printed QR code required at venue gate.',
      'Strict security screening in effect. No outside food or weapons.'
    ],
    ticketTiers: [
      {
        id: 'tier-afro-reg',
        name: 'Regular Pass',
        price: 15000,
        description: 'General admission standing area with access to main stage and food vendors.',
        availableQuantity: 5000,
        soldQuantity: 1420,
        maxPerOrder: 6,
        perks: ['Main Arena Access', 'Food & Drink Vendor Area']
      },
      {
        id: 'tier-afro-vip',
        name: 'VIP Front Row',
        price: 50000,
        description: 'Elevated VIP stage view, express gate entry, dedicated bar, and premium restroom access.',
        availableQuantity: 1000,
        soldQuantity: 650,
        maxPerOrder: 4,
        perks: ['Express Fast-Track Gate', 'Front Stage Pit', 'Private VIP Bar', 'Free Welcome Drink']
      },
      {
        id: 'tier-afro-vvip',
        name: 'VVIP Table Box',
        price: 250000,
        description: 'Reserved table for 4 guests, premium bottle service, private security, and back-stage lounge pass.',
        availableQuantity: 100,
        soldQuantity: 82,
        maxPerOrder: 2,
        perks: ['Reserved Table for 4', '2 Premium Bottles', 'Backstage VIP Pass', 'Dedicated Waiter']
      }
    ]
  },
  {
    id: 'evt-tech-ai-summit-2026',
    title: 'West Africa Tech & AI Summit',
    organizerName: 'Innovate Africa Network',
    organizerId: 'org-innovate-africa',
    currency: 'USD',
    country: 'Nigeria',
    category: 'Tech',
    date: '2026-10-12',
    time: '09:00',
    location: 'Lagos, Nigeria',
    venueName: 'Eko Hotels Convention Centre',
    address: 'Plot 1415 Adetokunbo Ademola Street, Victoria Island, Lagos',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
    description: 'Gathering 2,500+ tech founders, AI researchers, venture capitalists, and policy makers shaping the digital economy in West Africa. Keynote presentations, startup pitch battles, product demos, and executive networking sessions.',
    featured: true,
    tags: ['Tech', 'Artificial Intelligence', 'Startups', 'Lagos', 'Conference'],
    expectations: [
      'Keynote addresses by top industry visionaries and investors',
      'Hands-on AI and cloud engineering masterclasses',
      'Startup pitch competition with $100k non-dilutive grant pool',
      'Exclusive B2B networking lunch and cocktail evening'
    ],
    importantInfo: [
      'Badge pickup starts at 08:00 AM on Day 1.',
      'Laptops and tablet devices permitted.',
      'WiFi access credentials provided inside badge packet.'
    ],
    ticketTiers: [
      {
        id: 'tier-tech-dev',
        name: 'Developer & Student Pass',
        price: 50,
        description: 'Access to all keynote sessions, breakout tracks, and exhibition floor.',
        availableQuantity: 1000,
        soldQuantity: 410,
        maxPerOrder: 4,
        perks: ['Keynote & Track Access', 'Exhibition Pass', 'Certificate of Participation']
      },
      {
        id: 'tier-tech-executive',
        name: 'Executive & Delegate',
        price: 250,
        description: 'Full delegate access including executive lounge, B2B matchmaking app, and networking dinner.',
        availableQuantity: 500,
        soldQuantity: 310,
        maxPerOrder: 2,
        perks: ['Executive Lounge', 'B2B Matchmaking', 'Networking Lunch & Dinner', 'VIP Swag Bag']
      }
    ]
  },
  {
    id: 'evt-lagos-comedy-fest-2026',
    title: 'Lagos Live Comedy Night',
    organizerName: 'Laughter Unlimited',
    organizerId: 'org-laughter-unlimited',
    currency: 'NGN',
    country: 'Nigeria',
    category: 'Comedy',
    date: '2026-11-05',
    time: '18:30',
    location: 'Lagos, Nigeria',
    venueName: 'Muson Centre Agip Recital Hall',
    address: '8/9 Marina Road, Onikan, Lagos Island',
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80',
    description: 'An unforgettable evening of non-stop laughter featuring West Africa’s top stand-up comedians and rising comedic talents. Enjoy hilarious routines, musical comedy, and guest celebrity appearances.',
    featured: true,
    tags: ['Comedy', 'StandUp', 'Entertainment', 'Lagos'],
    expectations: [
      '2.5 hours of unfiltered stand-up comedy performance',
      'Surprise guest musical performances',
      'Cocktails and mocktails available at venue bar'
    ],
    importantInfo: [
      'Age restriction: 18+ recommended.',
      'No professional video recording equipment allowed.'
    ],
    ticketTiers: [
      {
        id: 'tier-comedy-std',
        name: 'Standard Ticket',
        price: 10000,
        description: 'Reserved seating in main hall.',
        availableQuantity: 800,
        soldQuantity: 520,
        maxPerOrder: 6
      },
      {
        id: 'tier-comedy-vip',
        name: 'VIP Front Bench',
        price: 25000,
        description: 'Premium front row seating with complimentary welcome beverage.',
        availableQuantity: 200,
        soldQuantity: 185,
        maxPerOrder: 4
      }
    ]
  },
  {
    id: 'evt-accra-beach-wave-2026',
    title: 'Accra Beach Wave Music Festival',
    organizerName: 'Gold Coast Events',
    organizerId: 'org-gold-coast',
    currency: 'GHS',
    country: 'Ghana',
    category: 'Festival',
    date: '2026-12-28',
    time: '14:00',
    location: 'Accra, Ghana',
    venueName: 'Labadi Beach Resort Grounds',
    address: 'La Road, Labadi, Accra, Ghana',
    image: 'https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=1200&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1600&q=80',
    description: 'Experience Year of Return December in Ghana at the ultimate oceanfront music and cultural festival. High-energy DJ sets, live bands, beach volleyball, art installations, and bonfire after-parties.',
    featured: true,
    tags: ['Festival', 'Beach', 'Accra', 'Ghana', 'Music'],
    expectations: [
      'Sunset beach party with international DJs',
      'Authentic Ghanaian jollof and seafood grills',
      'Fire dancer shows and beach fireworks at midnight'
    ],
    importantInfo: [
      'Casual beachwear advised.',
      'Waterproof phone pouches provided at entrance.'
    ],
    ticketTiers: [
      {
        id: 'tier-accra-day',
        name: 'Day & Night Pass',
        price: 300,
        description: 'Full day access to beach arena, main stage, and bonfire zone.',
        availableQuantity: 2000,
        soldQuantity: 1100,
        maxPerOrder: 8
      },
      {
        id: 'tier-accra-cabana',
        name: 'VIP Beach Cabana',
        price: 2500,
        description: 'Private shaded beach lounge for 6 guests with food platter and drinks.',
        availableQuantity: 50,
        soldQuantity: 38,
        maxPerOrder: 1
      }
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-8921-AFRO',
    eventId: 'evt-afro-riviera-2026',
    eventTitle: 'Afrobeats Riviera Fest 2026',
    customerName: 'Kofi Mensah',
    customerEmail: 'kofi.mensah@example.com',
    customerPhone: '+225 07 08 09 10 11',
    purchaseDate: '2026-08-01 14:32',
    totalAmount: 65000,
    paymentMethod: 'Flutterwave',
    tickets: [
      {
        ticketCode: 'TKT-AFRO-001',
        orderId: 'ORD-8921-AFRO',
        eventId: 'evt-afro-riviera-2026',
        eventTitle: 'Afrobeats Riviera Fest 2026',
        eventDate: '2026-09-18',
        eventTime: '19:00',
        venueName: 'Palais de la Culture Treichville',
        tierName: 'Regular Pass',
        attendeeName: 'Kofi Mensah',
        attendeeEmail: 'kofi.mensah@example.com',
        pricePaid: 15000,
        purchaseDate: '2026-08-01 14:32',
        status: 'VALID'
      },
      {
        ticketCode: 'TKT-AFRO-002',
        orderId: 'ORD-8921-AFRO',
        eventId: 'evt-afro-riviera-2026',
        eventTitle: 'Afrobeats Riviera Fest 2026',
        eventDate: '2026-09-18',
        eventTime: '19:00',
        venueName: 'Palais de la Culture Treichville',
        tierName: 'VIP Front Row',
        attendeeName: 'Ama Mensah',
        attendeeEmail: 'kofi.mensah@example.com',
        pricePaid: 50000,
        purchaseDate: '2026-08-01 14:32',
        status: 'VALID'
      }
    ]
  }
];

export const INITIAL_PROMOS: PromoCode[] = [
  {
    code: 'TICKETA10',
    discountPercentage: 10,
    usedCount: 42,
    active: true
  },
  {
    code: 'VIP20',
    discountPercentage: 20,
    usedCount: 15,
    active: true
  }
];
