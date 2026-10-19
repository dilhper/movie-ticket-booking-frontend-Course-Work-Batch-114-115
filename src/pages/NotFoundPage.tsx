import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="container-xl py-5 text-center fade-in-up">
      <div className="card-cine p-5 mx-auto" style={{ maxWidth: 520 }}>
        <div className="display-1 fw-black text-primary mb-2">404</div>
        <h1 className="h3 fw-bold text-white mb-2">Scene Not Found</h1>
        <p className="text-muted small mb-4">
          The cinema hall or movie page you are looking for has concluded its screening or does not exist.
        </p>
        <div className="d-flex justify-content-center gap-2">
          <Link to="/" className="btn btn-outline-light rounded-pill px-4">
            Back to Home
          </Link>
          <Link to="/movies" className="btn btn-gradient rounded-pill px-4">
            Explore Movies
          </Link>
        </div>
      </div>
    </div>
  );
}
