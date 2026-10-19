import type { Booking, Payment, Seat, Show, User } from '../../types';
import { base64UrlEncode, decodeJwt } from '../../utils/jwt';
import { isShowUpcoming, rowLabel, showStartDate } from '../../utils/format';
import { config } from '../../config';
import { loadDb, nextId, saveDb, type Db, type DbBooking, type DbShow, type DbUser } from './mockDb';
/*  Route handlers that emulate the Movie Ticket Booking REST backend  */

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface AuthClaims {
  userId: number;
  role: 'ADMIN' | 'CUSTOMER';
}

export interface RouteContext {
  params: Record<string, string>;
  query: Record<string, string>;
  body: Record<string, unknown>;
  auth: AuthClaims | null;
  db: Db;
}

type Access = 'public' | 'user' | 'admin';
type Handler = (ctx: RouteContext) => unknown;

interface Route {
  method: string;
  regex: RegExp;
  keys: string[];
  access: Access;
  handler: Handler;
}

const routes: Route[] = [];

const route = (method: string, path: string, access: Access, handler: Handler) => {
  const keys: string[] = [];
  const pattern = path.replace(/:(\w+)/g, (_, key: string) => {
    keys.push(key);
    return '([^/]+)';
  });
  routes.push({ method, regex: new RegExp(`^${pattern}/?$`), keys, access, handler });
};

// helpers

const TOKEN_TTL_SECONDS = 60 * 60 * 8;

const createToken = (user: DbUser): string => {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
    JSON.stringify({ sub: user.email, userId: user.id, role: user.role, name: user.name, iat: now, exp: now + TOKEN_TTL_SECONDS }),
  );
  return `${header}.${payload}.mock-signature`;
};

export const claimsFromHeader = (authHeader: string | undefined): AuthClaims | null => {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const payload = decodeJwt(authHeader.slice(7));
  if (!payload?.userId || !payload.exp || payload.exp * 1000 < Date.now()) return null;
  return { userId: Number(payload.userId), role: payload.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER' };
};

const publicUser = ({ password: _password, ...user }: DbUser): User => user;

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : v === undefined || v === null ? '' : String(v));
const num = (v: unknown) => Number(v);

const findOr404 = <T extends { id: number }>(list: T[], id: string | number, label: string): T => {
  const item = list.find((x) => x.id === Number(id));
  if (!item) throw new HttpError(404, `${label} not found`);
  return item;
};

const activeBookingsForShow = (db: Db, showId: number) =>
  db.bookings.filter((b) => b.showId === showId && b.status !== 'CANCELLED');

const bookedSeatsForShow = (db: Db, show: DbShow): Set<string> => {
  const seats = new Set(show.reservedSeats);
  activeBookingsForShow(db, show.id).forEach((b) => b.seatNumbers.forEach((s) => seats.add(s)));
  return seats;
};

const enrichShow = (db: Db, show: DbShow): Show => {
  const { reservedSeats: _reserved, ...rest } = show;
  const totalSeats = show.rows * show.seatsPerRow;
  return {
    ...rest,
    movie: db.movies.find((m) => m.id === show.movieId),
    theatre: db.theatres.find((t) => t.id === show.theatreId),
    totalSeats,
    availableSeats: totalSeats - bookedSeatsForShow(db, show).size,
  };
};

const enrichBooking = (db: Db, booking: DbBooking): Booking => {
  const show = db.shows.find((s) => s.id === booking.showId);
  const user = db.users.find((u) => u.id === booking.userId);
  const payments = db.payments.filter((p) => p.bookingId === booking.id);
  const payment =
    payments.find((p) => p.status === 'SUCCESS' || p.status === 'REFUNDED') ?? payments[payments.length - 1] ?? null;
  return {
    ...booking,
    show: show ? enrichShow(db, show) : undefined,
    user: user ? { id: user.id, name: user.name, email: user.email } : undefined,
    payment,
  };
};

const enrichPayment = (db: Db, payment: Payment): Payment => {
  const booking = db.bookings.find((b) => b.id === payment.bookingId);
  return { ...payment, booking: booking ? { ...enrichBooking(db, booking), payment: undefined } : undefined };
};

const assertOwnerOrAdmin = (ctx: RouteContext, ownerId: number) => {
  if (ctx.auth?.role !== 'ADMIN' && ctx.auth?.userId !== ownerId) {
    throw new HttpError(403, 'You do not have access to this resource');
  }
};

