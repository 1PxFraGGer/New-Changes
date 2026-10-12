
import { useEffect, useState, useRef, useCallback } from "react";
import api from "../api/api";
import "./HomeTestimonials.css";

const AUTO_DELAY = 4500;

export default function HomeTestimonials() {
  const [data, setData] = useState([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);

  const touchStart = useRef(null);

  /* ==========================================
     FETCH TESTIMONIALS
  ========================================== */

  useEffect(() => {
    let mounted = true;

    const fetchTestimonials = async () => {
      try {
        const res = await api.get("/public/testimonials");

        const testimonials = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        if (mounted) {
          setData(testimonials);
        }
      } catch (error) {
        console.error("Error loading testimonials:", error);
      }
    };

    fetchTestimonials();

    return () => {
      mounted = false;
    };
  }, []);

  /* ==========================================
     RESPONSIVE CARD COUNT
  ========================================== */

  useEffect(() => {
    const updateCount = () => {
      if (window.innerWidth <= 600) {
        setVisibleCount(1);
      } else if (window.innerWidth <= 900) {
        setVisibleCount(2);
      } else if (window.innerWidth <= 1200) {
        setVisibleCount(3);
      } else {
        setVisibleCount(4);
      }
    };

    updateCount();

    window.addEventListener("resize", updateCount);

    return () => {
      window.removeEventListener("resize", updateCount);
    };
  }, []);

  /* ==========================================
     NAVIGATION
  ========================================== */

  const next = useCallback(() => {
    if (data.length <= visibleCount) return;

    setActive((prev) => (prev + 1) % data.length);
  }, [data.length, visibleCount]);

  const prev = useCallback(() => {
    if (data.length <= visibleCount) return;

    setActive(
      (prev) => (prev - 1 + data.length) % data.length
    );
  }, [data.length, visibleCount]);

  /* ==========================================
     AUTO ROTATION
  ========================================== */

  useEffect(() => {
    if (
      paused ||
      data.length <= visibleCount
    ) {
      return;
    }

    const timer = setInterval(next, AUTO_DELAY);

    return () => clearInterval(timer);
  }, [next, paused, data.length, visibleCount]);

  /* ==========================================
     SWIPE SUPPORT
  ========================================== */

  const handleTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStart.current === null) return;

    const distance =
      e.changedTouches[0].clientX -
      touchStart.current;

    if (Math.abs(distance) > 45) {
      if (distance < 0) {
        next();
      } else {
        prev();
      }
    }

    touchStart.current = null;
  };

  /* ==========================================
     VISIBLE TESTIMONIALS
  ========================================== */

  const visibleTestimonials = [];

  const count = Math.min(visibleCount, data.length);

  for (let i = 0; i < count; i++) {
    const index = (active + i) % data.length;

    visibleTestimonials.push({
      ...data[index],
      originalIndex: index,
    });
  }

  if (!data.length) return null;

  return (
    <section className="home-testimonials">

      {/* BACKGROUND DECORATIONS */}

      <div className="ht-bg ht-bg-one" />
      <div className="ht-bg ht-bg-two" />

      <div className="ht-dots ht-dots-left" />
      <div className="ht-dots ht-dots-right" />

      <div className="ht-orbit ht-orbit-left" />
      <div className="ht-orbit ht-orbit-right" />

      <div className="ht-orbit-dot ht-orbit-dot-left" />
      <div className="ht-orbit-dot ht-orbit-dot-right" />

      <div className="ht-container">

        {/* HEADER */}

        <div className="ht-header">

          <div className="ht-heading-top">
            <span className="ht-heading-line" />

            <span className="ht-tag">
              Testimonials
            </span>

            <span className="ht-heading-line" />
          </div>

          <h2>
            Trusted By Students,
            <br />
            Institutions &amp;{" "}
            <span>Professionals</span>
          </h2>

          <p>
            Real experiences from learners, university
            partners and working professionals who
            transformed their educational journey with us.
          </p>

          <div className="ht-heading-diamond" />

        </div>

        {/* CAROUSEL */}

        <div
          className="ht-carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >

          {/* LEFT ARROW */}

          <button
            type="button"
            className="ht-nav ht-nav-prev"
            onClick={prev}
            disabled={data.length <= visibleCount}
            aria-label="Previous testimonials"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </button>

          {/* CARDS */}

          <div
            className="ht-cards"
            key={`${active}-${visibleCount}`}
          >

            {visibleTestimonials.map((t, index) => (

              <article
                className="ht-card"
                key={`${t.id ?? t.originalIndex}-${index}`}
                style={{
                  "--card-delay": `${index * 0.08}s`,
                }}
              >

                <div className="ht-card-glow" />

                <div className="ht-card-decoration" />

                {/* QUOTE */}

                <div className="ht-quote">
                  <svg
                    width="29"
                    height="29"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M10.5 11H6.2c.4-2.5 1.8-4.2 4.3-5.2V3.5C5.5 4.8 3 8.4 3 13.5V20h7.5v-9Zm10.5 0h-4.3c.4-2.5 1.8-4.2 4.3-5.2V3.5c-5 1.3-7.5 4.9-7.5 10V20H21v-9Z" />
                  </svg>
                </div>

                {/* MESSAGE */}

                <div className="ht-content">
                  <p>{t.message}</p>
                </div>

                {/* USER */}

                <div className="ht-footer">

                  <div className="ht-avatar">
                    {t.name
                      ?.charAt(0)
                      ?.toUpperCase() || "G"}
                  </div>

                  <div className="ht-user">

                    <h4>
                      {t.name || "Anonymous"}
                    </h4>

                    {t.designation && (
                      <span>{t.designation}</span>
                    )}

                    {t.organization && (
                      <small>{t.organization}</small>
                    )}

                  </div>

                </div>

              </article>

            ))}

          </div>

          {/* RIGHT ARROW */}

          <button
            type="button"
            className="ht-nav ht-nav-next"
            onClick={next}
            disabled={data.length <= visibleCount}
            aria-label="Next testimonials"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>

        </div>

        {/* PAGINATION */}

        {data.length > visibleCount && (
          <div className="ht-pagination">

            {data.map((_, index) => (
              <button
                type="button"
                key={index}
                className={`ht-page-dot ${
                  index === active ? "active" : ""
                }`}
                onClick={() => setActive(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}

          </div>
        )}

      </div>

    </section>
  );
}
