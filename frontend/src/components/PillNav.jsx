import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function PillNav({
  logo,
  logoAlt = "Logo",
  items = [],
  activeHref = "/",
  className = "",
  ease = "power2.out",
  baseColor = "#0a1222",
  pillColor = "#ffffff",
  hoveredPillTextColor = "#ffffff",
  pillTextColor = "#0a1222",
  theme = "color",
  initialLoadAnimation = false,
}) {
  const navRef = useRef(null);
  const linksRef = useRef({});
  const indicatorRef = useRef(null);
  const firstPositionedRef = useRef(false);

  function setLinkRef(href, element) {
    if (!element) {
      delete linksRef.current[href];
      return;
    }
    linksRef.current[href] = element;
  }

  function getActiveElement() {
    return linksRef.current[activeHref] || null;
  }

  function moveIndicator(targetElement, animate = true) {
    const navElement = navRef.current;
    const indicatorElement = indicatorRef.current;

    if (!navElement || !indicatorElement || !targetElement) {
      return;
    }

    const navRect = navElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    const x = targetRect.left - navRect.left;
    const width = targetRect.width;

    if (!animate) {
      gsap.set(indicatorElement, {
        x,
        width,
        opacity: 1,
      });
      return;
    }

    gsap.to(indicatorElement, {
      duration: 0.28,
      ease,
      x,
      width,
      opacity: 1,
    });
  }

  useEffect(() => {
    const activeElement = getActiveElement();
    if (!activeElement) {
      if (indicatorRef.current) {
        gsap.set(indicatorRef.current, { opacity: 0, width: 0 });
      }
      return;
    }

    const shouldAnimate = firstPositionedRef.current ? true : initialLoadAnimation;
    moveIndicator(activeElement, shouldAnimate);
    firstPositionedRef.current = true;
  }, [activeHref, initialLoadAnimation]);

  useEffect(() => {
    function onResize() {
      const activeElement = getActiveElement();
      if (!activeElement) {
        if (indicatorRef.current) {
          gsap.set(indicatorRef.current, { opacity: 0, width: 0 });
        }
        return;
      }

      moveIndicator(activeElement, false);
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeHref]);

  return (
    <div
      className={`pill-nav ${theme === "color" ? "pill-nav-color" : ""} ${className}`.trim()}
      style={
        {
          "--pill-nav-base-color": baseColor,
          "--pill-nav-pill-color": pillColor,
          "--pill-nav-pill-text": pillTextColor,
          "--pill-nav-hover-text": hoveredPillTextColor,
        }
      }
    >
      {logo ? (
        <Link to="/" className="pill-nav-logo-link">
          <img src={logo} alt={logoAlt} className="pill-nav-logo" />
        </Link>
      ) : null}

      <div
        className="pill-nav-links"
        ref={navRef}
        onMouseLeave={() => {
          moveIndicator(getActiveElement(), true);
        }}
      >
        <span ref={indicatorRef} className="pill-nav-indicator" />

        {items.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            ref={(element) => setLinkRef(item.href, element)}
            className={`pill-nav-link ${activeHref === item.href ? "active" : ""}`.trim()}
            onMouseEnter={(event) => moveIndicator(event.currentTarget, true)}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default PillNav;
