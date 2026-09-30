// GENERAL REFERENCE PATTERNS — not live data, not specific to American Fork.
// These are widely-reported industry patterns (AAA/OPIS/EIA weekly retail surveys,
// and multiple GasBuddy annual "best day to buy gas" studies) used ONLY as a starting
// point until you've logged enough of your own fill-ups for the app to use your real
// data instead. Every chart that uses these labels them "general pattern" so it's
// never confused with your personal history.
//
// Day-of-week index: retailers in most U.S. markets typically move price zones up
// Wed–Fri (ahead of weekend travel demand) and are more likely to hold or cut prices
// Sun–Tue. The swing is usually small (a few cents/gal) but persistent. Values below
// are a relative index (1.00 = weekly average); Monday is the reference floor.
export const REFERENCE_DAY_OF_WEEK_INDEX = [
  { day: 0, label: 'Sun', index: 1.004 },
  { day: 1, label: 'Mon', index: 0.997 },
  { day: 2, label: 'Tue', index: 0.995 },
  { day: 3, label: 'Wed', index: 0.998 },
  { day: 4, label: 'Thu', index: 1.003 },
  { day: 5, label: 'Fri', index: 1.006 },
  { day: 6, label: 'Sat', index: 1.005 },
];

// Seasonal index: U.S. retail gasoline reliably rises into spring as refineries
// switch to summer-blend fuel (costlier to produce) and driving demand climbs, peaks
// around Memorial Day–Labor Day, then eases through fall/winter. Values are a relative
// index against the annual average (1.00). Utah tracks the national shape closely
// since it sits on the Salt Lake City refining corridor with its own seasonal switch.
export const REFERENCE_MONTH_INDEX = [
  { month: 1, label: 'Jan', index: 0.93 },
  { month: 2, label: 'Feb', index: 0.95 },
  { month: 3, label: 'Mar', index: 1.0 },
  { month: 4, label: 'Apr', index: 1.05 },
  { month: 5, label: 'May', index: 1.07 },
  { month: 6, label: 'Jun', index: 1.06 },
  { month: 7, label: 'Jul', index: 1.05 },
  { month: 8, label: 'Aug', index: 1.03 },
  { month: 9, label: 'Sep', index: 1.0 },
  { month: 10, label: 'Oct', index: 0.96 },
  { month: 11, label: 'Nov', index: 0.94 },
  { month: 12, label: 'Dec', index: 0.95 },
];

export const REFERENCE_SOURCE_NOTE =
  'General pattern from widely reported AAA/OPIS/GasBuddy retail studies and EIA seasonal data — not specific to American Fork and not live. Log fill-ups to replace this with your own history.';

export function getReferenceDayIndex(dayOfWeek) {
  return REFERENCE_DAY_OF_WEEK_INDEX.find((d) => d.day === dayOfWeek)?.index ?? 1;
}

export function getReferenceMonthIndex(month1to12) {
  return REFERENCE_MONTH_INDEX.find((m) => m.month === month1to12)?.index ?? 1;
}
