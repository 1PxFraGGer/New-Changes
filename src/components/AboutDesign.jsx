import { useEffect, useRef } from "react";
import "./AboutDesign.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api.geduconnect.com/api";
const BASE_URL = API_BASE.replace(/\/api\/?$/, "");
const getImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const DEFAULT_TITLE = "About G Educonnect";
const DEFAULT_SUBTITLE = "Empowering Education Through Institutional & Consultant Partnerships";
const DEFAULT_DESC =
  "G Educonnect is a trusted education consultant in Jaipur offering admission counselling, course selection, college guidance and university support across India.";

const CANVAS_W = 1680; // must match .ga-stage / .ga-container width in the CSS
const CORNER_IMAGE = "/university-building.png"; // put this file in your /public folder, or change the path
const STAGE_H = 480;  // must match .ga-stage / .ga-container height in the CSS

export default function AboutDesign({ about = {} }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const fit = () => {
      if (window.innerWidth <= 768) {
        stage.style.transform = "";
        stage.style.left = "";
        stage.style.top = "";
        section.style.height = "";
        section.style.setProperty("--ga-s", "1");
        section.style.setProperty("--ga-pad", "0px");
        return;
      }
      const scale = Math.min(section.clientWidth / CANVAS_W, 1.4);
      stage.style.transform = `scale(${scale})`;
      stage.style.left = `${Math.max(0, (section.clientWidth - CANVAS_W * scale) / 2)}px`;
      section.style.setProperty("--ga-s", String(scale));
      const PAD = 30;
      stage.style.top = `${PAD}px`;
      section.style.setProperty("--ga-pad", `${PAD}px`);
      // height is calculated from constants (no DOM measuring), +3 for the top border
      section.style.height = `${Math.ceil(STAGE_H * scale + PAD * 2 + 3)}px`;
    };

    fit();
    window.addEventListener("resize", fit);
    const ro = new ResizeObserver(fit);
    ro.observe(section);
    return () => {
      window.removeEventListener("resize", fit);
      ro.disconnect();
    };
  }, []);

  const heading = about.heading && about.heading.includes("G Educonnect") ? about.heading : DEFAULT_TITLE;
  const [before, ...rest] = heading.split("G Educonnect");
  const after = rest.join("G Educonnect");

  return (
    <section className="ga-section" id="about" ref={sectionRef} data-ga-version="v3">
      <div className="ga-dots ga-dots-right" />
      <div className="ga-corner" style={{ "--ga-corner-img": `url(${about.corner_image_url ? getImageUrl(about.corner_image_url) : CORNER_IMAGE})` }} />
      <div className="ga-arc" />
      <div className="ga-glow" />

      <div className="ga-stage" ref={stageRef}>
        <div className="ga-dots ga-dots-left" />
        <div className="ga-dots ga-dots-middle" />

        <div className="ga-container">
          {/* LEFT */}
          <div className="ga-visual">
            <div className="ga-red-block ga-red-top" />
            <div className="ga-red-block ga-red-bottom" />
            <div className="ga-outline" />

            <div className="ga-photo">
              {about.image_url && (
                <img src={getImageUrl(about.image_url)} alt="Student representing G Educonnect education services" />
              )}
            </div>

            <div className="ga-edu">
              <div className="ga-edu-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 1 9l11 6 9-4.9V17h2V9L12 3z" /><path d="M5 13.2v4c0 1.7 3.1 3.3 7 3.3s7-1.6 7-3.3v-4l-7 3.8-7-3.8z" /></svg>
              </div>
              <h3>Empowering<br />Education<br />Across India</h3>
              <div className="ga-gold-line" />
            </div>

            <div className="ga-exp">
              <div className="ga-crown">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8z" /></svg>
              </div>
              <h3>12+</h3>
              <p>Years of<br />Excellence</p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="ga-content">
            <div className="ga-eyebrow"><span>WHO WE ARE</span></div>

            <h2 className="ga-title">{before}<span>G Educonnect</span>{after}</h2>

            <p className="ga-subtitle">{about.subheading || DEFAULT_SUBTITLE}</p>
            <p className="ga-desc">{about.paragraph1 || DEFAULT_DESC}</p>

            <div className="ga-grid">
              <div className="ga-card">
                <div className="ga-card-top">
                  <div className="ga-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m11 17 2 2a1 1 0 1 0 3-3" /><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" /><path d="m21 3 1 11h-2" /><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" /><path d="M3 4h8" /></svg>
                  </div>
                  <h3>Trust-Driven<br />Partnerships</h3>
                </div>
                <p>Building long-term relationships with universities and education consultants.</p>
              </div>

              <div className="ga-card">
                <div className="ga-card-top">
                  <div className="ga-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="13" width="4.5" height="8" rx="1" /><rect x="9.75" y="8.5" width="4.5" height="12.5" rx="1" /><rect x="16.5" y="3" width="4.5" height="18" rx="1" /></svg>
                  </div>
                  <h3>Tech-Enabled<br />Growth</h3>
                </div>
                <p>Using technology to create smarter, faster and more transparent education solutions.</p>
              </div>

              <div className="ga-card">
                <div className="ga-card-top">
                  <div className="ga-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.5" r="3.2" /><path d="M6.3 20c0-3.5 2.5-5.7 5.7-5.7s5.7 2.2 5.7 5.7" /><circle cx="4.8" cy="10" r="2.1" /><path d="M1.5 18.2c0-2.4 1.4-3.9 3.3-3.9" /><circle cx="19.2" cy="10" r="2.1" /><path d="M22.5 18.2c0-2.4-1.4-3.9-3.3-3.9" /></svg>
                  </div>
                  <h3>Pan-India<br />Reach</h3>
                </div>
                <p>Connecting students, consultants and institutions across India for greater opportunities.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}