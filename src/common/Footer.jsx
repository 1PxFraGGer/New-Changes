
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import "./Footer.css";

import logo from "../assets/white logo.png";
import whatsappimg from "../assets/whatsapp.png";
import facebookIcon from "../assets/facebook.png";
import twitterIcon from "../assets/twitter.png";
import instagramIcon from "../assets/instagram.png";
import linkedinIcon from "../assets/linkedin.png";
import Faqs from "../components/Faqs";

/* ==========================================
   ICON COMPONENT
========================================== */

function FooterIcon({ type, size = 17 }) {
  const paths = {
    graduation: (
      <>
        <path d="m2 9 10-5 10 5-10 5L2 9Z" />
        <path d="M6 11v6c3.5 3 8.5 3 12 0v-6" />
      </>
    ),
    monitor: (
      <>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </>
    ),
    book: (
      <>
        <path d="M4 3h12a3 3 0 0 1 3 3v15H7a3 3 0 0 1-3-3V3Z" />
        <path d="M7 7h9M7 11h7M7 15h6" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M2 20v-2a7 7 0 0 1 14 0v2H2Z" />
        <path d="M17 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 4 5v1" />
      </>
    ),
    building: (
      <>
        <path d="M3 21h18M5 21V9h14v12" />
        <path d="m3 9 9-6 9 6H3Z" />
        <path d="M9 21v-7h6v7" />
      </>
    ),
    phone: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.09 5.18 2 2 0 0 1 5.08 3h3a2 2 0 0 1 2 1.72l.5 2.81a2 2 0 0 1-.57 1.7L8.3 10.94a16 16 0 0 0 4.76 4.76l1.71-1.71a2 2 0 0 1 1.7-.57l2.81.5A2 2 0 0 1 22 16.92Z" />
    ),
    mail: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m2 6 10 7 10-7" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[type] || paths.building}
    </svg>
  );
}

/* ==========================================
   MAIN FOOTER
========================================== */

