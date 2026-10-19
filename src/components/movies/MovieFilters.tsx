import type { MovieStatus } from '../../types';

interface MovieFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: 'ALL' | MovieStatus;
  onStatusChange: (status: 'ALL' | MovieStatus) => void;
  genre: string;
  onGenreChange: (genre: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  genres: string[];
  languages: string[];
  onReset: () => void;
}

export function MovieFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  genre,
  onGenreChange,
  language,
  onLanguageChange,
  genres,
  languages,
  onReset,
}: MovieFiltersProps) {
  const hasFilters = search || status !== 'ALL' || genre || language;

  return (
    <div className="card-cine p-3 p-md-4 mb-4">
      {/* Status tabs */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 border-bottom border-secondary border-opacity-15 pb-3">
        <div className="btn-group p-1 bg-black bg-opacity-40 rounded-pill border border-secondary border-opacity-25">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 ${status === 'ALL' ? 'btn-gradient fw-semibold' : 'btn-link text-muted text-decoration-none'}`}
            onClick={() => onStatusChange('ALL')}
          >
            All Movies
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 ${status === 'NOW_SHOWING' ? 'btn-gradient fw-semibold' : 'btn-link text-muted text-decoration-none'}`}
            onClick={() => onStatusChange('NOW_SHOWING')}
          >
            Now Showing
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 ${status === 'COMING_SOON' ? 'btn-gradient fw-semibold' : 'btn-link text-muted text-decoration-none'}`}
            onClick={() => onStatusChange('COMING_SOON')}
          >
            Coming Soon
          </button>
        </div>

        {hasFilters && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-1"
            onClick={onReset}
          >
            <i className="bi bi-x-circle" /> Clear Filters
          </button>
        )}
      </div>

      {/* Inputs row */}
      <div className="row g-2 g-md-3">
        <div className="col-12 col-md-5">
          <div className="input-icon">
            <i className="bi bi-search text-muted" aria-hidden />
            <input
              type="text"
              className="form-control"
              placeholder="Search by movie title, actor, or director…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div className="col-6 col-md-3">
          <select
            className="form-select"
            value={genre}
            onChange={(e) => onGenreChange(e.target.value)}
            aria-label="Filter by genre"
          >
            <option value="">All Genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="col-6 col-md-4">
          <select
            className="form-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            aria-label="Filter by language"
          >
            <option value="">All Languages</option>
            {languages.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
