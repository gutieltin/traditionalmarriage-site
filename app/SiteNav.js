"use client";

import { useEffect, useRef, useState } from "react";

// id of each page section, and the label shown in the menu
const LINKS = [
  ["story", "Our story"],
  ["details", "The day"],
  ["programme", "Program"],
  ["gallery-sec", "Gallery"],
  ["messages", "Messages"],
];

export default function SiteNav({ visible, partner1, partner2, dateText, venue }) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState("");
  const [progress, setProgress] = useState(0);
  const closeRef = useRef(null);

  // Scroll progress bar, and switch the bar from glass to white once we leave the hero
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setSolid(y > window.innerHeight * 0.6);
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the link of the section currently on screen
  useEffect(() => {
    const els = LINKS.map(([id]) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Full-screen menu: stop the page scrolling behind it, close with Escape
  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = () => setOpen(false);

  return (
    <>
      <div className="progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />

      <header className={`snav ${visible ? "show" : ""} ${solid ? "solid" : ""}`}>
        <a className="snav-mono" href="#top" aria-label="Back to the top">
          {partner1[0]}<i>&amp;</i>{partner2[0]}
        </a>

        <nav className="snav-links" aria-label="Main">
          {LINKS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? "on" : ""}>{label}</a>
          ))}
        </nav>

        <button className="snav-burger" aria-expanded={open} aria-controls="mmenu" onClick={() => setOpen(true)}>
          <span className="bars" aria-hidden="true"><i /><i /></span>
          Menu
        </button>
      </header>

      <div id="mmenu" className={`mmenu ${open ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="Menu"
           onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
        <div className="mmenu-panel">
          <button ref={closeRef} className="mmenu-close" onClick={() => setOpen(false)} aria-label="Close menu">&times;</button>

          <p className="mmenu-eyebrow">{partner1} &amp; {partner2}</p>
          <nav aria-label="Menu">
            <ol>
              {LINKS.map(([id, label], i) => (
                <li key={id} style={{ transitionDelay: `${0.08 * i + 0.12}s` }}>
                  <a href={`#${id}`} onClick={go}>
                    <small>0{i + 1}</small>
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mmenu-foot">
            <p>{dateText}</p>
            <p>{venue}</p>
            <a className="btn" href="#messages" onClick={go}>Leave a message</a>
          </div>
        </div>
      </div>
    </>
  );
}
