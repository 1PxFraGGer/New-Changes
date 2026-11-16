import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import "./Clients.css";

/* ------------------------------------------------------------------ */
/* Config & helpers                                                    */
/* ------------------------------------------------------------------ */

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://api.geduconnect.com/api";
const BASE_URL = API_BASE.replace(/\/api\/?$/, "");
const MODES = ["online", "regular", "distance"];
const SWIPE_THRESHOLD = 48;

const titleCase = (value = "") =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

// Short labels and display order for the universities in the design.
const BRANDS = [
  { match: /amity/i, label: "Amity" },
  { match: /manipal.*jaipur|jaipur.*manipal/i, label: "Manipal" },
  { match: /\bvgu\b|vivekananda global/i, label: "VGU" },
  { match: /jain/i, label: "Jain" },
  { match: /sharda/i, label: "Sharda" },
  { match: /\blpu\b|lovely professional/i, label: "LPU" },
  { match: /\bgla\b/i, label: "GLA" },
];

const nameOf = (item) => String(item?.name || item?.slug || "");
const brandIndex = (item) => {
  const index = BRANDS.findIndex((brand) => brand.match.test(nameOf(item)));
  return index < 0 ? BRANDS.length : index;
};
const brandFor = (item) => BRANDS[brandIndex(item)];
const isManipalJaipur = (item) => BRANDS[1].match.test(nameOf(item));

