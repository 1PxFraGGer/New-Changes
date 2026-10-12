
import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./Clients.css";

/* ==========================================
   API CONFIGURATION
========================================== */

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://api.geduconnect.com/api";

const BASE_URL = API_BASE.replace(/\/api\/?$/, "");

const getImageUrl = (path) => {
  if (!path) return "";

  if (/^(https?:)?\/\//i.test(path)) {
    return path;
  }

  return `${BASE_URL}${
    path.startsWith("/") ? "" : "/"
  }${path}`;
};

/* ==========================================
   ICON COMPONENT
========================================== */

function Icon({ name, size = 22 }) {
  const paths = {
    online: (
      <>
        <rect x="3" y="3" width="18" height="14" rx="2" />
        <path d="M8 21h8M12 17v4M7 7h10" />
      </>
    ),

    regular: (
      <>
        <path d="M3 10h18L12 3 3 10Z" />
        <path d="M5 10v10M9 10v10M15 10v10M19 10v10" />
        <path d="M2 21h20" />
      </>
    ),

    distance: (
      <>
        <path d="m2 9 10-5 10 5-10 5L2 9Z" />
        <path d="M6 11v6c4 3 8 3 12 0v-6" />
        <path d="M22 9v8" />
      </>
    ),

    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),

    location: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),

    drag: (
      <>
        <path d="M8 5V3m8 2V3M8 19v2m8-2v2" />
        <path d="M4 9H2m2 6H2m20-6h-2m2 6h-2" />
        <rect x="5" y="6" width="14" height="12" rx="3" />
        <path d="m9 12 3-3 3 3-3 3-3-3Z" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.arrow}
    </svg>
  );
}

/* ==========================================
   STUDY MODE DATA
========================================== */

const MODES = [
  {
    id: "online",
    title: "Online",
    description: "Flexible learning for your future",
    icon: "online",
  },
  {
    id: "regular",
    title: "Regular",
    description: "On-campus learning with full support",
    icon: "regular",
  },
  {
    id: "distance",
    title: "Distance",
    description: "Learn at your pace from anywhere",
    icon: "distance",
  },
];

/* ==========================================
   UNIVERSITY CARD
========================================== */

