// Loyalty / membership programs relevant to Utah County fuel shopping.
// "perGallon" programs discount the posted price directly.
// "membership" programs require an annual fee, amortized against a typical Costco-vs-street
// price gap; the UI lets the user override the gap and their own annual gallons.

export const LOYALTY_PROGRAMS = [
  {
    id: 'maverik',
    label: 'Maverik Adventure Club card',
    brand: 'maverik',
    type: 'per-gallon',
    discountPerGallon: 0.02,
    note: 'Your card. Applied automatically to any Maverik fill-up you log.',
  },
  {
    id: 'costco',
    label: 'Costco membership',
    brand: 'costco',
    type: 'membership',
    annualFee: 65,
    typicalGapPerGallon: 0.1,
    note: 'Costco gas is usually 8–15¢/gal below street price, but only Costco members can buy it.',
  },
  {
    id: 'sams-club',
    label: "Sam's Club membership",
    brand: 'sams-club',
    type: 'membership',
    annualFee: 50,
    typicalGapPerGallon: 0.08,
    note: 'No Sam\'s Club fuel station currently seeded near American Fork — add one manually if that changes.',
  },
  {
    id: 'smiths-fuel-points',
    label: "Smith's Fuel Points",
    brand: 'smiths',
    type: 'points',
    pointValuePerGallon: 0.1,
    pointsPerDollarGrocery: 1,
    fuelPointsPer100: 1,
    note: '1 fuel point per $1 spent at Smith\'s/Kroger; 100 points ≈ 10¢/gal off, up to 35 gal.',
  },
  {
    id: 'chevron-techron',
    label: 'Chevron Techron Advantage',
    brand: 'chevron',
    type: 'per-gallon',
    discountPerGallon: 0.03,
    note: 'Introductory/ongoing card discount varies by promo; verify current rate on your statement.',
  },
];

export function getLoyaltyProgram(id) {
  return LOYALTY_PROGRAMS.find((p) => p.id === id);
}
