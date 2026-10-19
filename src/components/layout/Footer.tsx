import { Link } from 'react-router-dom';
import { config } from '../../config';

export function Footer() {
  return (
    <footer className="footer-cine border-top border-secondary border-opacity-10 mt-auto py-5 bg-black bg-opacity-40">
      <div className="container-xl">
        <div className="row g-4 justify-content-between">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 text-white fw-bold"
                style={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #ff3d6e, #ff7a45)',
                }}
              >
                <i className="bi bi-film" />
              </div>
              <span className="fw-bold fs-4 text-white">Cine<span style={{ color: '#ff3d6e' }}>Book</span></span>
            </div>
            <p className="text-muted small pe-lg-4 mb-3">
              The next-generation cinema ticketing platform. Browse trending blockbusters, explore premium halls, reserve your favorite seats in real-time, and experience contactless entry.
            </p>
            <div className="d-flex align-items-center gap-2 text-muted small">
              <span className="badge bg-dark border border-secondary border-opacity-25 text-light">
                <i className="bi bi-cpu me-1 text-primary" /> React + TypeScript + Bootstrap
              </span>
            </div>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="text-white fw-semibold mb-3">Explore</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/movies" className="text-muted text-decoration-none hover-white">Now Showing</Link></li>
              <li><Link to="/movies?status=COMING_SOON" className="text-muted text-decoration-none hover-white">Upcoming Releases</Link></li>
              <li><Link to="/theatres" className="text-muted text-decoration-none hover-white">Our Theatres</Link></li>
              <li><Link to="/shows" className="text-muted text-decoration-none hover-white">Showtimes & Schedule</Link></li>
              <li><Link to="/future-enhancements" className="text-muted text-decoration-none hover-white">Future Enhancements</Link></li>
            </ul>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="text-white fw-semibold mb-3">Account & Help</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/bookings" className="text-muted text-decoration-none hover-white">My Bookings</Link></li>
              <li><Link to="/profile" className="text-muted text-decoration-none hover-white">Account Profile</Link></li>
              <li><Link to="/signin" className="text-muted text-decoration-none hover-white">Sign In</Link></li>
              <li><Link to="/signup" className="text-muted text-decoration-none hover-white">Register Account</Link></li>
              <li><Link to="/admin" className="text-muted text-decoration-none hover-white">Admin Portal</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-semibold mb-3">Booking Policy</h6>
            <div className="card-cine p-3 small mb-2">
              <div className="d-flex align-items-center gap-2 text-warning mb-1">
                <i className="bi bi-clock-history" />
                <span className="fw-semibold">Cancellation Cutoff</span>
              </div>
              <p className="text-muted mb-0" style={{ fontSize: '0.82rem' }}>
                Cancellations are accepted up to {config.cancellationCutoffHours} hours prior to showtime for a full refund.
              </p>
            </div>
            <div className="text-muted small mt-2">
              <i className="bi bi-shield-check text-success me-1" />
              Supported currency: <strong>{config.currency}</strong> (Sri Lankan Rupee)
            </div>
          </div>
        </div>

        <hr className="border-secondary border-opacity-15 my-4" />

        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 text-muted small">
          <div>
            &copy; {new Date().getFullYear()} CineBook. All rights reserved.
          </div>
          <div className="d-flex gap-3">
            <span className="text-secondary">Built with React, TypeScript & Bootstrap 5</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