const validateMovie = (body: Record<string, unknown>) => {
  const title = str(body.title);
  if (!title) throw new HttpError(400, 'Title is required');
  if (!str(body.genre)) throw new HttpError(400, 'Genre is required');
  if (!(num(body.durationMinutes) > 0)) throw new HttpError(400, 'Duration must be greater than 0');
  return {
    title,
    description: str(body.description),
    genre: str(body.genre),
    language: str(body.language) || 'English',
    durationMinutes: num(body.durationMinutes),
    certificate: str(body.certificate) || 'PG',
    releaseDate: str(body.releaseDate),
    posterUrl: str(body.posterUrl),
    rating: Math.min(10, Math.max(0, num(body.rating) || 0)),
    director: str(body.director),
    cast: Array.isArray(body.cast) ? body.cast.map(str).filter(Boolean) : [],
    status: body.status === 'COMING_SOON' ? ('COMING_SOON' as const) : ('NOW_SHOWING' as const),
  };
};

const validateTheatre = (body: Record<string, unknown>) => {
  const name = str(body.name);
  if (!name) throw new HttpError(400, 'Theatre name is required');
  if (!str(body.city)) throw new HttpError(400, 'City is required');
  return {
    name,
    city: str(body.city),
    address: str(body.address),
    screens: Math.max(1, num(body.screens) || 1),
    facilities: Array.isArray(body.facilities) ? body.facilities.map(str).filter(Boolean) : [],
    contactNumber: str(body.contactNumber),
  };
};

const validateShow = (db: Db, body: Record<string, unknown>) => {
  findOr404(db.movies, num(body.movieId), 'Movie');
  findOr404(db.theatres, num(body.theatreId), 'Theatre');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str(body.showDate))) throw new HttpError(400, 'Show date is required');
  if (!/^\d{2}:\d{2}$/.test(str(body.showTime))) throw new HttpError(400, 'Show time is required');
  if (!(num(body.ticketPrice) > 0)) throw new HttpError(400, 'Ticket price must be greater than 0');
  const rows = num(body.rows);
  const seatsPerRow = num(body.seatsPerRow);
  if (!(rows >= 1 && rows <= 26)) throw new HttpError(400, 'Rows must be between 1 and 26');
  if (!(seatsPerRow >= 1 && seatsPerRow <= 30)) throw new HttpError(400, 'Seats per row must be between 1 and 30');
  return {
    movieId: num(body.movieId),
    theatreId: num(body.theatreId),
    showDate: str(body.showDate),
    showTime: str(body.showTime),
    screen: str(body.screen) || 'Screen 1',
    format: (['2D', '3D', 'IMAX'].includes(str(body.format)) ? str(body.format) : '2D') as Show['format'],
    ticketPrice: num(body.ticketPrice),
    rows,
    seatsPerRow,
  };
};

// auth

