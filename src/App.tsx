import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastProvider';
import { AuthProvider } from './context/AuthProvider';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ProtectedRoute, GuestRoute } from './components/common/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { MovieDetailsPage } from './pages/MovieDetailsPage';
import { TheatresPage } from './pages/TheatresPage';
import { ShowsPage } from './pages/ShowsPage';
import { BookingPage } from './pages/BookingPage';
import { PaymentPage } from './pages/PaymentPage';
import { BookingsPage } from './pages/BookingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { FutureExpansionPage } from './pages/FutureExpansionPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ScrollToTop />
          <div className="d-flex flex-column min-vh-100 bg-cine-dark text-cine-light">
            <Navbar />
            <main className="flex-grow-1">
              <Routes>
                {/* Public Browsing Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/movies" element={<MoviesPage />} />
                <Route path="/movies/:id" element={<MovieDetailsPage />} />
                <Route path="/theatres" element={<TheatresPage />} />
                <Route path="/shows" element={<ShowsPage />} />
                <Route path="/future-enhancements" element={<FutureExpansionPage />} />

                {/* Guest-only Auth Routes */}
                <Route element={<GuestRoute />}>
                  <Route path="/signin" element={<LoginPage />} />
                  <Route path="/signup" element={<RegisterPage />} />
                </Route>

                {/* Customer & General Authenticated Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/booking/:showId" element={<BookingPage />} />
                  <Route path="/payment/:bookingId" element={<PaymentPage />} />
                  <Route path="/bookings" element={<BookingsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>

                {/* Admin-only Routes */}
                <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                  <Route path="/admin" element={<AdminPage />} />
                </Route>

                {/* Error & Fallback Routes */}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
