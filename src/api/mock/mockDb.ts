import type { Booking, Movie, Payment, Role, Show, Theatre } from '../../types';
import { addDays, rowLabel, toLocalDateString } from '../../utils/format';
import { MOCK_MOVIES, MOCK_THEATRES } from './mockData';
/*  Persistent in-browser "database" used by the mock backend          */

export interface DbUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  password: string;
  createdAt: string;
}

export type DbShow = Omit<Show, 'movie' | 'theatre' | 'totalSeats' | 'availableSeats'> & {
  /** Seats sold at the box office (not tied to an online booking). */
  reservedSeats: string[];
};

export type DbBooking = Omit<Booking, 'show' | 'user' | 'payment'>;

export interface Db {
  users: DbUser[];
  movies: Movie[];
  theatres: Theatre[];
  shows: DbShow[];
  bookings: DbBooking[];
  payments: Payment[];
  seq: Record<'users' | 'movies' | 'theatres' | 'shows' | 'bookings' | 'payments', number>;
}

const STORAGE_KEY = 'cinebook.mockdb.v1';
const BASE_TIMES = ['10:30', '13:45', '17:15', '20:45'];
const DAYS_BACK = 3;
const DAYS_AHEAD = 7;

// utilities

/** Deterministic PRNG so generated data is stable across reloads. */
const seededRandom = (seedText: string) => {
  let h = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i++) {
    h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
};

export const nextId = (db: Db, key: keyof Db['seq']): number => {
  db.seq[key] += 1;
  return db.seq[key];
};

const generateReservedSeats = (rows: number, perRow: number, seed: string): string[] => {
  const rand = seededRandom(seed);
  const occupancy = 0.12 + rand() * 0.35;
  const seats: string[] = [];
  for (let r = 0; r < rows; r++) {
    for (let n = 1; n <= perRow; n++) {
      // Middle rows/seats are more popular
      const centre = 1 - Math.abs(n - perRow / 2) / perRow;
      if (rand() < occupancy * (0.6 + centre)) seats.push(`${rowLabel(r)}${n}`);
    }
  }
  return seats;
};

const generateShowsForDate = (db: Db, date: string) => {
  const nowShowing = db.movies.filter((m) => m.status === 'NOW_SHOWING');
  if (!nowShowing.length) return;
  const dayIndex = Math.floor(new Date(date).getTime() / 86_400_000);

  db.theatres.forEach((theatre) => {
    for (let s = 1; s <= theatre.screens; s++) {
      const movie = nowShowing[(dayIndex + theatre.id * 3 + s) % nowShowing.length];
      const format: DbShow['format'] =
        s === 1 && theatre.facilities.includes('IMAX') ? 'IMAX' : s === 2 && theatre.facilities.includes('3D') ? '3D' : '2D';
      const basePrice = format === 'IMAX' ? 2500 : format === '3D' ? 1600 : 1200;
      const premium = theatre.facilities.includes('Recliners') ? 300 : 0;
      const rows = 8 + ((theatre.id + s) % 3);
      const seatsPerRow = (theatre.id + s) % 2 === 0 ? 14 : 12;
      const times = BASE_TIMES.filter((_, i) => (i + s + theatre.id) % 4 !== 0);

      times.forEach((time) => {
        db.shows.push({
          id: nextId(db, 'shows'),
          movieId: movie.id,
          theatreId: theatre.id,
          showDate: date,
          showTime: time,
          screen: `Screen ${s}`,
          format,
          ticketPrice: basePrice + premium,
          rows,
          seatsPerRow,
          reservedSeats: generateReservedSeats(rows, seatsPerRow, `${date}-${theatre.id}-${s}-${time}`),
        });
      });
    }
  });
};

/** Make sure there is always a rolling week of shows, even weeks after first launch. */
const ensureShowWindow = (db: Db) => {
  const existing = new Set(db.shows.map((s) => s.showDate));
  for (let i = -DAYS_BACK; i <= DAYS_AHEAD; i++) {
    const date = toLocalDateString(addDays(new Date(), i));
    if (!existing.has(date)) generateShowsForDate(db, date);
  }
};

const seedDemoBookings = (db: Db) => {
  const customer = db.users.find((u) => u.role === 'CUSTOMER');
  if (!customer) return;
  const today = toLocalDateString(new Date());
  const pastDate = toLocalDateString(addDays(new Date(), -2));
  const futureDate = toLocalDateString(addDays(new Date(), 2));

  const pick = (date: string, offset: number) => db.shows.filter((s) => s.showDate === date)[offset];
  const demo: { show?: DbShow; seats: string[]; status: DbBooking['status']; pay: Payment['status'] | null }[] = [
    { show: pick(pastDate, 2), seats: ['F6', 'F7'], status: 'CONFIRMED', pay: 'SUCCESS' },
    { show: pick(futureDate, 4), seats: ['E5', 'E6', 'E7'], status: 'CONFIRMED', pay: 'SUCCESS' },
    { show: pick(futureDate, 9), seats: ['D3'], status: 'CANCELLED', pay: 'REFUNDED' },
  ];

  demo.forEach(({ show, seats, status, pay }, i) => {
    if (!show) return;
    show.reservedSeats = show.reservedSeats.filter((s) => !seats.includes(s));
    const bookingDate = addDays(new Date(), -(5 - i)).toISOString();
    const booking: DbBooking = {
      id: nextId(db, 'bookings'),
      userId: customer.id,
      showId: show.id,
      seatNumbers: seats,
      numberOfTickets: seats.length,
      totalAmount: seats.length * show.ticketPrice,
      status,
      bookingDate,
    };
    db.bookings.push(booking);
    if (pay) {
      db.payments.push({
        id: nextId(db, 'payments'),
        bookingId: booking.id,
        amount: booking.totalAmount,
        method: i % 2 ? 'WALLET' : 'CARD',
        status: pay,
        transactionId: `TXN${today.replace(/-/g, '')}${String(booking.id).padStart(5, '0')}`,
        paymentDate: bookingDate,
      });
    }
  });
};

const createSeedDb = (): Db => {
  const now = new Date().toISOString();
  const db: Db = {
    users: [
      { id: 1, name: 'Admin User', email: 'admin@cinebook.com', phone: '0771234567', role: 'ADMIN', password: 'Admin@123', createdAt: now },
      { id: 2, name: 'Nimali Perera', email: 'customer@cinebook.com', phone: '0719876543', role: 'CUSTOMER', password: 'Customer@123', createdAt: now },
    ],
    movies: structuredClone(MOCK_MOVIES),
    theatres: structuredClone(MOCK_THEATRES),
    shows: [],
    bookings: [],
    payments: [],
    seq: { users: 2, movies: MOCK_MOVIES.length, theatres: MOCK_THEATRES.length, shows: 0, bookings: 0, payments: 0 },
  };
  ensureShowWindow(db);
  seedDemoBookings(db);
  return db;
};

// persistence

let cache: Db | null = null;

export const loadDb = (): Db => {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as Db) : createSeedDb();
  } catch {
    cache = createSeedDb();
  }
  ensureShowWindow(cache);
  saveDb(cache);
  return cache;
};

export const saveDb = (db: Db) => {
  cache = db;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* storage full / disabled – keep working in memory */
  }
};

export const resetMockDb = () => {
  localStorage.removeItem(STORAGE_KEY);
  cache = null;
  loadDb();
};
