# CineBook – Movie Ticket Booking Web Application

CineBook is a responsive single-page web application for cinema movie browsing, real-time seat reservation, and ticket booking. Built with **React 19**, **TypeScript**, **Bootstrap 5**, **React Router**, and **Axios**.

---

## Features

- **User Authentication**: Secure Sign-In and Sign-Up with client-side form validation (email format, password strength meter, required fields). Supports JWT authentication with automatic Bearer token headers and persistent session handling.
- **Movie Catalog**: Browse now-showing and upcoming movies with real-time text search (by title, director, or cast) and filtering by genre and language.
- **Detailed Movie Pages**: View detailed movie descriptions, duration, certificates, ratings, and screening schedules grouped by cinema theatre.
- **Theatres Directory**: Explore cinema locations across major cities with facility badges (IMAX, Dolby Atmos, 4DX, Recliners, VIP Lounge).
- **Showtimes & Schedules**: Filter screenings by date, theatre, movie, and viewing format (2D, 3D, IMAX) with live seat availability counters.
- **Interactive Seat Selection**: Visual cinema screen layout with dynamic rows and seat statuses (available, selected, reserved). Enforces booking seat limits and dynamically calculates total pricing.
- **Checkout & Payment**: Supports simulated Card payments (with card validation and Luhn checking), mobile wallets (eZ Cash, FriMi, Genie), and net banking.
- **Digital Ticket Pass**: Generates a confirmed booking pass with ticket QR code, booking details, and print/save options.
- **Booking Management**: Customers can review booking history and cancel eligible bookings up to 2 hours before showtime with automatic refund processing.
- **Admin Control Center**: Dedicated dashboard for administrators with KPI summary metrics and full management (CRUD) of movies, theatres, and show schedules.
- **In-Browser Mock Mode**: Includes an integrated mock adapter backed by browser storage, allowing full end-to-end functionality right out of the box without requiring a live backend server.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, React Router v7
- **Styling**: Bootstrap 5, Bootstrap Icons, Custom CSS Theme
- **HTTP Client**: Axios with request/response interceptors
- **Build Tool**: Vite 8

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Setup & Run

1. Clone or download the repository:
   ```bash
   git clone <repo-url>
   cd movie-ticket-booking-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open the application in your browser:
   ```
   http://localhost:5173/
   ```

5. Run TypeScript check:
   ```bash
   npx tsc --noEmit
   ```

6. Build for production:
   ```bash
   npm run build
   ```

---

## Test Accounts

The built-in mock mode provides the following default accounts for evaluation:

- **Customer Account**:
  - Email: `customer@cinebook.com`
  - Password: `Customer@123`
- **Admin Account**:
  - Email: `admin@cinebook.com`
  - Password: `Admin@123`

*(You can also use the quick login buttons on the Sign In page or navbar for instant access).*

---

## Future Enhancements & Proposals

The following enhancements are proposed for upcoming releases (details accessible on the `/future-enhancements` page):

1. **3D Seat & Auditorium View**: Implement a 3D preview using WebGL/Three.js showing the exact viewing angle from each seat towards the cinema screen before purchase.
2. **Promotions & Bank Card Discounts**: Add a dynamic coupon engine and BIN-based bank card discount detection (e.g. 1-for-1 credit card promotions).
3. **Verified Customer Reviews**: Enable verified ticket holders to leave ratings, spoiler tags, and badges after watching a screening.
4. **Automated WhatsApp / SMS Pass Delivery**: Send contactless digital passes directly to WhatsApp or SMS to ensure entry even in low-connectivity areas.

---

## Project Structure

```
src/
├── api/             # Axios instance, interceptors, and mock adapter
├── components/
│   ├── common/      # Reusable UI elements (modals, fields, badges, loaders)
│   ├── layout/      # Navbar, Footer
│   └── movies/      # MovieCard, MovieFilters
├── context/         # AuthContext and ToastContext providers
├── hooks/           # Custom React hooks (useAuth, useToast, useFetch)
├── pages/           # Application views (Home, Movies, Shows, Booking, etc.)
├── services/        # Service layer API calls (movies, theatres, shows, bookings)
├── types/           # TypeScript interfaces and models
├── utils/           # Validation, date/currency formatting, JWT storage
├── App.tsx          # Router setup and route protection
├── main.tsx         # Application entry point
└── index.css        # Theme variables and custom styling
```
