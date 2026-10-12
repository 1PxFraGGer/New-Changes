import { useEffect, useState, useRef } from "react";
import api from "../api/api";
import AboutDesign from "./AboutDesign";
import "./AboutDesign.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api.geduconnect.com/api";
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
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < window.innerHeight) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        obs.disconnect();
      }
    }, { threshold, rootMargin: "0px 0px -40px 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Counter({ end, suffix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useReveal(0.3);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [visible, end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function About({ variant = "home" }) {
  const [about, setAbout] = useState(null);
  const [bannerRef, bannerVisible] = useReveal(0.05);
  const [founderRef, founderVisible] = useReveal(0.1);
  const [mvRef, mvVisible] = useReveal(0.1);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await api.get("/public/home");
        setAbout(res.data.about);
      } catch (err) {
        console.error("Error loading about section:", err);
      }
    };
    fetchAbout();
  }, []);

  if (!about || Number(about.is_active) !== 1) return null;

  return (
    <>
      {variant === "page" && about.home_image_url && (
        <section ref={bannerRef} className={`about-banner ${bannerVisible ? "banner-revealed" : ""}`} style={{ backgroundImage: `url(${getImageUrl(about.home_image_url)})` }}>
          <div className="banner-grain" />
          <div className="banner-overlay" />
          <div className="banner-orb banner-orb--1" />
          <div className="banner-orb banner-orb--2" />
          <div className="banner-geo banner-geo--1" />
          <div className="banner-geo banner-geo--2" />
          <div className="banner-content">
            <div className="banner-eyebrow">Our Story</div>
            <h1 className="banner-title">{about.heading}</h1>
            <p className="banner-sub">Partnering with 750+ consultants and 25+ universities to build a smarter, scalable education network for the future.</p>
            <div className="banner-line" />
          </div>
          <div className="stat-strip">
            {[
              { end: 750, suffix: "+", label: "Consultants" },
              { end: 25, suffix: "+", label: "Universities" },
              { end: 12, suffix: "+", label: "Years of Excellence" },
              { end: 98, suffix: "%", label: "Partner Satisfaction" },
            ].map((s) => (
              <div key={s.label} className="stat-item">
                <div className="stat-number"><Counter end={s.end} suffix={s.suffix} /></div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <AboutDesign about={about} />

      {variant === "page" && (
        <>
          {(about.founder_message || about.founder_image_url) && (
            <section ref={founderRef} className={`founder-section ${founderVisible ? "section-revealed" : ""}`}>
              <div className="founder-inner">
                <div className="founder-img-col">
                  {about.founder_image_url && (
                    <div className="founder-img-wrap">
                      <img src={getImageUrl(about.founder_image_url)} alt={about.founder_name || "Founder"} />
                      <div className="founder-img-accent" />
                    </div>
                  )}
                </div>
                <div className="founder-text-col">
                  <div className="section-eyebrow">Founder's Note</div>
                  <div className="quote-mark">"</div>
                  {about.founder_message && <p className="founder-quote">{about.founder_message}</p>}
                  {about.founder_name && (
                    <div className="founder-sig"><div className="founder-sig__line" /><span>{about.founder_name}</span></div>
                  )}
                </div>
              </div>
            </section>
          )}
          {(about.mission || about.vision) && (
            <section ref={mvRef} className={`mv-section ${mvVisible ? "section-revealed" : ""}`}>
              <div className="mv-inner">
                <div className="section-eyebrow mv-eyebrow">Our Purpose</div>
                <h2 className="mv-title">Mission &amp; Vision</h2>
                <div className="mv-cards">
                  {about.mission && <div className="mv-card mv-card--mission"><div className="mv-card__icon">◎</div><h3>Our Mission</h3><p>{about.mission}</p></div>}
                  {about.vision && <div className="mv-card mv-card--vision"><div className="mv-card__icon">◈</div><h3>Our Vision</h3><p>{about.vision}</p></div>}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}