function getImageUrl(path) {
  if (typeof path !== "string" || !path.trim()) return "";
  const clean = path.trim();
  if (/^(https?:)?\/\//i.test(clean) || /^(data|blob):/i.test(clean))
    return clean;
  return `${BASE_URL}${clean.startsWith("/") ? "" : "/"}${clean}`;
}

/** True for anything worth showing: non-empty strings, non-zero numbers. */
function hasValue(value) {
  if (value === null || value === undefined) return false;
  const text = String(value).trim();
  if (!text) return false;
  const numeric = Number(text.replace(/,/g, ""));
  return Number.isNaN(numeric) ? true : numeric > 0;
}

/** 15000 → "15,000" (Indian grouping); "25+" stays "25+". */
function formatValue(value) {
  const text = String(value).trim();
  const numeric = Number(text.replace(/,/g, ""));
  return /^[\d,]+$/.test(text) && Number.isFinite(numeric)
    ? numeric.toLocaleString("en-IN")
    : text;
}

function shortLabel(item) {
  const featured = item.extra_data?.featured || {};
  return (
    featured.short_name ||
    brandFor(item)?.label ||
    item.short_name ||
    nameOf(item)
      .replace(/\s+(university|online|distance|regular)\b/gi, "")
      .trim() ||
    "University"
  );
}

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const ICON_PATHS = {
  book: (
    <>
      <path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Z" />
      <path d="M12 5v15" />
    </>
  ),
  people: (
    <>
      <circle cx="12" cy="6" r="2.5" />
      <circle cx="5" cy="9" r="2" />
      <circle cx="19" cy="9" r="2" />
      <path d="M7 21v-4a5 5 0 0 1 10 0v4H7ZM2 18v-3a3 3 0 0 1 4-3M22 18v-3a3 3 0 0 0-4-3" />
    </>
  ),
  shield: (
    <>
      <path d="m12 2 8 3v6c0 5-3 8-8 11-5-3-8-6-8-11V5l8-3Z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  chart: (
    <path d="M3 15h4v6H3zM10 11h4v10h-4zM17 7h4v14h-4zM3 10l6-5 4 2 8-5M17 2h4v4" />
  ),
  campus: (
    <path d="m2 8 10-5 10 5H2ZM3 21h18M5 10v8M10 10v8M14 10v8M19 10v8M3 18h18" />
  ),
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  "chevron-left": <path d="m14 6-6 6 6 6" />,
  "chevron-right": <path d="m10 6 6 6-6 6" />,
  refresh: (
    <>
      <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      <path d="M20 4v7h-7" />
    </>
  ),
};
const STAT_ICONS = ["book", "people", "shield", "chart"];

function Icon({ name, fallback = "campus", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {ICON_PATHS[name] || ICON_PATHS[fallback]}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Image with graceful fallback + fade-in                              */
/* ------------------------------------------------------------------ */

function UniversityImage({ src, alt, placeholderLabel, eager = false }) {
  const [status, setStatus] = useState(src ? "loading" : "failed");
  const imgRef = useRef(null);

  // Images served from cache can finish before React attaches onLoad.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete) setStatus(img.naturalWidth ? "loaded" : "failed");
  }, []);

  if (!src || status === "failed") {
    return (
      <div
        className="cl-image-placeholder"
        role={placeholderLabel ? "img" : undefined}
        aria-label={placeholderLabel}
      >
        <Icon name="campus" />
        {placeholderLabel && <span aria-hidden="true">{placeholderLabel}</span>}
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={status === "loaded" ? "is-loaded" : undefined}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      onLoad={() => setStatus("loaded")}
      onError={() => setStatus("failed")}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Feature data                                                        */
/* ------------------------------------------------------------------ */

function getFeature(item, mode) {
  const extra = item.extra_data || {};
  const featured = extra.featured || {};
  const courseCount =
    featured.program_count ?? item.program_count ?? item.total_courses;
  const studentCount = featured.student_count ?? item.student_count;
  const image =
    featured.image_url ||
    item.image_url ||
    item.banner_url ||
    item.cover_image_url ||
    extra.og_image;
  const grade = String(extra.naac_grade || "")
    .replace(/^NAAC\s*/i, "")
    .trim();

  const defaults = [
    hasValue(courseCount)
      ? { icon: "book", value: formatValue(courseCount), label: "Programs" }
      : { icon: "book", value: "Explore", label: "Programs" },
    hasValue(studentCount)
      ? { icon: "people", value: formatValue(studentCount), label: "Students" }
      : { icon: "people", value: titleCase(mode), label: "Learning" },
    grade
      ? { icon: "shield", value: `NAAC ${grade}`, label: "Accredited" }
      : { icon: "shield", value: "University", label: "Details" },
    { icon: "chart", value: "Explore", label: "Opportunities" },
  ];

  const customStats = Array.isArray(featured.stats)
    ? featured.stats
        .filter((stat) => stat && hasValue(stat.value))
        .slice(0, 4)
        .map((stat) => ({ ...stat, value: formatValue(stat.value) }))
    : [];

  return {
    title: featured.title || item.name || "University",
    description:
      featured.description ||
      item.description ||
      `Explore ${mode} programmes and admission information at ${item.name || "this university"}.`,
    image: getImageUrl(image),
    grade,
    stats: customStats.length ? customStats : defaults,
  };
}

/* ------------------------------------------------------------------ */
/* University browser (tabs + feature card)                            */
/* ------------------------------------------------------------------ */

function UniversityBrowser({ items, mode }) {
  const instance = useId();
  const [selected, setSelected] = useState(() => {
    const initial = items.findIndex(isManipalJaipur);
    return initial < 0 ? 0 : initial;
  });
  const [edges, setEdges] = useState({ start: false, end: false });
  const tabRefs = useRef([]);
  const trackRef = useRef(null);
  const firstScroll = useRef(true);
  const touch = useRef(null);

  const count = items.length;
  const active = Math.min(selected, Math.max(0, count - 1));
  const university = items[active];
  const panelId = `${instance}-panel`;
  const feature = useMemo(
    () => (university ? getFeature(university, mode) : null),
    [university, mode],
  );

  const move = useCallback(
    (step) => setSelected((active + step + count) % count),
    [active, count],
  );

  // Track whether the tab strip can scroll further, for the edge fades.
  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    const start = track.scrollLeft > 2;
    const end = track.scrollLeft < max - 2;
    setEdges((prev) =>
      prev.start === start && prev.end === end ? prev : { start, end },
    );
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    updateEdges();
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateEdges)
        : null;
    observer?.observe(track);
    track.addEventListener("scroll", updateEdges, { passive: true });
    return () => {
      observer?.disconnect();
      track.removeEventListener("scroll", updateEdges);
    };
  }, [updateEdges, count]);

  // Keep the active tab in view (instant on first paint, smooth after).
  useEffect(() => {
    const track = trackRef.current;
    const tab = tabRefs.current[active];
    if (!track || !tab) return;
    const parent = track.getBoundingClientRect();
    const child = tab.getBoundingClientRect();
    let delta = 0;
    if (child.left < parent.left) delta = child.left - parent.left - 16;
    else if (child.right > parent.right) delta = child.right - parent.right + 16;
    if (delta)
      track.scrollTo({
        left: track.scrollLeft + delta,
        behavior: firstScroll.current ? "auto" : "smooth",
      });
    firstScroll.current = false;
  }, [active]);

  // Warm the cache for neighbouring campus images so switching feels instant.
  useEffect(() => {
    if (count < 2) return;
    [active - 1, active + 1].forEach((index) => {
      const neighbour = items[(index + count) % count];
      const src = neighbour && getFeature(neighbour, mode).image;
      if (src) {
        const img = new Image();
        img.decoding = "async";
        img.src = src;
      }
    });
  }, [active, count, items, mode]);

  if (!university || !feature) {
    return (
      <div className="cl-empty" role="status">
        <Icon name="campus" className="cl-empty-icon" />
        <strong>No {mode} universities yet</strong>
        <span>Please check another mode of study.</span>
      </div>
    );
  }

  const handleTabKey = (event, index) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % count;
    else if (event.key === "ArrowLeft") next = (index - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabRefs.current[next]?.focus({ preventScroll: true });
  };

  const onTouchStart = (event) => {
    const point = event.touches[0];
    touch.current = { x: point.clientX, y: point.clientY };
  };
  const onTouchEnd = (event) => {
    const start = touch.current;
    touch.current = null;
    if (!start || count < 2) return;
    const point = event.changedTouches[0];
    const dx = point.clientX - start.x;
    const dy = point.clientY - start.y;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.4)
      move(dx < 0 ? 1 : -1);
  };

  const trackClass = [
    "cl-university-tabs",
    edges.start && "has-start",
    edges.end && "has-end",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="cl-university-browser">
      <div className="cl-university-nav">
        <button
          className="cl-nav-button"
          type="button"
          aria-label="Previous university"
          aria-controls={panelId}
          disabled={count < 2}
          onClick={() => move(-1)}
        >
          <Icon name="chevron-left" />
        </button>

        <div
          className={trackClass}
          role="tablist"
          aria-label={`${titleCase(mode)} universities`}
          ref={trackRef}
        >
          {items.map((item, index) => {
            const label = shortLabel(item);
            const featured = item.extra_data?.featured || {};
            const icon = getImageUrl(featured.icon_url || item.icon_url);
            const logo = getImageUrl(item.logo_url);
            const useFullLogo = !icon && Boolean(logo);
            const isActive = index === active;
            return (
              <button
                key={item.id ?? item.slug ?? index}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                id={`${instance}-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                title={item.name || label}
                data-brand={brandFor(item)?.label}
                className={`cl-university-tab${isActive ? " is-active" : ""}${
                  useFullLogo ? " cl-university-tab--wordmark" : ""
                }`}
                onClick={() => setSelected(index)}
                onKeyDown={(event) => handleTabKey(event, index)}
              >
                <span
                  className={`cl-tab-logo${useFullLogo ? " cl-tab-logo--full" : ""}`}
                >
                  <UniversityImage key={icon || logo} src={icon || logo} alt="" />
                </span>
                <span className={useFullLogo ? "cl-sr-only" : "cl-tab-label"}>
                  <strong>{label}</strong>
                  <span>{titleCase(mode)}</span>
                </span>
              </button>
            );
          })}
        </div>

        <button
          className="cl-nav-button"
          type="button"
          aria-label="Next university"
          aria-controls={panelId}
          disabled={count < 2}
          onClick={() => move(1)}
        >
          <Icon name="chevron-right" />
        </button>
      </div>

      <article
        key={university.id ?? university.slug ?? active}
        className="cl-feature"
        id={panelId}
        role="tabpanel"
        tabIndex={0}
        aria-labelledby={`${instance}-tab-${active}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="cl-feature-image">
          <UniversityImage
            key={feature.image}
            src={feature.image}
            alt={`${university.name || feature.title} campus`}
            placeholderLabel="Campus image unavailable"
            eager
          />
          <span className="cl-feature-badge">{titleCase(mode)}</span>
          {count > 1 && (
            <span className="cl-feature-count" aria-hidden="true">
              {String(active + 1).padStart(2, "0")}
              <i>/</i>
              {String(count).padStart(2, "0")}
            </span>
          )}
        </div>

        <div className="cl-feature-content">
          <h3 className="cl-feature-title">{feature.title}</h3>
          <p className="cl-feature-description">{feature.description}</p>

          <div className="cl-feature-footer">
            <ul className="cl-stats">
              {feature.stats.map((stat, index) => (
                <li className="cl-stat" key={`${stat.label}-${index}`}>
                  <span className="cl-stat-icon">
                    <Icon name={stat.icon} fallback={STAT_ICONS[index]} />
                  </span>
                  <span className="cl-stat-copy">
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="cl-feature-actions">
              <span className="cl-feature-hint">
                View all programmes and admission details
              </span>
              {university.slug ? (
                <Link
                  className="cl-explore-button"
                  to={`/university/${encodeURIComponent(university.slug)}`}
                  aria-label={`Explore ${university.name || feature.title}`}
                >
                  Explore University <Icon name="arrow" />
                </Link>
              ) : (
                <span className="cl-explore-button is-disabled" aria-disabled="true">
                  Details coming soon
                </span>
              )}
            </div>
          </div>
        </div>
      </article>

      <p className="cl-live" aria-live="polite">
        {`Showing ${university.name || feature.title}, ${active + 1} of ${count}`}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Loading skeleton                                                    */
/* ------------------------------------------------------------------ */

function BrowserSkeleton() {
  return (
    <div className="cl-skeleton" role="status" aria-label="Loading universities">
      <div className="cl-skeleton-tabs">
        {Array.from({ length: 7 }, (_, index) => (
          <span key={index} className="cl-shimmer cl-skeleton-tab" />
        ))}
      </div>
      <div className="cl-skeleton-feature">
        <span className="cl-shimmer cl-skeleton-image" />
        <div className="cl-skeleton-copy">
          <span className="cl-shimmer" style={{ width: "55%", height: 26 }} />
          <span className="cl-shimmer" style={{ width: "92%" }} />
          <span className="cl-shimmer" style={{ width: "74%" }} />
          <div className="cl-skeleton-stats">
            {Array.from({ length: 4 }, (_, index) => (
              <span key={index} className="cl-shimmer" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export default function Clients() {
  const headingId = useId();
  const [clients, setClients] = useState([]);
  const [activeMode, setActiveMode] = useState("online");
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;
    setStatus("loading");

    api
      .get("/public/clients", { signal: controller.signal })
      .then((res) => {
        const payload = res?.data;
        const data = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
        if (!mounted) return;
        setClients(data.filter((item) => item && typeof item === "object"));
        setStatus("ready");
      })
      .catch((err) => {
        if (!mounted || err?.name === "CanceledError" || err?.name === "AbortError")
          return;
        setStatus("error");
      });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [attempt]);

  // Group by mode once, sorted by brand order, then name.
  const byMode = useMemo(() => {
    const groups = Object.fromEntries(MODES.map((mode) => [mode, []]));
    clients.forEach((item) => {
      if (normalize(item.type) !== "university") return;
      const mode = normalize(item.mode);
      if (groups[mode]) groups[mode].push(item);
    });
    MODES.forEach((mode) =>
      groups[mode].sort(
        (a, b) =>
          brandIndex(a) - brandIndex(b) || nameOf(a).localeCompare(nameOf(b)),
      ),
    );
    return groups;
  }, [clients]);

  const universities = byMode[activeMode];

  return (
    <section className="cl-section" aria-labelledby={headingId}>
      <div className="cl-container">
        <div className="cl-layout">
          <div className="cl-left">
            <div className="cl-eyebrow">
              <span>OUR NETWORK</span>
              <i aria-hidden="true" />
            </div>
            <h2 className="cl-title" id={headingId}>
              <span className="cl-title-line">Explore Regular, Online</span>{" "}
              <span className="cl-title-accent">&amp; Distance Education</span>
            </h2>
            <p className="cl-description">
              Discover our network of reputed universities offering online,
              regular and distance programmes.
            </p>
            <div className="cl-mode-tabs" role="group" aria-label="Mode of study">
              {MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`cl-mode-tab${mode === activeMode ? " is-active" : ""}`}
                  aria-pressed={mode === activeMode}
                  onClick={() => setActiveMode(mode)}
                >
                  {titleCase(mode)}
                </button>
              ))}
            </div>
          </div>

          <div className="cl-right" aria-busy={status === "loading"}>
            {status === "loading" ? (
              <BrowserSkeleton />
            ) : status === "error" ? (
              <div className="cl-error" role="alert">
                <Icon name="campus" className="cl-empty-icon" />
                <strong>Unable to load universities</strong>
                <span>Please check your connection and try again.</span>
                <button
                  className="cl-retry"
                  type="button"
                  onClick={() => setAttempt((value) => value + 1)}
                >
                  <Icon name="refresh" /> Try again
                </button>
              </div>
            ) : (
              <UniversityBrowser
                key={activeMode}
                items={universities}
                mode={activeMode}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}