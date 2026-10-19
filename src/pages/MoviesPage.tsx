import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { movieService } from '../services/movieService';
import type { Movie, MovieStatus } from '../types';
import { MovieCard } from '../components/movies/MovieCard';
import { MovieFilters } from '../components/movies/MovieFilters';
import { PageHeader } from '../components/common/PageHeader';
import { SkeletonGrid } from '../components/common/Loader';
import { EmptyState, ErrorState } from '../components/common/Feedback';

export function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state synced with search params
  const search = searchParams.get('search') ?? '';
  const status = (searchParams.get('status') as 'ALL' | MovieStatus) ?? 'ALL';
  const genre = searchParams.get('genre') ?? '';
  const language = searchParams.get('language') ?? '';

  const updateParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value && value !== 'ALL') {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

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

  const genres = useMemo(() => {
    return Array.from(new Set(movies.map((m) => m.genre))).sort();
  }, [movies]);

  const languages = useMemo(() => {
    return Array.from(new Set(movies.map((m) => m.language))).sort();
  }, [movies]);

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      if (status !== 'ALL' && movie.status !== status) return false;
      if (genre && movie.genre !== genre) return false;
      if (language && movie.language !== language) return false;
      if (search) {
        const query = search.toLowerCase();
        const matchesTitle = movie.title.toLowerCase().includes(query);
        const matchesDirector = movie.director.toLowerCase().includes(query);
        const matchesCast = movie.cast.some((c) => c.toLowerCase().includes(query));
        const matchesGenre = movie.genre.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDirector && !matchesCast && !matchesGenre) return false;
      }
      return true;
    });
  }, [movies, status, genre, language, search]);

  const handleReset = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="container-xl py-4 fade-in-up">
      <PageHeader
        title="Movie Catalog"
        subtitle="Explore now showing and upcoming blockbuster releases"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Movies' }]}
        actions={
          <div className="badge bg-secondary-subtle text-secondary-emphasis px-3 py-2 rounded-pill">
            Showing {filteredMovies.length} of {movies.length} movies
          </div>
        }
      />

      <MovieFilters
        search={search}
        onSearchChange={(val) => updateParam('search', val)}
        status={status}
        onStatusChange={(val) => updateParam('status', val)}
        genre={genre}
        onGenreChange={(val) => updateParam('genre', val)}
        language={language}
        onLanguageChange={(val) => updateParam('language', val)}
        genres={genres}
        languages={languages}
        onReset={handleReset}
      />

      {error && <ErrorState message={error} onRetry={loadMovies} />}

      {loading ? (
        <SkeletonGrid count={8} />
      ) : filteredMovies.length === 0 ? (
        <EmptyState
          icon="bi-camera-reels"
          title="No movies found"
          message="We couldn't find any movies matching your current filters. Try searching for something else or clearing your filters."
          action={
            <button type="button" className="btn btn-outline-light rounded-pill px-4" onClick={handleReset}>
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="row g-4">
          {filteredMovies.map((movie) => (
            <div key={movie.id} className="col-6 col-md-4 col-lg-3">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
