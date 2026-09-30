import { WEEKDAY_LABELS, MONTH_LABELS, weekdayFromDateString, monthFromDateString } from './format';
import { REFERENCE_DAY_OF_WEEK_INDEX, REFERENCE_MONTH_INDEX } from '../data/referencePatterns';

const MIN_PERSONAL_SAMPLES = 3;

function mean(arr) {
  if (!arr.length) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function effectivePrice(fillup) {
  const posted = Number(fillup.postedPricePerGallon);
  const discount = Number(fillup.discountPerGallon) || 0;
  return posted - discount;
}

export function totalCost(fillup) {
  return effectivePrice(fillup) * Number(fillup.gallons || 0);
}

// ---- Day-of-week analysis ------------------------------------------------

export function aggregateByWeekday(fillups) {
  const buckets = Array.from({ length: 7 }, () => []);
  for (const f of fillups) {
    const day = weekdayFromDateString(f.date);
    buckets[day].push(effectivePrice(f));
  }
  return buckets.map((prices, day) => ({
    day,
    label: WEEKDAY_LABELS[day],
    count: prices.length,
    avg: mean(prices),
    min: prices.length ? Math.min(...prices) : null,
    max: prices.length ? Math.max(...prices) : null,
  }));
}

export function computeDayOfWeekAnalysis(fillups, baselinePrice) {
  const personal = aggregateByWeekday(fillups);
  const overallPersonalAvg = mean(fillups.map(effectivePrice));
  const baseline = overallPersonalAvg ?? baselinePrice ?? null;

  return personal.map((bucket) => {
    const refIndex = REFERENCE_DAY_OF_WEEK_INDEX[bucket.day].index;
    if (bucket.count >= MIN_PERSONAL_SAMPLES) {
      return { ...bucket, value: bucket.avg, source: 'personal' };
    }
    if (baseline != null) {
      const refValue = baseline * refIndex;
      if (bucket.count > 0) {
        // Blend the few personal points you have with the reference shape, weighted by sample count.
        const weight = bucket.count / MIN_PERSONAL_SAMPLES;
        return { ...bucket, value: bucket.avg * weight + refValue * (1 - weight), source: 'blended' };
      }
      return { ...bucket, value: refValue, source: 'reference' };
    }
    return { ...bucket, value: refIndex, source: 'reference-index-only' };
  });
}

export function bestDayFromAnalysis(dayAnalysis) {
  const withValues = dayAnalysis.filter((d) => d.value != null);
  if (!withValues.length) return null;
  return withValues.reduce((best, d) => (d.value < best.value ? d : best), withValues[0]);
}

export function worstDayFromAnalysis(dayAnalysis) {
  const withValues = dayAnalysis.filter((d) => d.value != null);
  if (!withValues.length) return null;
  return withValues.reduce((worst, d) => (d.value > worst.value ? d : worst), withValues[0]);
}

// ---- Seasonal / month analysis ------------------------------------------

export function aggregateByMonth(fillups) {
  const buckets = Array.from({ length: 12 }, () => []);
  for (const f of fillups) {
    const month = monthFromDateString(f.date); // 1-12
    buckets[month - 1].push(effectivePrice(f));
  }
  return buckets.map((prices, idx) => ({
    month: idx + 1,
    label: MONTH_LABELS[idx],
    count: prices.length,
    avg: mean(prices),
  }));
}

/** Aggregate raw EIA weekly points ({date:'YYYY-MM-DD', price}) into a Jan–Dec average across all years present. */
export function aggregateEiaByMonth(eiaPoints) {
  const buckets = Array.from({ length: 12 }, () => []);
  for (const p of eiaPoints) {
    const month = Number(p.date.slice(5, 7));
    if (month >= 1 && month <= 12) buckets[month - 1].push(p.price);
  }
  return buckets.map((prices, idx) => ({
    month: idx + 1,
    label: MONTH_LABELS[idx],
    count: prices.length,
    avg: mean(prices),
  }));
}

export function computeSeasonalAnalysis(fillups, eiaPoints) {
  const personalByMonth = aggregateByMonth(fillups);
  const eiaByMonth = eiaPoints?.length ? aggregateEiaByMonth(eiaPoints) : null;
  const eiaOverallAvg = eiaByMonth ? mean(eiaByMonth.filter((m) => m.avg != null).map((m) => m.avg)) : null;
  const personalOverallAvg = mean(fillups.map(effectivePrice));
  const baseline = eiaOverallAvg ?? personalOverallAvg ?? null;

  return personalByMonth.map((bucket) => {
    const refIndex = REFERENCE_MONTH_INDEX[bucket.month - 1].index;
    const eiaBucket = eiaByMonth?.[bucket.month - 1];

    if (eiaBucket?.avg != null) {
      // Official EIA regional data wins when we have it — most trustworthy source.
      return { ...bucket, value: eiaBucket.avg, source: 'eia', personalAvg: bucket.avg };
    }
    if (bucket.count >= MIN_PERSONAL_SAMPLES) {
      return { ...bucket, value: bucket.avg, source: 'personal' };
    }
    if (baseline != null) {
      return { ...bucket, value: baseline * refIndex, source: 'reference' };
    }
    return { ...bucket, value: refIndex, source: 'reference-index-only' };
  });
}

// ---- Station comparison --------------------------------------------------

export function computeStationStats(fillups, stationLookup) {
  const groups = new Map();
  for (const f of fillups) {
    const key = f.stationId || `custom:${f.customStationLabel || 'unknown'}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(f);
  }

  const rows = [];
  for (const [key, entries] of groups) {
    const prices = entries.map(effectivePrice);
    const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));
    const station = f_lookupStation(key, stationLookup);
    rows.push({
      key,
      station,
      label: station?.name || sorted[0]?.customStationLabel || 'Unknown station',
      brand: station?.brand,
      cityId: station?.cityId || sorted[0]?.cityId,
      count: entries.length,
      avg: mean(prices),
      last: sorted[0] ? { date: sorted[0].date, price: effectivePrice(sorted[0]) } : null,
    });
  }
  return rows.sort((a, b) => (a.avg ?? Infinity) - (b.avg ?? Infinity));
}

function f_lookupStation(key, stationLookup) {
  if (key.startsWith('custom:')) return null;
  return stationLookup?.get(key) || null;
}

// ---- Personal spend & MPG -------------------------------------------------

export function computeSpendStats(fillups) {
  if (!fillups.length) {
    return { totalSpent: 0, totalGallons: 0, avgPrice: null, count: 0, estimatedMpg: null, last30DaysSpent: 0 };
  }
  const sorted = [...fillups].sort((a, b) => (a.date < b.date ? -1 : 1));
  const totalGallons = sorted.reduce((sum, f) => sum + Number(f.gallons || 0), 0);
  const totalSpent = sorted.reduce((sum, f) => sum + totalCost(f), 0);

  const mpgSamples = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    if (prev.odometer != null && cur.odometer != null && cur.odometer > prev.odometer && cur.gallons > 0) {
      mpgSamples.push((cur.odometer - prev.odometer) / cur.gallons);
    }
  }

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const last30DaysSpent = sorted
    .filter((f) => new Date(f.date).getTime() >= thirtyDaysAgo)
    .reduce((sum, f) => sum + totalCost(f), 0);

  return {
    totalSpent,
    totalGallons,
    avgPrice: totalGallons ? totalSpent / totalGallons : null,
    count: sorted.length,
    estimatedMpg: mpgSamples.length ? mean(mpgSamples) : null,
    last30DaysSpent,
  };
}

// ---- Detour calculator -----------------------------------------------------

export function computeDetour({ basePricePerGal, altPricePerGal, extraRoundTripMiles, mpg, gallonsToBuy }) {
  const base = Number(basePricePerGal);
  const alt = Number(altPricePerGal);
  const miles = Number(extraRoundTripMiles) || 0;
  const efficiency = Number(mpg) || 0;
  const gallons = Number(gallonsToBuy) || 0;

  const grossSavings = (base - alt) * gallons;
  const detourFuelCost = efficiency > 0 ? (miles / efficiency) * alt : 0;
  const netSavings = grossSavings - detourFuelCost;

  return {
    grossSavings,
    detourFuelCost,
    netSavings,
    worthIt: netSavings > 0,
    breakEvenExtraMiles: base > alt && efficiency > 0 ? ((base - alt) * gallons * efficiency) / Math.max(alt, 0.01) : 0,
  };
}

// ---- Loyalty program comparison ---------------------------------------------

export function effectivePriceForProgram(program, postedPrice, { annualGallons = 600, gapOverride } = {}) {
  if (!program) return { effectivePrice: postedPrice, annualNet: null, breakEvenGallons: null };
  if (program.type === 'per-gallon') {
    return { effectivePrice: postedPrice - program.discountPerGallon, annualNet: null, breakEvenGallons: null };
  }
  if (program.type === 'membership') {
    const gap = gapOverride ?? program.typicalGapPerGallon;
    const annualSavings = gap * annualGallons - program.annualFee;
    const breakEvenGallons = gap > 0 ? program.annualFee / gap : null;
    return { effectivePrice: postedPrice - gap, annualNet: annualSavings, breakEvenGallons };
  }
  if (program.type === 'points') {
    return { effectivePrice: postedPrice - program.pointValuePerGallon, annualNet: null, breakEvenGallons: null };
  }
  return { effectivePrice: postedPrice, annualNet: null, breakEvenGallons: null };
}
