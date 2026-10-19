import { Link } from 'react-router-dom';

export function UnauthorizedPage() {
  return (
    <div className="container-xl py-5 text-center fade-in-up">
      <div className="card-cine p-5 mx-auto" style={{ maxWidth: 500 }}>
        <div className="p-3 rounded-circle bg-danger bg-opacity-20 text-danger d-inline-flex mb-3">
          <i className="bi bi-shield-x fs-1" />
        </div>
        <h1 className="h3 fw-bold text-white mb-2">Access Denied</h1>
        <p className="text-muted small mb-4">
          You do not have the required administrative permissions to access this page. Please return to the homepage or sign in with an administrator account.
        </p>
        <div className="d-flex justify-content-center gap-2">
          <Link to="/" className="btn btn-outline-light rounded-pill px-4">
            Go to Home
          </Link>
          <Link to="/signin" className="btn btn-gradient rounded-pill px-4">
            Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
}
