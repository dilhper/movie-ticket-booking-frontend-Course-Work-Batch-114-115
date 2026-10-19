import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { showService } from '../services/showService';
import type { Movie, Show } from '../types';
import { PosterImage } from '../components/common/PosterImage';
import { PageHeader } from '../components/common/PageHeader';
import { Loader } from '../components/common/Loader';
import { ErrorState, EmptyState } from '../components/common/Feedback';
import {
  formatDuration,
  formatCurrency,
  formatTime,
  upcomingDates,
  dayLabel,
  todayString,
  availabilityTone,
} from '../utils/format';

export function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(todayString());

  const dates = useMemo(() => upcomingDates(7), []);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [movieData, showsData] = await Promise.all([
          movieService.getById(id),
          showService.getAll({ movieId: id }),
        ]);
        setMovie(movieData);
        setShows(showsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Group shows by Theatre for the selected date
  const filteredShows = useMemo(() => {
    return shows.filter((s) => s.showDate === selectedDate);
  }, [shows, selectedDate]);

  const showsByTheatre = useMemo(() => {
    const map = new Map<number, { theatreName: string; theatreCity: string; shows: Show[] }>();
    filteredShows.forEach((show) => {
      const tId = show.theatreId;
      const tName = show.theatre?.name ?? `Theatre #${tId}`;
      const tCity = show.theatre?.city ?? '';
      if (!map.has(tId)) {
        map.set(tId, { theatreName: tName, theatreCity: tCity, shows: [] });
      }
      map.get(tId)!.shows.push(show);
    });
    return Array.from(map.values());
  }, [filteredShows]);

  if (loading) return <Loader fullPage label="Loading movie details and shows…" />;
  if (error || !movie) return <div className="container-xl py-5"><ErrorState message={error ?? 'Movie not found'} /></div>;

  return (
    <div className="movie-details-page fade-in-up pb-5">
      {/* Movie Details Header */}
      <div className="position-relative py-5 border-bottom border-secondary border-opacity-15 bg-black bg-opacity-40">
        <div className="container-xl">
          <PageHeader
            title=""
            crumbs={[
              { label: 'Home', to: '/' },
              { label: 'Movies', to: '/movies' },
              { label: movie.title },
            ]}
          />

          <div className="row g-4 align-items-center">
            <div className="col-12 col-md-4 col-lg-3">
              <div className="rounded-4 overflow-hidden shadow-2xl border border-secondary border-opacity-25" style={{ aspectRatio: '2 / 3' }}>
                <PosterImage
                  src={movie.posterUrl}
                  title={movie.title}
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
            </div>

            <div className="col-12 col-md-8 col-lg-9">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className={`badge rounded-pill ${movie.status === 'NOW_SHOWING' ? 'bg-danger text-white' : 'bg-info text-dark'}`}>
                  {movie.status === 'NOW_SHOWING' ? 'NOW SHOWING' : 'COMING SOON'}
                </span>
                <span className="badge rounded-pill bg-dark border border-secondary border-opacity-25 text-light">
                  {movie.genre}
                </span>
                <span className="badge rounded-pill bg-dark border border-secondary border-opacity-25 text-light">
                  {movie.language}
                </span>
                <span className="badge rounded-pill bg-secondary-subtle text-secondary-emphasis">
                  {movie.certificate}
                </span>
                <span className="text-warning small d-flex align-items-center gap-1 ms-2">
                  <i className="bi bi-star-fill" /> <strong>{movie.rating.toFixed(1)}</strong> / 10
                </span>
              </div>

              <h1 className="display-5 fw-black text-white mb-3">{movie.title}</h1>

              <div className="d-flex align-items-center gap-4 text-muted small mb-4">
                <div>
                  <i className="bi bi-clock me-1 text-primary" /> {formatDuration(movie.durationMinutes)}
                </div>
                <div>
                  <i className="bi bi-calendar3 me-1 text-primary" /> Release: {movie.releaseDate}
                </div>
              </div>

              <div className="card-cine p-3 p-md-4 mb-4">
                <h2 className="h6 fw-semibold text-white mb-2">Synopsis</h2>
                <p className="text-muted small mb-3 lh-base">{movie.description}</p>

                <div className="row g-3 small border-top border-secondary border-opacity-15 pt-3">
                  <div className="col-sm-6">
                    <span className="text-muted d-block mb-1">Director:</span>
                    <strong className="text-white">{movie.director}</strong>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted d-block mb-1">Cast:</span>
                    <span className="text-white">{movie.cast.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shows & Booking Schedule */}
      <div className="container-xl py-5">
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="h4 fw-bold text-white mb-1">Available Showtimes</h2>
            <p className="text-muted small mb-0">Select a date to view available cinema halls and reserve your seats</p>
          </div>
        </div>

        {/* Date Selector Pills */}
        <div className="d-flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-thin">
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
                onClick={() => setSelectedDate(dateStr)}
              >
                <span className="small opacity-75">{top}</span>
                <span className="fs-5 fw-bold lh-1 my-1">{day}</span>
                <span className="small opacity-75">{month}</span>
              </button>
            );
          })}
        </div>

        {/* Shows grouped by theatre */}
        {showsByTheatre.length === 0 ? (
          <EmptyState
            icon="bi-calendar-x"
            title="No shows scheduled for this date"
            message={`There are no available screening sessions for ${movie.title} on ${selectedDate}. Try selecting another date above.`}
          />
        ) : (
          <div className="d-flex flex-column gap-4">
            {showsByTheatre.map((group) => (
              <div key={group.theatreName} className="card-cine p-4">
                <div className="d-flex align-items-center justify-content-between border-bottom border-secondary border-opacity-15 pb-3 mb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="h5 fw-bold text-white mb-0">
                      <i className="bi bi-buildings me-2 text-primary" />
                      {group.theatreName}
                    </h3>
                    <span className="text-muted small">{group.theatreCity}</span>
                  </div>
                  <span className="badge bg-dark border border-secondary border-opacity-25 text-light small px-3 py-1.5">
                    {group.shows.length} screening{group.shows.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="row g-3">
                  {group.shows.map((show) => {
                    const tone = availabilityTone(show);
                    return (
                      <div key={show.id} className="col-12 col-md-6 col-lg-4">
                        <div className="p-3 rounded-4 bg-black bg-opacity-40 border border-secondary border-opacity-20 d-flex flex-column justify-content-between h-100">
                          <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                            <div>
                              <span className="badge bg-secondary-subtle text-secondary-emphasis me-1">
                                {show.screen}
                              </span>
                              <span className="badge bg-primary bg-opacity-25 text-primary fw-bold">
                                {show.format}
                              </span>
                            </div>
                            <span className="fw-bold text-white fs-6">
                              {formatCurrency(show.ticketPrice)}
                            </span>
                          </div>

                          <div className="d-flex align-items-center justify-content-between my-2">
                            <div className="fs-5 fw-bold text-white">
                              <i className="bi bi-clock me-1 text-primary" />
                              {formatTime(show.showTime)}
                            </div>
                            <span className={`small text-${tone} d-flex align-items-center gap-1`}>
                              <span className={`p-1 rounded-circle bg-${tone} d-inline-block`} />
                              {show.availableSeats} seats left
                            </span>
                          </div>

                          <Link
                            to={`/booking/${show.id}`}
                            className="btn btn-gradient btn-sm rounded-pill w-100 mt-2 d-flex align-items-center justify-content-center gap-1"
                          >
                            <i className="bi bi-grid-3x3-gap" /> Select Seats
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
