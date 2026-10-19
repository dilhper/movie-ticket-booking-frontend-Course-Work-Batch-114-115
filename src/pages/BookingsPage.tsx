import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import type { Booking } from '../types';
import { useToast } from '../hooks/useToast';
import { PageHeader } from '../components/common/PageHeader';
import { Loader } from '../components/common/Loader';
import { EmptyState, ErrorState } from '../components/common/Feedback';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal, ConfirmDialog } from '../components/common/Modal';
import { config } from '../config';
import {
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime,
  canCancelBooking,
} from '../utils/format';

export function BookingsPage() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'ALL' | 'CONFIRMED' | 'CANCELLED'>('ALL');

  // Cancel dialog state
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Ticket modal state
  const [viewTicket, setViewTicket] = useState<Booking | null>(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getMine();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve booking history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (filterTab === 'CONFIRMED') return b.status === 'CONFIRMED';
      if (filterTab === 'CANCELLED') return b.status === 'CANCELLED';
      return true;
    });
  }, [bookings, filterTab]);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      setCancelling(true);
      const updated = await bookingService.cancel(cancelTarget.id);
      setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      showToast({
        type: 'success',
        title: 'Booking Cancelled',
        message: `Booking #${cancelTarget.id} has been cancelled and full refund has been initiated.`,
      });
      setCancelTarget(null);
    } catch (err) {
      showToast({
        type: 'danger',
        title: 'Cancellation Failed',
        message: err instanceof Error ? err.message : 'Could not cancel booking.',
      });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container-xl py-4 fade-in-up pb-5">
      <PageHeader
        title="My Bookings & Tickets"
        subtitle="View your active reservations, digital tickets, and past booking history"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'My Bookings' }]}
        actions={
          <Link to="/movies" className="btn btn-gradient btn-sm rounded-pill px-3">
            <i className="bi bi-plus-circle me-1" /> Book New Movie
          </Link>
        }
      />

      {/* Tabs */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div className="btn-group p-1 bg-black bg-opacity-40 rounded-pill border border-secondary border-opacity-25">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${filterTab === 'ALL' ? 'btn-gradient fw-semibold' : 'btn-link text-muted text-decoration-none'}`}
            onClick={() => setFilterTab('ALL')}
          >
            All Bookings ({bookings.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${filterTab === 'CONFIRMED' ? 'btn-gradient fw-semibold' : 'btn-link text-muted text-decoration-none'}`}
            onClick={() => setFilterTab('CONFIRMED')}
          >
            Confirmed ({bookings.filter((b) => b.status === 'CONFIRMED').length})
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${filterTab === 'CANCELLED' ? 'btn-gradient fw-semibold' : 'btn-link text-muted text-decoration-none'}`}
            onClick={() => setFilterTab('CANCELLED')}
          >
            Cancelled ({bookings.filter((b) => b.status === 'CANCELLED').length})
          </button>
        </div>

        <span className="badge bg-secondary-subtle text-secondary-emphasis small p-2 rounded-pill">
          Cancellation policy: up to {config.cancellationCutoffHours}h before show
        </span>
      </div>

      {error && <ErrorState message={error} onRetry={loadBookings} />}

      {loading ? (
        <Loader label="Fetching your reservations…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="bi-ticket-perforated"
          title="No bookings found"
          message={
            filterTab === 'ALL'
              ? "You haven't made any ticket reservations yet. Browse movies and pick your seats!"
              : `No ${filterTab.toLowerCase()} bookings found.`
          }
          action={
            <Link to="/movies" className="btn btn-gradient rounded-pill px-4">
              Explore Now Showing Movies
            </Link>
          }
        />
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtered.map((booking) => {
            const show = booking.show;
            const eligibleForCancel = canCancelBooking(booking);
            const isConfirmed = booking.status === 'CONFIRMED';
            const isCancelled = booking.status === 'CANCELLED';

            return (
              <div key={booking.id} className="card-cine p-3 p-md-4 transition-all">
                <div className="row g-3 align-items-center">
                  {/* Poster Thumbnail */}
                  <div className="col-auto">
                    {show?.movie?.posterUrl ? (
                      <img
                        src={show.movie.posterUrl}
                        alt={show.movie.title}
                        className="rounded-3 object-fit-cover shadow-sm"
                        style={{ width: 68, height: 96 }}
                      />
                    ) : (
                      <div
                        className="rounded-3 bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center"
                        style={{ width: 68, height: 96 }}
                      >
                        <i className="bi bi-film fs-3 text-muted" />
                      </div>
                    )}
                  </div>

                  {/* Main Details */}
                  <div className="col">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                      <span className="badge bg-dark border border-secondary border-opacity-30 text-white-50">
                        #{booking.id}
                      </span>
                      <StatusBadge status={booking.status} />
                      {booking.payment && <StatusBadge status={booking.payment.status} prefix="Payment" />}
                      <span className="text-muted small ms-auto">
                        Booked: {formatDateTime(booking.bookingDate)}
                      </span>
                    </div>

                    <h3 className="h5 fw-bold text-white mb-1">
                      {show?.movie?.title ?? `Movie #${booking.showId}`}
                    </h3>

                    <div className="d-flex flex-wrap gap-3 text-muted small mb-2">
                      <span>
                        <i className="bi bi-buildings me-1 text-primary" />
                        {show?.theatre?.name} ({show?.theatre?.city})
                      </span>
                      <span>
                        <i className="bi bi-calendar3 me-1 text-primary" />
                        {show ? formatDate(show.showDate) : ''} at {show ? formatTime(show.showTime) : ''}
                      </span>
                      <span>
                        <i className="bi bi-display me-1 text-primary" />
                        {show?.screen} &bull; {show?.format}
                      </span>
                    </div>

                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <span className="small text-muted">Seats:</span>
                      {booking.seatNumbers.map((seat) => (
                        <span key={seat} className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-40">
                          {seat}
                        </span>
                      ))}
                      <span className="small text-muted ms-2">
                        ({booking.numberOfTickets} tickets)
                      </span>
                    </div>
                  </div>

                  {/* Total & Actions */}
                  <div className="col-12 col-md-auto text-md-end border-top border-md-top-0 border-secondary border-opacity-15 pt-3 pt-md-0">
                    <div className="small text-muted mb-1">Total Paid</div>
                    <div className="fs-4 fw-black text-warning mb-2">
                      {formatCurrency(booking.totalAmount)}
                    </div>

                    <div className="d-flex gap-2 justify-content-md-end">
                      {isConfirmed && (
                        <button
                          type="button"
                          className="btn btn-outline-light btn-sm rounded-pill px-3"
                          onClick={() => setViewTicket(booking)}
                        >
                          <i className="bi bi-qr-code me-1" /> View Ticket
                        </button>
                      )}

                      {isConfirmed && eligibleForCancel && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm rounded-pill px-3"
                          onClick={() => setCancelTarget(booking)}
                        >
                          <i className="bi bi-x-circle me-1" /> Cancel
                        </button>
                      )}

                      {isConfirmed && !eligibleForCancel && (
                        <span
                          className="badge bg-secondary-subtle text-muted p-2 rounded-pill small"
                          title="Cancellation is only permitted up to 2 hours before the showtime"
                        >
                          Cutoff passed
                        </span>
                      )}

                      {isCancelled && (
                        <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 p-2 rounded-pill small">
                          Cancelled & Refunded
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Cancellation */}
      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel This Booking?"
        message={
          cancelTarget ? (
            <div>
              <p>
                Are you sure you want to cancel booking <strong>#{cancelTarget.id}</strong> for{' '}
                <strong>{cancelTarget.show?.movie?.title}</strong>?
              </p>
              <div className="alert alert-warning small mb-0">
                <i className="bi bi-exclamation-triangle me-1" />
                Your seats ({cancelTarget.seatNumbers.join(', ')}) will be released to the public and a full refund of{' '}
                <strong>{formatCurrency(cancelTarget.totalAmount)}</strong> will be credited to your account.
              </div>
            </div>
          ) : null
        }
        confirmLabel="Yes, Cancel Booking"
        tone="danger"
        busy={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
      />

      {/* Ticket Pass View Modal */}
      {viewTicket && (
        <Modal
          open={!!viewTicket}
          title={`Ticket Pass #${viewTicket.id}`}
          onClose={() => setViewTicket(null)}
          size="md"
          footer={
            <div className="d-flex justify-content-between w-100">
              <button type="button" className="btn btn-outline-light btn-sm" onClick={() => window.print()}>
                <i className="bi bi-printer me-1" /> Print Pass
              </button>
              <button type="button" className="btn btn-glass btn-sm text-white" onClick={() => setViewTicket(null)}>
                Close
              </button>
            </div>
          }
        >
          <div className="text-center p-2">
            <h3 className="h5 fw-bold text-white mb-1">{viewTicket.show?.movie?.title}</h3>
            <p className="text-muted small mb-3">
              {viewTicket.show?.theatre?.name} &bull; {viewTicket.show?.screen} ({viewTicket.show?.format})
            </p>

            <div className="p-3 bg-white rounded-3 d-inline-block shadow-sm mb-3">
              <svg viewBox="0 0 100 100" width="140" height="140" fill="#07070d">
                <rect x="0" y="0" width="30" height="30" />
                <rect x="5" y="5" width="20" height="20" fill="#fff" />
                <rect x="9" y="9" width="12" height="12" fill="#07070d" />
                <rect x="70" y="0" width="30" height="30" />
                <rect x="75" y="5" width="20" height="20" fill="#fff" />
                <rect x="79" y="9" width="12" height="12" fill="#07070d" />
                <rect x="0" y="70" width="30" height="30" />
                <rect x="5" y="75" width="20" height="20" fill="#fff" />
                <rect x="9" y="79" width="12" height="12" fill="#07070d" />
                <circle cx="50" cy="50" r="14" fill="#ff3d6e" />
                <rect x="42" y="10" width="16" height="10" />
                <rect x="42" y="75" width="16" height="15" />
                <rect x="70" y="45" width="20" height="15" />
              </svg>
            </div>

            <div className="d-flex justify-content-center gap-2 mb-3">
              {viewTicket.seatNumbers.map((s) => (
                <span key={s} className="badge bg-danger text-white fs-6 px-3 py-1.5">
                  Seat {s}
                </span>
              ))}
            </div>

            <div className="row g-2 text-start small text-muted border-top border-secondary border-opacity-15 pt-3">
              <div className="col-6">
                Date: <strong className="text-white">{viewTicket.show ? formatDate(viewTicket.show.showDate) : ''}</strong>
              </div>
              <div className="col-6">
                Time: <strong className="text-white">{viewTicket.show ? formatTime(viewTicket.show.showTime) : ''}</strong>
              </div>
              <div className="col-6">
                Total: <strong className="text-warning">{formatCurrency(viewTicket.totalAmount)}</strong>
              </div>
              <div className="col-6">
                Status: <span className="text-success fw-bold">Active & Paid</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
