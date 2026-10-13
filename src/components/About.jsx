import { useEffect, useState, useRef } from "react";

import api from "../api/api";

import AboutDesign from "./AboutDesign";

import "./AboutDesign.css";

import "./About.css";



const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://api.geduconnect.com/api";

const BASE_URL = API_BASE.replace(/\/api\/?$/, "");

const getImageUrl = (path) => {

  if (!path) return "";

  if (/^(https?:)?\/\//i.test(path)) return path;

  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

};



// Department group photos hosted on the Geduconnect backend.

const TEAM_DEPARTMENTS = [

  {

    id: "digital",

    name: "Digital Department",

    eyebrow: "TECHNOLOGY · DESIGN · CONTENT",

    title: "The minds behind our digital innovation.",

    description: "Our Digital Department brings together development, design, content, SEO and technical operations. From building intuitive platforms to creating useful digital experiences, the team turns ideas into solutions that help our education network grow.",

    image: "https://api.geduconnect.com/uploads/department/1791890817913-whatsapp-image-2026-10-13-at-4-54-41-pm--2-.jpeg",

  },

  {

    id: "accounts-hr",

    name: "Accounts & HR Department",

    eyebrow: "FINANCE · PEOPLE · OPERATIONS",

    title: "Supporting our people and strengthening our operations.",

    description: "Our Accounts & HR Department supports the people and processes behind Geduconnect. From financial coordination and records to recruitment, employee support and workplace operations, the team helps keep our organisation running smoothly.",

    image: "https://api.geduconnect.com/uploads/department/1791891210885-whatsapp-image-2026-10-13-at-4-54-41-pm--3-.jpeg",

  },

  {

    id: "b2b",

    name: "B2B Department",

    eyebrow: "PARTNERSHIPS · RELATIONSHIPS · GROWTH",

    title: "Building partnerships that matter.",

    description: "Our B2B Department strengthens relationships with education consultants, universities and institutional partners. The team focuses on trust, collaboration and sustainable opportunities across the education ecosystem.",

    image: "https://api.geduconnect.com/uploads/department/1791890775779-whatsapp-image-2026-10-13-at-4-54-41-pm--1-.jpeg",

  },

  {

    id: "b2c",

    name: "B2C Department",

    eyebrow: "STUDENT SUPPORT · GUIDANCE · ADMISSIONS",

    title: "Helping students move forward with confidence.",

    description: "Our B2C Department works directly with students and families, helping them explore suitable courses, understand admission processes, and make informed education decisions. The team focuses on approachable guidance and a supportive experience at every step.",

    image: "https://api.geduconnect.com/uploads/department/1791890649737-img_3615.jpeg",

  },

  {

    id: "marketing",

    name: "Marketing Department",

    eyebrow: "BRAND · CAMPAIGNS · COMMUNICATION",

    title: "The people behind our brand.",

    description: "Our Marketing Department connects our work with the people who need it. Through creative campaigns, communication, brand strategy and outreach, the team helps educational opportunities reach a wider audience.",

    image: "https://api.geduconnect.com/uploads/department/1791890740637-whatsapp-image-2026-10-13-at-4-54-41-pm.jpeg",

  },

];



function useReveal(threshold = 0.05) {

  const ref = useRef(null);

  const [visible, setVisible] = useState(false);

  useEffect(() => {

    const element = ref.current;

    if (!element) return;

    if (typeof IntersectionObserver === "undefined") { setVisible(true); return; }

    const observer = new IntersectionObserver(([entry]) => {

      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }

    }, { threshold, rootMargin: "0px 0px 50px 0px" });

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

      const progress = Math.min((time - startTime) / duration, 1);

      setCount(Math.round(target * (1 - Math.pow(1 - progress, 3))));

      if (progress < 1) frame = requestAnimationFrame(animate);

    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);

  }, [visible, end, duration]);

  return <span ref={ref}>{count.toLocaleString("en-IN")}{suffix}</span>;

}



function DepartmentPhoto({ department }) {

  const [failed, setFailed] = useState(false);

  return (

    <div className="about-team-photo">

      {department.image && !failed ? (

        <img

          src={department.image}

          alt={`${department.name} group photograph`}

          loading="lazy"

          onError={() => setFailed(true)}

        />

      ) : (

        <div className="about-team-photo-placeholder" role="img" aria-label={`${department.name} photo placeholder`}>

          <svg viewBox="0 0 64 64" width="66" height="66" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">

            <circle cx="22" cy="23" r="8" /><circle cx="43" cy="24" r="7" />

            <path d="M5 52c0-11 7-18 17-18s17 7 17 18M34 37c9-5 25 2 25 15" />

          </svg>

          <strong>{department.name}</strong>

          <span>Add your department group photo</span>

        </div>

      )}

      <div className="about-team-photo-label">THE {department.name.toUpperCase()} TEAM</div>

    </div>

  );

}



