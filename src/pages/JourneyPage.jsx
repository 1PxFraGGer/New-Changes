
import React, { useEffect, useRef, useState } from "react";
import api from "../api/api";
import "./JourneyPage.css";

const SCROLL_SPEED = 45;

export default function JourneyPage() {
  const [journeyData, setJourneyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const groupRef = useRef(null);

  const positionRef = useRef(0);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const pointerRef = useRef({
    x: 0,
    moved: false,
  });

  /* ==========================================
     FETCH JOURNEY FROM BACKEND
  ========================================== */

  useEffect(() => {
    let mounted = true;

    const fetchJourney = async () => {
      try {
        const res = await api.get("/journey/public");

        const response = res.data;

        const items = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.journeys)
          ? response.journeys
          : [];

        if (mounted) {
          setJourneyData(items);
        }
      } catch (error) {
        console.error("Journey fetch failed:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchJourney();

    return () => {
      mounted = false;
    };
  }, []);

  /* ==========================================
     INFINITE CONTINUOUS AUTO ROTATION
  ========================================== */

  useEffect(() => {
    if (!journeyData.length) return;

    const track = trackRef.current;
    const group = groupRef.current;

    if (!track || !group) return;

    let frameId;
    let lastTime = null;

    const normalizePosition = (position, width) => {
      if (width <= 0) return 0;

      return ((position % width) + width) % width;
    };

    const animate = (timestamp) => {
      if (lastTime === null) {
        lastTime = timestamp;
      }

      const delta = Math.min(
        (timestamp - lastTime) / 1000,
        0.05
      );

      lastTime = timestamp;

      const groupWidth = group.getBoundingClientRect().width;

      if (
        !pausedRef.current &&
        !draggingRef.current &&
        !document.hidden
      ) {
        positionRef.current += SCROLL_SPEED * delta;
      }

      positionRef.current = normalizePosition(
        positionRef.current,
        groupWidth
      );

      track.style.transform = `translate3d(${-positionRef.current}px, 0, 0)`;

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [journeyData]);

  /* ==========================================
     POINTER DRAG SUPPORT
  ========================================== */

  const handlePointerDown = (e) => {
    if (e.pointerType === "touch") return;

    draggingRef.current = true;
    pausedRef.current = true;

    setIsDragging(true);

    pointerRef.current = {
      x: e.clientX,
      moved: false,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;

    const difference = e.clientX - pointerRef.current.x;

    if (Math.abs(difference) > 2) {
      pointerRef.current.moved = true;
    }

    positionRef.current -= difference;
    pointerRef.current.x = e.clientX;
  };

  const handlePointerUp = (e) => {
    draggingRef.current = false;
    setIsDragging(false);

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    pausedRef.current = e.currentTarget.matches(":hover");
  };

  /* ==========================================
     PREVIOUS / NEXT CONTROLS
  ========================================== */

  const moveTimeline = (direction) => {
    const group = groupRef.current;
    const item = group?.querySelector(".snake-item");

    if (!group || !item) return;

    const width = group.getBoundingClientRect().width;

    const styles = window.getComputedStyle(group);
    const gap = parseFloat(styles.columnGap) || 0;

    const distance =
      item.getBoundingClientRect().width + gap;

    if (!width) return;

    positionRef.current =
      ((positionRef.current + direction * distance) % width + width) % width;
  };

  /* ==========================================
     RENDER MILESTONE CARD
  ========================================== */

  const renderMilestone = (item, index, duplicate = false) => {
    return (
      <div
        className="snake-item"
        key={`${duplicate ? "copy" : "original"}-${item.id ?? index}-${index}`}
      >
        <div className="snake-dot">
          <span />
        </div>

        <div className="snake-card">
          <div className="snake-card-glow" />

          <div className="snake-card-top">
            <span className="year">
              {item.year}
            </span>

            <span className="snake-card-index">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <h4>{item.title}</h4>

          <p>{item.description}</p>

          <div className="snake-card-bottom">
            <span className="snake-card-label">
              MILESTONE
            </span>

            <span className="snake-arrow">
              ↗
            </span>
          </div>
        </div>
      </div>
    );
  };

  /* ==========================================
     LOADING / EMPTY STATE
  ========================================== */

  if (loading || journeyData.length === 0) {
    return null;
  }

  /* ==========================================
     RENDER
  ========================================== */

  return (
    <section className="journey-snake">

      {/* BACKGROUND DECORATIONS */}
      <div className="journey-decoration journey-decoration-one" />
      <div className="journey-decoration journey-decoration-two" />
      <div className="journey-dot-pattern" />

      <div className="journey-container">

        {/* SECTION HEADER */}
        <div className="journey-header">

          <div className="journey-eyebrow">
            <span className="journey-eyebrow-line" />
            <span>OUR GROWTH STORY</span>
            <span className="journey-eyebrow-line" />
          </div>

          <h2>
            A Journey of Vision,
            <br />
            <em>Innovation &amp; Expansion</em>
          </h2>

          <p>
            From our foundation to national impact,
            every milestone reflects our commitment
            to transforming education partnerships
            across India.
          </p>

        </div>

        {/* INFINITE TIMELINE */}
        <div className="journey-timeline-area">

          <div
            className={`snake-scroll-wrapper ${
              isDragging ? "active" : ""
            }`}
            ref={viewportRef}
            onMouseEnter={() => {
              pausedRef.current = true;
            }}
            onMouseLeave={() => {
              if (!draggingRef.current) {
                pausedRef.current = false;
              }
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >

            <div
              className="snake-row"
              ref={trackRef}
            >

              {/* ORIGINAL MILESTONES */}
              <div
                className="snake-group"
                ref={groupRef}
              >
                {journeyData.map((item, index) =>
                  renderMilestone(item, index)
                )}
              </div>

              {/* DUPLICATE FOR SEAMLESS LOOP */}
              <div
                className="snake-group"
                aria-hidden="true"
              >
                {journeyData.map((item, index) =>
                  renderMilestone(item, index, true)
                )}
              </div>

            </div>
          </div>
        </div>

        {/* BOTTOM CONTROLS */}
        <div className="journey-bottom">

          <div className="journey-hint">
            <span className="journey-hint-dot" />
            <span>
              Explore Our Milestones
            </span>
          </div>

          <div className="journey-controls">

            <button
              type="button"
              className="journey-nav-btn"
              onClick={() => moveTimeline(-1)}
              aria-label="Previous milestone"
            >
              ←
            </button>

            <button
              type="button"
              className="journey-nav-btn"
              onClick={() => moveTimeline(1)}
              aria-label="Next milestone"
            >
              →
            </button>

          </div>
        </div>

      </div>
    </section>
  );
}
