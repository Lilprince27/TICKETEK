// Seed catalogue for the demo box office. Ids are slugs so routes read nicely.

import { ROWS, SEATS_PER_ROW } from "./layout.js";

const EVENTS = [
  {
    id: "midnight-bloom-afterglow",
    title: "Midnight Bloom: Afterglow Tour",
    category: "Pop",
    tagline: "Arena pop with a full live band and a mirror-ball finale.",
    venue: "Qudos Bank Arena",
    city: "Sydney",
    date: "2027-02-14T19:30:00+11:00",
    doors: "6:00 pm",
    description:
      "Midnight Bloom bring the Afterglow Tour to Sydney for one night only: two hours of shimmering synth-pop, a six-piece band and a closing run of the singles that started it all.",
    gradient: ["#ff2d55", "#7c1dff"],
    prices: { premium: 249, standard: 169, economy: 99 }
  },
  {
    id: "harbour-lights-festival",
    title: "Harbour Lights Festival",
    category: "Festival",
    tagline: "Ten acts, one stage, sunset to midnight on the harbour.",
    venue: "The Domain",
    city: "Sydney",
    date: "2027-01-09T16:00:00+11:00",
    doors: "3:00 pm",
    description:
      "Sydney's summer festival returns with a lineup spanning indie, hip-hop and disco across one long harbour-side afternoon. Gates open at 3pm, music runs until midnight.",
    gradient: ["#00d4ff", "#0047ff"],
    prices: { premium: 189, standard: 139, economy: 89 }
  },
  {
    id: "the-riff-brotherhood",
    title: "The Riff Brotherhood",
    category: "Rock",
    tagline: "Loud, sweaty, riff-for-riff rock and roll.",
    venue: "Riverstage",
    city: "Brisbane",
    date: "2026-12-12T18:00:00+10:00",
    doors: "5:00 pm",
    description:
      "The Riff Brotherhood close out their national tour under the fig trees at Riverstage, with a support set from local favourites The Narrow Hours.",
    gradient: ["#ff8a00", "#ff2d2d"],
    prices: { premium: 179, standard: 129, economy: 85 }
  },
  {
    id: "sunday-sessions-jazz",
    title: "Sunday Sessions: Jazz at the Con",
    category: "Jazz",
    tagline: "A late-afternoon set from the house quartet and guests.",
    venue: "Sydney Opera House — Concert Hall",
    city: "Sydney",
    date: "2026-12-06T17:00:00+11:00",
    doors: "4:15 pm",
    description:
      "An unhurried Sunday of standards and new material from the Conservatorium quartet, joined by a rotating guest vocalist each week.",
    gradient: ["#ffd166", "#b5179e"],
    prices: { premium: 149, standard: 109, economy: 69 }
  },
  {
    id: "comedy-gala-night",
    title: "Comedy Gala Night",
    category: "Comedy",
    tagline: "Six comics, one night, no interval.",
    venue: "Enmore Theatre",
    city: "Sydney",
    date: "2027-03-20T20:00:00+11:00",
    doors: "7:15 pm",
    description:
      "Six of the country's sharpest stand-ups in a fast-moving gala line-up at the Enmore. Strictly 18+, phones in bags for the duration.",
    gradient: ["#7cf7c4", "#0b7285"],
    prices: { premium: 129, standard: 95, economy: 65 }
  },
  {
    id: "neon-skyline-melbourne",
    title: "Neon Skyline",
    category: "Electronic",
    tagline: "Warehouse-scale synths at the Bowl.",
    venue: "Sidney Myer Music Bowl",
    city: "Melbourne",
    date: "2027-02-27T19:00:00+11:00",
    doors: "6:00 pm",
    description:
      "Neon Skyline's visual-heavy electronic show lands for a single Melbourne night, with a full LED rig and support from two local producers.",
    gradient: ["#c8ff00", "#00a3ff"],
    prices: { premium: 199, standard: 149, economy: 95 }
  },
  {
    id: "desert-bloom-sounds",
    title: "Desert Bloom Sounds",
    category: "Indie",
    tagline: "Late-night indie in the round.",
    venue: "Adelaide Entertainment Centre",
    city: "Adelaide",
    date: "2027-01-23T19:30:00+10:30",
    doors: "6:30 pm",
    description:
      "An in-the-round indie bill with three acts sharing the stage and swapping players between sets. One night only in Adelaide.",
    gradient: ["#ff7a00", "#ff0059"],
    prices: { premium: 159, standard: 119, economy: 75 }
  },
  {
    id: "freo-fest-sessions",
    title: "Freo Fest Sessions",
    category: "Folk",
    tagline: "Courtyard folk, long tables and a sunset set.",
    venue: "Fremantle Arts Centre",
    city: "Perth",
    date: "2027-03-06T17:30:00+08:00",
    doors: "4:30 pm",
    description:
      "A seated courtyard evening of folk and roots music in the Freo Arts Centre gardens, with food trucks on site from 4:30pm.",
    gradient: ["#00ffa3", "#00b3ff"],
    prices: { premium: 119, standard: 89, economy: 59 }
  }
];

// Deterministic "already sold" seats per event, so the map looks lived-in while
// staying stable between restarts (seeded from the event id).
function seededSoldSeats(id) {
  let seed = 7;
  for (const char of id) seed = (seed * 31 + char.charCodeAt(0)) % 2147483647;
  const next = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    seed >>>= 0;
    return seed / 4294967296;
  };

  const density = 0.12 + next() * 0.26;
  const sold = [];
  for (const row of ROWS) {
    for (let number = 1; number <= SEATS_PER_ROW; number += 1) {
      const rowBias = row === "A" || row === "B" ? 0.06 : 0;
      if (next() < density + rowBias) sold.push(`${row}${number}`);
    }
  }
  return sold;
}

// Event times are shown in the venue's timezone, not the visitor's, so a Sydney
// show always reads 7:30 pm no matter where the browser is.
export const CITY_TIME_ZONES = {
  Sydney: "Australia/Sydney",
  Melbourne: "Australia/Melbourne",
  Brisbane: "Australia/Brisbane",
  Adelaide: "Australia/Adelaide",
  Perth: "Australia/Perth"
};

export function createSeedData() {
  return {
    events: EVENTS.map((event) => ({
      ...event,
      timeZone: CITY_TIME_ZONES[event.city] ?? "Australia/Sydney",
      seededSold: seededSoldSeats(event.id)
    })),
    bookings: []
  };
}

export { EVENTS };
