
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./Clients.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://api.geduconnect.com/api";

const BASE_URL = API_BASE.replace(/\/api\/?$/, "");

const getImageUrl = (path) => {
  if (!path) return "";
  if (/^(https?:)?\/\//i.test(path)) return path;
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const MODES = [
  {
    id: "online",
    title: "Online",
    subtitle: "Flexible learning for your future",
  },
  {
    id: "regular",
    title: "Regular",
    subtitle: "On-campus learning with full support",
  },
  {
    id: "distance",
    title: "Distance",
    subtitle: "Learn at your pace from anywhere",
  },
];

/* ================= ICONS ================= */

function ModeIcon({ mode }) {
  if (mode === "online") {
    return (
      <svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.7"
        strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="14" rx="1.5" />
        <path d="M8 21h8M12 17v4M6 6h12" />
      </svg>
    );
  }

  if (mode === "regular") {
    return (
      <svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.7"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9 12 3l10 6H2ZM4 21h16M3 18h18M6 10v8M10 10v8M14 10v8M18 10v8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 9 10-5 10 5-10 5L2 9Z" />
      <path d="M6 11v6c3 3 9 3 12 0v-6M22 9v8" />
    </svg>
  );
}

function ArrowIcon({ direction = "right" }) {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{
        transform: direction === "left"
          ? "rotate(180deg)"
          : "none",
      }}>
      <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13"
      fill="currentColor" aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
    </svg>
  );
}

/* ================= UNIVERSITY CARD ================= */

function UniversityCard({ university, onClick }) {
  const image =
    university.image_url ||
    university.banner_url ||
    university.cover_image_url ||
    university.logo_url;

  const location =
    university.city ||
    university.location ||
    university.state ||
    "India";

  return (
    <article className="cl-university-card">
      <button
        type="button"
        className="cl-card-click"
        onClick={onClick}
        aria-label={`Explore ${university.name}`}
      >
        <div className="cl-card-image">
          {image ? (
            <img
              src={getImageUrl(image)}
              alt={university.name}
              loading="lazy"
              draggable={false}
              onError={(e) => {
                const fallback = getImageUrl(university.logo_url);

                if (fallback && e.currentTarget.src !== fallback) {
                  e.currentTarget.src = fallback;
                } else {
                  e.currentTarget.style.display = "none";
                }
              }}
            />
          ) : (
            <div className="cl-card-placeholder">
              <ModeIcon mode="regular" />
            </div>
          )}
        </div>

        <div className="cl-card-content">
          <h3 className="cl-card-name">{university.name}</h3>

          <div className="cl-card-bottom">
            <span className="cl-card-location">
              <LocationIcon />
              {location}
            </span>

            <span className="cl-card-arrow">
              <ArrowIcon />
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}

/* ================= UNIVERSITY CAROUSEL ================= */

function UniversityCarousel({ items, onCardClick }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef(null);

  const total = items.length;
  const visibleCount = 5;

  const next = useCallback(() => {
    if (total <= 1) return;
    setActive((current) => (current + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    if (total <= 1) return;
    setActive((current) => (current - 1 + total) % total);
  }, [total]);

  /* ================= AUTO ROTATION ================= */

  useEffect(() => {
    if (paused || total <= 1) return;

    const timer = setInterval(() => {
      next();
    }, 3500);

    return () => clearInterval(timer);
  }, [paused, next, total]);

  /* ================= SWIPE SUPPORT ================= */

  const handleTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStart.current === null) return;

    const distance =
      e.changedTouches[0].clientX - touchStart.current;

    if (Math.abs(distance) > 45) {
      if (distance < 0) next();
      else prev();
    }

    touchStart.current = null;
  };

  if (!total) {
    return (
      <div className="cl-empty">
        No universities available in this category.
      </div>
    );
  }

  const displayedItems = Array.from(
    { length: Math.min(visibleCount, total) },
    (_, index) => items[(active + index) % total]
  );

  return (
    <div
      className="cl-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setPaused(false);
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="cl-carousel-viewport">
        <div className="cl-carousel-track">
          {displayedItems.map((university, index) => (
            <UniversityCard
              key={`${university.id || university.slug || index}-${active}-${index}`}
              university={university}
              onClick={() => {
                if (university.slug) {
                  onCardClick(university.slug);
                }
              }}
            />
          ))}
        </div>
      </div>

      {total > 1 && (
        <div className="cl-carousel-navigation">
          <button
            type="button"
            className="cl-nav-button"
            onClick={prev}
            aria-label="Previous universities"
          >
            <ArrowIcon direction="left" />
          </button>

          <div
            className="cl-carousel-progress"
            role="progressbar"
            aria-label="University carousel position"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={active + 1}
          >
            <div
              className="cl-progress-fill"
              style={{
                width: `${100 / total}%`,
                left: `${(active / total) * 100}%`,
              }}
            />
          </div>

          <button
            type="button"
            className="cl-nav-button"
            onClick={next}
            aria-label="Next universities"
          >
            <ArrowIcon direction="right" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ================= MAIN COMPONENT ================= */

export default function Clients() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [activeMode, setActiveMode] = useState("online");
  const [loading, setLoading] = useState(true);

  /* ================= FETCH API ================= */

  useEffect(() => {
    let mounted = true;

    const fetchClients = async () => {
      try {
        const res = await api.get("/public/clients");

        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        if (mounted) setClients(data);
      } catch (err) {
        console.error("Error loading universities:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchClients();

    return () => {
      mounted = false;
    };
  }, []);

  const universities = clients.filter(
    (item) =>
      item.type?.toLowerCase() === "university" &&
      item.mode?.toLowerCase() === activeMode
  );

  const activeModeName =
    MODES.find((mode) => mode.id === activeMode)?.title ||
    "Online";

  if (!loading && !clients.length) return null;

  return (
    <section className="cl-section">
      {/* BACKGROUND DECORATIONS */}
      <div className="cl-deco cl-deco-top-left" />
      <div className="cl-deco cl-deco-top-right" />
      <div className="cl-deco cl-deco-bottom-left" />
      <div className="cl-deco cl-deco-bottom-right" />
      <div className="cl-dot-pattern" />

      <div className="cl-container">
        <div className="cl-layout">

          {/* LEFT COLUMN */}
          <div className="cl-left">
            <div className="cl-eyebrow">
              <span>OUR NETWORK</span>
              <i />
            </div>

            <h2 className="cl-title">
              Partnered
              <span>Universities</span>
            </h2>

            <p className="cl-description">
              Choose a mode of study to explore
              our partner universities.
            </p>
          </div>

          {/* RIGHT COLUMN */}
          <div className="cl-right">

            {/* STUDY MODE BUTTONS */}
            <div className="cl-mode-grid">
              {MODES.map((mode) => (
                <button
                  type="button"
                  key={mode.id}
                  className={`cl-mode-card ${
                    activeMode === mode.id
                      ? "cl-mode-card--active"
                      : ""
                  }`}
                  onClick={() => setActiveMode(mode.id)}
                  aria-pressed={activeMode === mode.id}
                >
                  <span className="cl-mode-icon">
                    <ModeIcon mode={mode.id} />
                  </span>

                  <span className="cl-mode-info">
                    <strong>{mode.title}</strong>
                    <small>{mode.subtitle}</small>
                  </span>

                  <span className="cl-mode-arrow">
                    <ArrowIcon />
                  </span>
                </button>
              ))}
            </div>

            {/* UNIVERSITIES HEADING */}
            <div className="cl-universities-heading">
              <h3>
                Top Partnered Universities{" "}
                <span>({activeModeName})</span>
              </h3>

              <button
                type="button"
                className="cl-view-all"
                onClick={() => navigate("/university")}
              >
                View All Universities
                <ArrowIcon />
              </button>
            </div>

            {/* UNIVERSITY CAROUSEL */}
            {loading ? (
              <div className="cl-empty">
                Loading universities...
              </div>
            ) : (
              <UniversityCarousel
                key={activeMode}
                items={universities}
                onCardClick={(slug) =>
                  navigate(`/university/${slug}`)
                }
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
