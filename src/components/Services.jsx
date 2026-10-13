
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import api from "../api/api";
import "./Services.css";

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

  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

/* ==========================================
   SERVICE ICON
========================================== */

function ServiceIcon({ title = "", icon }) {
  const name = title.toLowerCase();

  if (icon) {
    return (
      <img
        src={icon}
        alt=""
        loading="lazy"
        className="svc-icon-image"
      />
    );
  }

  let paths;

  if (name.includes("marketing")) {
    paths = (
      <>
        <path d="M3 20h18" />
        <rect x="4" y="13" width="4" height="7" rx=".5" />
        <rect x="10" y="9" width="4" height="11" rx=".5" />
        <rect x="16" y="5" width="4" height="15" rx=".5" />
        <path d="m4 10 6-5 4 2 6-5M16 2h4v4" />
      </>
    );
  } else if (
    name.includes("admission") ||
    name.includes("student")
  ) {
    paths = (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M2 21v-3a7 7 0 0 1 14 0v3H2Z" />
        <path d="M17 14a5 5 0 0 1 5 5v2h-4" />
      </>
    );
  } else if (
    name.includes("publishing") ||
    name.includes("printing") ||
    name.includes("book")
  ) {
    paths = (
      <>
        <path d="M12 6C9 3 5 3 2 4v15c4-1 7-1 10 2" />
        <path d="M12 6c3-3 7-3 10-2v15c-4-1-7-1-10 2" />
        <path d="M12 6v15" />
      </>
    );
  } else if (
    name.includes("erp") ||
    name.includes("crm") ||
    name.includes("software")
  ) {
    paths = (
      <>
        <path d="M10 2h4l.7 2.4 2 .9 2.2-1.2 2.8 2.8-1.2 2.2.9 2L24 12l-2.6 1-.9 2 1.2 2.2-2.8 2.8-2.2-1.2-2 .9L14 22h-4l-.7-2.3-2-.9-2.2 1.2-2.8-2.8 1.2-2.2-.9-2L0 12l2.6-1 .9-2-1.2-2.2 2.8-2.8 2.2 1.2 2-.9L10 2Z" />
        <circle cx="12" cy="12" r="4" />
      </>
    );
  } else {
    paths = (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8M12 8v8" />
      </>
    );
  }

  return (
    <svg
      width="43"
      height="43"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths}
    </svg>
  );
}

/* ==========================================
   SERVICE CARD
========================================== */

function ServiceCard({ service, index, onClick }) {
  const featured = index === 0;

  return (
    <button
      type="button"
      className={`svc-card ${
        featured ? "svc-card--featured" : ""
      }`}
      onClick={onClick}
      disabled={!service.slug}
      aria-label={`Explore ${service.title}`}
    >
      {featured && (
        <span className="svc-featured-label">
          FEATURED
        </span>
      )}

      <div className="svc-card__icon">
        <ServiceIcon
          title={service.title}
          icon={getImageUrl(service.icon_url)}
        />
      </div>

      <div className="svc-card__content">
        <h3>{service.title}</h3>

        <p>
          {service.subtitle ||
            "Explore our education solutions and services."}
        </p>
      </div>

      <span className="svc-card__arrow">
        <ArrowRight size={21} />
      </span>
    </button>
  );
}

/* ==========================================
   GLOBAL PARTNERS - STATIC DISPLAY

   - No automatic scrolling
   - No duplicate logos
   - No navigation arrows
   - Dynamic API data
   - Existing burgundy/gold design
========================================== */

