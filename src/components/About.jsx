
import { useEffect, useState, useRef } from "react";
import api from "../api/api";
import AboutDesign from "./AboutDesign";
import "./AboutDesign.css";
import "./About.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://api.geduconnect.com/api";

const BASE_URL = API_BASE.replace(/\/api\/?$/, "");

const getImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

function useReveal(threshold = 0.05) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (
      typeof IntersectionObserver === "undefined"
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: "0px 0px 50px 0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

function Counter({ end, suffix = "", duration = 1600 }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useReveal(0.1);

  useEffect(() => {
    if (!visible) return;

    const target = Number(end) || 0;
    let frame;
    let startTime;

    const animate = (time) => {
      if (startTime === undefined) startTime = time;

      const progress = Math.min(
        (time - startTime) / duration,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(Math.round(target * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [visible, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export default function About({ variant = "home" }) {
  const [about, setAbout] = useState(null);
  const [bannerRef, bannerVisible] = useReveal();
  const [founderRef, founderVisible] = useReveal();
  const [mvRef, mvVisible] = useReveal();

  useEffect(() => {
    let active = true;

    const fetchAbout = async () => {
      try {
        const res = await api.get("/public/home");
        if (active) setAbout(res.data.about);
      } catch (err) {
        console.error("Error loading about section:", err);
      }
    };

    fetchAbout();

    return () => {
      active = false;
    };
  }, []);

  if (!about || Number(about.is_active) !== 1) {
    return null;
  }

  const hasFounder =
    Boolean(about.founder_message) ||
    Boolean(about.founder_image_url);

  return (
    <div className="about-page">
      {variant === "page" && about.home_image_url && (
        <section
          ref={bannerRef}
          className={`about-banner ${
            bannerVisible ? "banner-revealed" : ""
          }`}
          style={{
            backgroundImage: `url("${getImageUrl(
              about.home_image_url
            )}")`,
          }}
        >
          <div className="banner-grain" />
          <div className="banner-overlay" />
          <div className="banner-orb banner-orb--1" />
          <div className="banner-orb banner-orb--2" />
          <div className="banner-geo banner-geo--1" />
          <div className="banner-geo banner-geo--2" />

          <div className="banner-content">
            <div className="banner-eyebrow">Our Story</div>
            <h1 className="banner-title">{about.heading}</h1>
            <p className="banner-sub">
              Partnering with 750+ consultants and 25+
              universities to build a smarter, scalable
              education network for the future.
            </p>
            <div className="banner-line" />
          </div>

          <div className="stat-strip">
            {[
              {
                end: 750,
                suffix: "+",
                label: "Consultants",
              },
              {
                end: 25,
                suffix: "+",
                label: "Universities",
              },
              {
                end: 12,
                suffix: "+",
                label: "Years of Excellence",
              },
              {
                end: 98,
                suffix: "%",
                label: "Partner Satisfaction",
              },
            ].map((stat) => (
              <div className="stat-item" key={stat.label}>
                <div className="stat-number">
                  <Counter
                    end={stat.end}
                    suffix={stat.suffix}
                  />
                </div>
                <div className="stat-label">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Existing homepage About section */}
      <AboutDesign about={about} />

      {variant === "page" && (
        <>
          {/* PREMIUM FOUNDER SECTION */}
          {hasFounder && (
            <section
              ref={founderRef}
              className={`founder-section ${
                founderVisible ? "section-revealed" : ""
              }`}
            >
              <div className="founder-shell">
                <div className="founder-heading">
                  <span className="founder-eyebrow">
                    <span className="founder-eyebrow-line" />
                    THE VISION BEHIND OUR JOURNEY
                  </span>

                  <h2>
                    A Message from <em>Our Founder</em>
                  </h2>

                  <p>
                    Building meaningful connections,
                    creating opportunities, and shaping
                    the future of education.
                  </p>
                </div>

                <div className="founder-card">
                  <div className="founder-portrait-side">
                    <div className="founder-portrait-decor founder-decor-one" />
                    <div className="founder-portrait-decor founder-decor-two" />

                    {about.founder_image_url ? (
                      <div className="founder-portrait-frame">
                        <img
                          src={getImageUrl(
                            about.founder_image_url
                          )}
                          alt={
                            about.founder_name ||
                            "G Educonnect Founder"
                          }
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="founder-portrait-placeholder">
                        <span>G</span>
                      </div>
                    )}

                    <div className="founder-photo-caption">
                      <span>LEADERSHIP & VISION</span>
                      <strong>
                        {about.founder_name || "Our Founder"}
                      </strong>
                      <small>Founder, G Educonnect</small>
                    </div>
                  </div>

                  <div className="founder-message-side">
                    <div className="founder-message-top">
                      <span className="founder-message-label">
                        FOUNDER'S NOTE
                      </span>
                      <span className="founder-quote-symbol">
                        &ldquo;
                      </span>
                    </div>

                    <h3>
                      Empowering education through
                      stronger partnerships.
                    </h3>

                    <div className="founder-message-scroll">
                      {about.founder_message
                        ? String(about.founder_message)
                            .split(/\n\s*\n/)
                            .filter(Boolean)
                            .map((paragraph, index) => (
                              <p key={index}>
                                {paragraph.trim()}
                              </p>
                            ))
                        : (
                          <p>
                            Creating opportunities through
                            collaboration and innovation.
                          </p>
                        )}
                    </div>

                    <div className="founder-message-signature">
                      <span className="founder-signature-rule" />

                      <div>
                        <strong>
                          {about.founder_name || "Our Founder"}
                        </strong>
                        <span>Founder, G Educonnect</span>
                      </div>

                      <span className="founder-signature-mark">
                        GE
                      </span>
                    </div>
                  </div>
                </div>

                <div className="founder-bottom-line">
                  <span>
                    <i />
                    LEADERSHIP WITH PURPOSE
                  </span>
                  <span>
                    CONNECTING PEOPLE. CREATING FUTURES.
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* MISSION & VISION */}
          {(about.mission || about.vision) && (
            <section
              ref={mvRef}
              className={`mv-section ${
                mvVisible ? "section-revealed" : ""
              }`}
            >
              <div className="mv-inner">
                <div className="section-eyebrow mv-eyebrow">
                  Our Purpose
                </div>

                <h2 className="mv-title">
                  Mission &amp; Vision
                </h2>

                <div className="mv-cards">
                  {about.mission && (
                    <div className="mv-card mv-card--mission">
                      <div className="mv-card__icon">◎</div>
                      <h3>Our Mission</h3>
                      <p>{about.mission}</p>
                    </div>
                  )}

                  {about.vision && (
                    <div className="mv-card mv-card--vision">
                      <div className="mv-card__icon">◈</div>
                      <h3>Our Vision</h3>
                      <p>{about.vision}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
