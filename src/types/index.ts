/*  Domain models shared across the app (mirror the backend DTOs)      */

export type Role = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface UpdateProfileRequest {
  name: string;
  phone: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export type MovieStatus = 'NOW_SHOWING' | 'COMING_SOON';

export interface Movie {
  id: number;
  title: string;
  description: string;
  genre: string;
  language: string;
  durationMinutes: number;
  certificate: string;
  releaseDate: string;
  posterUrl: string;
  rating: number;
  director: string;
  cast: string[];
  status: MovieStatus;
}

export type MoviePayload = Omit<Movie, 'id'>;

export interface Theatre {
  id: number;
  name: string;
  city: string;
  address: string;
  screens: number;
  facilities: string[];
  contactNumber?: string;
}

export type TheatrePayload = Omit<Theatre, 'id'>;

export type ShowFormat = '2D' | '3D' | 'IMAX';

export interface Show {
  id: number;
  movieId: number;
  theatreId: number;
  movie?: Movie;
  theatre?: Theatre;
  /** Local date, YYYY-MM-DD */
  showDate: string;
  /** 24h local time, HH:mm */
  showTime: string;
  screen: string;
  format: ShowFormat;
  ticketPrice: number;
  rows: number;
  seatsPerRow: number;
  totalSeats: number;
  availableSeats: number;
}

export type ShowPayload = Pick<
  Show,
  'movieId' | 'theatreId' | 'showDate' | 'showTime' | 'screen' | 'format' | 'ticketPrice' | 'rows' | 'seatsPerRow'
>;

export interface ShowFilters {
  movieId?: number | string;
  theatreId?: number | string;
  date?: string;
  city?: string;
}

export type SeatStatus = 'AVAILABLE' | 'BOOKED';

export interface Seat {
  seatNumber: string;
  row: string;
  number: number;
  status: SeatStatus;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface Booking {
  id: number;
  userId: number;
  showId: number;
  show?: Show;
  user?: Pick<User, 'id' | 'name' | 'email'>;
  seatNumbers: string[];
  numberOfTickets: number;
  totalAmount: number;
  status: BookingStatus;
  bookingDate: string;
  payment?: Payment | null;
}

export interface CreateBookingRequest {
  showId: number;
  seatNumbers: string[];
}

export type PaymentMethod = 'CARD' | 'WALLET' | 'NET_BANKING';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  paymentDate: string;
  booking?: Booking;
  failureReason?: string;
}

export interface PaymentRequest {
  bookingId: number;
  amount: number;
  method: PaymentMethod;
  /** Only the last 4 digits are ever sent – full card data never leaves the browser. */
  cardLast4?: string;
  cardHolder?: string;
  walletNumber?: string;
  bank?: string;
}

export interface ApiMessage {
  message: string;
}
