import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { TextField } from '../components/common/FormFields';
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  passwordStrength,
} from '../utils/validators';

export function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const phoneErr = validatePhone(phone);
    const passErr = validatePassword(password);
    const confirmErr = password !== confirmPassword ? 'Passwords do not match' : '';

    if (nameErr || emailErr || phoneErr || passErr || confirmErr) {
      setErrors({
        name: nameErr,
        email: emailErr,
        phone: phoneErr,
        password: passErr,
        confirmPassword: confirmErr,
      });
      return;
    }
    setErrors({});

    try {
      setLoading(true);
      const user = await register({ name, email, phone, password });
      showToast({
        type: 'success',
        title: 'Account Created!',
        message: `Welcome to CineBook, ${user.name}! Your account is active.`,
      });
      navigate('/movies', { replace: true });
    } catch (err) {
      showToast({
        type: 'danger',
        title: 'Registration Failed',
        message: err instanceof Error ? err.message : 'Could not register account.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-xl py-5 fade-in-up">
      <div className="row justify-content-center">
        <div className="col-12 col-md-9 col-lg-6">
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
                <i className="bi bi-person-plus fs-3" />
              </div>
              <h1 className="h3 fw-bold text-white mb-1">Create CineBook Account</h1>
              <p className="text-muted small">Join now to enjoy personalized bookings and digital tickets</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <TextField
                id="reg-name"
                label="Full Name"
                placeholder="Nimali Perera"
                icon="bi-person"
                value={name}
                error={errors.name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                className="mb-3"
                required
              />

              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <TextField
                    id="reg-email"
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
                    required
                  />
                </div>
                <div className="col-md-6">
                  <TextField
                    id="reg-phone"
                    label="Phone Number"
                    type="tel"
                    placeholder="077 123 4567"
                    icon="bi-telephone"
                    value={phone}
                    error={errors.phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                    }}
                    required
                  />
                </div>
              </div>

              <TextField
                id="reg-password"
                label="Password"
                type="password"
                placeholder="At least 8 chars with letters & numbers"
                icon="bi-lock"
                value={password}
                error={errors.password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                className="mb-2"
                required
              />

              {/* Password strength indicator */}
              {password && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span>Password strength:</span>
                    <span className={`text-${strength.tone} fw-semibold`}>{strength.label}</span>
                  </div>
                  <div className="progress" style={{ height: 4 }}>
                    <div
                      className={`progress-bar bg-${strength.tone}`}
                      style={{ width: `${(strength.score / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <TextField
                id="reg-confirm-password"
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                icon="bi-check2-circle"
                value={confirmPassword}
                error={errors.confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                className="mb-4"
                required
              />

              <button
                type="submit"
                className="btn btn-gradient btn-lg w-100 rounded-pill fw-semibold shadow-lg d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" aria-hidden />
                    Creating Account…
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-check-fill" /> Create Account
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-3 border-top border-secondary border-opacity-15 small text-muted">
              Already have an account?{' '}
              <Link to="/signin" className="text-primary fw-semibold text-decoration-none hover-white">
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