route('POST', '/auth/register', 'public', ({ body, db }) => {
  const name = str(body.name);
  const email = str(body.email).toLowerCase();
  const password = str(body.password);
  if (!name || !email || !password) throw new HttpError(400, 'Name, email and password are required');
  if (password.length < 8) throw new HttpError(400, 'Password must be at least 8 characters');
  if (db.users.some((u) => u.email === email)) throw new HttpError(409, 'An account with this email already exists');
  const user: DbUser = {
    id: nextId(db, 'users'),
    name,
    email,
    phone: str(body.phone),
    password,
    role: 'CUSTOMER',
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  return { token: createToken(user), user: publicUser(user) };
});

route('POST', '/auth/login', 'public', ({ body, db }) => {
  const email = str(body.email).toLowerCase();
  const user = db.users.find((u) => u.email === email && u.password === str(body.password));
  if (!user) throw new HttpError(401, 'Invalid email or password');
  return { token: createToken(user), user: publicUser(user) };
});

// users

route('GET', '/users/me', 'user', ({ auth, db }) => publicUser(findOr404(db.users, auth!.userId, 'User')));

route('PUT', '/users/me', 'user', ({ auth, body, db }) => {
  const user = findOr404(db.users, auth!.userId, 'User');
  if (!str(body.name)) throw new HttpError(400, 'Name is required');
  user.name = str(body.name);
  user.phone = str(body.phone);
  return publicUser(user);
});

route('PUT', '/users/me/password', 'user', ({ auth, body, db }) => {
  const user = findOr404(db.users, auth!.userId, 'User');
  if (user.password !== str(body.currentPassword)) throw new HttpError(400, 'Current password is incorrect');
  if (str(body.newPassword).length < 8) throw new HttpError(400, 'New password must be at least 8 characters');
  user.password = str(body.newPassword);
  return { message: 'Password updated successfully' };
});

route('GET', '/users', 'admin', ({ db }) => db.users.map(publicUser));

route('DELETE', '/users/:id', 'admin', ({ params, auth, db }) => {
  const user = findOr404(db.users, params.id, 'User');
  if (user.id === auth!.userId) throw new HttpError(400, 'You cannot delete your own account');
  if (db.bookings.some((b) => b.userId === user.id && b.status !== 'CANCELLED')) {
    throw new HttpError(409, 'This user has active bookings and cannot be deleted');
  }
  db.users = db.users.filter((u) => u.id !== user.id);
  return { message: 'User deleted' };
});

// movies

route('GET', '/movies', 'public', ({ query, db }) => {
  const search = (query.search ?? '').toLowerCase();
  return db.movies.filter(
    (m) =>
      (!search || m.title.toLowerCase().includes(search) || m.genre.toLowerCase().includes(search)) &&
      (!query.genre || m.genre === query.genre) &&
      (!query.language || m.language === query.language),
  );
});

route('GET', '/movies/:id', 'public', ({ params, db }) => findOr404(db.movies, params.id, 'Movie'));

route('POST', '/movies', 'admin', ({ body, db }) => {
  const movie = { id: nextId(db, 'movies'), ...validateMovie(body) };
  db.movies.push(movie);
  return movie;
});

route('PUT', '/movies/:id', 'admin', ({ params, body, db }) => {
  const movie = findOr404(db.movies, params.id, 'Movie');
  Object.assign(movie, validateMovie(body));
  return movie;
});

route('DELETE', '/movies/:id', 'admin', ({ params, db }) => {
  const movie = findOr404(db.movies, params.id, 'Movie');
  const showIds = db.shows.filter((s) => s.movieId === movie.id).map((s) => s.id);
  if (db.bookings.some((b) => showIds.includes(b.showId) && b.status !== 'CANCELLED')) {
    throw new HttpError(409, 'Cannot delete a movie that has active bookings');
  }
  db.movies = db.movies.filter((m) => m.id !== movie.id);
  db.shows = db.shows.filter((s) => s.movieId !== movie.id);
  return { message: 'Movie deleted' };
});

// theatres

route('GET', '/theatres', 'public', ({ query, db }) => {
  const search = (query.search ?? '').toLowerCase();
  return db.theatres.filter(
    (t) =>
      (!query.city || t.city === query.city) &&
      (!search || t.name.toLowerCase().includes(search) || t.address.toLowerCase().includes(search)),
  );
});

route('GET', '/theatres/:id', 'public', ({ params, db }) => findOr404(db.theatres, params.id, 'Theatre'));

route('POST', '/theatres', 'admin', ({ body, db }) => {
  const theatre = { id: nextId(db, 'theatres'), ...validateTheatre(body) };
  db.theatres.push(theatre);
  return theatre;
});

route('PUT', '/theatres/:id', 'admin', ({ params, body, db }) => {
  const theatre = findOr404(db.theatres, params.id, 'Theatre');
  Object.assign(theatre, validateTheatre(body));
  return theatre;
});

route('DELETE', '/theatres/:id', 'admin', ({ params, db }) => {
  const theatre = findOr404(db.theatres, params.id, 'Theatre');
  const showIds = db.shows.filter((s) => s.theatreId === theatre.id).map((s) => s.id);
  if (db.bookings.some((b) => showIds.includes(b.showId) && b.status !== 'CANCELLED')) {
    throw new HttpError(409, 'Cannot delete a theatre that has active bookings');
  }
  db.theatres = db.theatres.filter((t) => t.id !== theatre.id);
  db.shows = db.shows.filter((s) => s.theatreId !== theatre.id);
  return { message: 'Theatre deleted' };
});

// shows

route('GET', '/shows', 'public', ({ query, db }) => {
  const includePast = query.includePast === 'true';
  return db.shows
    .filter(
      (s) =>
        (!query.movieId || s.movieId === Number(query.movieId)) &&
        (!query.theatreId || s.theatreId === Number(query.theatreId)) &&
        (!query.date || s.showDate === query.date) &&
        (!query.city || db.theatres.find((t) => t.id === s.theatreId)?.city === query.city) &&
        (includePast || isShowUpcoming(s)),
    )
    .sort((a, b) => showStartDate(a).getTime() - showStartDate(b).getTime())
    .map((s) => enrichShow(db, s));
});

route('GET', '/shows/:id', 'public', ({ params, db }) => enrichShow(db, findOr404(db.shows, params.id, 'Show')));

route('GET', '/shows/:id/seats', 'public', ({ params, db }) => {
  const show = findOr404(db.shows, params.id, 'Show');
  const booked = bookedSeatsForShow(db, show);
  const seats: Seat[] = [];
  for (let r = 0; r < show.rows; r++) {
    for (let n = 1; n <= show.seatsPerRow; n++) {
      const seatNumber = `${rowLabel(r)}${n}`;
      seats.push({ seatNumber, row: rowLabel(r), number: n, status: booked.has(seatNumber) ? 'BOOKED' : 'AVAILABLE' });
    }
  }
  return seats;
});

route('POST', '/shows', 'admin', ({ body, db }) => {
  const show: DbShow = { id: nextId(db, 'shows'), ...validateShow(db, body), reservedSeats: [] };
  db.shows.push(show);
  return enrichShow(db, show);
});

route('PUT', '/shows/:id', 'admin', ({ params, body, db }) => {
  const show = findOr404(db.shows, params.id, 'Show');
  const data = validateShow(db, body);
  if (activeBookingsForShow(db, show.id).length && (data.rows < show.rows || data.seatsPerRow < show.seatsPerRow)) {
    throw new HttpError(409, 'Cannot shrink the seat layout of a show with active bookings');
  }
  Object.assign(show, data);
  return enrichShow(db, show);
});

route('DELETE', '/shows/:id', 'admin', ({ params, db }) => {
  const show = findOr404(db.shows, params.id, 'Show');
  if (activeBookingsForShow(db, show.id).length) throw new HttpError(409, 'Cannot delete a show with active bookings');
  db.shows = db.shows.filter((s) => s.id !== show.id);
  return { message: 'Show deleted' };
});

// bookings

route('POST', '/bookings', 'user', ({ body, auth, db }) => {
  const show = findOr404(db.shows, num(body.showId), 'Show');
  const seatNumbers = Array.isArray(body.seatNumbers) ? [...new Set(body.seatNumbers.map(str))] : [];
  if (!seatNumbers.length) throw new HttpError(400, 'Select at least one seat');
  if (seatNumbers.length > config.maxSeatsPerBooking) {
    throw new HttpError(400, `You can book up to ${config.maxSeatsPerBooking} seats at a time`);
  }
  if (!isShowUpcoming(show)) throw new HttpError(400, 'This show has already started');

  const valid = new Set<string>();
  for (let r = 0; r < show.rows; r++) for (let n = 1; n <= show.seatsPerRow; n++) valid.add(`${rowLabel(r)}${n}`);
  const invalid = seatNumbers.filter((s) => !valid.has(s));
  if (invalid.length) throw new HttpError(400, `Invalid seat(s): ${invalid.join(', ')}`);

  const booked = bookedSeatsForShow(db, show);
  const taken = seatNumbers.filter((s) => booked.has(s));
  if (taken.length) throw new HttpError(409, `Seat(s) ${taken.join(', ')} were just booked by someone else`);

  const booking: DbBooking = {
    id: nextId(db, 'bookings'),
    userId: auth!.userId,
    showId: show.id,
    seatNumbers,
    numberOfTickets: seatNumbers.length,
    totalAmount: seatNumbers.length * show.ticketPrice,
    status: 'PENDING',
    bookingDate: new Date().toISOString(),
  };
  db.bookings.push(booking);
  return enrichBooking(db, booking);
});

route('GET', '/bookings/my', 'user', ({ auth, db }) =>
  db.bookings
    .filter((b) => b.userId === auth!.userId)
    .sort((a, b) => b.bookingDate.localeCompare(a.bookingDate))
    .map((b) => enrichBooking(db, b)),
);

route('GET', '/bookings', 'admin', ({ db }) =>
  [...db.bookings].sort((a, b) => b.bookingDate.localeCompare(a.bookingDate)).map((b) => enrichBooking(db, b)),
);

route('GET', '/bookings/:id', 'user', (ctx) => {
  const booking = findOr404(ctx.db.bookings, ctx.params.id, 'Booking');
  assertOwnerOrAdmin(ctx, booking.userId);
  return enrichBooking(ctx.db, booking);
});

route('PUT', '/bookings/:id/cancel', 'user', (ctx) => {
  const { db } = ctx;
  const booking = findOr404(db.bookings, ctx.params.id, 'Booking');
  assertOwnerOrAdmin(ctx, booking.userId);
  if (booking.status === 'CANCELLED') throw new HttpError(400, 'This booking is already cancelled');
  const show = findOr404(db.shows, booking.showId, 'Show');
  const cutoffMs = config.cancellationCutoffHours * 3_600_000;
  if (showStartDate(show).getTime() - Date.now() <= cutoffMs) {
    throw new HttpError(400, `Bookings can only be cancelled at least ${config.cancellationCutoffHours} hours before the show`);
  }
  booking.status = 'CANCELLED';
  db.payments
    .filter((p) => p.bookingId === booking.id && p.status === 'SUCCESS')
    .forEach((p) => (p.status = 'REFUNDED'));
  return enrichBooking(db, booking);
});

// payments

route('POST', '/payments', 'user', (ctx) => {
  const { body, db } = ctx;
  const booking = findOr404(db.bookings, num(body.bookingId), 'Booking');
  assertOwnerOrAdmin(ctx, booking.userId);
  if (booking.status === 'CANCELLED') throw new HttpError(400, 'This booking has been cancelled');
  if (booking.status === 'CONFIRMED') throw new HttpError(400, 'This booking is already paid');
  if (Math.abs(num(body.amount) - booking.totalAmount) > 0.01) throw new HttpError(400, 'Payment amount does not match booking total');
  const method = str(body.method) as Payment['method'];
  if (!['CARD', 'WALLET', 'NET_BANKING'].includes(method)) throw new HttpError(400, 'Unsupported payment method');

  // Demo rule: cards ending with 0000 are declined by the "bank"
  const declined = method === 'CARD' && str(body.cardLast4) === '0000';
  const payment: Payment = {
    id: nextId(db, 'payments'),
    bookingId: booking.id,
    amount: booking.totalAmount,
    method,
    status: declined ? 'FAILED' : 'SUCCESS',
    transactionId: `TXN${Date.now().toString().slice(-8)}${String(booking.id).padStart(4, '0')}`,
    paymentDate: new Date().toISOString(),
    ...(declined ? { failureReason: 'Your bank declined the transaction. Try another card.' } : {}),
  };
  db.payments.push(payment);
  if (!declined) booking.status = 'CONFIRMED';
  return enrichPayment(db, payment);
});

route('GET', '/payments/my', 'user', ({ auth, db }) => {
  const myBookingIds = new Set(db.bookings.filter((b) => b.userId === auth!.userId).map((b) => b.id));
  return db.payments
    .filter((p) => myBookingIds.has(p.bookingId))
    .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))
    .map((p) => enrichPayment(db, p));
});

