import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { showService } from '../services/showService';
import { bookingService } from '../services/bookingService';
import type { Show, Seat } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { config } from '../config';
import { PageHeader } from '../components/common/PageHeader';
import { Loader } from '../components/common/Loader';
import { ErrorState } from '../components/common/Feedback';
import {
  formatCurrency,
  formatTime,
  formatDate,
  sortSeats,
} from '../utils/format';

export function BookingPage() {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [show, setShow] = useState<Show | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!showId) return;
    const loadShowAndSeats = async () => {
      try {
        setLoading(true);
        setError(null);
        const showData = await showService.getById(showId);
        setShow(showData);
        const seatsData = await showService.getSeats(showData);
        setSeats(seatsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load show details');
      } finally {
        setLoading(false);
      }
    };
    loadShowAndSeats();
  }, [showId]);

  // Group seats by row
  const seatRows = useMemo(() => {
    const map = new Map<string, Seat[]>();
    seats.forEach((seat) => {
      if (!map.has(seat.row)) map.set(seat.row, []);
      map.get(seat.row)!.push(seat);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  const handleToggleSeat = (seat: Seat) => {
    if (seat.status === 'BOOKED') return;
    const seatNumber = seat.seatNumber;

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats((prev) => prev.filter((s) => s !== seatNumber));
    } else {
      if (selectedSeats.length >= config.maxSeatsPerBooking) {
        showToast({
          type: 'warning',
          title: 'Seat Limit Reached',
          message: `You can select a maximum of ${config.maxSeatsPerBooking} seats per transaction.`,
        });
        return;
      }
      setSelectedSeats((prev) => [...prev, seatNumber]);
    }
  };

  const handleBookTickets = async () => {
    if (!isAuthenticated) {
      showToast({
        type: 'info',
        title: 'Sign In Required',
        message: 'Please sign in or create an account to complete your ticket booking.',
      });
      navigate('/signin', { state: { from: `/booking/${showId}` } });
      return;
    }

    if (!show || selectedSeats.length === 0) return;

    try {
      setSubmitting(true);
      const booking = await bookingService.create({
        showId: show.id,
        seatNumbers: sortSeats(selectedSeats),
      });
      showToast({
        type: 'success',
        title: 'Seats Reserved!',
        message: `${selectedSeats.length} ticket(s) reserved. Proceeding to checkout…`,
      });
      navigate(`/payment/${booking.id}`);
    } catch (err) {
      showToast({
        type: 'danger',
        title: 'Booking Failed',
        message: err instanceof Error ? err.message : 'Could not reserve seats. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullPage label="Preparing cinema screen & seating layout…" />;
  if (error || !show) return <div className="container-xl py-5"><ErrorState message={error ?? 'Show not found'} /></div>;

  const totalAmount = selectedSeats.length * show.ticketPrice;
  const sortedSelected = sortSeats(selectedSeats);

  return (
    <div className="booking-page fade-in-up pb-5">
      <div className="container-xl py-4">
        <PageHeader
          title={`Seat Selection: ${show.movie?.title ?? 'Movie'}`}
          subtitle={`${show.theatre?.name ?? 'Cinema'} • ${show.screen} • ${show.format} • ${formatDate(show.showDate)} at ${formatTime(show.showTime)}`}
          crumbs={[
            { label: 'Home', to: '/' },
            { label: 'Shows', to: '/shows' },
            { label: 'Seat Selection' },
          ]}
        />

        <div className="row g-4">
          {/* Cinema Hall & Interactive Seats (Left/Main Column) */}
          <div className="col-lg-8">
            <div className="card-cine p-3 p-md-4 text-center">
              {/* Cinema Screen Indicator */}
              <div className="mb-4 text-center">
                <div
                  className="mx-auto rounded-pill mb-2 shadow"
                  style={{
                    height: 8,
                    maxWidth: 480,
                    background: 'linear-gradient(90deg, transparent, #ff3d6e, #ffb547, transparent)',
                    boxShadow: '0 4px 20px rgba(255, 61, 110, 0.4)',
                  }}
                />
                <span className="small text-uppercase tracking-widest text-muted fw-semibold">
                  <i className="bi bi-display me-1" /> CINEMA SCREEN THIS DIRECTION
                </span>
              </div>

              {/* Seating Grid */}
              <div className="seating-area overflow-x-auto py-3 px-2 mb-4 scrollbar-thin">
                <div className="d-inline-flex flex-column gap-2" style={{ minWidth: show.seatsPerRow * 36 + 80 }}>
                  {seatRows.map(([rowName, rowSeats]) => (
                    <div key={rowName} className="d-flex align-items-center justify-content-center gap-1.5">
                      {/* Row Label Left */}
                      <span className="fw-bold text-muted small me-2" style={{ width: 24 }}>
                        {rowName}
                      </span>

                      {/* Row Seats */}
                      {rowSeats.map((seat) => {
                        const isBooked = seat.status === 'BOOKED';
                        const isSelected = selectedSeats.includes(seat.seatNumber);

                        return (
                          <button
                            key={seat.seatNumber}
                            type="button"
                            className={`seat-btn rounded-2 transition-all ${
                              isBooked
                                ? 'seat-booked'
                                : isSelected
                                ? 'seat-selected'
                                : 'seat-available'
                            }`}
                            disabled={isBooked}
                            onClick={() => handleToggleSeat(seat)}
                            title={`Seat ${seat.seatNumber} (${isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'})`}
                            aria-label={`Seat ${seat.seatNumber}`}
                          >
                            <span className="seat-number-label">{seat.number}</span>
                          </button>
                        );
                      })}

                      {/* Row Label Right */}
                      <span className="fw-bold text-muted small ms-2" style={{ width: 24 }}>
                        {rowName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seating Legend */}
              <div className="d-flex flex-wrap align-items-center justify-content-center gap-4 py-3 border-top border-secondary border-opacity-15 text-muted small">
                <div className="d-flex align-items-center gap-2">
                  <div className="seat-legend-box seat-available rounded-2" />
                  <span>Available ({show.ticketPrice} {config.currency})</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="seat-legend-box seat-selected rounded-2" />
                  <span className="text-white fw-semibold">Selected</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="seat-legend-box seat-booked rounded-2" />
                  <span>Booked / Reserved</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary Sidebar (Right Column) */}
          <div className="col-lg-4">
            <div className="card-cine p-4 sticky-top" style={{ top: 90 }}>
              <h2 className="h5 fw-bold text-white mb-3 border-bottom border-secondary border-opacity-15 pb-2">
                Booking Summary
              </h2>

              <div className="d-flex gap-3 mb-3">
                {show.movie?.posterUrl && (
                  <img
                    src={show.movie.posterUrl}
                    alt={show.movie.title}
                    className="rounded-3 object-fit-cover flex-shrink-0"
                    style={{ width: 60, height: 85 }}
                  />
                )}
                <div>
                  <h3 className="h6 fw-bold text-white mb-1">{show.movie?.title}</h3>
                  <div className="small text-muted mb-1">{show.theatre?.name}</div>
                  <span className="badge bg-secondary-subtle text-secondary-emphasis me-1">{show.screen}</span>
                  <span className="badge bg-primary bg-opacity-25 text-primary">{show.format}</span>
                </div>
              </div>

              <div className="d-flex flex-column gap-2 small text-muted border-top border-secondary border-opacity-15 py-3">
                <div className="d-flex justify-content-between">
                  <span>Date:</span>
                  <strong className="text-white">{formatDate(show.showDate)}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Showtime:</span>
                  <strong className="text-white">{formatTime(show.showTime)}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Price per Ticket:</span>
                  <strong className="text-white">{formatCurrency(show.ticketPrice)}</strong>
                </div>
              </div>

              {/* Selected Seats Display */}
              <div className="border-top border-secondary border-opacity-15 py-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small fw-semibold text-white">Selected Seats:</span>
                  <span className="badge bg-primary rounded-pill px-2.5">
                    {selectedSeats.length} / {config.maxSeatsPerBooking}
                  </span>
                </div>

                {selectedSeats.length === 0 ? (
                  <div className="p-3 rounded-3 bg-black bg-opacity-30 border border-secondary border-opacity-15 text-center text-muted small">
                    <i className="bi bi-hand-index-thumb me-1 text-primary" />
                    Click seats on the layout to add them to your reservation.
                  </div>
                ) : (
                  <div className="d-flex flex-wrap gap-1.5 mb-2">
                    {sortedSelected.map((num) => (
                      <span
                        key={num}
                        className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 px-2.5 py-1.5 rounded-pill d-inline-flex align-items-center gap-1.5"
                      >
                        <i className="bi bi-ticket-perforated" /> {num}
                        <button
                          type="button"
                          className="btn-close btn-close-white btn-sm"
                          style={{ fontSize: '0.55rem' }}
                          onClick={() => setSelectedSeats((prev) => prev.filter((s) => s !== num))}
                          aria-label={`Remove seat ${num}`}
                        />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Calculation */}
              <div className="border-top border-secondary border-opacity-15 pt-3 mb-4">
                <div className="d-flex justify-content-between align-items-baseline mb-1">
                  <span className="text-muted">Tickets ({selectedSeats.length}):</span>
                  <span className="text-white small">
                    {selectedSeats.length} &times; {formatCurrency(show.ticketPrice)}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-baseline">
                  <span className="h6 fw-bold text-white mb-0">Total Amount:</span>
                  <span className="fs-4 fw-black text-warning">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                className="btn btn-gradient btn-lg w-100 rounded-pill fw-semibold shadow-lg d-flex align-items-center justify-content-center gap-2"
                disabled={selectedSeats.length === 0 || submitting}
                onClick={handleBookTickets}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" aria-hidden />
                    Reserving Seats…
                  </>
                ) : (
                  <>
                    <i className="bi bi-shield-check" /> Proceed to Checkout
                  </>
                )}
              </button>

              <div className="text-center mt-3">
                <Link to={`/movies/${show.movieId}`} className="small text-muted text-decoration-none hover-white">
                  &larr; Back to Movie Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
