
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./Services.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://api.geduconnect.com/api";

const BASE_URL = API_BASE.replace(/\/api\/?$/, "");

const getImageUrl = (path) => {
  if (!path) return "";
  if (/^(https?:)?\/\//i.test(path)) return path;
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

function ArrowIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function ServiceIcon({ title, icon }) {
  const name = title.toLowerCase();

  let paths;

  if (name.includes("marketing")) {
    paths = (
      <>
        <path d="M3 20h18" />
        <rect x="4" y="13" width="4" height="7" rx="0.5" />
        <rect x="10" y="9" width="4" height="11" rx="0.5" />
        <rect x="16" y="5" width="4" height="15" rx="0.5" />
        <path d="m4 10 6-5 4 2 6-5" />
        <path d="M16 2h4v4" />
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
        <path d="M12 6c-3-3-7-3-10-2v15c4-1 7-1 10 2" />
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
        <ArrowIcon />
      </span>
    </button>
  );
}

export const Services = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

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

        if (servicesResult.status === "fulfilled") {
          const response = servicesResult.value.data;

          setServices(
            Array.isArray(response)
              ? response
              : Array.isArray(response?.data)
              ? response.data
              : []
          );
        } else {
          console.error(
            "Error loading services:",
            servicesResult.reason
          );
        }

        if (partnersResult.status === "fulfilled") {
          const response = partnersResult.value.data;

          const clients = Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
            ? response.data
            : [];

          setPartners(
            clients.filter(
              (item) =>
                item.type === "partner" &&
                item.logo_url
            )
          );
        } else {
          console.error(
            "Error loading partners:",
            partnersResult.reason
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="svc-section">
        <div className="svc-loading">
          Loading services...
        </div>
      </section>
    );
  }

  return (
    <>
      {/* GLOBAL PARTNERS - RENDERED ONLY HERE */}

      {partners.length > 0 && (
        <section className="svc-partners-section">
          <div className="svc-partners-pattern svc-partners-pattern--left" />
          <div className="svc-partners-pattern svc-partners-pattern--right" />
          <div className="svc-partners-corner" />

          <div className="svc-partners-container">
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
                In collaboration with leading
                organizations to expand education
                opportunities worldwide.
              </p>
            </div>

            <div className="svc-partners-wall">
              {partners.map((partner, index) => (
                <div
                  className="svc-partners-logo"
                  key={partner.id || index}
                >
                  <img
                    src={getImageUrl(partner.logo_url)}
                    alt={partner.name || "Partner"}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EDUCATION SOLUTIONS */}

      {services.length > 0 && (
        <section className="svc-section">
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
                  marketing to publishing and tailored
                  ERP/CRM tools.
                </p>

                <div className="svc-intro-actions">
                  <button
                    type="button"
                    className="svc-explore-btn"
                    onClick={() =>
                      navigate("/services")
                    }
                  >
                    Explore All Services
                    <ArrowIcon />
                  </button>

                  <div className="svc-count-pill">
                    <span className="svc-count-number">
                      {services.length}
                    </span>
                    <span>Premium Services</span>
                  </div>
                </div>
              </div>

              {/* RIGHT SERVICE CARDS */}

              <div className="svc-grid">
                {services.map((service, index) => (
                  <ServiceCard
                    key={
                      service.id ||
                      service.slug ||
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
