
import { useEffect, useState } from "react";
import api from "../api/api";
import "./WhyChooseUs.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://api.geduconnect.com/api";

const BASE_URL = API_BASE.replace(/\/api\/?$/, "");

const getImageUrl = (path) => {
  if (!path) return "";
  if (/^(https?:)?\/\//i.test(path)) return path;

  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

/* ==========================================
   DECORATIVE ICONS
========================================== */

function WhyIcon({ type }) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (type) {
    case "graduation":
      return (
        <svg {...common}>
          <path d="m2 9 10-5 10 5-10 5L2 9Z" />
          <path d="M6 11v6c3.5 3 8.5 3 12 0v-6" />
          <path d="M22 9v8" />
        </svg>
      );

    case "people":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M2 21v-3a7 7 0 0 1 14 0v3H2Z" />
          <path d="M17 14a5 5 0 0 1 5 5v2h-4" />
        </svg>
      );

    case "growth":
      return (
        <svg {...common}>
          <path d="M3 20h18" />
          <rect x="4" y="13" width="4" height="7" />
          <rect x="10" y="9" width="4" height="11" />
          <rect x="16" y="5" width="4" height="15" />
          <path d="m4 10 6-5 4 2 6-5" />
          <path d="M16 2h4v4" />
        </svg>
      );

    case "handshake":
      return (
        <svg {...common}>
          <path d="m2 12 4-5 4 2 3-2 5 1 4 4-5 7-3-2" />
          <path d="m6 7 3-2 4 2" />
          <path d="m10 13 6 6" />
          <path d="m8 16 4 4" />
          <path d="m14 10-3 3 2 2 3-2" />
        </svg>
      );

    default:
      return null;
  }
}

/* ==========================================
   MAIN COMPONENT
========================================== */

export default function WhyChooseUs() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchSection = async () => {
      try {
        const res = await api.get("/public/why-choose-us");

        if (mounted) {
          setData(res.data?.data || res.data);
        }
      } catch (err) {
        console.error("Error loading Why Choose Us:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSection();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading || !data) return null;

  if (Number(data.is_active) !== 1) return null;

  const points = Array.isArray(data.points)
    ? [...data.points].sort(
        (a, b) =>
          (Number(a.sort_order) || 0) -
          (Number(b.sort_order) || 0)
      )
    : [];

  const imageUrl = getImageUrl(data.image_url);

  return (
    <section className="why-section">
      {/* BACKGROUND DECORATIONS */}
      <div className="why-bg why-bg-one" />
      <div className="why-bg why-bg-two" />
      <div className="why-dot-pattern" />

      <div className="why-container">
        <div className="why-grid">

          {/* LEFT CONTENT */}
          <div className="why-left">

            <div className="why-heading-row">
              <span className="why-section-number">
                03
              </span>

              <div className="why-heading-content">
                <div className="why-tag">
                  <span>WHY CHOOSE US</span>
                  <span className="why-tag-line" />
                </div>

                <h2 className="why-title">
                  {data.heading || "Why Choose Us"}
                </h2>
              </div>
            </div>

            <p className="why-desc">
              {data.description}
            </p>

            {/* OFFERINGS */}
            {points.length > 0 && (
              <div className="why-offerings">
                {data.offerings_title && (
                  <h3 className="why-offerings-title">
                    {data.offerings_title}
                  </h3>
                )}

                <div className="why-points">
                  {points.map((point, index) => (
                    <div
                      className="why-point"
                      key={point.id ?? index}
                    >
                      <div className="why-point-icon">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <p>{point.point}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            {data.cta_text && data.cta_link && (
              <div className="why-cta">
                <a href={data.cta_link}>
                  <span>{data.cta_text}</span>
                  <span className="why-cta-arrow">
                    →
                  </span>
                </a>
              </div>
            )}
          </div>

          {/* RIGHT VISUAL */}
          <div className="why-right">
            <div className="why-visual">

              <div className="why-orbit why-orbit-one" />
              <div className="why-orbit why-orbit-two" />

              <div className="why-image-wrap">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={data.heading || "Why Choose Us"}
                    className="why-image"
                    loading="lazy"
                  />
                ) : (
                  <div className="why-no-image">
                    University Excellence
                  </div>
                )}
              </div>

              {/* FLOATING ICONS */}
              <div className="why-float-icon why-float-graduation">
                <WhyIcon type="graduation" />
              </div>

              <div className="why-float-icon why-float-people">
                <WhyIcon type="people" />
              </div>

              <div className="why-float-icon why-float-growth">
                <WhyIcon type="growth" />
              </div>

              <div className="why-float-icon why-float-handshake">
                <WhyIcon type="handshake" />
              </div>

              {/* EXCELLENCE BADGE */}
              <div className="why-excellence-badge">
                <span className="why-excellence-number">
                  17+
                </span>
                <span className="why-excellence-text">
                  Years of
                  <br />
                  Excellence
                </span>
              </div>

              <span className="why-orbit-dot why-orbit-dot-one" />
              <span className="why-orbit-dot why-orbit-dot-two" />
              <span className="why-orbit-dot why-orbit-dot-three" />

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
