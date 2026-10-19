import { useEffect, useState } from 'react';
import { movieService } from '../services/movieService';
import { theatreService } from '../services/theatreService';
import { showService } from '../services/showService';
import { bookingService } from '../services/bookingService';
import type { Movie, Theatre, Show, Booking, MoviePayload, TheatrePayload, ShowPayload, MovieStatus, ShowFormat } from '../types';
import { useToast } from '../hooks/useToast';
import { PageHeader } from '../components/common/PageHeader';
import { Loader } from '../components/common/Loader';
import { ErrorState } from '../components/common/Feedback';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal, ConfirmDialog } from '../components/common/Modal';
import { TextField, SelectField, TextAreaField } from '../components/common/FormFields';
import { formatCurrency, formatDate, formatTime, todayString } from '../utils/format';

export function AdminPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'MOVIES' | 'THEATRES' | 'SHOWS' | 'BOOKINGS'>('MOVIES');

  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [movieModalOpen, setMovieModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [theatreModalOpen, setTheatreModalOpen] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState<Theatre | null>(null);
  const [showModalOpen, setShowModalOpen] = useState(false);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'MOVIE' | 'THEATRE' | 'SHOW'; id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Movie form
  const [movieTitle, setMovieTitle] = useState('');
  const [movieDesc, setMovieDesc] = useState('');
  const [movieGenre, setMovieGenre] = useState('Action');
  const [movieLanguage, setMovieLanguage] = useState('English');
  const [movieDuration, setMovieDuration] = useState(120);
  const [movieCert, setMovieCert] = useState('PG-13');
  const [movieRelease, setMovieRelease] = useState(todayString());
  const [movieRating, setMovieRating] = useState(8.0);
  const [movieDirector, setMovieDirector] = useState('');
  const [movieCast, setMovieCast] = useState('');
  const [movieStatus, setMovieStatus] = useState<MovieStatus>('NOW_SHOWING');
  const [moviePoster, setMoviePoster] = useState('/images/poster_neon_horizon.jpg');

  // Theatre form
  const [theatreName, setTheatreName] = useState('');
  const [theatreCity, setTheatreCity] = useState('Colombo');
  const [theatreAddress, setTheatreAddress] = useState('');
  const [theatreScreens, setTheatreScreens] = useState(3);
  const [theatreFacilities, setTheatreFacilities] = useState('Dolby Atmos, IMAX, Parking');
  const [theatreContact, setTheatreContact] = useState('');

  // Show form
  const [showMovieId, setShowMovieId] = useState<number>(0);
  const [showTheatreId, setShowTheatreId] = useState<number>(0);
  const [showDate, setShowDate] = useState(todayString());
  const [showTime, setShowTime] = useState('14:30');
  const [showScreen, setShowScreen] = useState('Screen 1');
  const [showFormat, setShowFormat] = useState<ShowFormat>('2D');
  const [showPrice, setShowPrice] = useState(1500);
  const [showRows, setShowRows] = useState(8);
  const [showSeatsPerRow, setShowSeatsPerRow] = useState(12);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [m, t, s, b] = await Promise.all([
        movieService.getAll(),
        theatreService.getAll(),
        showService.getAll({ includePast: true }),
        bookingService.getAll(),
      ]);
      setMovies(m);
      setTheatres(t);
      setShows(s);
      setBookings(b);
      if (m[0]) setShowMovieId(m[0].id);
      if (t[0]) setShowTheatreId(t[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admin resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Movie Handlers
  const openAddMovieModal = () => {
    setEditingMovie(null);
    setMovieTitle('');
    setMovieDesc('');
    setMovieGenre('Action');
    setMovieLanguage('English');
    setMovieDuration(120);
    setMovieCert('PG-13');
    setMovieRelease(todayString());
    setMovieRating(8.0);
    setMovieDirector('');
    setMovieCast('');
    setMovieStatus('NOW_SHOWING');
    setMoviePoster('/images/poster_neon_horizon.jpg');
    setMovieModalOpen(true);
  };

  const openEditMovieModal = (m: Movie) => {
    setEditingMovie(m);
    setMovieTitle(m.title);
    setMovieDesc(m.description);
    setMovieGenre(m.genre);
    setMovieLanguage(m.language);
    setMovieDuration(m.durationMinutes);
    setMovieCert(m.certificate);
    setMovieRelease(m.releaseDate);
    setMovieRating(m.rating);
    setMovieDirector(m.director);
    setMovieCast(m.cast.join(', '));
    setMovieStatus(m.status);
    setMoviePoster(m.posterUrl);
    setMovieModalOpen(true);
  };

  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: MoviePayload = {
      title: movieTitle,
      description: movieDesc,
      genre: movieGenre,
      language: movieLanguage,
      durationMinutes: Number(movieDuration),
      certificate: movieCert,
      releaseDate: movieRelease,
      posterUrl: moviePoster || '/images/poster_neon_horizon.jpg',
      rating: Number(movieRating),
      director: movieDirector,
      cast: movieCast.split(',').map((s) => s.trim()).filter(Boolean),
      status: movieStatus,
    };

    try {
      if (editingMovie) {
        const updated = await movieService.update(editingMovie.id, payload);
        setMovies((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        showToast({ type: 'success', title: 'Movie Updated', message: `${updated.title} was updated.` });
      } else {
        const created = await movieService.create(payload);
        setMovies((prev) => [created, ...prev]);
        showToast({ type: 'success', title: 'Movie Created', message: `${created.title} added to catalog.` });
      }
      setMovieModalOpen(false);
    } catch (err) {
      showToast({ type: 'danger', title: 'Error', message: err instanceof Error ? err.message : 'Could not save movie' });
    }
  };

  // Theatre Handlers
  const openAddTheatreModal = () => {
    setEditingTheatre(null);
    setTheatreName('');
    setTheatreCity('Colombo');
    setTheatreAddress('');
    setTheatreScreens(3);
    setTheatreFacilities('Dolby Atmos, IMAX, Parking');
    setTheatreContact('');
    setTheatreModalOpen(true);
  };

  const openEditTheatreModal = (t: Theatre) => {
    setEditingTheatre(t);
    setTheatreName(t.name);
    setTheatreCity(t.city);
    setTheatreAddress(t.address);
    setTheatreScreens(t.screens);
    setTheatreFacilities(t.facilities.join(', '));
    setTheatreContact(t.contactNumber ?? '');
    setTheatreModalOpen(true);
  };

  const handleSaveTheatre = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: TheatrePayload = {
      name: theatreName,
      city: theatreCity,
      address: theatreAddress,
      screens: Number(theatreScreens),
      facilities: theatreFacilities.split(',').map((s) => s.trim()).filter(Boolean),
      contactNumber: theatreContact,
    };

    try {
      if (editingTheatre) {
        const updated = await theatreService.update(editingTheatre.id, payload);
        setTheatres((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        showToast({ type: 'success', title: 'Theatre Updated', message: `${updated.name} updated.` });
      } else {
        const created = await theatreService.create(payload);
        setTheatres((prev) => [...prev, created]);
        showToast({ type: 'success', title: 'Theatre Added', message: `${created.name} added.` });
      }
      setTheatreModalOpen(false);
    } catch (err) {
      showToast({ type: 'danger', title: 'Error', message: err instanceof Error ? err.message : 'Could not save theatre' });
    }
  };

  // Show Handlers
  const handleSaveShow = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ShowPayload = {
      movieId: Number(showMovieId),
      theatreId: Number(showTheatreId),
      showDate,
      showTime,
      screen: showScreen,
      format: showFormat,
      ticketPrice: Number(showPrice),
      rows: Number(showRows),
      seatsPerRow: Number(showSeatsPerRow),
    };

    try {
      const created = await showService.create(payload);
      setShows((prev) => [created, ...prev]);
      showToast({ type: 'success', title: 'Show Scheduled', message: `Screening scheduled for ${showDate} at ${showTime}.` });
      setShowModalOpen(false);
    } catch (err) {
      showToast({ type: 'danger', title: 'Error', message: err instanceof Error ? err.message : 'Could not schedule show' });
    }
  };

  // Deletion Handlers
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      if (deleteTarget.type === 'MOVIE') {
        await movieService.remove(deleteTarget.id);
        setMovies((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      } else if (deleteTarget.type === 'THEATRE') {
        await theatreService.remove(deleteTarget.id);
        setTheatres((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      } else if (deleteTarget.type === 'SHOW') {
        await showService.remove(deleteTarget.id);
        setShows((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      }
      showToast({ type: 'success', title: 'Deleted', message: `${deleteTarget.name} has been removed.` });
      setDeleteTarget(null);
    } catch (err) {
      showToast({ type: 'danger', title: 'Delete Failed', message: err instanceof Error ? err.message : 'Could not delete item' });
    } finally {
      setIsDeleting(false);
    }
  };

  const totalRevenue = bookings
    .filter((b) => b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  if (loading) return <Loader fullPage label="Loading administrative consoles & metrics…" />;

  return (
    <div className="container-xl py-4 fade-in-up pb-5">
      <PageHeader
        title="Admin Control Center"
        subtitle="Manage movie catalog, cinema halls, show schedules, and customer reservations"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Admin Portal' }]}
        actions={
          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
            <i className="bi bi-shield-lock-fill me-1" /> ROLE: ADMINISTRATOR
          </span>
        }
      />

      {error && <ErrorState message={error} onRetry={loadAll} />}

      {/* Top Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card-cine p-3 text-center">
            <span className="small text-muted d-block">Total Movies</span>
            <span className="fs-3 fw-black text-white">{movies.length}</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card-cine p-3 text-center">
            <span className="small text-muted d-block">Cinema Theatres</span>
            <span className="fs-3 fw-black text-white">{theatres.length}</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card-cine p-3 text-center">
            <span className="small text-muted d-block">Scheduled Shows</span>
            <span className="fs-3 fw-black text-white">{shows.length}</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card-cine p-3 text-center">
            <span className="small text-muted d-block">Gross Revenue</span>
            <span className="fs-3 fw-black text-warning">{formatCurrency(totalRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div className="btn-group p-1 bg-black bg-opacity-40 rounded-pill border border-secondary border-opacity-25">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3.5 ${activeTab === 'MOVIES' ? 'btn-gradient fw-semibold' : 'btn-link text-muted text-decoration-none'}`}
            onClick={() => setActiveTab('MOVIES')}
          >
            <i className="bi bi-film me-1" /> Movies ({movies.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3.5 ${activeTab === 'THEATRES' ? 'btn-gradient fw-semibold' : 'btn-link text-muted text-decoration-none'}`}
            onClick={() => setActiveTab('THEATRES')}
          >
            <i className="bi bi-buildings me-1" /> Theatres ({theatres.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3.5 ${activeTab === 'SHOWS' ? 'btn-gradient fw-semibold' : 'btn-link text-muted text-decoration-none'}`}
            onClick={() => setActiveTab('SHOWS')}
          >
            <i className="bi bi-calendar-check me-1" /> Shows ({shows.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3.5 ${activeTab === 'BOOKINGS' ? 'btn-gradient fw-semibold' : 'btn-link text-muted text-decoration-none'}`}
            onClick={() => setActiveTab('BOOKINGS')}
          >
            <i className="bi bi-ticket-detailed me-1" /> Bookings ({bookings.length})
          </button>
        </div>

        <div>
          {activeTab === 'MOVIES' && (
            <button type="button" className="btn btn-gradient btn-sm rounded-pill px-3" onClick={openAddMovieModal}>
              <i className="bi bi-plus-lg me-1" /> Add Movie
            </button>
          )}
          {activeTab === 'THEATRES' && (
            <button type="button" className="btn btn-gradient btn-sm rounded-pill px-3" onClick={openAddTheatreModal}>
              <i className="bi bi-plus-lg me-1" /> Add Theatre
            </button>
          )}
          {activeTab === 'SHOWS' && (
            <button type="button" className="btn btn-gradient btn-sm rounded-pill px-3" onClick={() => setShowModalOpen(true)}>
              <i className="bi bi-plus-lg me-1" /> Schedule Show
            </button>
          )}
        </div>
      </div>
      {/*  Tab 1: Movies Table                                              */}
      {activeTab === 'MOVIES' && (
        <div className="card-cine p-3 p-md-4 overflow-x-auto">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr className="text-muted small">
                <th>Movie</th>
                <th>Genre & Cert</th>
                <th>Duration</th>
                <th>Rating</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={m.posterUrl}
                        alt={m.title}
                        className="rounded object-fit-cover"
                        style={{ width: 36, height: 50 }}
                      />
                      <div>
                        <div className="fw-bold text-white">{m.title}</div>
                        <div className="small text-muted">{m.language} &bull; Dir: {m.director}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-secondary-subtle text-secondary-emphasis me-1">{m.genre}</span>
                    <span className="badge bg-dark border border-secondary border-opacity-30">{m.certificate}</span>
                  </td>
                  <td>{m.durationMinutes} mins</td>
                  <td>
                    <span className="text-warning small d-flex align-items-center gap-1">
                      <i className="bi bi-star-fill" /> {m.rating.toFixed(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge rounded-pill ${m.status === 'NOW_SHOWING' ? 'bg-danger text-white' : 'bg-info text-dark'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-outline-light btn-sm me-1 rounded-pill"
                      onClick={() => openEditMovieModal(m)}
                    >
                      <i className="bi bi-pencil" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm rounded-pill"
                      onClick={() => setDeleteTarget({ type: 'MOVIE', id: m.id, name: m.title })}
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/*  Tab 2: Theatres Table                                            */}
      {activeTab === 'THEATRES' && (
        <div className="card-cine p-3 p-md-4 overflow-x-auto">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr className="text-muted small">
                <th>Theatre Name</th>
                <th>City</th>
                <th>Address</th>
                <th>Screens</th>
                <th>Facilities</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {theatres.map((t) => (
                <tr key={t.id}>
                  <td className="fw-bold text-white">{t.name}</td>
                  <td>
                    <span className="badge bg-primary bg-opacity-20 text-primary">{t.city}</span>
                  </td>
                  <td className="small text-muted">{t.address}</td>
                  <td>{t.screens} screens</td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {t.facilities.map((f) => (
                        <span key={f} className="badge bg-dark border border-secondary border-opacity-30 small">
                          {f}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-outline-light btn-sm me-1 rounded-pill"
                      onClick={() => openEditTheatreModal(t)}
                    >
                      <i className="bi bi-pencil" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm rounded-pill"
                      onClick={() => setDeleteTarget({ type: 'THEATRE', id: t.id, name: t.name })}
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/*  Tab 3: Shows Table                                               */}
      {activeTab === 'SHOWS' && (
        <div className="card-cine p-3 p-md-4 overflow-x-auto">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr className="text-muted small">
                <th>Movie</th>
                <th>Theatre & Screen</th>
                <th>Date & Time</th>
                <th>Format</th>
                <th>Price</th>
                <th>Seats</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shows.slice(0, 30).map((s) => (
                <tr key={s.id}>
                  <td className="fw-bold text-white">{s.movie?.title ?? `Movie #${s.movieId}`}</td>
                  <td>
                    <div className="text-white small">{s.theatre?.name ?? `Theatre #${s.theatreId}`}</div>
                    <div className="text-muted small">{s.screen}</div>
                  </td>
                  <td>
                    <div className="text-white small">{formatDate(s.showDate)}</div>
                    <div className="text-muted small">{formatTime(s.showTime)}</div>
                  </td>
                  <td>
                    <span className="badge bg-primary bg-opacity-25 text-primary">{s.format}</span>
                  </td>
                  <td className="text-warning fw-semibold">{formatCurrency(s.ticketPrice)}</td>
                  <td className="small">
                    {s.availableSeats} / {s.totalSeats} free
                  </td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm rounded-pill"
                      onClick={() => setDeleteTarget({ type: 'SHOW', id: s.id, name: `Show #${s.id} (${s.showDate} ${s.showTime})` })}
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/*  Tab 4: Customer Bookings Table                                   */}
      {activeTab === 'BOOKINGS' && (
        <div className="card-cine p-3 p-md-4 overflow-x-auto">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr className="text-muted small">
                <th>Booking ID</th>
                <th>Movie</th>
                <th>Show Details</th>
                <th>Seats</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <span className="badge bg-dark border border-secondary border-opacity-30">#{b.id}</span>
                  </td>
                  <td className="fw-bold text-white">{b.show?.movie?.title ?? `Movie #${b.showId}`}</td>
                  <td className="small text-muted">
                    {b.show ? `${formatDate(b.show.showDate)} at ${formatTime(b.show.showTime)}` : 'N/A'}
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {b.seatNumbers.map((s) => (
                        <span key={s} className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-40">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="text-warning fw-semibold">{formatCurrency(b.totalAmount)}</td>
                  <td>
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/*  Movie Add/Edit Modal                                             */}
      <Modal
        open={movieModalOpen}
        title={editingMovie ? 'Edit Movie' : 'Add New Movie'}
        onClose={() => setMovieModalOpen(false)}
        size="lg"
      >
        <form onSubmit={handleSaveMovie}>
          <div className="row g-3 mb-3">
            <div className="col-md-8">
              <TextField
                id="m-title"
                label="Movie Title"
                value={movieTitle}
                onChange={(e) => setMovieTitle(e.target.value)}
                required
              />
            </div>
            <div className="col-md-4">
              <SelectField
                id="m-status"
                label="Status"
                value={movieStatus}
                onChange={(e) => setMovieStatus(e.target.value as MovieStatus)}
              >
                <option value="NOW_SHOWING">NOW SHOWING</option>
                <option value="COMING_SOON">COMING SOON</option>
              </SelectField>
            </div>

            <div className="col-12">
              <TextAreaField
                id="m-desc"
                label="Synopsis / Description"
                rows={3}
                value={movieDesc}
                onChange={(e) => setMovieDesc(e.target.value)}
                required
              />
            </div>

            <div className="col-md-4">
              <TextField
                id="m-genre"
                label="Genre"
                value={movieGenre}
                onChange={(e) => setMovieGenre(e.target.value)}
                required
              />
            </div>
            <div className="col-md-4">
              <TextField
                id="m-lang"
                label="Language"
                value={movieLanguage}
                onChange={(e) => setMovieLanguage(e.target.value)}
                required
              />
            </div>
            <div className="col-md-4">
              <TextField
                id="m-dur"
                label="Duration (minutes)"
                type="number"
                value={movieDuration}
                onChange={(e) => setMovieDuration(Number(e.target.value))}
                required
              />
            </div>

            <div className="col-md-4">
              <TextField
                id="m-cert"
                label="Certificate"
                value={movieCert}
                onChange={(e) => setMovieCert(e.target.value)}
                required
              />
            </div>
            <div className="col-md-4">
              <TextField
                id="m-release"
                label="Release Date"
                type="date"
                value={movieRelease}
                onChange={(e) => setMovieRelease(e.target.value)}
                required
              />
            </div>
            <div className="col-md-4">
              <TextField
                id="m-rating"
                label="Rating (0–10)"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={movieRating}
                onChange={(e) => setMovieRating(Number(e.target.value))}
                required
              />
            </div>

            <div className="col-md-6">
              <TextField
                id="m-director"
                label="Director"
                value={movieDirector}
                onChange={(e) => setMovieDirector(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6">
              <TextField
                id="m-cast"
                label="Cast (comma-separated)"
                value={movieCast}
                onChange={(e) => setMovieCast(e.target.value)}
                required
              />
            </div>

            <div className="col-12">
              <TextField
                id="m-poster"
                label="Poster Image URL"
                value={moviePoster}
                onChange={(e) => setMoviePoster(e.target.value)}
                hint="e.g. /images/poster_neon_horizon.jpg or any image URL"
                required
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-3 border-top border-secondary border-opacity-15">
            <button type="button" className="btn btn-glass" onClick={() => setMovieModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-gradient">
              Save Movie
            </button>
          </div>
        </form>
      </Modal>
      {/*  Theatre Add/Edit Modal                                           */}
      <Modal
        open={theatreModalOpen}
        title={editingTheatre ? 'Edit Theatre' : 'Add New Theatre'}
        onClose={() => setTheatreModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleSaveTheatre}>
          <div className="row g-3 mb-3">
            <div className="col-md-8">
              <TextField
                id="t-name"
                label="Theatre Name"
                value={theatreName}
                onChange={(e) => setTheatreName(e.target.value)}
                required
              />
            </div>
            <div className="col-md-4">
              <TextField
                id="t-city"
                label="City"
                value={theatreCity}
                onChange={(e) => setTheatreCity(e.target.value)}
                required
              />
            </div>
            <div className="col-12">
              <TextField
                id="t-addr"
                label="Address"
                value={theatreAddress}
                onChange={(e) => setTheatreAddress(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6">
              <TextField
                id="t-screens"
                label="Number of Screens"
                type="number"
                min="1"
                value={theatreScreens}
                onChange={(e) => setTheatreScreens(Number(e.target.value))}
                required
              />
            </div>
            <div className="col-md-6">
              <TextField
                id="t-contact"
                label="Contact Number"
                value={theatreContact}
                onChange={(e) => setTheatreContact(e.target.value)}
              />
            </div>
            <div className="col-12">
              <TextField
                id="t-fac"
                label="Facilities (comma-separated)"
                value={theatreFacilities}
                onChange={(e) => setTheatreFacilities(e.target.value)}
                hint="e.g. Dolby Atmos, IMAX, 4DX, Recliners, Parking"
                required
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-3 border-top border-secondary border-opacity-15">
            <button type="button" className="btn btn-glass" onClick={() => setTheatreModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-gradient">
              Save Theatre
            </button>
          </div>
        </form>
      </Modal>
      {/*  Show Add Modal                                                   */}
      <Modal
        open={showModalOpen}
        title="Schedule Screening Session"
        onClose={() => setShowModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleSaveShow}>
          <div className="row g-3 mb-3">
            <div className="col-12">
              <SelectField
                id="s-movie"
                label="Movie"
                value={showMovieId}
                onChange={(e) => setShowMovieId(Number(e.target.value))}
              >
                {movies.map((m) => (
                  <option key={m.id} value={m.id}>{m.title} ({m.language})</option>
                ))}
              </SelectField>
            </div>

            <div className="col-12">
              <SelectField
                id="s-theatre"
                label="Theatre"
                value={showTheatreId}
                onChange={(e) => setShowTheatreId(Number(e.target.value))}
              >
                {theatres.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
                ))}
              </SelectField>
            </div>

            <div className="col-md-6">
              <TextField
                id="s-date"
                label="Show Date"
                type="date"
                value={showDate}
                onChange={(e) => setShowDate(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6">
              <TextField
                id="s-time"
                label="Showtime (HH:mm)"
                value={showTime}
                placeholder="17:30"
                onChange={(e) => setShowTime(e.target.value)}
                required
              />
            </div>

            <div className="col-md-4">
              <TextField
                id="s-screen"
                label="Screen / Hall"
                value={showScreen}
                onChange={(e) => setShowScreen(e.target.value)}
                required
              />
            </div>
            <div className="col-md-4">
              <SelectField
                id="s-format"
                label="Format"
                value={showFormat}
                onChange={(e) => setShowFormat(e.target.value as ShowFormat)}
              >
                <option value="2D">2D</option>
                <option value="3D">3D</option>
                <option value="IMAX">IMAX</option>
              </SelectField>
            </div>
            <div className="col-md-4">
              <TextField
                id="s-price"
                label="Ticket Price (LKR)"
                type="number"
                value={showPrice}
                onChange={(e) => setShowPrice(Number(e.target.value))}
                required
              />
            </div>

            <div className="col-md-6">
              <TextField
                id="s-rows"
                label="Rows (A to H = 8)"
                type="number"
                min="4"
                max="26"
                value={showRows}
                onChange={(e) => setShowRows(Number(e.target.value))}
                required
              />
            </div>
            <div className="col-md-6">
              <TextField
                id="s-seats-row"
                label="Seats per row"
                type="number"
                min="4"
                max="30"
                value={showSeatsPerRow}
                onChange={(e) => setShowSeatsPerRow(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-3 border-top border-secondary border-opacity-15">
            <button type="button" className="btn btn-glass" onClick={() => setShowModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-gradient">
              Schedule Show
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog for Deletions */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Confirm Removal"
        message={deleteTarget ? `Are you sure you want to delete ${deleteTarget.name}? This action cannot be reversed.` : ''}
        confirmLabel="Yes, Delete"
        tone="danger"
        busy={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
