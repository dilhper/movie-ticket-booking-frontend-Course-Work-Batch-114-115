import { Link } from 'react-router-dom';
import type { Movie } from '../../types';
import { PosterImage } from '../common/PosterImage';
import { formatDuration } from '../../utils/format';

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const isNowShowing = movie.status === 'NOW_SHOWING';

  return (
    <div className="card-cine movie-card h-100 d-flex flex-column overflow-hidden transition-all">
      <div className="position-relative overflow-hidden" style={{ aspectRatio: '2 / 3' }}>
        <PosterImage
          src={movie.posterUrl}
          title={movie.title}
          className="w-100 h-100 object-fit-cover movie-poster-img"
        />
        <div className="position-absolute top-0 start-0 m-2 d-flex flex-column gap-1">
          <span
            className={`badge rounded-pill ${
              isNowShowing ? 'bg-danger text-white' : 'bg-info text-dark'
            } fw-semibold shadow-sm`}
          >
            {isNowShowing ? 'NOW SHOWING' : 'COMING SOON'}
          </span>
          <span className="badge rounded-pill bg-dark bg-opacity-75 text-light border border-secondary border-opacity-25 backdrop-blur">
            {movie.language}
          </span>
        </div>

        <div className="position-absolute top-0 end-0 m-2">
          <span className="badge rounded-pill bg-black bg-opacity-75 text-warning border border-warning border-opacity-25 d-flex align-items-center gap-1 shadow-sm px-2 py-1">
            <i className="bi bi-star-fill text-warning" />
            <strong className="text-white">{movie.rating.toFixed(1)}</strong>
          </span>
        </div>

        <div className="movie-card-overlay d-flex flex-column justify-content-end p-3">
          <p className="text-white small mb-2 line-clamp-3 opacity-90">
            {movie.description}
          </p>
          <Link
            to={`/movies/${movie.id}`}
            className="btn btn-sm btn-outline-light w-100 rounded-pill"
          >
            <i className="bi bi-info-circle me-1" /> Quick View
          </Link>
        </div>
      </div>

      <div className="card-body p-3 d-flex flex-column flex-grow-1">
        <div className="d-flex align-items-center justify-content-between gap-1 text-muted small mb-1">
          <span className="badge bg-secondary-subtle text-secondary-emphasis">{movie.genre}</span>
          <span className="small">{movie.certificate} &bull; {formatDuration(movie.durationMinutes)}</span>
        </div>

        <h3 className="h6 fw-bold text-white mb-2 text-truncate" title={movie.title}>
          <Link to={`/movies/${movie.id}`} className="text-white text-decoration-none hover-primary">
            {movie.title}
          </Link>
        </h3>

        <div className="mt-auto pt-2">
          {isNowShowing ? (
            <Link
              to={`/movies/${movie.id}`}
              className="btn btn-gradient btn-sm w-100 rounded-pill d-flex align-items-center justify-content-center gap-1.5 shadow-sm"
            >
              <i className="bi bi-ticket-perforated" /> Book Tickets
            </Link>
          ) : (
            <Link
              to={`/movies/${movie.id}`}
              className="btn btn-outline-secondary btn-sm w-100 rounded-pill d-flex align-items-center justify-content-center gap-1"
            >
              <i className="bi bi-bell me-1" /> Release Info
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