route('GET', '/payments/booking/:bookingId', 'user', (ctx) => {
  const booking = findOr404(ctx.db.bookings, ctx.params.bookingId, 'Booking');
  assertOwnerOrAdmin(ctx, booking.userId);
  return ctx.db.payments.filter((p) => p.bookingId === booking.id).map((p) => enrichPayment(ctx.db, p));
});

route('GET', '/payments', 'admin', ({ db }) =>
  [...db.payments].sort((a, b) => b.paymentDate.localeCompare(a.paymentDate)).map((p) => enrichPayment(db, p)),
);

// dispatcher

export const dispatch = (
  method: string,
  path: string,
  query: Record<string, string>,
  body: Record<string, unknown>,
  authHeader: string | undefined,
): { status: number; data: unknown } => {
  const matches = routes.filter((r) => r.regex.test(path));
  if (!matches.length) throw new HttpError(404, `No route for ${method} ${path}`);
  const match = matches.find((r) => r.method === method);
  if (!match) throw new HttpError(405, `Method ${method} not allowed on ${path}`);

  const auth = claimsFromHeader(authHeader);
  if (match.access !== 'public' && !auth) throw new HttpError(401, 'Authentication required');
  if (match.access === 'admin' && auth?.role !== 'ADMIN') throw new HttpError(403, 'Admin access required');

  const values = match.regex.exec(path)!.slice(1);
  const params = Object.fromEntries(match.keys.map((k, i) => [k, decodeURIComponent(values[i])]));
  const db = loadDb();
  const data = match.handler({ params, query, body, auth, db });
  if (method !== 'GET') saveDb(db);
  return { status: method === 'POST' ? 201 : 200, data: structuredClone(data) };
};
