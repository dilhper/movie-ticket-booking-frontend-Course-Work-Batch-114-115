import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { config } from '../../config';
import { resetMockDb } from '../../api/mock/mockDb';
import { initials } from '../../utils/format';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);

  const handleQuickDemoLogin = async (role: 'CUSTOMER' | 'ADMIN') => {
    try {
      if (role === 'ADMIN') {
        await login('admin@cinebook.com', 'Admin@123', true);
        showToast({ type: 'success', title: 'Welcome Admin', message: 'Signed in as Administrator.' });
        navigate('/admin');
      } else {
        await login('customer@cinebook.com', 'Customer@123', true);
        showToast({ type: 'success', title: 'Welcome Back', message: 'Signed in as demo customer Nimali.' });
        navigate('/movies');
      }
    } catch {
      showToast({ type: 'danger', title: 'Login Failed', message: 'Could not log in with demo account.' });
    }
  };

  const handleResetData = () => {
    resetMockDb();
    showToast({ type: 'info', title: 'Database Reset', message: 'Mock data restored to initial state.' });
    window.location.reload();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-cine sticky-top" aria-label="Main navigation">
      <div className="container-xl">
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 text-white fw-bold shadow-sm"
            style={{
              width: 38,
              height: 38,
              background: 'linear-gradient(135deg, #ff3d6e, #ff7a45)',
            }}
          >
            <i className="bi bi-film fs-5" aria-hidden />
          </div>
          <div>
            <span className="fw-bold tracking-tight text-white fs-4">Cine<span style={{ color: '#ff3d6e' }}>Book</span></span>
          </div>
        </Link>

        {config.useMockApi && (
          <span
            className="badge rounded-pill text-bg-dark border border-secondary border-opacity-25 ms-2 d-none d-md-inline-flex align-items-center gap-1 small py-1 px-2"
            title="Running in local mock mode"
          >
            <span className="p-1 rounded-circle bg-success d-inline-block" style={{ width: 6, height: 6 }} />
            Mock API
          </span>
        )}

        <button
          className="navbar-toggler border-0 shadow-none text-white p-1"
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-controls="navbarMainContent"
          aria-expanded={!collapsed}
          aria-label="Toggle navigation"
        >
          <i className={`bi ${collapsed ? 'bi-list' : 'bi-x-lg'} fs-3`} />
        </button>

        <div className={`collapse navbar-collapse ${collapsed ? '' : 'show'}`} id="navbarMainContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-lg-1">
            <li className="nav-item">
              <NavLink to="/movies" className={({ isActive }) => `nav-link ${isActive ? 'active text-primary fw-semibold' : ''}`} onClick={() => setCollapsed(true)}>
                <i className="bi bi-camera-reels me-1" /> Movies
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/theatres" className={({ isActive }) => `nav-link ${isActive ? 'active text-primary fw-semibold' : ''}`} onClick={() => setCollapsed(true)}>
                <i className="bi bi-buildings me-1" /> Theatres
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/shows" className={({ isActive }) => `nav-link ${isActive ? 'active text-primary fw-semibold' : ''}`} onClick={() => setCollapsed(true)}>
                <i className="bi bi-calendar-event me-1" /> Shows
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/future-enhancements" className={({ isActive }) => `nav-link ${isActive ? 'active text-primary fw-semibold' : ''}`} onClick={() => setCollapsed(true)}>
                <i className="bi bi-stars me-1" /> Enhancements
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2 flex-wrap mt-3 mt-lg-0">
            {isAuthenticated && user ? (
              <>
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="btn btn-outline-warning btn-sm d-flex align-items-center gap-1 px-3 py-1.5 rounded-pill"
                    onClick={() => setCollapsed(true)}
                  >
                    <i className="bi bi-shield-check" /> Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/bookings"
                    className="btn btn-glass btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill text-white"
                    onClick={() => setCollapsed(true)}
                  >
                    <i className="bi bi-ticket-perforated" /> My Bookings
                  </Link>
                )}

                <div className="dropdown">
                  <button
                    className="btn btn-outline-secondary btn-sm rounded-pill text-white d-flex align-items-center gap-2 px-2.5 py-1 dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    id="userDropdown"
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold small"
                      style={{
                        width: 28,
                        height: 28,
                        background: isAdmin ? '#ffb547' : '#ff3d6e',
                        color: isAdmin ? '#12121d' : '#ffffff',
                      }}
                    >
                      {initials(user.name) || 'U'}
                    </div>
                    <span className="small d-none d-sm-inline fw-medium">{user.name.split(' ')[0]}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow-lg border-secondary border-opacity-25" aria-labelledby="userDropdown">
                    <li className="dropdown-header">
                      <div className="fw-semibold text-white">{user.name}</div>
                      <div className="small text-muted">{user.email}</div>
                      <span className="badge bg-secondary-subtle text-secondary-emphasis mt-1">{user.role}</span>
                    </li>
                    <li><hr className="dropdown-divider border-secondary border-opacity-25" /></li>
                    <li>
                      <Link to="/profile" className="dropdown-item py-2" onClick={() => setCollapsed(true)}>
                        <i className="bi bi-person me-2" /> My Profile
                      </Link>
                    </li>
                    {!isAdmin && (
                      <li>
                        <Link to="/bookings" className="dropdown-item py-2" onClick={() => setCollapsed(true)}>
                          <i className="bi bi-ticket-detailed me-2" /> Bookings History
                        </Link>
                      </li>
                    )}
                    {isAdmin && (
                      <li>
                        <Link to="/admin" className="dropdown-item py-2" onClick={() => setCollapsed(true)}>
                          <i className="bi bi-speedometer2 me-2" /> Admin Dashboard
                        </Link>
                      </li>
                    )}
                    {config.useMockApi && (
                      <li>
                        <button type="button" className="dropdown-item py-2 text-warning" onClick={handleResetData}>
                          <i className="bi bi-arrow-counterclockwise me-2" /> Reset Mock Data
                        </button>
                      </li>
                    )}
                    <li><hr className="dropdown-divider border-secondary border-opacity-25" /></li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item text-danger py-2"
                        onClick={() => {
                          logout();
                          navigate('/signin');
                          setCollapsed(true);
                        }}
                      >
                        <i className="bi bi-box-arrow-right me-2" /> Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="btn-group">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm dropdown-toggle rounded-pill text-white"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-lightning-charge me-1 text-warning" /> Demo Logins
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow border-secondary border-opacity-25">
                    <li>
                      <button
                        type="button"
                        className="dropdown-item py-2"
                        onClick={() => handleQuickDemoLogin('CUSTOMER')}
                      >
                        <i className="bi bi-person me-2 text-primary" /> Sign in as <strong>Customer</strong>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item py-2"
                        onClick={() => handleQuickDemoLogin('ADMIN')}
                      >
                        <i className="bi bi-shield-lock me-2 text-warning" /> Sign in as <strong>Admin</strong>
                      </button>
                    </li>
                    {config.useMockApi && (
                      <>
                        <li><hr className="dropdown-divider border-secondary border-opacity-25" /></li>
                        <li>
                          <button type="button" className="dropdown-item py-2 text-muted small" onClick={handleResetData}>
                            <i className="bi bi-arrow-counterclockwise me-2" /> Reset Sample Data
                          </button>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <Link
                  to="/signin"
                  className="btn btn-outline-light btn-sm px-3 rounded-pill"
                  onClick={() => setCollapsed(true)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-gradient btn-sm px-3.5 rounded-pill fw-medium"
                  onClick={() => setCollapsed(true)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
