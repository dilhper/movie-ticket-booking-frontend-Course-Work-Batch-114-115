import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { paymentService } from '../services/paymentService';
import type { Booking, Payment, PaymentMethod } from '../types';
import { useToast } from '../hooks/useToast';
import { PageHeader } from '../components/common/PageHeader';
import { Loader } from '../components/common/Loader';
import { ErrorState } from '../components/common/Feedback';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime,
} from '../utils/format';

export function PaymentPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { showToast } = useToast();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [completedPayment, setCompletedPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form inputs
  const [method, setMethod] = useState<PaymentMethod>('CARD');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [walletNumber, setWalletNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState('Commercial Bank of Ceylon');

  useEffect(() => {
    if (!bookingId) return;
    const loadBooking = async () => {
      try {
        setLoading(true);
        setError(null);
        const b = await bookingService.getById(bookingId);
        setBooking(b);
        if (b.payment && b.payment.status === 'SUCCESS') {
          setCompletedPayment(b.payment);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to retrieve booking information');
      } finally {
        setLoading(false);
      }
    };
    loadBooking();
  }, [bookingId]);

  const handleCardNumberChange = (val: string) => {
    // Only numbers, format as XXXX XXXX XXXX XXXX
    const digits = val.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      setCardExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setCardExpiry(digits);
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    if (method === 'CARD') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 16) {
        showToast({ type: 'warning', title: 'Invalid Card', message: 'Please enter a valid 16-digit card number.' });
        return;
      }
      if (!cardHolder.trim()) {
        showToast({ type: 'warning', title: 'Cardholder Name', message: 'Please enter the name on your card.' });
        return;
      }
      if (cardExpiry.length < 5) {
        showToast({ type: 'warning', title: 'Expiry Date', message: 'Please enter card expiry in MM/YY format.' });
        return;
      }
      if (cardCvv.length < 3) {
        showToast({ type: 'warning', title: 'CVV', message: 'Please enter 3 or 4-digit CVV security code.' });
        return;
      }
    } else if (method === 'WALLET') {
      if (walletNumber.length < 9) {
        showToast({ type: 'warning', title: 'Wallet Number', message: 'Please enter your mobile wallet number.' });
        return;
      }
    }

    try {
      setProcessing(true);
      const payment = await paymentService.pay({
        bookingId: booking.id,
        amount: booking.totalAmount,
        method,
        cardLast4: method === 'CARD' ? cardNumber.replace(/\s/g, '').slice(-4) : undefined,
        cardHolder: method === 'CARD' ? cardHolder : undefined,
        walletNumber: method === 'WALLET' ? walletNumber : undefined,
        bank: method === 'NET_BANKING' ? selectedBank : undefined,
      });

      setCompletedPayment(payment);
      // Reload booking to get confirmed status
      const updatedBooking = await bookingService.getById(booking.id);
      setBooking(updatedBooking);

      showToast({
        type: 'success',
        title: 'Payment Successful!',
        message: `Booking #${booking.id} confirmed! Your ticket pass is ready.`,
      });
    } catch (err) {
      showToast({
        type: 'danger',
        title: 'Payment Failed',
        message: err instanceof Error ? err.message : 'Transaction could not be processed. Please check your credentials.',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Loader fullPage label="Loading booking and checkout details…" />;
  if (error || !booking) return <div className="container-xl py-5"><ErrorState message={error ?? 'Booking record not found'} /></div>;

  const show = booking.show;
  const isPaid = completedPayment?.status === 'SUCCESS' || booking.status === 'CONFIRMED';

  return (
    <div className="payment-page fade-in-up pb-5">
      <div className="container-xl py-4">
        <PageHeader
          title={isPaid ? 'Ticket Confirmation Pass' : 'Secure Checkout & Payment'}
          subtitle={isPaid ? `Booking ID #${booking.id} is confirmed and active.` : 'Review your order and select your preferred payment method'}
          crumbs={[
            { label: 'Home', to: '/' },
            { label: 'My Bookings', to: '/bookings' },
            { label: `Booking #${booking.id}` },
          ]}
        />

        {isPaid ? (
          /*  Confirmed Digital Ticket Pass                                    */
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <div className="card-cine overflow-hidden shadow-2xl border-secondary border-opacity-30">
                {/* Header Banner */}
                <div
                  className="p-4 p-md-5 text-white position-relative"
                  style={{
                    background: 'linear-gradient(135deg, #1f1025, #0f0f1c 65%, #180d24)',
                    borderBottom: '2px dashed rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                    <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-3 py-1.5 rounded-pill fs-6">
                      <i className="bi bi-check-circle-fill me-1" /> BOOKING CONFIRMED
                    </span>
                    <span className="badge bg-dark border border-secondary border-opacity-25 text-white-50">
                      Pass #{booking.id}
                    </span>
                  </div>

                  <h2 className="display-6 fw-black text-white mb-1">{show?.movie?.title}</h2>
                  <p className="text-muted mb-0">
                    <i className="bi bi-buildings me-1 text-primary" /> {show?.theatre?.name} ({show?.theatre?.city})
                  </p>
                </div>

                {/* Ticket Details Body */}
                <div className="p-4 p-md-5">
                  <div className="row g-4 align-items-center">
                    <div className="col-md-8">
                      <div className="row g-3">
                        <div className="col-6">
                          <span className="text-muted small d-block">Screen & Format:</span>
                          <strong className="text-white fs-6">{show?.screen} &bull; {show?.format}</strong>
                        </div>
                        <div className="col-6">
                          <span className="text-muted small d-block">Show Date:</span>
                          <strong className="text-white fs-6">{show ? formatDate(show.showDate) : 'N/A'}</strong>
                        </div>
                        <div className="col-6">
                          <span className="text-muted small d-block">Showtime:</span>
                          <strong className="text-white fs-6">{show ? formatTime(show.showTime) : 'N/A'}</strong>
                        </div>
                        <div className="col-6">
                          <span className="text-muted small d-block">Seats Reserved:</span>
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {booking.seatNumbers.map((s) => (
                              <span key={s} className="badge bg-danger bg-opacity-30 text-danger border border-danger border-opacity-40">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="col-6">
                          <span className="text-muted small d-block">Tickets:</span>
                          <strong className="text-white">{booking.numberOfTickets} seat(s)</strong>
                        </div>
                        <div className="col-6">
                          <span className="text-muted small d-block">Total Paid:</span>
                          <strong className="text-warning fs-5">{formatCurrency(booking.totalAmount)}</strong>
                        </div>
                        {completedPayment && (
                          <div className="col-12 border-top border-secondary border-opacity-15 pt-2">
                            <span className="text-muted small d-block">Transaction Ref:</span>
                            <code className="text-info">{completedPayment.transactionId}</code>
                            <span className="text-muted small ms-2">({formatDateTime(completedPayment.paymentDate)})</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* QR Code Pass Simulator */}
                    <div className="col-md-4 text-center border-start-md border-secondary border-opacity-15 ps-md-4">
                      <div className="p-3 bg-white rounded-3 d-inline-block shadow-sm mb-2">
                        {/* High quality SVG QR representation */}
                        <svg viewBox="0 0 100 100" width="130" height="130" fill="#07070d">
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
                      <div className="small text-muted fw-semibold">Scan at Entrance Gate</div>
                      <div className="small text-muted" style={{ fontSize: '0.75rem' }}>CineBook Contactless Entry</div>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mt-5 pt-3 border-top border-secondary border-opacity-15">
                    <button
                      type="button"
                      className="btn btn-outline-light rounded-pill px-4"
                      onClick={() => window.print()}
                    >
                      <i className="bi bi-printer me-2" /> Print / Save Pass
                    </button>

                    <div className="d-flex gap-2">
                      <Link to="/bookings" className="btn btn-glass rounded-pill px-4 text-white">
                        <i className="bi bi-ticket-detailed me-1" /> View My Bookings
                      </Link>
                      <Link to="/movies" className="btn btn-gradient rounded-pill px-4">
                        Book Another Movie
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /*  Checkout & Payment Gateway Form                                 */
          <div className="row g-4">
            {/* Payment Methods (Left) */}
            <div className="col-lg-7">
              <div className="card-cine p-4">
                <h2 className="h5 fw-bold text-white mb-3">Select Payment Method</h2>

                <div className="d-flex gap-2 mb-4">
                  <button
                    type="button"
                    className={`btn flex-fill py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2 ${
                      method === 'CARD' ? 'btn-gradient fw-bold' : 'btn-glass text-light'
                    }`}
                    onClick={() => setMethod('CARD')}
                  >
                    <i className="bi bi-credit-card-2-front fs-5" /> Card
                  </button>
                  <button
                    type="button"
                    className={`btn flex-fill py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2 ${
                      method === 'WALLET' ? 'btn-gradient fw-bold' : 'btn-glass text-light'
                    }`}
                    onClick={() => setMethod('WALLET')}
                  >
                    <i className="bi bi-phone fs-5" /> Mobile Wallet
                  </button>
                  <button
                    type="button"
                    className={`btn flex-fill py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2 ${
                      method === 'NET_BANKING' ? 'btn-gradient fw-bold' : 'btn-glass text-light'
                    }`}
                    onClick={() => setMethod('NET_BANKING')}
                  >
                    <i className="bi bi-bank fs-5" /> Net Banking
                  </button>
                </div>

                <form onSubmit={handleProcessPayment}>
                  {method === 'CARD' && (
                    <div className="d-flex flex-column gap-3">
                      <div>
                        <label className="form-label text-muted small">Card Number</label>
                        <div className="input-icon">
                          <i className="bi bi-credit-card text-muted" />
                          <input
                            type="text"
                            className="form-control"
                            placeholder="4532 •••• •••• 8892"
                            value={cardNumber}
                            onChange={(e) => handleCardNumberChange(e.target.value)}
                            maxLength={19}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="form-label text-muted small">Name on Card</label>
                        <div className="input-icon">
                          <i className="bi bi-person text-muted" />
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. N. Perera"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="row g-3">
                        <div className="col-6">
                          <label className="form-label text-muted small">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            className="form-control text-center"
                            placeholder="12/28"
                            value={cardExpiry}
                            onChange={(e) => handleExpiryChange(e.target.value)}
                            maxLength={5}
                            required
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label text-muted small">CVV Code</label>
                          <input
                            type="password"
                            className="form-control text-center"
                            placeholder="•••"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>

                      <div className="small text-muted d-flex align-items-center gap-2 mt-2">
                        <i className="bi bi-shield-lock-fill text-success" />
                        <span>256-bit SSL encrypted. Mock payment processed instantly.</span>
                      </div>
                    </div>
                  )}

                  {method === 'WALLET' && (
                    <div className="d-flex flex-column gap-3">
                      <div>
                        <label className="form-label text-muted small">Select Wallet Provider</label>
                        <div className="d-flex gap-2 mb-2">
                          {['eZ Cash', 'FriMi', 'Genie'].map((w) => (
                            <button
                              key={w}
                              type="button"
                              className="btn btn-outline-light btn-sm rounded-pill px-3"
                              onClick={() => showToast({ type: 'info', message: `${w} selected` })}
                            >
                              {w}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="form-label text-muted small">Registered Mobile Number</label>
                        <div className="input-icon">
                          <i className="bi bi-telephone text-muted" />
                          <input
                            type="tel"
                            className="form-control"
                            placeholder="071 ••• ••••"
                            value={walletNumber}
                            onChange={(e) => setWalletNumber(e.target.value)}
                            required
                          />
                        </div>
                        <span className="small text-muted mt-1 d-block">
                          A confirmation prompt will be simulated to authorize {formatCurrency(booking.totalAmount)}.
                        </span>
                      </div>
                    </div>
                  )}

                  {method === 'NET_BANKING' && (
                    <div className="d-flex flex-column gap-3">
                      <div>
                        <label className="form-label text-muted small">Select Your Bank</label>
                        <select
                          className="form-select"
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                        >
                          <option value="Commercial Bank of Ceylon">Commercial Bank of Ceylon</option>
                          <option value="Bank of Ceylon">Bank of Ceylon</option>
                          <option value="Sampath Bank">Sampath Bank</option>
                          <option value="Hatton National Bank">Hatton National Bank (HNB)</option>
                          <option value="Nations Trust Bank">Nations Trust Bank</option>
                        </select>
                      </div>
                      <div className="p-3 rounded-3 bg-black bg-opacity-30 border border-secondary border-opacity-15 text-muted small">
                        <i className="bi bi-info-circle me-1 text-primary" />
                        You will be redirected to the mock banking portal to authorize this payment upon submission.
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-top border-secondary border-opacity-15">
                    <button
                      type="submit"
                      className="btn btn-gradient btn-lg w-100 rounded-pill fw-bold shadow d-flex align-items-center justify-content-center gap-2"
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <span className="spinner-border spinner-border-sm" aria-hidden />
                          Processing Transaction…
                        </>
                      ) : (
                        <>
                          <i className="bi bi-lock-fill" /> Pay {formatCurrency(booking.totalAmount)}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Order Summary (Right) */}
            <div className="col-lg-5">
              <div className="card-cine p-4">
                <h2 className="h5 fw-bold text-white mb-3 border-bottom border-secondary border-opacity-15 pb-2">
                  Order Summary
                </h2>

                <div className="d-flex gap-3 mb-3">
                  {show?.movie?.posterUrl && (
                    <img
                      src={show.movie.posterUrl}
                      alt={show.movie.title}
                      className="rounded-3 object-fit-cover"
                      style={{ width: 64, height: 90 }}
                    />
                  )}
                  <div>
                    <h3 className="h6 fw-bold text-white mb-1">{show?.movie?.title}</h3>
                    <div className="small text-muted mb-1">{show?.theatre?.name}</div>
                    <span className="badge bg-secondary-subtle text-secondary-emphasis me-1">{show?.screen}</span>
                    <span className="badge bg-primary bg-opacity-25 text-primary">{show?.format}</span>
                  </div>
                </div>

                <div className="d-flex flex-column gap-2 small text-muted border-top border-secondary border-opacity-15 py-3">
                  <div className="d-flex justify-content-between">
                    <span>Show Date:</span>
                    <strong className="text-white">{show ? formatDate(show.showDate) : ''}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Showtime:</span>
                    <strong className="text-white">{show ? formatTime(show.showTime) : ''}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Seats:</span>
                    <strong className="text-white">{booking.seatNumbers.join(', ')}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Number of Tickets:</span>
                    <strong className="text-white">{booking.numberOfTickets}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Status:</span>
                    <StatusBadge status={booking.status} />
                  </div>
                </div>

                <div className="border-top border-secondary border-opacity-15 pt-3">
                  <div className="d-flex justify-content-between align-items-baseline">
                    <span className="h6 fw-bold text-white mb-0">Total Payable:</span>
                    <span className="fs-3 fw-black text-warning">
                      {formatCurrency(booking.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
