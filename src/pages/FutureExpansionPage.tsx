import { PageHeader } from '../components/common/PageHeader';

export function FutureExpansionPage() {
  const proposals = [
    {
      id: 'interactive-seats',
      title: '1. 3D & Spatial Seat Visualization',
      icon: 'bi-box',
      category: 'UI/UX & Immersion',
      badge: 'High Impact',
      summary: 'Upgrade the 2D grid into an interactive WebGL/Three.js 3D auditorium view showing sightlines and acoustics.',
      problem: 'Customers currently see a 2D matrix without realizing that extreme corner seats or front-row seats may have steep viewing angles.',
      solution: 'Render a lightweight 3D canvas that previews the exact point-of-view from the selected seat toward the cinema screen before payment is confirmed.',
      benefits: ['Eliminates customer dissatisfaction with poor angles', 'Boosts sales of premium middle and VIP recliner seats', 'Differentiates CineBook as a flagship luxury ticket platform'],
    },
    {
      id: 'promo-discount',
      title: '2. Dynamic Coupons & Bank Partner Promotions',
      icon: 'bi-tags',
      category: 'Fintech & Marketing',
      badge: 'Revenue Driver',
      summary: 'A promo code & bank card discount engine applying instant discounts during payment (e.g. 1-for-1 HSBC / Sampath Bank credit card offers).',
      problem: 'Cinema ticket platforms frequently partner with credit cards and telecom loyalty programs, but without a discount input students and customers cannot apply deals.',
      solution: 'Add promo code verification endpoint (`POST /api/promotions/verify`) with instant recalculation of total ticket bill, and automatic BIN-based card discount detection.',
      benefits: ['Increases conversion rates during checkouts', 'Strengthens partnerships with Sri Lankan commercial banks', 'Encourages group bookings with multi-ticket bundle discounts'],
    },
    {
      id: 'reviews-ratings',
      title: '3. Verified Customer Reviews & Community Ratings',
      icon: 'bi-chat-heart',
      category: 'Social Proof',
      badge: 'Engagement',
      summary: 'Allow verified ticket holders to leave star ratings, spoiler-tagged reviews, and tags (e.g., "Must watch in IMAX", "Family Friendly").',
      problem: 'Users must leave the site to check IMDb or Rotten Tomatoes before deciding whether to book tickets.',
      solution: 'Only customers with a CONFIRMED past booking can submit a "Verified Watcher" review, ensuring genuine feedback free from review bombing.',
      benefits: ['Keeps users engaged on the booking platform', 'Provides authentic local feedback for Sinhala, Tamil, and English cinema', 'Increases time-on-site and repeat bookings'],
    },
    {
      id: 'sms-notifications',
      title: '4. Automated SMS & WhatsApp Ticket Pass Delivery',
      icon: 'bi-whatsapp',
      category: 'Customer Convenience',
      badge: 'Operational',
      summary: 'Instant dispatch of booking confirmations and QR entry links straight to WhatsApp / SMS using Twilio or local gateways (Dialog/Mobitel).',
      problem: 'Users might experience intermittent cellular data issues when standing at the theatre cinema gates trying to reload the webpage.',
      solution: 'Upon payment confirmation, trigger an automated webhook sending a lightweight WhatsApp message with the seat numbers, movie time, and direct QR entry image.',
      benefits: ['Frictionless contactless gate scanning without needing internet access at the door', 'Decreases queues at the physical cinema box office', 'Enables one-click ticket forwarding to friends in group bookings'],
    },
  ];

  return (
    <div className="container-xl py-4 fade-in-up pb-5">
      <PageHeader
        title="Future Enhancements & Proposals"
        subtitle="Architectural roadmap and planned UX upgrades for upcoming releases of CineBook"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Future Enhancements' }]}
        actions={
          <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-30 px-3 py-2 rounded-pill">
            System Roadmap &bull; Future Scope
          </span>
        }
      />

      <div className="card-cine p-4 p-md-5 mb-5 bg-gradient-soft border border-primary border-opacity-20">
        <div className="row align-items-center g-4">
          <div className="col-lg-8">
            <span className="badge bg-primary text-white rounded-pill px-3 py-1 mb-2 fw-semibold">
              OVERVIEW
            </span>
            <h2 className="h3 fw-bold text-white mb-2">Enhancing the CineBook Platform</h2>
            <p className="text-muted mb-0">
              The current version of CineBook provides complete end-to-end cinema ticketing with JWT authentication, responsive movie/theatre browsing, real-time seat reservation, and checkout processing. The proposals below highlight key features planned for future updates to deliver an even richer user experience.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end">
            <div className="d-inline-flex flex-column gap-2 text-start p-3 rounded-4 bg-black bg-opacity-40 border border-secondary border-opacity-20">
              <div className="small text-muted"><i className="bi bi-check-circle-fill text-success me-1" /> Implemented: Core Booking Flow</div>
              <div className="small text-muted"><i className="bi bi-check-circle-fill text-success me-1" /> Implemented: Mock Backend Adapter</div>
              <div className="small text-white fw-semibold"><i className="bi bi-arrow-up-right-circle-fill text-warning me-1" /> Ready for: Multi-channel expansions</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {proposals.map((p) => (
          <div key={p.id} className="col-12 col-md-6">
            <div className="card-cine p-4 h-100 d-flex flex-column justify-content-between border border-secondary border-opacity-20">
              <div>
                <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                  <div className="p-2.5 rounded-3 bg-primary bg-opacity-20 text-primary d-inline-flex align-items-center justify-content-center">
                    <i className={`bi ${p.icon} fs-4`} />
                  </div>
                  <div className="d-flex gap-2">
                    <span className="badge bg-secondary-subtle text-secondary-emphasis small">{p.category}</span>
                    <span className="badge bg-warning bg-opacity-20 text-warning border border-warning border-opacity-30 small">
                      {p.badge}
                    </span>
                  </div>
                </div>

                <h3 className="h5 fw-bold text-white mb-2">{p.title}</h3>
                <p className="text-muted small mb-3">{p.summary}</p>

                <div className="p-3 rounded-3 bg-black bg-opacity-30 border border-secondary border-opacity-15 mb-3 small">
                  <strong className="text-danger d-block mb-1"><i className="bi bi-exclamation-circle me-1" /> Problem Addressed:</strong>
                  <span className="text-muted">{p.problem}</span>
                </div>

                <div className="p-3 rounded-3 bg-black bg-opacity-30 border border-secondary border-opacity-15 mb-3 small">
                  <strong className="text-success d-block mb-1"><i className="bi bi-gear-wide-connected me-1" /> Proposed Implementation:</strong>
                  <span className="text-muted">{p.solution}</span>
                </div>
              </div>

              <div className="border-top border-secondary border-opacity-15 pt-3 mt-3">
                <span className="small fw-semibold text-white d-block mb-2">Key User Experience Impacts:</span>
                <ul className="list-unstyled mb-0 small text-muted d-flex flex-column gap-1">
                  {p.benefits.map((b) => (
                    <li key={b} className="d-flex align-items-baseline gap-1.5">
                      <i className="bi bi-check2 text-primary" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
