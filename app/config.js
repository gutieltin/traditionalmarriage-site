// Everything you may want to edit lives here.

export const CONFIG = {
  partner1: "Emmanuel",
  partner2: "Bijoux",
  fullNames: "Emmanuel Nii Odartey Lamptey & Biama Osei Kufuor",
  // Accra is UTC+0, so these times are treated as Accra time for every visitor.
  date: "2026-11-14T09:00:00",
  endDate: "2026-11-14T17:00:00", // used for calendar events; edit as needed
  venue: "The Underbridge Annex, East Legon, Accra",
  mapsQuery: "The Underbridge Annex East Legon Accra",
  storyKicker: "How we met",
  storyHeading: "Our story",
  story: [
    "As fate would have it, our paths first crossed thanks to Emmanuel’s cousin. After a family hangout, his cousin decided to stop by briefly to say hello and introduce his siblings and Emmanuel happened to tag along. A simple hello and a thoughtful “Are you okay?” sparked the connection.",
    "We soon reconnected on Snapchat, started talking every day, and a few years later, here we are! Surrounded by the people we cherish most, we are so excited to begin our forever journey together.",
  ],
  photographer: "Wedding Memories GH",
  developer: "Guti Eltin", // credit in the footer; clear it to hide the line
  programme: [
    { part: "Part 1", items: [["Traditional Marriage Ceremony", "9:00 AM – 11:30 AM"], ["Photography", "11:30 AM – 12:30 PM"]] },
    { part: "Part 2", time: "12:30 PM – 2:00 PM", items: [["Exchange of Vows and Rings"], ["Blessing"], ["Signing of Register"], ["Presentation of Certificate"], ["Photography"]] },
    { part: "Part 3", items: [["Reception", "2:00 PM"]] },
  ],
};

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

// Gallery: every EB photo, in a masonry layout. bw = show in black and white.
export const GALLERY = [
  { src: "/photos/EB01.jpg", bw: false },
  { src: "/photos/EB02.jpg", bw: false },
  { src: "/photos/EB03.jpg", bw: false },
  { src: "/photos/EB04.jpg", bw: false },
  { src: "/photos/EB05.jpg", bw: false },
  { src: "/photos/EB06.jpg", bw: false },
  { src: "/photos/EB07.jpg", bw: false },
  { src: "/photos/EB08.jpg", bw: false },
  { src: "/photos/EB09.jpg", bw: false },
  { src: "/photos/EB10.jpg", bw: false },
  { src: "/photos/EB11.jpg", bw: false },
  { src: "/photos/EB12.jpg", bw: false },
  { src: "/photos/EB13.jpg", bw: true  },
  { src: "/photos/EB14.jpg", bw: false },
  { src: "/photos/EB16.jpg", bw: true  },
  { src: "/photos/EB17.jpg", bw: false },
  { src: "/photos/EB18.jpg", bw: false },
  { src: "/photos/EB19.jpg", bw: false },
  { src: "/photos/EB20.jpg", bw: true  },
];
export const PHOTOS = GALLERY.map((g) => g.src);
export const BW = new Set(GALLERY.filter((g) => g.bw).map((g) => g.src));

// Soft photo backdrops behind each section (a white wash is laid over them in WeddingSite.js)
export const BACKDROPS = {
  floral: "/photos/floral.jpg", // the flower arch and fairy lights photo
  story: "/photos/EB11.jpg",
  details: "/photos/EB02.jpg",
  programme: "/photos/EB10.jpg",
  gallery: "/photos/floral.jpg",
};

// Which photo goes where (file names live in public/photos)
export const LOGO = "/photos/logo-eb.png"; // E&B monogram on the cover
export const HERO_BG = "/photos/hero-bg.jpg"; // full-screen photo behind the cover and the first page
export const STORY_PHOTO = "/photos/EB13.jpg"; // framed photo beside the story
export const TILE_WHEN = "/photos/EB16.jpg";
export const TILE_WHERE = "/photos/venue.jpg";    // The Underbridge Annex
export const TILE_PROGRAM = "/photos/program-card.jpg"; // order of service card with your details
export const MESSAGE_BG = "/photos/EB12.jpg"; // dark full-width photo behind the message form
