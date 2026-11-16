import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Play,
  School,
  ShieldCheck,
  Users,
} from "lucide-react";

import api from "../api/api";
import "./HeroCarousel.css";

/* =========================================================
   API: DESKTOP HERO DATA + UNIVERSITY PARTNERS
========================================================= */

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://api.geduconnect.com/api";

const BASE_URL = API_BASE.replace(/\/api\/?$/, "");

const resolveUrl = (url) => {
  if (!url) return "";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `${BASE_URL}/${String(url).replace(/^\/+/, "")}`;
};

/* =========================================================
   MOBILE BANNER FROM src/assets — NO MOBILE API

   The local file shown in your assets folder is named:
     src/assets/Optimistic Student on Campus

   Vite's import.meta.glob loads it regardless of the image
   extension (.png, .webp, .jpg, etc.). This image is used
   for the FIRST sorted carousel slide on mobile <= 640px.
   All other slides use their desktop banner as a fallback.
========================================================= */

const localMobileFiles = import.meta.glob(
  "../assets/Optimistic Student on Campus.*",
  { eager: true, query: "?url", import: "default" }
);

const firstMobileBanner = Object.values(localMobileFiles)[0] || "";

const getDesktopImage = (item) =>
  resolveUrl(item?.desktop_image_url || item?.web_image_url || item?.image_url);

/* =========================================================
   ONE SLIDE, TWO IMAGE SOURCES
========================================================= */

function ResponsiveBanner({ item, index, active }) {
  const desktopImage = getDesktopImage(item);
  const mobileImage = index === 0 ? firstMobileBanner : "";

  if (!desktopImage) return null;

  return (
    <picture
      className={`ge-home-hero__art ${active ? "is-active" : ""}`}
      aria-hidden={!active}
    >
      {mobileImage && (
        <source media="(max-width: 640px)" srcSet={mobileImage} />
      )}
      <img
        src={desktopImage}
        alt={active ? item?.title || "Education banner" : ""}
        fetchPriority={index === 0 ? "high" : "auto"}
        loading={index === 0 ? "eager" : "lazy"}
        decoding="async"
      />
    </picture>
  );
}

/* =========================================================
   FALLBACK CTA + STATS
========================================================= */

const audiences = {
  student: {
    text: "Get Guidance",
    href: "/contact?audience=student",
  },
  university: {
    text: "Partner With Us",
    href: "/contact?audience=university",
  },
  consultant: {
    text: "Join Our Network",
    href: "/consultantNetwork",
  },
};

const stats = [
  { value: "500+", label: "University Partners", Icon: School },
  { value: "10,000+", label: "Students Guided", Icon: GraduationCap },
  { value: "200+", label: "Consultants", Icon: Users },
  { value: "95%", label: "Satisfaction Rate", Icon: ShieldCheck },
];