export const Footer = () => {
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchServices = async () => {
      try {
        const res = await api.get("/public/services");

        const result = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.services)
          ? res.data.services
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        if (mounted) setServices(result);
      } catch (err) {
        console.error("Failed to load services:", err);
      } finally {
        if (mounted) setLoadingServices(false);
      }
    };

    fetchServices();

    return () => {
      mounted = false;
    };
  }, []);

  const getServiceLink = (service) => {
    return `/services/${
      service.slug || service.page_link || service.id
    }`;
  };

  const serviceIcons = [
    "graduation",
    "monitor",
    "book",
    "users",
    "building",
  ];

  const quickLinks = [
    { label: "Home", to: "/" },
    { label: "Universities", to: "/university" },
    { label: "Online Education", to: "/university" },
    { label: "Distance Education", to: "/university" },
    { label: "Latest News", to: "/news" },
    { label: "Contact Us", to: "/contact" },
  ];

  const exploreLinks = [
    { label: "About G Educonnect", to: "/about" },
    { label: "Our Services", to: "/services" },
    { label: "Partner With Us", to: "/contact" },
    { label: "Blogs & Articles", to: "/blogs" },
    { label: "News & Updates", to: "/news" },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      icon: facebookIcon,
      url: "https://www.facebook.com/geduconnectpvtltd/",
    },
    {
      name: "LinkedIn",
      icon: linkedinIcon,
      url: "https://www.linkedin.com/company/geduconnect/",
    },
    {
      name: "Instagram",
      icon: instagramIcon,
      url: "https://www.instagram.com/geduconnect/",
    },
    {
      name: "Twitter",
      icon: twitterIcon,
      url: "#",
    },
  ];

  return (
    <>
      {/* EXISTING FAQ SECTION */}
      <Faqs />

      <footer className="ft-root">
        {/* BACKGROUND DECORATIONS */}
        <div className="ft-bg-pattern" />
        <div className="ft-decoration-left" />
        <div className="ft-decoration-right" />
        <div className="ft-gold-curve" />

        <div className="ft-inner">
          {/* BRAND */}
          <div className="ft-brand">
            <Link to="/" className="ft-logo-link">
              <img
                src={logo}
                alt="G Educonnect"
                className="ft-logo"
              />
            </Link>

            <p className="ft-tagline">
              At G Educonnect, we make education
              simple, accessible and future-ready.
              From admissions to career growth,
              we support students at every step.
            </p>

            <div className="ft-social">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target={
                    social.url === "#" ? undefined : "_blank"
                  }
                  rel="noopener noreferrer"
                  className="ft-social-link"
                  aria-label={social.name}
                >
                  <img
                    src={social.icon}
                    alt={social.name}
                  />
                </a>
              ))}
            </div>
          </div>

          {/* SERVICES - BACKEND CONNECTED */}
          <div className="ft-col ft-services-col">
            <h3 className="ft-col-title">
              Our Services
            </h3>

            <div className="ft-col-rule" />

            <ul className="ft-list ft-service-list">
              {loadingServices && (
                <li className="ft-list-loading">
                  Loading services...
                </li>
              )}

              {!loadingServices && services.length === 0 && (
                <li>No services available</li>
              )}

              {services.map((service, index) => (
                <li key={service.id ?? index}>
                  <Link to={getServiceLink(service)}>
                    <span className="ft-service-icon">
                      <FooterIcon
                        type={
                          serviceIcons[
                            index % serviceIcons.length
                          ]
                        }
                      />
                    </span>
                    <span>
                      {service.title || "Service"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* QUICK LINKS */}
          <div className="ft-col">
            <h3 className="ft-col-title">
              Quick Links
            </h3>

            <div className="ft-col-rule" />

            <ul className="ft-list">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* EXPLORE */}
          <div className="ft-col">
            <h3 className="ft-col-title">
              Explore
            </h3>

            <div className="ft-col-rule" />

            <ul className="ft-list">
              {exploreLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div className="ft-contact-box">
            <h3 className="ft-contact-title">
              Get In Touch
            </h3>

            <div className="ft-contact-items">
              <a href="tel:+919251925827" className="ft-contact-item">
                <span className="ft-contact-icon">
                  <FooterIcon type="phone" />
                </span>
                <span>+91 925-192-5827</span>
              </a>

              <a
                href="mailto:admin@geduconnect.com"
                className="ft-contact-item"
              >
                <span className="ft-contact-icon">
                  <FooterIcon type="mail" />
                </span>
                <span>admin@geduconnect.com</span>
              </a>

              <a
                href="https://www.google.com/maps?q=B-3,+Shivam+Apartment,+Adarsh+Nagar,+Jaipur,+Rajasthan+302004"
                target="_blank"
                rel="noopener noreferrer"
                className="ft-contact-item"
              >
                <span className="ft-contact-icon">
                  <FooterIcon type="location" />
                </span>
                <span>
                  B-3, Shivam Apartment,
                  Adarsh Nagar, Jaipur,
                  Rajasthan 302004
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT BAR */}
        <div className="ft-bottom">
          <div className="ft-bottom-inner">
            <span className="ft-copy">
              © {new Date().getFullYear()} G Educonnect
              Private Limited. All rights reserved.
            </span>

            <div className="ft-bottom-links">
              <Link to="/termsandconditions">
                Terms &amp; Conditions
              </Link>

              <span className="ft-bottom-sep">|</span>

              <Link to="/privacypolicy">
                Privacy Policy
              </Link>

              <span className="ft-bottom-sep">|</span>

              <Link to="/sitemap.xml">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* WHATSAPP FLOAT */}
      <a
        href="https://wa.me/919251925827"
        className="ft-whatsapp"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <img src={whatsappimg} alt="WhatsApp" />
      </a>
    </>
  );
};
