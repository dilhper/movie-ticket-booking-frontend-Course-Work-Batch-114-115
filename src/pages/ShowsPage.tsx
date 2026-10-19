import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { showService } from '../services/showService';
import { movieService } from '../services/movieService';
import { theatreService } from '../services/theatreService';
import type { Show, Movie, Theatre, ShowFormat } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { SkeletonGrid } from '../components/common/Loader';
import { EmptyState, ErrorState } from '../components/common/Feedback';
import {
  formatCurrency,
  formatTime,
  upcomingDates,
  dayLabel,
  todayString,
  availabilityTone,
} from '../utils/format';

export function ShowsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shows, setShows] = useState<Show[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedDate = searchParams.get('date') ?? todayString();
  const selectedMovieId = searchParams.get('movieId') ?? '';
  const selectedTheatreId = searchParams.get('theatreId') ?? '';
  const selectedFormat = (searchParams.get('format') ?? '') as ShowFormat | '';

  const dates = useMemo(() => upcomingDates(7), []);

  const updateParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [showsData, moviesData, theatresData] = await Promise.all([
        showService.getAll({
          movieId: selectedMovieId || undefined,
          theatreId: selectedTheatreId || undefined,
          date: selectedDate,
        }),
        movieService.getAll(),
        theatreService.getAll(),
      ]);
      setShows(showsData);
      setMovies(moviesData);
      setTheatres(theatresData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shows schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate, selectedMovieId, selectedTheatreId]);

  const filteredShows = useMemo(() => {
    return shows.filter((s) => {
      if (selectedFormat && s.format !== selectedFormat) return false;
      return true;
    });
  }, [shows, selectedFormat]);

  const handleReset = () => {
    setSearchParams(new URLSearchParams({ date: todayString() }));
  };

  return (
    <div className="container-xl py-4 fade-in-up">
      <PageHeader
        title="Cinema Shows Schedule"
        subtitle="Browse showtimes, screen formats, and book directly across all theatres"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Shows' }]}
        actions={
          <div className="badge bg-secondary-subtle text-secondary-emphasis px-3 py-2 rounded-pill">
            {filteredShows.length} Showtimes Available
          </div>
        }
      />

      {/* Date Carousel Selector */}
      <div className="card-cine p-3 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="small fw-semibold text-white">Select Screening Date</span>
          <span className="small text-muted">{selectedDate}</span>
        </div>
        <div className="d-flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {dates.map((dateStr) => {
            const { top, day, month } = dayLabel(dateStr);
            const isSelected = dateStr === selectedDate;
            return (
              <button
                key={dateStr}
                type="button"
                className={`btn date-pill d-flex flex-column align-items-center justify-content-center p-2 rounded-4 text-center transition-all ${
                  isSelected ? 'btn-gradient active-date shadow' : 'btn-glass text-light'
                }`}
                style={{ minWidth: 84 }}
                onClick={() => updateParam('date', dateStr)}
              >
                <span className="small opacity-75">{top}</span>
                <span className="fs-5 fw-bold lh-1 my-1">{day}</span>
                <span className="small opacity-75">{month}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Row */}
      <div className="card-cine p-3 p-md-4 mb-4">
        <div className="row g-2 g-md-3">
          <div className="col-12 col-md-4">
            <select
              className="form-select"
              value={selectedMovieId}
              onChange={(e) => updateParam('movieId', e.target.value)}
              aria-label="Filter by movie"
            >
              <option value="">All Movies</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-4">
            <select
              className="form-select"
              value={selectedTheatreId}
              onChange={(e) => updateParam('theatreId', e.target.value)}
              aria-label="Filter by theatre"
            >
              <option value="">All Theatres</option>
              {theatres.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={selectedFormat}
              onChange={(e) => updateParam('format', e.target.value)}
              aria-label="Filter by format"
            >
              <option value="">All Formats</option>
              <option value="2D">2D</option>
              <option value="3D">3D</option>
              <option value="IMAX">IMAX</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <button
              type="button"
              className="btn btn-outline-secondary w-100 rounded-pill"
              onClick={handleReset}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={loadData} />}

      {loading ? (
        <SkeletonGrid count={6} />
      ) : filteredShows.length === 0 ? (
        <EmptyState
          icon="bi-calendar2-x"
          title="No shows found"
          message="No screening sessions match the selected movie, theatre, date, or format criteria. Please try another combination."
          action={
            <button type="button" className="btn btn-outline-light rounded-pill px-4" onClick={handleReset}>
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="row g-4">
          {filteredShows.map((show) => {
            const tone = availabilityTone(show);
            const movie = show.movie;
            const theatre = show.theatre;

            return (
              <div key={show.id} className="col-12 col-md-6 col-lg-4">
                <div className="card-cine p-3.5 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex gap-3 mb-3">
                      {movie?.posterUrl && (
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="rounded-3 object-fit-cover flex-shrink-0"
                          style={{ width: 68, height: 96 }}
                        />
                      )}
                      <div className="overflow-hidden">
                        <span className="badge bg-primary bg-opacity-25 text-primary fw-bold mb-1">
                          {show.format}
                        </span>
                        <h3 className="h6 fw-bold text-white mb-1 text-truncate" title={movie?.title ?? 'Movie'}>
                          {movie ? (
                            <Link to={`/movies/${movie.id}`} className="text-white text-decoration-none hover-primary">
                              {movie.title}
                            </Link>
                          ) : (
                            `Movie #${show.movieId}`
                          )}
                        </h3>
                        <p className="text-muted small mb-1 text-truncate">
                          <i className="bi bi-buildings me-1 text-primary" /> {theatre?.name ?? `Theatre #${show.theatreId}`}
                        </p>
                        <p className="text-muted small mb-0">
                          <span className="badge bg-secondary-subtle text-secondary-emphasis">
                            {show.screen}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between p-2.5 rounded-3 bg-black bg-opacity-30 border border-secondary border-opacity-15 mb-3">
                      <div>
                        <div className="small text-muted">Showtime</div>
                        <div className="fs-5 fw-bold text-white">
                          <i className="bi bi-clock me-1 text-primary" /> {formatTime(show.showTime)}
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="small text-muted">Ticket Price</div>
                        <div className="fs-5 fw-bold text-warning">
                          {formatCurrency(show.ticketPrice)}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between text-muted small mb-3">
                      <span className={`text-${tone} d-flex align-items-center gap-1`}>
                        <span className={`p-1 rounded-circle bg-${tone} d-inline-block`} />
                        {show.availableSeats} of {show.totalSeats} seats free
                      </span>
                      <span>Total: {show.rows}x{show.seatsPerRow}</span>
                    </div>
                  </div>

                  <Link
                    to={`/booking/${show.id}`}
                    className="btn btn-gradient btn-sm rounded-pill w-100 d-flex align-items-center justify-content-center gap-1"
                  >
                    <i className="bi bi-grid-3x3-gap" /> Book This Show
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