export default function HeroCarousel() {
  const [universities, setUniversities] = useState([]);
  const [heroes, setHeroes] = useState([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);

  /* Fetch desktop slides; mobile banners are NOT requested here. */
  useEffect(() => {
    const controller = new AbortController();

    const fetchHero = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/public/home", {
          signal: controller.signal,
        });

        const images = Array.isArray(data?.hero?.images)
          ? data.hero.images
          : [];
        const sortedImages = [...images].sort(
          (a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0)
        );
        if (!controller.signal.aborted) {
          setHeroes(sortedImages);
          setActive(0);
        }
      } catch (error) {
        if (
          error?.name !== "CanceledError" &&
          error?.code !== "ERR_CANCELED"
        ) {
          console.error("Failed to load hero data:", error);
          if (!controller.signal.aborted) setHeroes([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchHero();
    return () => controller.abort();
  }, []);

  /* Fetch partner university logos as before. */
  useEffect(() => {
    const controller = new AbortController();

    api
      .get("/public/clients", { signal: controller.signal })
      .then(({ data }) => {
        const clients = Array.isArray(data)
          ? data
          : data?.clients || data?.data || [];
        if (!controller.signal.aborted) {
          setUniversities(
            clients.filter(
              (client) => String(client?.type || "").toLowerCase() === "university"
            )
          );
        }
      })
      .catch((error) => {
        if (
          error?.name !== "CanceledError" &&
          error?.code !== "ERR_CANCELED"
        ) {
          console.error("Failed to load universities:", error);
        }
      });

    return () => controller.abort();
  }, []);

  /* Automatic slide advance, with hover/focus pause. */
  useEffect(() => {
    if (
      paused ||
      heroes.length <= 1 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % heroes.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [paused, heroes.length]);

  useEffect(() => {
    if (heroes.length === 0 || active >= heroes.length) setActive(0);
  }, [heroes.length, active]);

  const moveSlide = (direction) => {
    if (heroes.length < 2) return;
    setActive((current) => (current + direction + heroes.length) % heroes.length);
  };

  const scrollPartners = (direction) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({
      left: direction * Math.max(180, trackRef.current.clientWidth * 0.65),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  if (loading) {
    return (
      <section className="ge-home-hero ge-home-hero--loading">
        <div className="ge-home-hero__main">
          <div className="ge-home-hero__body">
            <div className="ge-home-hero__copy">
              <p className="ge-home-hero__eyebrow">
                YOUR PARTNER IN EDUCATION GROWTH
              </p>
              <h1>
                Empowering Education <span>Together</span>
              </h1>
              <p className="ge-home-hero__subtitle">
                Connecting Students, Universities and Consultants for a Brighter Future.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!heroes.length) return null;

  const slide = heroes[active] || heroes[0];
  const title = slide?.title || "";
  const subtitle = slide?.subtitle || "";
  const description = slide?.description || "";

  // Avoid repeating the main title inside the CMS eyebrow/subtitle.
  const displaySubtitle = (() => {
    const raw = String(subtitle).trim();
    const heading = String(title).trim();
    if (!heading) return raw;
    const normalize = (text) => text.replace(/\s+/g, " ").trim().toLowerCase();
    const normalizedRaw = normalize(raw);
    const normalizedHeading = normalize(heading);
    if (!normalizedRaw.endsWith(normalizedHeading)) return raw;
    // Search for the last heading word sequence, preserving the original case.
    const words = heading.split(/\s+/).filter(Boolean);
    const tokens = raw.split(/\s+/);
    const tail = tokens.slice(-words.length);
    if (normalize(tail.join(" ")) !== normalizedHeading) return raw;
    return tokens.slice(0, -words.length).join(" ").trim();
  })();
  const fallbackCta = audiences.student;
  const cta1Text = slide?.primary_cta_text || fallbackCta.text;
  const cta1Link = slide?.primary_cta_link || fallbackCta.href;
  const cta2Text = slide?.secondary_cta_text || "";
  const cta2Link = slide?.secondary_cta_link || "/about";

  return (
    <section
      className="ge-home-hero"
      aria-roledescription="carousel"
      aria-label="G Educonnect highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          moveSlide(-1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          moveSlide(1);
        }
      }}
      tabIndex={0}
    >
      <div className="ge-home-hero__main">
        {/* Keep images mounted while moving between slides for smooth fades. */}
        <div className="ge-home-hero__visual">
          <div className="ge-home-hero__slides">
            {heroes.map((item, index) => (
              <ResponsiveBanner
                key={item?.id ?? `banner-${index}`}
                item={item}
                index={index}
                active={index === active}
              />
            ))}
          </div>
        </div>

        <div className="ge-home-hero__body" key={slide?.id ?? active}>
          <div className="ge-home-hero__copy">
            {displaySubtitle && (
              <p className="ge-home-hero__eyebrow">{displaySubtitle}</p>
            )}
            {title && <h1 id="ge-home-title">{title}</h1>}
            {description && (
              <p className="ge-home-hero__subtitle">{description}</p>
            )}

            {(cta1Text || cta2Text) && (
              <div className="ge-home-hero__actions-row">
                {cta1Text && (
                  <Link to={cta1Link} className="ge-home-hero__cta">
                    {cta1Text}
                    <ArrowRight size={19} aria-hidden="true" />
                  </Link>
                )}
                {cta2Text && (
                  <Link to={cta2Link} className="ge-home-hero__secondary">
                    <span className="ge-home-hero__play">
                      <Play size={12} fill="currentColor" aria-hidden="true" />
                    </span>
                    {cta2Text}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {heroes.length > 1 && (
          <>
            <button
              className="ge-home-hero__arrow ge-home-hero__arrow--left"
              type="button"
              onClick={() => moveSlide(-1)}
              aria-label="Previous slide"
            >
              <ChevronLeft />
            </button>
            <button
              className="ge-home-hero__arrow ge-home-hero__arrow--right"
              type="button"
              onClick={() => moveSlide(1)}
              aria-label="Next slide"
            >
              <ChevronRight />
            </button>
            <div className="ge-home-hero__dots" role="group" aria-label="Choose hero slide">
              {heroes.map((item, index) => (
                <button
                  key={item?.id ?? index}
                  type="button"
                  className={index === active ? "is-active" : ""}
                  onClick={() => setActive(index)}
                  aria-label={`Show slide ${index + 1}`}
                  aria-pressed={index === active}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Floating stats + university partners */}
      <div className="ge-home-hero__lower-card">
        <div className="ge-home-hero__stats">
          {stats.map(({ value, label, Icon }) => (
            <div key={label}>
              <Icon aria-hidden="true" />
              <strong>{value}</strong>
              <small>{label}</small>
            </div>
          ))}
        </div>

        {universities.length > 0 && (
          <div className="ge-home-hero__partners" aria-label="Our partner universities">
            <p>Our Partner Universities</p>
            <div className="ge-home-hero__partner-row">
              <button
                type="button"
                aria-label="Previous universities"
                onClick={() => scrollPartners(-1)}
              >
                <ChevronLeft size={18} />
              </button>
              <div className="ge-home-hero__track" ref={trackRef}>
                {universities.map((uni, index) => (
                  <Link
                    key={uni?.id ?? `${uni?.slug}-${index}`}
                    to={uni?.slug ? `/university/${uni.slug}` : "/clients"}
                    className="ge-home-hero__partner"
                    title={uni?.name || undefined}
                  >
                    {uni?.logo_url && (
                      <img
                        src={resolveUrl(uni.logo_url)}
                        alt={uni?.name || "Partner university"}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.hidden = true;
                          const fallback = event.currentTarget.nextElementSibling;
                          if (fallback) fallback.hidden = false;
                        }}
                      />
                    )}
                    <span hidden={Boolean(uni?.logo_url)}>
                      {uni?.name || "University"}
                    </span>
                  </Link>
                ))}
              </div>
              <button
                type="button"
                aria-label="Next universities"
                onClick={() => scrollPartners(1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