function GlobalPartners({ partners }) {
  if (!partners || partners.length === 0) {
    return null;
  }

  return (
    <section className="svc-partners-section">

      {/* BACKGROUND DECORATIONS */}

      <div className="svc-partners-pattern svc-partners-pattern--left" />
      <div className="svc-partners-pattern svc-partners-pattern--right" />

      <div className="svc-partners-corner" />

      <div className="svc-partners-gold-wave svc-partners-gold-wave--left" />
      <div className="svc-partners-gold-wave svc-partners-gold-wave--right" />

      <div className="svc-partners-container">

        {/* HEADER */}

        <div className="svc-partners-header">

          <div className="svc-partners-eyebrow">
            <span className="svc-partners-line" />

            <span>TRUSTED BY</span>

            <span className="svc-partners-line" />
          </div>

          <h2 className="svc-partners-title">
            Our Global <span>Partners</span>
          </h2>

          <p className="svc-partners-subtitle">
            Collaborating with leading organizations to
            expand education opportunities worldwide.
          </p>

        </div>

        {/* STATIC PARTNER LOGOS */}

        <div className="svc-partners-carousel">

          {/* GOLD HORIZONTAL LINE */}

          <div className="svc-partners-timeline" />

          {/* PARTNER LOGO CONTAINER */}

          <div className="svc-partners-viewport">

            <div className="svc-partners-wall">

              {partners.map((partner, index) => (
                <div
                  className="svc-partners-logo"
                  key={partner.id ?? index}
                >

                  <div className="svc-partners-logo-card">

                    <img
                      src={getImageUrl(partner.logo_url)}
                      alt={
                        partner.name ||
                        "Global Partner"
                      }
                      loading="lazy"
                      draggable="false"
                    />

                  </div>

                </div>
              ))}

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

/* ==========================================
   MAIN SERVICES COMPONENT
========================================== */

export const Services = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ==========================================
     FETCH SERVICES AND PARTNERS
  ========================================== */

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [servicesResult, partnersResult] =
          await Promise.allSettled([
            api.get("/public/services"),
            api.get("/public/clients"),
          ]);

        if (!mounted) return;

        /* SERVICES DATA */

        if (servicesResult.status === "fulfilled") {
          const response = servicesResult.value.data;

          const serviceData = Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.services)
            ? response.services
            : [];

          setServices(serviceData);
        } else {
          console.error(
            "Error loading services:",
            servicesResult.reason
          );
        }

        /* GLOBAL PARTNERS DATA */

        if (partnersResult.status === "fulfilled") {
          const response = partnersResult.value.data;

          const clients = Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
            ? response.data
            : [];

          const partnerData = clients.filter(
            (item) =>
              item.type === "partner" &&
              item.logo_url
          );

          setPartners(partnerData);
        } else {
          console.error(
            "Error loading partners:",
            partnersResult.reason
          );
        }
      } catch (err) {
        console.error(
          "Error fetching Services data:",
          err
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  /* ==========================================
     LOADING STATE
  ========================================== */

  if (loading) {
    return (
      <section className="svc-section">
        <div className="svc-loading">
          Loading services...
        </div>
      </section>
    );
  }

  /* ==========================================
     RENDER
  ========================================== */

  return (
    <>

      {/* ==========================================
          GLOBAL PARTNERS
      ========================================== */}

      {partners.length > 0 && (
        <GlobalPartners partners={partners} />
      )}

      {/* ==========================================
          EDUCATION SOLUTIONS
      ========================================== */}

      {services.length > 0 && (
        <section className="svc-section">

          {/* BACKGROUND DECORATIONS */}

          <div className="svc-decoration svc-decoration--tl" />
          <div className="svc-decoration svc-decoration--br" />

          <div className="svc-container">

            <div className="svc-layout">

              {/* LEFT CONTENT */}

              <div className="svc-intro">

                <div className="svc-eyebrow">
                  WHAT WE OFFER
                </div>

                <h2 className="svc-title">
                  End-to-End
                  <br />
                  <em>Education</em>
                  <br />
                  Solutions
                </h2>

                <p className="svc-subtitle">
                  G Educonnect offers end-to-end
                  solutions helping universities and
                  education consultants grow faster
                  and smarter — from admissions and
                  marketing to publishing and
                  tailored ERP/CRM tools.
                </p>

                {/* ACTION BUTTONS */}

                <div className="svc-intro-actions">

                  <button
                    type="button"
                    className="svc-explore-btn"
                    onClick={() =>
                      navigate("/services")
                    }
                  >
                    Explore All Services
                    <ArrowRight size={18} />
                  </button>

                  <div className="svc-count-pill">

                    <span className="svc-count-number">
                      {services.length}
                    </span>

                    <span>
                      Premium Services
                    </span>

                  </div>

                </div>

              </div>

              {/* RIGHT SERVICE CARDS */}

              <div className="svc-grid">

                {services.map((service, index) => (
                  <ServiceCard
                    key={
                      service.id ??
                      service.slug ??
                      index
                    }
                    service={service}
                    index={index}
                    onClick={() => {
                      if (service.slug) {
                        navigate(
                          `/services/${service.slug}`
                        );
                      }
                    }}
                  />
                ))}

              </div>

            </div>

          </div>

        </section>
      )}

    </>
  );
};

export default Services;
