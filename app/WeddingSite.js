"use client";

import { useEffect, useState } from "react";
import {
  CONFIG, API_URL, GALLERY, PHOTOS, BW, BACKDROPS, LOGO, HERO_BG, STORY_PHOTO, TILE_WHEN, TILE_WHERE, TILE_PROGRAM, MESSAGE_BG,
} from "./config";
import SiteNav from "./SiteNav";

const compact = (s) => s.replace(/[-:]/g, "");
const eventStart = new Date(CONFIG.date + "Z"); // Accra is UTC+0

const dateText = eventStart.toLocaleDateString("en-GB", {
  weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
});
const timeText = eventStart.toLocaleTimeString("en-GB", {
  hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC",
});

const title = `${CONFIG.partner1} & ${CONFIG.partner2} Marriage Ceremony`;
const googleCalendarUrl =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  `&text=${encodeURIComponent(title)}` +
  `&dates=${compact(CONFIG.date)}/${compact(CONFIG.endDate)}` +
  `&ctz=Africa/Accra&location=${encodeURIComponent(CONFIG.venue)}`;
const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.mapsQuery)}`;

// A photo with a wash of white (or ivory) over it, so text stays easy to read
const backdrop = (key, wash = 0.9, ivory = false) => {
  const tint = ivory ? "251,246,234" : "255,255,255";
  return {
    backgroundImage: `linear-gradient(rgba(${tint},${wash}),rgba(${tint},${wash})), url(${BACKDROPS[key]})`,
    backgroundSize: "cover",
    backgroundPosition: key === "hero" || key === "floral" || key === "gallery" ? "center 45%" : "center top",
  };
};

export default function WeddingSite() {
  const [opened, setOpened] = useState(false);
  const [now, setNow] = useState(null);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState(""); // hidden field; real people never fill it
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [modal, setModal] = useState(null);

  const [albumOpen, setAlbumOpen] = useState(false); // the PRE-WEDDING Photos folder
  const [lb, setLb] = useState(null); // index of open photo, or null
  const [touchX, setTouchX] = useState(null);

  // Photo protection: no right-click menu and no dragging (text boxes keep their normal menu)
  useEffect(() => {
    const noMenu = (e) => { if (!e.target.closest("input, textarea")) e.preventDefault(); };
    const noDrag = (e) => { if (e.target.tagName === "IMG") e.preventDefault(); };
    document.addEventListener("contextmenu", noMenu);
    document.addEventListener("dragstart", noDrag);
    return () => {
      document.removeEventListener("contextmenu", noMenu);
      document.removeEventListener("dragstart", noDrag);
    };
  }, []);

  // Countdown
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Lock page scroll while the cover is showing
  useEffect(() => {
    document.body.classList.toggle("locked", !opened);
  }, [opened]);

  // Folder opened: stop the page scrolling behind it, and let Escape close it
  useEffect(() => {
    document.body.classList.toggle("album-open", albumOpen);
    if (!albumOpen) return;
    const onKey = (e) => e.key === "Escape" && lb === null && setAlbumOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [albumOpen, lb]);

  // Photo viewer keyboard support
  useEffect(() => {
    if (lb === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLb(null);
      if (e.key === "ArrowLeft") setLb((i) => (i + PHOTOS.length - 1) % PHOTOS.length);
      if (e.key === "ArrowRight") setLb((i) => (i + 1) % PHOTOS.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lb]);

  async function sendMessage() {
    setErr("");
    if (!name.trim()) return setErr("Please enter your name.");
    if (!message.trim()) return setErr("Please write a message.");
    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim(), website: trap }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 422) {
        return setErr(Object.values(data.errors || {}).flat()[0] || "Please check what you wrote.");
      }
      if (res.status === 429) return setErr("Too many attempts. Please wait a minute and try again.");
      if (!res.ok) throw new Error("bad status");

      setModal({
        title: "Thank you!",
        text: `Your message has been sent to ${CONFIG.partner1} & ${CONFIG.partner2}.`,
      });
      setName("");
      setMessage("");
    } catch {
      setErr("Could not send your message. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  // Countdown pieces
  let left = now === null ? 0 : Math.max(0, Math.floor((eventStart.getTime() - now) / 1000));
  const units = [["Days", 86400], ["Hours", 3600], ["Mins", 60], ["Secs", 1]].map(([label, size]) => {
    const value = Math.floor(left / size);
    left -= value * size;
    return [label, value];
  });

  return (
    <>
      {/* Opening cover */}
      <div
        id="intro"
        className={opened ? "gone" : ""}
        style={{ backgroundImage: `linear-gradient(rgba(15,10,4,.55),rgba(15,10,4,.78)), url(${HERO_BG})` }}
      >
        <p className="intro-kicker">Welcome to our marriage ceremony</p>
        <div className="beat">
          <img className="intro-logo" src={LOGO} alt={`${CONFIG.partner1[0]} and ${CONFIG.partner2[0]} monogram`} />
        </div>
        <h2 className="intro-names">{CONFIG.partner1} <i>&amp;</i> {CONFIG.partner2}</h2>
        <p className="intro-date">{dateText}</p>
        <button className="btn gold-bright" onClick={() => setOpened(true)}>Enter</button>
      </div>

      <SiteNav
        visible={opened}
        partner1={CONFIG.partner1}
        partner2={CONFIG.partner2}
        dateText={dateText}
        venue={CONFIG.venue}
      />

      <main id="top">
        {/* First page: the photo is the background */}
        <section id="hero" className="hero2" aria-labelledby="hero-title">
          <div className="hero2-bg" style={{ backgroundImage: `url(${HERO_BG})` }} aria-hidden="true" />
          <div className="hero2-shade" aria-hidden="true" />
          <div className="hero2-inner">
            <h1 id="hero-title">We&rsquo;re Saying<br />&ldquo;I Do&rdquo;</h1>
            <p className="hero2-kicker">The marriage ceremony of</p>
            <p className="hero2-names">{CONFIG.partner1} <i>&amp;</i> {CONFIG.partner2}</p>
            <p className="hero2-date">{dateText} &middot; {timeText}</p>
            <p className="hero2-venue">{CONFIG.venue}</p>
            <div className="count">
              {units.map(([label, value]) => (
                <div key={label}><b>{value}</b><span>{label}</span></div>
              ))}
            </div>
            <div className="row">
              <a className="btn gold-bright" href="#messages">Leave a message</a>
              <a className="btn ghost" href="#details">See the details</a>
            </div>
          </div>
          <a className="scrollcue" href="#story" aria-label="Scroll to our story"><span /></a>
        </section>

      {/* Our story */}
      <div id="story" className="band" style={backdrop("story", 0.9, true)}>
        <div className="wrap split flip">
          <div className="media">
            <div className="frame">
              <img src={STORY_PHOTO} alt="" style={{ objectPosition: "50% 40%" }} />
            </div>
          </div>
          <div className="copy center">
            <p className="kicker">{CONFIG.storyKicker}</p>
            <h2>{CONFIG.storyHeading}</h2>
            {CONFIG.story.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} style={{ lineHeight: 1.8 }}>{paragraph}</p>
            ))}
            <div className="orn" />
            <p className="script-sig">
              {CONFIG.partner1} &amp; {CONFIG.partner2}
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div id="details" style={backdrop("details", 0.92)}>
        <div className="wrap center">
          <h2>Bear witness to<br />our special day</h2>
          <div className="tiles">
            <div className="tile">
              <div className="ph"><img src={TILE_WHEN} alt="" style={{ objectPosition: "50% 30%" }} /></div>
              <p>{dateText}<br />{timeText}</p>
              <div className="row">
                <a className="btn" href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">Save the date</a>
              </div>
            </div>
            <div className="tile">
              <div className="ph"><img src={TILE_WHERE} alt="The Underbridge Annex" style={{ objectPosition: "50% 45%" }} /></div>
              <p>{CONFIG.venue}</p>
              <div className="row">
                <a className="btn" href={mapsUrl} target="_blank" rel="noopener noreferrer">Get directions</a>
              </div>
            </div>
            <div className="tile">
              <div className="ph"><img src={TILE_PROGRAM} alt="The order of service for the marriage ceremony of Emmanuel and Bijoux" style={{ objectPosition: "50% 55%" }} /></div>
              <p>Reception follows at the same venue</p>
              <div className="row">
                <a className="btn" href="#programme">View the programme</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Programme */}
      <div id="programme" className="band" style={backdrop("programme", 0.9, true)}>
        <div className="wrap center">
          <h2>Programme</h2>
          <div className="orn" />
          <div className="prog">
            {CONFIG.programme.map((p) => (
              <div className="pblock" key={p.part}>
                <p className="part">{p.part}</p>
                {p.time && <p className="time">{p.time}</p>}
                {p.items.map(([itemName, time]) => (
                  <div key={itemName + (time || "")}>
                    <div className="item serif">{itemName}</div>
                    {time && <div className="time">{time}</div>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div id="gallery-sec" style={backdrop("gallery", 0.82)}>
        <div className="wrap center">
          <h2>Gallery</h2>
          <div className="orn" />
          <button className="folder" onClick={() => setAlbumOpen(true)} aria-label={`Open PRE-WEDDING Photos, ${GALLERY.length} photos`}>
            <span className="folder-back" />
            <span className="folder-photos" aria-hidden="true">
              {GALLERY.slice(0, 3).map((g, i) => (
                <img key={g.src} className={`fp fp${i + 1}${g.bw ? " bw" : ""}`} src={g.src} alt="" />
              ))}
            </span>
            <span className="folder-front">
              <span className="folder-title">PRE-MARRIAGE PHOTOS</span>
              <span className="folder-count">{GALLERY.length} photos &middot; Tap to open</span>
            </span>
          </button>
        </div>
      </div>

      {/* A message for the couple, on a dark photo */}
      <div
        id="messages"
        className="photo-band"
        style={{ backgroundImage: `linear-gradient(rgba(20,14,6,.66),rgba(20,14,6,.74)), url(${MESSAGE_BG})` }}
      >
        <div className="wrap">
          <h2>A message for the couple</h2>
          <p className="muted">
            Share a wish, a memory or a few kind words. {CONFIG.partner1} &amp; {CONFIG.partner2} will read every message.
          </p>
          <div className="card">
            <label className="lbl" htmlFor="name">Your name</label>
            <input id="name" type="text" maxLength={80} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />

            <label className="lbl" htmlFor="msg">Your message</label>
            <textarea id="msg" rows={5} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} />
            <div className="counter">{message.length} / 1000</div>

            {/* Honeypot: hidden from people, tempting for bots */}
            <div className="hp" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
            </div>

            <div className="err" role="alert">{err}</div>
            <button className="btn" style={{ width: "100%" }} onClick={sendMessage} disabled={busy}>
              {busy ? "Sending…" : "Send message"}
            </button>
          </div>
        </div>
      </div>

      </main>

      <footer className="serif">
        {CONFIG.photographer && <>Photography: {CONFIG.photographer}<br /></>}
        <button className="btn ghost" style={{ margin: "12px 0" }} onClick={() => { window.scrollTo(0, 0); setOpened(false); }}>
          Replay opening
        </button>
        <br />
        With love, {CONFIG.partner1} &amp; {CONFIG.partner2}
        {CONFIG.developer && <p className="credit">Designed &amp; developed by {CONFIG.developer}</p>}
      </footer>

      {/* PRE-WEDDING Photos album */}
      {albumOpen && (
        <div className="album-screen" role="dialog" aria-modal="true" aria-labelledby="albumTitle">
          <div className="album-bar">
            <h3 id="albumTitle">
              PRE-WEDDING Photos
              <small>{GALLERY.length} photos</small>
            </h3>
            <button className="album-close" onClick={() => setAlbumOpen(false)} aria-label="Close album">&times;</button>
          </div>
          <div className="album-body">
            <div className="masonry">
              {GALLERY.map((g, i) => (
                <button key={g.src} onClick={() => setLb(i)} aria-label={`Open photo ${i + 1}`}>
                  <img loading="lazy" className={g.bw ? "bw" : ""} src={g.src} alt={`Photo ${i + 1}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Photo viewer */}
      {lb !== null && (
        <div
          className="overlay lb"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onClick={(e) => { if (e.target === e.currentTarget) setLb(null); }}
          onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 50) setLb((i) => (i + (dx < 0 ? 1 : PHOTOS.length - 1)) % PHOTOS.length);
            setTouchX(null);
          }}
        >
          <button className="x" onClick={() => setLb(null)} aria-label="Close">&times;</button>
          <button className="nav prev" onClick={() => setLb((i) => (i + PHOTOS.length - 1) % PHOTOS.length)} aria-label="Previous">&#8249;</button>
          <div className="lb-frame">
            <img className={BW.has(PHOTOS[lb]) ? "bw" : ""} src={PHOTOS[lb]} alt={`Photo ${lb + 1}`} draggable={false} />
          </div>
          <button className="nav next" onClick={() => setLb((i) => (i + 1) % PHOTOS.length)} aria-label="Next">&#8250;</button>
          <div className="cnt">{lb + 1} / {PHOTOS.length}</div>
        </div>
      )}

      {/* Thank-you dialog */}
      {modal && (
        <div
          className="overlay modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mTitle"
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}
        >
          <div className="box">
            <h2 className="serif" id="mTitle">{modal.title}</h2>
            <p style={{ color: "var(--muted)" }}>{modal.text}</p>
            <button className="btn" onClick={() => setModal(null)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