function UniversityCard({
  university,
  onExplore,
}) {
  const name = university.name || "University";

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
      <div className="cl-university-image">
        {image ? (
          <img
            src={getImageUrl(image)}
            alt={name}
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="cl-image-placeholder">
            {name.charAt(0)}
          </div>
        )}
      </div>

      <div className="cl-university-body">
        <h3 className="cl-university-name">
          {name}
        </h3>

        <div className="cl-university-bottom">
          <div className="cl-university-location">
            <Icon name="location" size={15} />
            <span>{location}</span>
          </div>

          <button
            type="button"
            className="cl-university-explore"
            aria-label={`Explore ${name}`}
            onClick={(event) => {
              event.stopPropagation();
              onExplore(university);
            }}
          >
            <Icon name="arrow" size={19} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ==========================================
   DRAG-ONLY UNIVERSITY CAROUSEL
========================================== */

function UniversityCarousel({
  universities,
  onExplore,
}) {
  const trackRef = useRef(null);
  const viewportRef = useRef(null);

  const pointerRef = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
    pointerId: null,
  });

  const pausedRef = useRef(false);
  const resumeTimerRef = useRef(null);
  const animationRef = useRef(null);
  const clickBlockedRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);

  const total = universities.length;

  /* ======================================
     GET CARD STEP
  ====================================== */

  const getStep = useCallback(() => {
    const track = trackRef.current;

    if (!track) return 250;

    const card = track.querySelector(
      ".cl-university-card"
    );

    if (!card) return 250;

    const styles = window.getComputedStyle(track);

    const gap =
      parseFloat(styles.columnGap) ||
      parseFloat(styles.gap) ||
      16;

    return card.getBoundingClientRect().width + gap;
  }, []);

  /* ======================================
     PAUSE AND RESUME AUTOPLAY
  ====================================== */

  const pauseAutoplay = useCallback(() => {
    pausedRef.current = true;

    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
  }, []);

  const resumeAutoplay = useCallback((delay = 3000) => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }

    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, delay);
  }, []);

  /* ======================================
     MOVE TO INDEX
  ====================================== */

  const scrollToIndex = useCallback(
    (index, behavior = "smooth") => {
      const viewport = viewportRef.current;

      if (!viewport || !total) return;

      const normalized =
        ((index % total) + total) % total;

      viewport.scrollTo({
        left: normalized * getStep(),
        behavior,
      });

      setActiveIndex(normalized);
    },
    [getStep, total]
  );

  /* ======================================
     AUTOMATIC ROTATION
  ====================================== */

  useEffect(() => {
    if (total <= 1) return;

    const interval = setInterval(() => {
      if (pausedRef.current) return;

      const viewport = viewportRef.current;
      if (!viewport) return;

      const step = getStep();
      const current = Math.round(
        viewport.scrollLeft / step
      );

      const next = (current + 1) % total;

      scrollToIndex(next);
    }, 3000);

    return () => clearInterval(interval);
  }, [total, getStep, scrollToIndex]);

  /* ======================================
     POINTER DRAG START
  ====================================== */

  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) return;

    pauseAutoplay();

    pointerRef.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: viewport.scrollLeft,
      moved: false,
      pointerId: event.pointerId,
    };

    clickBlockedRef.current = false;

    if (event.pointerType === "mouse") {
      event.currentTarget.setPointerCapture(
        event.pointerId
      );
    }
  };

  /* ======================================
     POINTER DRAG MOVE
  ====================================== */

  const handlePointerMove = (event) => {
    const pointer = pointerRef.current;

    if (!pointer.active) return;

    // Let touchscreens use native horizontal swiping.
    if (event.pointerType !== "mouse") return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    const delta = event.clientX - pointer.startX;

    if (Math.abs(delta) > 6) {
      pointer.moved = true;
      clickBlockedRef.current = true;
      setDragging(true);
    }

    if (pointer.moved) {
      viewport.scrollLeft =
        pointer.startScrollLeft - delta;
    }
  };

  /* ======================================
     DRAG END
  ====================================== */

  const handlePointerUp = (event) => {
    const pointer = pointerRef.current;

    if (!pointer.active) return;

    pointer.active = false;

    const viewport = viewportRef.current;

    if (
      event.pointerType === "mouse" &&
      event.currentTarget.hasPointerCapture?.(
        event.pointerId
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    }

    setDragging(false);

    if (viewport && total) {
      const step = getStep();

      const nearestIndex = Math.round(
        viewport.scrollLeft / step
      );

      scrollToIndex(nearestIndex);
    }

    resumeAutoplay();
  };

  /* ======================================
     TRACK ACTIVE CARD ON SCROLL
  ====================================== */

  const handleScroll = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animationRef.current = requestAnimationFrame(() => {
      const viewport = viewportRef.current;

      if (!viewport || !total) return;

      const index = Math.min(
        total - 1,
        Math.max(
          0,
          Math.round(
            viewport.scrollLeft / getStep()
          )
        )
      );

      setActiveIndex(index);
    });
  };

  /* ======================================
     RESIZE HANDLING
  ====================================== */

  useEffect(() => {
    const handleResize = () => {
      scrollToIndex(activeIndex, "instant");
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [activeIndex, scrollToIndex]);

  /* ======================================
     CLEANUP
  ====================================== */

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  /* ======================================
     RESET WHEN MODE CHANGES
  ====================================== */

  useEffect(() => {
    setActiveIndex(0);

    const viewport = viewportRef.current;

    if (viewport) {
      viewport.scrollLeft = 0;
    }
  }, [universities]);

  if (!total) return null;

  return (
    <div className="cl-carousel-wrapper">

      <div
        ref={viewportRef}
        className={`cl-carousel-viewport ${
          dragging ? "is-dragging" : ""
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onScroll={handleScroll}
        onMouseEnter={pauseAutoplay}
        onMouseLeave={() => {
          if (pointerRef.current.active) return;
          resumeAutoplay(1500);
        }}
        onTouchStart={pauseAutoplay}
        onTouchEnd={() => resumeAutoplay()}
        onClickCapture={(event) => {
          if (clickBlockedRef.current) {
            event.stopPropagation();
            event.preventDefault();
            clickBlockedRef.current = false;
          }
        }}
      >
        <div
          ref={trackRef}
          className="cl-carousel-track"
        >
          {universities.map((university, index) => (
            <UniversityCard
              key={university.id || university.slug || index}
              university={university}
              onExplore={onExplore}
            />
          ))}
        </div>
      </div>

      {/* DRAG INDICATOR */}

      <div className="cl-carousel-footer">
        <div className="cl-drag-hint">
          <Icon name="drag" size={16} />
          <span>Drag to Explore Universities</span>
        </div>

        {/* PROGRESS INDICATOR */}

        <div className="cl-carousel-progress">
          <div className="cl-progress-track">
            <div
              className="cl-progress-fill"
              style={{
                width: `${
                  ((activeIndex + 1) / total) * 100
                }%`,
              }}
            />
          </div>

          <span className="cl-progress-count">
            {String(activeIndex + 1).padStart(2, "0")}
            <span> / </span>
            {String(total).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   MAIN CLIENTS COMPONENT
========================================== */

export default function Clients() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [activeMode, setActiveMode] =
    useState("online");

  const [loading, setLoading] = useState(true);

  /* ======================================
     FETCH FROM BACKEND
  ====================================== */

  useEffect(() => {
    let mounted = true;

    const fetchClients = async () => {
      try {
        const response = await api.get(
          "/public/clients"
        );

        const data = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        if (mounted) {
          setClients(data);
        }
      } catch (error) {
        console.error(
          "Error loading university clients:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchClients();

    return () => {
      mounted = false;
    };
  }, []);

  /* ======================================
     FILTER UNIVERSITIES
  ====================================== */

  const universities = clients.filter(
    (client) =>
      client.type?.toLowerCase() === "university" &&
      client.mode?.toLowerCase() === activeMode
  );

  const partners = clients.filter(
    (client) =>
      client.type?.toLowerCase() === "partner"
  );

  /* ======================================
     NAVIGATION
  ====================================== */

  const handleUniversityClick = (university) => {
    if (!university.slug) return;

    navigate(`/university/${university.slug}`);
  };

  const handleViewAll = () => {
    navigate(`/university?mode=${activeMode}`);
  };

  /* ======================================
     LOADING / EMPTY
  ====================================== */

  if (loading) return null;

  if (!clients.length) return null;

  return (
    <>
      <section className="cl-section">

        {/* DECORATIVE BACKGROUND */}

        <div className="cl-bg-circle cl-bg-circle--top" />
        <div className="cl-bg-circle cl-bg-circle--bottom" />
        <div className="cl-bg-dots" />

        <div className="cl-container">

          {/* HEADER + MODE BUTTONS */}

          <div className="cl-top-layout">

            <div className="cl-head">
              <div className="cl-eyebrow">
                Our Network
                <span className="cl-eyebrow-line" />
              </div>

              <h2 className="cl-title">
                <span>Partnered</span>
                <strong>Universities</strong>
              </h2>

              <p className="cl-sub">
                Choose a mode of study to explore
                our partner universities.
              </p>
            </div>

            {/* STUDY MODE BUTTONS */}

            <div className="cl-modes">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className={`cl-mode ${
                    activeMode === mode.id
                      ? "cl-mode--active"
                      : ""
                  }`}
                  onClick={() => setActiveMode(mode.id)}
                >
                  <div className="cl-mode-icon">
                    <Icon
                      name={mode.icon}
                      size={24}
                    />
                  </div>

                  <div className="cl-mode-text">
                    <span className="cl-mode-title">
                      {mode.title}
                    </span>

                    <span className="cl-mode-description">
                      {mode.description}
                    </span>
                  </div>

                  <div className="cl-mode-arrow">
                    <Icon name="arrow" size={17} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* UNIVERSITY LIST HEADING */}

          <div className="cl-university-header">
            <div>
              <div className="cl-university-eyebrow">
                Explore Our Network
              </div>

              <h3 className="cl-university-heading">
                Top Partnered Universities{" "}
                <span>
                  ({activeMode.charAt(0).toUpperCase() +
                    activeMode.slice(1)})
                </span>
              </h3>
            </div>

            <button
              type="button"
              className="cl-view-all"
              onClick={handleViewAll}
            >
              View All Universities
              <Icon name="arrow" size={18} />
            </button>
          </div>

          {/* UNIVERSITY CAROUSEL */}

          {universities.length > 0 ? (
            <UniversityCarousel
              key={activeMode}
              universities={universities}
              onExplore={handleUniversityClick}
            />
          ) : (
            <div className="cl-empty">
              No universities available in this mode.
            </div>
          )}
        </div>
      </section>

    
    </>
  );
}
