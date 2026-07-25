import { EventItem, Order, PromoCode } from '../types';

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'evt-davido',
    title: 'Davido Live in Lagos',
    organizerName: 'Flytimefest',
    category: 'Concerts',
    date: 'Thu, Dec 25, 2025',
    time: '19:00 WAT',
    location: 'Plot 1415 Adetokunbo Ademola Street, PMB 12724, Victoria Island, Lagos Nigeria',
    venueName: 'Eko Convention Center, VI',
    address: 'Plot 1415 Adetokunbo Ademola Street, Victoria Island, Lagos Nigeria',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80',
    description: 'Davido returns to Lagos with a powerful live performance showcasing his greatest hits and new favorites. This event features full live band performances, special guest artists, breathtaking stage lighting, and immersive visuals tailored for a premium concert experience. Expect a night of unstoppable energy, top-tier entertainment, and memories you will never forget.',
    featured: true,
    tags: ['Afrobeats', 'Live Music', 'Lagos', 'Concert'],
    expectations: [
      'Live full-band performance',
      'Guest artist appearances',
      'High-end lighting & stage effects',
      'Crowd interaction moments',
      'Exclusive "5IVE Alive Tour" merchandise',
      'Secure venue & organized seating arrangement'
    ],
    refundPolicy: 'Tickets are non-refundable except in the case of event cancellation or major rescheduling by the organizer.',
    importantInfo: [
      'Gates open at 5:00 PM',
      'No outside food or drinks allowed',
      'All attendees must present e-tickets at the entrance',
      'Bag checks will be conducted',
      'Event is recommended for ages 16+'
    ],
    ticketTiers: [
      {
        id: 'tier-reg',
        name: 'Regular',
        price: 30000,
        description: 'Standard access to the main arena floor.',
        availableQuantity: 1000,
        soldQuantity: 420,
        maxPerOrder: 6
      },
      {
        id: 'tier-vip',
        name: 'VIP',
        price: 100000,
        description: 'Elevated view deck, expedited entry gate, and private bar access.',
        availableQuantity: 200,
        soldQuantity: 110,
        maxPerOrder: 4
      },
      {
        id: 'tier-vvip',
        name: 'VVIP',
        price: 500000,
        description: 'Front row pit section with complimentary drinks and commemorative gift bag.',
        availableQuantity: 50,
        soldQuantity: 32,
        maxPerOrder: 2
      },
      {
        id: 'tier-prem',
        name: 'Premium Table',
        price: 3500000,
        description: 'Reserved table for guests with bottle service and backstage passes.',
        availableQuantity: 10,
        soldQuantity: 6,
        maxPerOrder: 1
      }
    ]
  },
  {
    id: 'evt-burna',
    title: 'Burna Boy Live in Lagos',
    organizerName: 'Spaceship Entertainment',
    category: 'Concerts',
    date: 'Sat, Dec 27, 2025',
    time: '20:00 WAT',
    location: 'Balmoral Convention Center, VI',
    venueName: 'Balmoral Convention Center, VI',
    address: 'Balmoral Convention Center, VI, Lagos',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1000&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80',
    description: 'The African Giant brings No Sign Of Weakness World Tour live to Lagos.',
    featured: true,
    tags: ['Afrobeats', 'Afro-fusion', 'Live Show'],
    ticketTiers: [
      {
        id: 'tier-burna-reg',
        name: 'Regular',
        price: 60000,
        description: 'General admission to the main hall.',
        availableQuantity: 800,
        soldQuantity: 510,
        maxPerOrder: 6
      }
    ]
  },
  {
    id: 'evt-hardy',
    title: 'Hardy The Country Tour',
    organizerName: 'Live Nation',
    category: 'Concerts',
    date: 'Sat, Feb 13, 2026',
    time: '20:00 EST',
    location: 'Golden Arena, Edmonton, AB',
    venueName: 'Golden Arena, Edmonton, AB',
    address: 'Golden Arena, Edmonton, AB',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80',
    description: 'Hardy brings country rock live with special guest Cameron Whitcomb.',
    featured: false,
    tags: ['Country', 'Rock'],
    ticketTiers: [
      {
        id: 'tier-hardy-reg',
        name: 'Regular',
        price: 45000,
        description: 'Standard floor ticket.',
        availableQuantity: 500,
        soldQuantity: 210,
        maxPerOrder: 4
      }
    ]
  },
  {
    id: 'evt-c5',
    title: 'C5 Carnival',
    organizerName: 'C5 Talent Show',
    category: 'Concerts',
    date: 'Thu, Feb 20, 2026',
    time: '19:00 EST',
    location: 'Fletcher Hall, Durham, NC',
    venueName: 'Fletcher Hall, Durham, NC',
    address: 'Fletcher Hall, Durham, NC',
    image: 'https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=1000&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=1600&q=80',
    description: 'An explosive showcase of emerging musical talent and live performances.',
    featured: false,
    tags: ['Carnival', 'Talent Show'],
    ticketTiers: [
      {
        id: 'tier-c5-reg',
        name: 'Regular',
        price: 30000,
        description: 'Standard admission pass.',
        availableQuantity: 300,
        soldQuantity: 150,
        maxPerOrder: 4
      }
    ]
  },
  {
    id: 'evt-saint',
    title: '1300Saint The Saviour Tour',
    organizerName: 'Saint Music Group',
    category: 'Concerts',
    date: 'Sat, Apr 04, 2026',
    time: '19:00 EST',
    location: 'Union Stage, Washington, DC',
    venueName: 'Union Stage, Washington, DC',
    address: 'Union Stage, Washington, DC',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80',
    description: 'Atmospheric live tour with immersive soundscapes and guest acts.',
    featured: false,
    tags: ['Hip-Hop', 'Indie'],
    ticketTiers: [
      {
        id: 'tier-saint-reg',
        name: 'Regular',
        price: 30000,
        description: 'Main hall ticket.',
        availableQuantity: 200,
        soldQuantity: 95,
        maxPerOrder: 4
      }
    ]
  },
  {
    id: 'evt-travis',
    title: 'Travis Scott Live in SA',
    organizerName: 'Cactus Jack Africa',
    category: 'Concerts',
    date: 'Sat, Apr 04, 2026',
    time: '19:00 SAST',
    location: 'Johannesburg Stadium, SA',
    venueName: 'Johannesburg Stadium, SA',
    address: 'Johannesburg Stadium, South Africa',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1000&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1600&q=80',
    description: 'Circus Maximus world tour lands at Johannesburg Stadium!',
    featured: true,
    tags: ['Rage', 'Hip-Hop'],
    ticketTiers: [
      {
        id: 'tier-travis-reg',
        name: 'Regular',
        price: 30000,
        description: 'Stadium seat pass.',
        availableQuantity: 10000,
        soldQuantity: 8400,
        maxPerOrder: 6
      }
    ]
  },
  {
    id: 'evt-asake',
    title: 'Asake Live in Lagos',
    organizerName: 'YBNL Nation',
    category: 'Concerts',
    date: 'Mon, Dec 29, 2025',
    time: '19:00 WAT',
    location: 'Johannesburg Stadium, SA',
    venueName: 'Johannesburg Stadium, SA',
    address: 'Eko Convention Center, VI, Lagos',
    image: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=1000&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=1600&q=80',
    description: 'Mr Money With The Vibe brings the Lungu Boy Tour live to Lagos!',
    featured: false,
    tags: ['Amapiano', 'Afrobeats'],
    ticketTiers: [
      {
        id: 'tier-asake-reg',
        name: 'Regular',
        price: 30000,
        description: 'Standard arena pass.',
        availableQuantity: 1500,
        soldQuantity: 1100,
        maxPerOrder: 6
      }
    ]
  },

  // COMEDY CATEGORY
  {
    id: 'evt-kennyblaq',
    title: 'Kenny Blaq Reckless MCF',
    organizerName: 'Reckless Comedy',
    category: 'Comedy',
    date: 'Thu, Dec 13, 2025',
    time: '14:00 WAT',
    location: 'Onikan Stadium, Surulere',
    venueName: 'Onikan Stadium, Surulere',
    address: 'Onikan Stadium, Surulere, Lagos',
    image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=1000&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=1600&q=80',
    description: 'Reckless Music & Comedy Festival featuring Kenny Blaq.',
    featured: true,
    tags: ['Comedy', 'Music'],
    ticketTiers: [
      {
        id: 'tier-kb-reg',
        name: 'Regular',
        price: 25000,
        description: 'Standard admission ticket.',
        availableQuantity: 500,
        soldQuantity: 310,
        maxPerOrder: 6
      }
    ]
  },
  {
    id: 'evt-bovi',
    title: 'Bovi African Comedy',
    organizerName: 'Kountry Kulture',
    category: 'Comedy',
    date: 'Sat, Dec 25, 2025',
    time: '19:00 WAT',
    location: 'Alliance Francaise MAC, Ikoyi',
    venueName: 'Alliance Francaise MAC, Ikoyi',
    address: 'Alliance Francaise, Ikoyi, Lagos',
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1000&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1600&q=80',
    description: 'Bovi presents an evening of unfiltered stand-up comedy.',
    featured: false,
    tags: ['Standup', 'Comedy'],
    ticketTiers: [
      {
        id: 'tier-bovi-reg',
        name: 'Regular',
        price: 45000,
        description: 'Standard seating pass.',
        availableQuantity: 300,
        soldQuantity: 240,
        maxPerOrder: 4
      }
    ]
  },
  {
    id: 'evt-ayuk',
    title: 'AY Live in UK',
    organizerName: 'Corporate World Ent.',
    category: 'Comedy',
    date: 'Thu, Feb 20, 2026',
    time: '19:00 WAT',
    location: 'Wosam Arena, Ago-Iwoye, Ogun',
    venueName: 'Wosam Arena, Ago-Iwoye, Ogun',
    address: 'Wosam Arena, Ago-Iwoye, Ogun State',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
    description: 'The world-famous AY Live tour hits the stage with hilarious sketches.',
    featured: false,
    tags: ['AY Live', 'Comedy'],
    ticketTiers: [
      {
        id: 'tier-ayuk-reg',
        name: 'Regular',
        price: 30000,
        description: 'General admission seat.',
        availableQuantity: 400,
        soldQuantity: 300,
        maxPerOrder: 4
      }
    ]
  },
  {
    id: 'evt-ayjam',
    title: 'AY Live Laugh Jam',
    organizerName: 'Corporate World Ent.',
    category: 'Comedy',
    date: 'Fri, Dec 12, 2025',
    time: '19:00 WAT',
    location: 'Wosam Arena, Ago-Iwoye, Ogun',
    venueName: 'Wosam Arena, Ago-Iwoye, Ogun',
    address: 'Wosam Arena, Ago-Iwoye, Ogun State',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
    description: 'Exclusive comedy jam with VIP table experiences.',
    featured: false,
    tags: ['Comedy', 'VIP Tables'],
    ticketTiers: [
      { id: 't-ay-n20k', name: 'Regular', price: 20000, description: 'Standard seat', availableQuantity: 300, soldQuantity: 180, maxPerOrder: 4 },
      { id: 't-ay-n50k', name: 'Silver VIP', price: 50000, description: 'VIP chair', availableQuantity: 100, soldQuantity: 65, maxPerOrder: 4 },
      { id: 't-ay-n100k', name: 'VVIP', price: 100000, description: 'VVIP seat', availableQuantity: 50, soldQuantity: 40, maxPerOrder: 2 },
      { id: 't-ay-1m', name: 'Gold Table', price: 1000000, description: 'Table for 6', availableQuantity: 10, soldQuantity: 7, maxPerOrder: 1 },
      { id: 't-ay-2m', name: 'Platinum Table', price: 2000000, description: 'Table for 10', availableQuantity: 5, soldQuantity: 4, maxPerOrder: 1 }
    ]
  },

  // TECH CATEGORY
  {
    id: 'evt-fortified',
    title: 'Fortified Submit 2025',
    organizerName: 'Tech-Powered Fortified',
    category: 'Tech',
    date: 'Fri, Nov 28, 2025',
    time: '10:00 - 16:00 WAT',
    location: 'Creative Studio, Yaba',
    venueName: 'Creative Studio, Yaba',
    address: 'Creative Studio, Herbert Macaulay Way, Yaba, Lagos',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80',
    description: 'Technology, innovation, and empowerment summit for tech founders and youth.',
    featured: true,
    tags: ['Hackathon', 'Tech'],
    ticketTiers: [
      {
        id: 'tier-fort-free',
        name: 'FREE Pass',
        price: 0,
        description: 'Complimentary full access badge.',
        availableQuantity: 500,
        soldQuantity: 380,
        maxPerOrder: 2
      }
    ]
  },
  {
    id: 'evt-lagoshack',
    title: 'Lagos Impact Hackathon',
    organizerName: 'Lagos Impact Network',
    category: 'Tech',
    date: 'Thu, Dec 13, 2025',
    time: '08:00 WAT',
    location: 'Unilag Main Auditorium, Lagos',
    venueName: 'Unilag Main Auditorium',
    address: 'University of Lagos Main Campus, Akoka, Yaba',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1600&q=80',
    description: '24-hour innovation hackathon solving real-world challenges in West Africa.',
    featured: false,
    tags: ['Hackathon', 'Coding'],
    ticketTiers: [
      {
        id: 'tier-hack-free',
        name: 'FREE Hacker Pass',
        price: 0,
        description: 'Includes hacker kit and meals.',
        availableQuantity: 300,
        soldQuantity: 280,
        maxPerOrder: 1
      }
    ]
  },
  {
    id: 'evt-devops',
    title: 'Ikorodu DevOps Meetup',
    organizerName: 'Ikorodu Tech Community',
    category: 'Tech',
    date: 'Thu, Dec 04, 2025',
    time: '12:00 WAT',
    location: 'Yinkus Restaurant, Ikorodu',
    venueName: 'Yinkus Restaurant, Ikorodu',
    address: 'Yinkus Restaurant, Ikorodu, Lagos',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1600&q=80',
    description: 'Managing containers on Linux & Cloud infrastructure best practices.',
    featured: false,
    tags: ['Linux', 'DevOps'],
    ticketTiers: [
      {
        id: 'tier-devops-free',
        name: 'FREE Attendee Pass',
        price: 0,
        description: 'Access to workshop and networking.',
        availableQuantity: 100,
        soldQuantity: 75,
        maxPerOrder: 2
      }
    ]
  },
  {
    id: 'evt-igbesa',
    title: 'Igbesa Design Meetup',
    organizerName: 'CONAS Design Guild',
    category: 'Tech',
    date: 'Fri, Dec 06, 2025',
    time: '15:00 WAT',
    location: 'Nas 5, CONAS building, Igbesa',
    venueName: 'Nas 5, CONAS building',
    address: 'CONAS Building, Crawford University, Igbesa',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1600&q=80',
    description: 'Designing with purpose: turning simple ideas into visual stories.',
    featured: false,
    tags: ['UI/UX', 'Design'],
    ticketTiers: [
      {
        id: 'tier-igbesa-free',
        name: 'FREE Pass',
        price: 0,
        description: 'Includes workshop materials.',
        availableQuantity: 150,
        soldQuantity: 110,
        maxPerOrder: 2
      }
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: '7362992662288',
    eventId: 'evt-davido',
    eventTitle: 'The 5IVE Alive Tour',
    customerName: 'Isaiah Makinde',
    customerEmail: 'contact@makindeisaiah.com',
    customerPhone: '+234 812 345 6789',
    totalAmount: 30000,
    paymentMethod: 'Credit Card',
    purchaseDate: 'Dec 2, 2025',
    tickets: [
      {
        ticketCode: '7362992662288',
        orderId: '7362992662288',
        eventId: 'evt-davido',
        eventTitle: 'The 5IVE Alive Tour',
        eventDate: 'Thu, Dec 25, 2025',
        eventTime: '19:00 WAT (Gate open: 17:00pm)',
        venueName: 'Eko Convention Center, VI',
        tierName: 'Regular',
        attendeeName: 'Isaiah Makinde',
        attendeeEmail: 'contact@makindeisaiah.com',
        pricePaid: 30000,
        purchaseDate: 'Dec 2, 2025',
        status: 'VALID'
      }
    ]
  }
];

export const INITIAL_PROMOS: PromoCode[] = [
  { code: 'TICKETA20', discountPercentage: 20, active: true, usedCount: 102 },
  { code: 'EARLYBIRD15', discountPercentage: 15, active: true, usedCount: 45 }
];
