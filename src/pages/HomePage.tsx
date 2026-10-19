import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import type { Movie } from '../types';
import { MovieCard } from '../components/movies/MovieCard';
import { SkeletonGrid } from '../components/common/Loader';
import { ErrorState } from '../components/common/Feedback';

export function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await movieService.getAll();
      setMovies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const nowShowing = movies.filter((m) => m.status === 'NOW_SHOWING');
  const comingSoon = movies.filter((m) => m.status === 'COMING_SOON');
  const featured = nowShowing[0] || movies[0];

  return (
    <div className="home-page fade-in-up">
      {/* Hero Banner */}
      <section className="position-relative overflow-hidden hero-section py-5 py-lg-6 mb-5 border-bottom border-secondary border-opacity-15">
        <div
          className="position-absolute top-0 start-0 w-100 h-100 z-n1"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(7,7,13,0.95) 0%, rgba(7,7,13,0.8) 50%, rgba(7,7,13,0.6) 100%), url('/images/hero_cinema_hall.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.65)',
          }}
        />

        <div className="container-xl">
          <div className="row align-items-center g-4 py-4">
            <div className="col-lg-7">
              <span className="badge rounded-pill bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 px-3 py-1.5 mb-3 fw-semibold">
                <i className="bi bi-fire me-1" /> CINEMA TICKETING REDEFINED
              </span>
              <h1 className="display-4 fw-black text-white lh-1 mb-3">
                Book Blockbusters, Pick Prime Seats, Live the Spectacle.
              </h1>
              <p className="lead text-muted mb-4" style={{ maxWidth: 540 }}>
                Explore the latest cinematic releases across Sri Lanka's finest theatres. Instant seat reservations, seamless checkout, and digital ticket passes right on your screen.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <Link to="/movies" className="btn btn-gradient btn-lg px-4 rounded-pill fw-semibold shadow-lg">
                  <i className="bi bi-play-circle-fill me-2" /> Browse All Movies
                </Link>
                <Link to="/theatres" className="btn btn-glass btn-lg px-4 rounded-pill text-white">
                  <i className="bi bi-geo-alt-fill me-2" /> Find Theatres
                </Link>
              </div>

              <div className="row g-3 mt-4 pt-3 border-top border-secondary border-opacity-20 text-muted small">
                <div className="col-auto d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill text-success fs-5" />
                  <span>Real-time Interactive Seats</span>
                </div>
                <div className="col-auto d-flex align-items-center gap-2">
                  <i className="bi bi-shield-check text-info fs-5" />
                  <span>Secure JWT Auth</span>
                </div>
                <div className="col-auto d-flex align-items-center gap-2">
                  <i className="bi bi-lightning-charge-fill text-warning fs-5" />
                  <span>Instant Booking Pass</span>
                </div>
              </div>
            </div>

            {featured && (
              <div className="col-lg-5 d-none d-lg-block">
                <div className="card-cine p-3 shadow-2xl position-relative overflow-hidden border border-secondary border-opacity-30">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge bg-warning text-dark fw-bold">SPOTLIGHT FEATURE</span>
                    <span className="text-warning small d-flex align-items-center gap-1">
                      <i className="bi bi-star-fill" /> {featured.rating.toFixed(1)} / 10
                    </span>
                  </div>
                  <div className="rounded-3 overflow-hidden mb-3" style={{ height: 260 }}>
                    <img
                      src={featured.posterUrl}
                      alt={featured.title}
                      className="w-100 h-100 object-fit-cover"
                    />
                  </div>
                  <h3 className="h5 fw-bold text-white mb-1">{featured.title}</h3>
                  <p className="text-muted small mb-3 line-clamp-2">{featured.description}</p>
                  <Link to={`/movies/${featured.id}`} className="btn btn-gradient w-100 rounded-pill">
                    <i className="bi bi-ticket-perforated me-1" /> Book {featured.title}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="container-xl mb-5">
        {/* Error Handling */}
        {error && <ErrorState message={error} onRetry={loadMovies} />}

        {/* Now Showing Section */}
        <section className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <span className="text-primary text-uppercase fw-bold small tracking-wider">In Theatres Now</span>
              <h2 className="h3 fw-bold text-white m-0">Now Showing</h2>
            </div>
            <Link to="/movies" className="btn btn-outline-light btn-sm rounded-pill px-3">
              View All <i className="bi bi-arrow-right ms-1" />
            </Link>
          </div>

          {loading ? (
            <SkeletonGrid count={4} />
          ) : (
            <div className="row g-4">
              {nowShowing.slice(0, 4).map((movie) => (
                <div key={movie.id} className="col-6 col-md-4 col-lg-3">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-4 my-5 card-cine p-4 p-md-5">
          <div className="text-center mb-4">
            <span className="badge bg-primary bg-opacity-20 text-primary px-3 py-1 rounded-pill mb-2">
              WHY CHOOSE CINEBOOK
            </span>
            <h2 className="h3 fw-bold text-white">The Ultimate Movie Experience</h2>
            <p className="text-muted small mx-auto" style={{ maxWidth: 500 }}>
              Engineered with modern web technologies to give cinephiles the fastest seat-booking workflow in Sri Lanka.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="p-3 rounded-4 bg-black bg-opacity-30 border border-secondary border-opacity-15 h-100">
                <div className="p-2.5 rounded-3 bg-danger bg-opacity-20 text-danger d-inline-block mb-3">
                  <i className="bi bi-grid-3x3-gap-fill fs-4" />
                </div>
                <h3 className="h6 fw-bold text-white mb-2">Live Cinema Seat Maps</h3>
                <p className="text-muted small mb-0">
                  Pick your exact row and seat number with immediate seat status, pricing updates, and screen layout orientation.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3 rounded-4 bg-black bg-opacity-30 border border-secondary border-opacity-15 h-100">
                <div className="p-2.5 rounded-3 bg-warning bg-opacity-20 text-warning d-inline-block mb-3">
                  <i className="bi bi-credit-card-2-front-fill fs-4" />
                </div>
                <h3 className="h6 fw-bold text-white mb-2">Multiple Payment Options</h3>
                <p className="text-muted small mb-0">
                  Support for Credit/Debit Cards, digital wallets, and bank transfer with full transaction logs and instant receipts.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3 rounded-4 bg-black bg-opacity-30 border border-secondary border-opacity-15 h-100">
                <div className="p-2.5 rounded-3 bg-success bg-opacity-20 text-success d-inline-block mb-3">
                  <i className="bi bi-arrow-counterclockwise fs-4" />
                </div>
                <h3 className="h6 fw-bold text-white mb-2">Flexible Cancellations</h3>
                <p className="text-muted small mb-0">
                  Cancel eligible bookings up to 2 hours prior to showtime directly from your account with automatic refund handling.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Coming Soon Section */}
        {comingSoon.length > 0 && (
          <section className="mb-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <span className="text-warning text-uppercase fw-bold small tracking-wider">Anticipated Releases</span>
                <h2 className="h3 fw-bold text-white m-0">Coming Soon</h2>
              </div>
              <Link to="/movies?status=COMING_SOON" className="btn btn-outline-light btn-sm rounded-pill px-3">
                View All <i className="bi bi-arrow-right ms-1" />
              </Link>
            </div>

            {loading ? (
              <SkeletonGrid count={4} />
            ) : (
              <div className="row g-4">
                {comingSoon.slice(0, 4).map((movie) => (
                  <div key={movie.id} className="col-6 col-md-4 col-lg-3">
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
