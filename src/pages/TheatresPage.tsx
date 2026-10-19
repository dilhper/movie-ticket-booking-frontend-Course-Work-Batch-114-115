import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { theatreService } from '../services/theatreService';
import type { Theatre } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { SkeletonGrid } from '../components/common/Loader';
import { EmptyState, ErrorState } from '../components/common/Feedback';

export function TheatresPage() {
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');

  const loadTheatres = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await theatreService.getAll();
      setTheatres(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch theatres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTheatres();
  }, []);

  const cities = useMemo(() => {
    return Array.from(new Set(theatres.map((t) => t.city))).sort();
  }, [theatres]);

  const filtered = useMemo(() => {
    return theatres.filter((t) => {
      if (selectedCity !== 'ALL' && t.city !== selectedCity) return false;
      if (search) {
        const q = search.toLowerCase();
        return t.name.toLowerCase().includes(q) || t.address.toLowerCase().includes(q) || t.city.toLowerCase().includes(q);
      }
      return true;
    });
  }, [theatres, selectedCity, search]);

  return (
    <div className="container-xl py-4 fade-in-up">
      <PageHeader
        title="Our Cinema Theatres"
        subtitle="Discover state-of-the-art cinema destinations across Sri Lanka"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Theatres' }]}
        actions={
          <div className="badge bg-secondary-subtle text-secondary-emphasis px-3 py-2 rounded-pill">
            {theatres.length} Cinema Locations
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="card-cine p-3 p-md-4 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-6">
            <div className="input-icon">
              <i className="bi bi-search text-muted" aria-hidden />
              <input
                type="text"
                className="form-control"
                placeholder="Search by theatre name, address, or landmark…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="d-flex flex-wrap gap-2 justify-content-md-end">
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 ${selectedCity === 'ALL' ? 'btn-gradient fw-semibold' : 'btn-glass text-light'}`}
                onClick={() => setSelectedCity('ALL')}
              >
                All Cities
              </button>
              {cities.map((city) => (
                <button
                  key={city}
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 ${selectedCity === city ? 'btn-gradient fw-semibold' : 'btn-glass text-light'}`}
                  onClick={() => setSelectedCity(city)}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={loadTheatres} />}

      {loading ? (
        <SkeletonGrid count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="bi-buildings"
          title="No theatres found"
          message="No theatre matched your query. Try resetting your search or city filter."
          action={
            <button
              type="button"
              className="btn btn-outline-light rounded-pill px-4"
              onClick={() => {
                setSearch('');
                setSelectedCity('ALL');
              }}
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="row g-4">
          {filtered.map((theatre) => (
            <div key={theatre.id} className="col-12 col-md-6 col-lg-4">
              <div className="card-cine p-4 h-100 d-flex flex-column justify-content-between transition-all hover-scale">
                <div>
                  <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                    <span className="badge bg-primary bg-opacity-20 text-primary border border-primary border-opacity-30 rounded-pill px-2.5 py-1">
                      <i className="bi bi-geo-alt-fill me-1" /> {theatre.city}
                    </span>
                    <span className="badge bg-dark border border-secondary border-opacity-25 text-light">
                      {theatre.screens} Screen{theatre.screens > 1 ? 's' : ''}
                    </span>
                  </div>

                  <h3 className="h5 fw-bold text-white mb-2">{theatre.name}</h3>
                  <p className="text-muted small mb-3">
                    <i className="bi bi-pin-map me-1 text-danger" /> {theatre.address}
                  </p>

                  {theatre.contactNumber && (
                    <div className="text-muted small mb-3">
                      <i className="bi bi-telephone me-1 text-success" /> {theatre.contactNumber}
                    </div>
                  )}

                  <div className="mb-3">
                    <div className="text-white-50 small fw-semibold mb-2">Facilities & Sound:</div>
                    <div className="d-flex flex-wrap gap-1.5">
                      {theatre.facilities.map((fac) => (
                        <span key={fac} className="badge bg-dark bg-opacity-70 text-light border border-secondary border-opacity-20 small">
                          <i className="bi bi-check2 text-primary me-1" /> {fac}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-top border-secondary border-opacity-15 pt-3 mt-auto">
                  <Link
                    to={`/shows?theatreId=${theatre.id}`}
                    className="btn btn-gradient btn-sm rounded-pill w-100 d-flex align-items-center justify-content-center gap-1.5"
                  >
                    <i className="bi bi-calendar-event" /> View Scheduled Shows
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
