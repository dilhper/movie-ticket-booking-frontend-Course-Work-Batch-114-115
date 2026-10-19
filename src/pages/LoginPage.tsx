import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { TextField } from '../components/common/FormFields';
import { validateEmail, validatePassword } from '../utils/validators';

export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname?: string } | string })?.from;
  const redirectTarget = typeof from === 'string' ? from : from?.pathname ?? '/movies';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      return;
    }
    setErrors({});

    try {
      setLoading(true);
      const user = await login(email, password, remember);
      showToast({
        type: 'success',
        title: 'Welcome Back!',
        message: `Signed in as ${user.name} (${user.role}).`,
      });
      navigate(user.role === 'ADMIN' && redirectTarget === '/movies' ? '/admin' : redirectTarget, { replace: true });
    } catch (err) {
      showToast({
        type: 'danger',
        title: 'Sign In Failed',
        message: err instanceof Error ? err.message : 'Invalid credentials. Please verify and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    try {
      setLoading(true);
      const user = await login(demoEmail, demoPass, true);
      showToast({
        type: 'success',
        title: 'Demo Sign In',
        message: `Signed in as ${user.name} (${user.role}).`,
      });
      navigate(user.role === 'ADMIN' ? '/admin' : redirectTarget, { replace: true });
    } catch (err) {
      showToast({
        type: 'danger',
        title: 'Sign In Failed',
        message: err instanceof Error ? err.message : 'Invalid credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-xl py-5 fade-in-up">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card-cine p-4 p-md-5 shadow-2xl">
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-4 text-white fw-bold mb-3 shadow"
                style={{
                  width: 52,
                  height: 52,
                  background: 'linear-gradient(135deg, #ff3d6e, #ff7a45)',
                }}
              >
                <i className="bi bi-film fs-3" />
              </div>
              <h1 className="h3 fw-bold text-white mb-1">Sign In to CineBook</h1>
              <p className="text-muted small">Access your bookings, profile, and ticket passes</p>
            </div>

            {/* Quick Demo Credentials Buttons */}
            <div className="p-3 rounded-4 bg-black bg-opacity-40 border border-secondary border-opacity-20 mb-4">
              <span className="small text-muted fw-semibold d-block mb-2 text-center">
                <i className="bi bi-lightning-charge-fill text-warning me-1" /> Quick Demo Accounts:
              </span>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-glass btn-sm flex-fill rounded-pill text-white"
                  onClick={() => handleDemoFill('customer@cinebook.com', 'Customer@123')}
                  disabled={loading}
                >
                  <i className="bi bi-person me-1 text-primary" /> Customer
                </button>
                <button
                  type="button"
                  className="btn btn-glass btn-sm flex-fill rounded-pill text-white"
                  onClick={() => handleDemoFill('admin@cinebook.com', 'Admin@123')}
                  disabled={loading}
                >
                  <i className="bi bi-shield-lock me-1 text-warning" /> Admin
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <TextField
                id="login-email"
                label="Email Address"
                type="email"
                placeholder="nimali@example.com"
                icon="bi-envelope"
                value={email}
                error={errors.email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                className="mb-3"
                required
              />

              <TextField
                id="login-password"
                label="Password"
                type="password"
                placeholder="••••••••"
                icon="bi-lock"
                value={password}
                error={errors.password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                className="mb-3"
                required
              />

              <div className="d-flex align-items-center justify-content-between mb-4 small">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <label className="form-check-label text-muted" htmlFor="rememberMe">
                    Remember me
                  </label>
                </div>
                <span className="text-muted">JWT Secured</span>
              </div>

              <button
                type="submit"
                className="btn btn-gradient btn-lg w-100 rounded-pill fw-semibold shadow-lg d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" aria-hidden />
                    Signing In…
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right" /> Sign In
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-3 border-top border-secondary border-opacity-15 small text-muted">
              Don't have an account yet?{' '}
              <Link to="/signup" className="text-primary fw-semibold text-decoration-none hover-white">
                Register here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
