import { apiClient, unwrap, unwrapList } from '../api/client';
import type { Seat, Show, ShowFilters, ShowPayload } from '../types';
import { rowLabel } from '../utils/format';

/** Fill computed fields if a backend omits them. */
const normaliseShow = (show: Show): Show => {
  const totalSeats = show.totalSeats ?? show.rows * show.seatsPerRow;
  return { ...show, totalSeats, availableSeats: show.availableSeats ?? totalSeats };
};

export const showService = {
  async getAll(filters: ShowFilters & { includePast?: boolean } = {}): Promise<Show[]> {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined));
    const { data } = await apiClient.get('/shows', { params });
    return unwrapList<Show>(data).map(normaliseShow);
  },

  async getById(id: number | string): Promise<Show> {
    const { data } = await apiClient.get(`/shows/${id}`);
    return normaliseShow(unwrap<Show>(data));
  },

  /**
   * Seat map for a show. Accepts a full seat list, or a list of booked seat numbers
   * (`string[]` / `{ bookedSeats: [] }`) which is expanded using the show layout.
   */
  async getSeats(show: Show): Promise<Seat[]> {
    const { data } = await apiClient.get(`/shows/${show.id}/seats`);
    const body = unwrap<unknown>(data);

    if (Array.isArray(body) && body.length && typeof body[0] === 'object') return body as Seat[];

    const booked = new Set<string>(
      Array.isArray(body) ? (body as string[]) : ((body as { bookedSeats?: string[] })?.bookedSeats ?? []),
    );
    const seats: Seat[] = [];
    for (let r = 0; r < show.rows; r++) {
      for (let n = 1; n <= show.seatsPerRow; n++) {
        const seatNumber = `${rowLabel(r)}${n}`;
        seats.push({ seatNumber, row: rowLabel(r), number: n, status: booked.has(seatNumber) ? 'BOOKED' : 'AVAILABLE' });
      }
    }
    return seats;
  },

  async create(payload: ShowPayload): Promise<Show> {
    const { data } = await apiClient.post('/shows', payload);
    return normaliseShow(unwrap<Show>(data));
  },

  async update(id: number, payload: ShowPayload): Promise<Show> {
    const { data } = await apiClient.put(`/shows/${id}`, payload);
    return normaliseShow(unwrap<Show>(data));
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/shows/${id}`);
  },
};