function OurTeam() {

  return (

    <section className="about-team-section" id="our-team">

      <div className="about-team-inner">

        <header className="about-team-heading">

          <span className="about-team-eyebrow">THE PEOPLE BEHIND GEDUCONNECT</span>

          <h2>Meet <em>Our Team</em></h2>

          <p>Different strengths. One shared purpose. Get to know the departments that bring our vision to life.</p>

        </header>

        <div className="about-team-departments">

          {TEAM_DEPARTMENTS.map((department, index) => (

            <article className={`about-team-department ${index % 2 ? "about-team-department--reverse" : ""}`} key={department.id}>

              <div className="about-team-copy">

                <span className="about-team-number">{String(index + 1).padStart(2, "0")} / OUR DEPARTMENTS</span>

                <span className="about-team-category">{department.eyebrow}</span>

                <h3>{department.name}</h3>

                <h4>{department.title}</h4>

                <p>{department.description}</p>

                <span className="about-team-rule" aria-hidden="true" />

              </div>

              <DepartmentPhoto department={department} />

            </article>

          ))}

        </div>

      </div>

    </section>

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

      try { const res = await api.get("/public/home"); if (active) setAbout(res.data.about); }

      catch (err) { console.error("Error loading about section:", err); }

    };

    fetchAbout();

    return () => { active = false; };

  }, []);

  if (!about || Number(about.is_active) !== 1) return null;

  const hasFounder = Boolean(about.founder_message) || Boolean(about.founder_image_url);

  return (

    <div className="about-page">

      {variant === "page" && about.home_image_url && (

        <section ref={bannerRef} className={`about-banner ${bannerVisible ? "banner-revealed" : ""}`}

          style={{ backgroundImage: `url("${getImageUrl(about.home_image_url)}")` }}>

          <div className="banner-grain" /><div className="banner-overlay" />

          <div className="banner-orb banner-orb--1" /><div className="banner-orb banner-orb--2" />

          <div className="banner-geo banner-geo--1" /><div className="banner-geo banner-geo--2" />

          <div className="banner-content"><div className="banner-eyebrow">Our Story</div>

            <h1 className="banner-title">{about.heading}</h1>

            <p className="banner-sub">Partnering with 750+ consultants and 25+ universities to build a smarter, scalable education network for the future.</p>

            <div className="banner-line" />

          </div>

          <div className="stat-strip">{[

            { end: 750, suffix: "+", label: "Consultants" },

            { end: 25, suffix: "+", label: "Universities" },

            { end: 12, suffix: "+", label: "Years of Excellence" },

            { end: 98, suffix: "%", label: "Partner Satisfaction" },

          ].map((stat) => <div className="stat-item" key={stat.label}>

            <div className="stat-number"><Counter end={stat.end} suffix={stat.suffix} /></div>

            <div className="stat-label">{stat.label}</div>

          </div>)}</div>

        </section>

      )}

      <AboutDesign about={about} />

      {variant === "page" && <>

        {hasFounder && <section ref={founderRef} className={`founder-section ${founderVisible ? "section-revealed" : ""}`}>

          <div className="founder-shell">

            <div className="founder-heading"><span className="founder-eyebrow"><span className="founder-eyebrow-line" />THE VISION BEHIND OUR JOURNEY</span>

              <h2>A Message from <em>Our Founder</em></h2>

              <p>Building meaningful connections, creating opportunities, and shaping the future of education.</p>

            </div>

            <div className="founder-card">

              <div className="founder-portrait-side">

                <div className="founder-portrait-decor founder-decor-one" /><div className="founder-portrait-decor founder-decor-two" />

                {about.founder_image_url ? <div className="founder-portrait-frame"><img src={getImageUrl(about.founder_image_url)} alt={about.founder_name || "G Educonnect Founder"} loading="lazy" /></div> : <div className="founder-portrait-placeholder"><span>G</span></div>}

                <div className="founder-photo-caption"><span>LEADERSHIP &amp; VISION</span><strong>{about.founder_name || "Our Founder"}</strong><small>Founder, G Educonnect</small></div>

              </div>

              <div className="founder-message-side">

                <div className="founder-message-top"><span className="founder-message-label">FOUNDER'S NOTE</span><span className="founder-quote-symbol">&ldquo;</span></div>

                <h3>Empowering education through stronger partnerships.</h3>

                <div className="founder-message-scroll">{about.founder_message ? String(about.founder_message).split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph.trim()}</p>) : <p>Creating opportunities through collaboration and innovation.</p>}</div>

                <div className="founder-message-signature"><span className="founder-signature-rule" /><div><strong>{about.founder_name || "Our Founder"}</strong><span>Founder, G Educonnect</span></div><span className="founder-signature-mark">GE</span></div>

              </div>

            </div>

            <div className="founder-bottom-line"><span><i />LEADERSHIP WITH PURPOSE</span><span>CONNECTING PEOPLE. CREATING FUTURES.</span></div>

          </div>

        </section>}

        <OurTeam />

        {(about.mission || about.vision) && <section ref={mvRef} className={`mv-section ${mvVisible ? "section-revealed" : ""}`}>

          <div className="mv-inner"><div className="section-eyebrow mv-eyebrow">Our Purpose</div><h2 className="mv-title">Mission &amp; Vision</h2>

            <div className="mv-cards">

              {about.mission && <div className="mv-card mv-card--mission"><div className="mv-card__icon">◎</div><h3>Our Mission</h3><p>{about.mission}</p></div>}

              {about.vision && <div className="mv-card mv-card--vision"><div className="mv-card__icon">◈</div><h3>Our Vision</h3><p>{about.vision}</p></div>}

            </div>

          </div>

        </section>}

      </>}

    </div>

  );

}
