
import { useEffect, useState, useRef } from "react";
import {
  UsersRound,
  GraduationCap,
  Landmark,
  Handshake,
  FileText,
} from "lucide-react";
import api from "../api/api";
import "./Highlights.css";

/* ==========================================
   API CONFIGURATION
========================================== */

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://api.geduconnect.com/api";

const BASE_URL = API_BASE.replace(/\/api\/?$/, "");

const resolveUrl = (url) => {
  if (!url) return "";
  if (/^(https?:)?\/\//i.test(url)) return url;

  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

/* ==========================================
   HIGHLIGHT ICONS
========================================== */

const HIGHLIGHT_ICONS = [
  UsersRound,
  GraduationCap,
  Landmark,
  Handshake,
  FileText,
];

function HighlightIcon({ index }) {
  const Icon =
    HIGHLIGHT_ICONS[index % HIGHLIGHT_ICONS.length];

  return (
    <Icon
      size={24}
      strokeWidth={1.5}
      aria-hidden="true"
    />
  );
}

/* ==========================================
   ANIMATED COUNTER
========================================== */

function Counter({ target, suffix = "+" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const numericTarget = Number(target) || 0;
    let frameId;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;

          let startTime = null;
          const duration = 1500;

          const animate = (timestamp) => {
            if (startTime === null) {
              startTime = timestamp;
            }

            const progress = Math.min(
              (timestamp - startTime) / duration,
              1
            );

            const eased =
              1 - Math.pow(1 - progress, 3);

            setCount(
              Math.floor(eased * numericTarget)
            );

            if (progress < 1) {
              frameId = requestAnimationFrame(animate);
            } else {
              setCount(numericTarget);
            }
          };

          frameId = requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [target]);

  return (
    <span ref={ref} className="hl-number">
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/* ==========================================
   MAIN HIGHLIGHTS COMPONENT
========================================== */

export default function Highlights() {
  const [highlights, setHighlights] = useState([]);

  const [meta, setMeta] = useState({
    title: "HIGHLIGHTS",
    subtitle:
      "Education Through People, Partnerships & Purpose",
    background_image_url: "",
    is_active: 1,
  });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const res = await api.get("/public/highlights");

        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        if (mounted) {
          setHighlights(data);
        }

        try {
          const metaRes = await api.get(
            "/public/highlights/meta"
          );

          const metaData =
            metaRes.data?.data &&
            !Array.isArray(metaRes.data.data)
              ? metaRes.data.data
              : metaRes.data;

          if (mounted && metaData) {
            setMeta((prev) => ({
              ...prev,
              ...metaData,
            }));
          }
        } catch (error) {
          console.warn(
            "Highlights metadata unavailable:",
            error
          );
        }
      } catch (err) {
        console.error(
          "Error loading highlights:",
          err
        );
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  if (!highlights.length) return null;
  if (Number(meta.is_active) === 0) return null;

  const bgStyle = meta.background_image_url
    ? {
        "--hl-cms-bg": `url("${resolveUrl(
          meta.background_image_url
        )}")`,
      }
    : {};

  return (
    <section className="hl-section" style={bgStyle}>

      {/* BACKGROUND IMAGE */}
      <div className="hl-bg-image" />

      {/* DARK GRADIENT OVERLAY */}
      <div className="hl-dark-overlay" />

      {/* BACKGROUND DOT TEXTURE */}
      <div className="hl-dots hl-dots-left" />
      <div className="hl-dots hl-dots-right" />

      {/* DECORATIVE GOLD CURVES */}
      <div className="hl-decoration-left">
        <div className="hl-deco-curve-one" />
        <div className="hl-deco-curve-two" />
      </div>

      <div className="hl-decoration-right">
        <div className="hl-deco-curve-three" />
        <div className="hl-deco-curve-four" />
      </div>

      {/* BOTTOM GOLD LIGHT EFFECTS */}
      <div className="hl-bottom-wave-left" />
      <div className="hl-bottom-wave-right" />

      {/* MAIN CONTENT */}
      <div className="hl-inner">

        {/* HEADING */}
        <div className="hl-head">

          <div className="hl-heading-top">
            <span className="hl-heading-line" />

            <h2 className="hl-title">
              {meta.title || "HIGHLIGHTS"}
            </h2>

            <span className="hl-heading-line" />
          </div>

          <h3 className="hl-subtitle">
            {meta.subtitle ||
              "Education Through People, Partnerships & Purpose"}
          </h3>

        </div>

        {/* HIGHLIGHTS STATISTICS */}
        <div className="hl-stats">

          {highlights.map((item, index) => (
            <div
              className="hl-stat"
              key={item.id ?? index}
              style={{
                animationDelay: `${index * 0.12}s`,
              }}
            >

              <div className="hl-stat-inner">

                {/* GOLD ICON CIRCLE */}
                <div className="hl-icon-circle">
                  <HighlightIcon index={index} />
                </div>

                {/* ANIMATED NUMBER */}
                <div className="hl-num-wrap">
                  <Counter
                    target={Number(item.value) || 0}
                    suffix={item.suffix ?? "+"}
                  />
                </div>

                {/* STAT LABEL */}
                <span className="hl-label">
                  {item.label}
                </span>

              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
