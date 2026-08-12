// Heavy Metal Pollution Index (HMPI) Computation Engine
// Based on Standard Methodologies (Prasad & Bose, 2001; WHO/BIS Standards)

// WHO/BIS Drinking Water Standards (mg/L)
export const WHO_STANDARDS = {
  As: { limit: 0.01, name: 'Arsenic', symbol: 'As', unit: 'mg/L', atomic_weight: 74.92, who_permissible: 0.01, bis_permissible: 0.01, health_risk: 'Carcinogenic' },
  Cd: { limit: 0.003, name: 'Cadmium', symbol: 'Cd', unit: 'mg/L', atomic_weight: 112.41, who_permissible: 0.003, bis_permissible: 0.003, health_risk: 'Kidney damage' },
  Cr: { limit: 0.05, name: 'Chromium', symbol: 'Cr', unit: 'mg/L', atomic_weight: 51.99, who_permissible: 0.05, bis_permissible: 0.05, health_risk: 'Carcinogenic' },
  Cu: { limit: 2.0, name: 'Copper', symbol: 'Cu', unit: 'mg/L', atomic_weight: 63.55, who_permissible: 2.0, bis_permissible: 0.05, health_risk: 'Liver damage' },
  Fe: { limit: 0.3, name: 'Iron', symbol: 'Fe', unit: 'mg/L', atomic_weight: 55.85, who_permissible: 0.3, bis_permissible: 0.3, health_risk: 'Organ toxicity' },
  Mn: { limit: 0.4, name: 'Manganese', symbol: 'Mn', unit: 'mg/L', atomic_weight: 54.94, who_permissible: 0.4, bis_permissible: 0.1, health_risk: 'Neurological damage' },
  Ni: { limit: 0.07, name: 'Nickel', symbol: 'Ni', unit: 'mg/L', atomic_weight: 58.69, who_permissible: 0.07, bis_permissible: 0.02, health_risk: 'Carcinogenic' },
  Pb: { limit: 0.01, name: 'Lead', symbol: 'Pb', unit: 'mg/L', atomic_weight: 207.2, who_permissible: 0.01, bis_permissible: 0.01, health_risk: 'Neurotoxic' },
  Zn: { limit: 5.0, name: 'Zinc', symbol: 'Zn', unit: 'mg/L', atomic_weight: 65.38, who_permissible: 5.0, bis_permissible: 5.0, health_risk: 'GI disturbances' },
  Hg: { limit: 0.006, name: 'Mercury', symbol: 'Hg', unit: 'mg/L', atomic_weight: 200.59, who_permissible: 0.006, bis_permissible: 0.001, health_risk: 'Neurotoxic' },
  Se: { limit: 0.04, name: 'Selenium', symbol: 'Se', unit: 'mg/L', atomic_weight: 78.96, who_permissible: 0.04, bis_permissible: 0.01, health_risk: 'Hepatotoxic' },
  Co: { limit: 0.05, name: 'Cobalt', symbol: 'Co', unit: 'mg/L', atomic_weight: 58.93, who_permissible: 0.05, bis_permissible: 0.05, health_risk: 'Cardiac toxicity' },
};

export const METAL_COLORS = {
  As: '#e17055', Cd: '#d63031', Cr: '#6c5ce7', Cu: '#00b894',
  Fe: '#fdcb6e', Mn: '#74b9ff', Ni: '#fd79a8', Pb: '#ff7675',
  Zn: '#00cec9', Hg: '#a29bfe', Se: '#55efc4', Co: '#ffeaa7',
};

// ─────────────────────────────────────────────
// 1. HEAVY METAL POLLUTION INDEX (HMPI)
// Formula: HMPI = Σ Qn / n
// where Qn = 100 × (Cn / Sn)
// Cn = observed concentration, Sn = WHO/BIS standard
// HMPI < 100: Safe; 100–200: Moderate; >200: Unsafe
// ─────────────────────────────────────────────
export function computeHMPI(concentrations) {
  const metals = Object.keys(concentrations);
  if (metals.length === 0) return null;
  
  const Qn_values = {};
  let sumQn = 0;
  
  metals.forEach(metal => {
    if (!WHO_STANDARDS[metal]) return;
    const Cn = parseFloat(concentrations[metal]);
    const Sn = WHO_STANDARDS[metal].limit;
    const Qn = 100 * (Cn / Sn);
    Qn_values[metal] = Qn;
    sumQn += Qn;
  });

  const hmpi = sumQn / metals.length;
  
  return {
    value: hmpi,
    Qn_values,
    classification: classifyHMPI(hmpi),
    formula: 'HMPI = Σ(100 × Cn/Sn) / n',
  };
}

function classifyHMPI(hmpi) {
  if (hmpi < 100) return { label: 'Safe', class: 'safe', color: '#00b894', description: 'Water is safe for drinking (WHO standards)' };
  if (hmpi < 200) return { label: 'Moderate Risk', class: 'moderate', color: '#fdcb6e', description: 'Slight contamination, requires monitoring' };
  if (hmpi < 300) return { label: 'High Risk', class: 'high', color: '#e17055', description: 'Unsafe for drinking, treatment required' };
  return { label: 'Critical Risk', class: 'critical', color: '#d63031', description: 'Severely contaminated, immediate action needed' };
}

// ─────────────────────────────────────────────
// 2. HEAVY METAL EVALUATION INDEX (HEI)
// HEI = Σ (Cn / Smac_n)
// Smac = Maximum allowable concentration
// ─────────────────────────────────────────────
export function computeHEI(concentrations) {
  const metals = Object.keys(concentrations);
  let hei = 0;
  const contributions = {};

  metals.forEach(metal => {
    if (!WHO_STANDARDS[metal]) return;
    const Cn = parseFloat(concentrations[metal]);
    const Sn = WHO_STANDARDS[metal].limit;
    const contribution = Cn / Sn;
    contributions[metal] = contribution;
    hei += contribution;
  });

  return {
    value: hei,
    contributions,
    classification: classifyHEI(hei),
    formula: 'HEI = Σ (Cn / Smac_n)',
  };
}

function classifyHEI(hei) {
  if (hei < 10) return { label: 'Low', class: 'safe', color: '#00b894' };
  if (hei < 20) return { label: 'Medium', class: 'moderate', color: '#fdcb6e' };
  return { label: 'High', class: 'critical', color: '#d63031' };
}

// ─────────────────────────────────────────────
// 3. CONTAMINATION FACTOR (CF) per metal
// CF_i = Cn_i / Cback_i (or WHO standard if background unknown)
// CF < 1: Low; 1–3: Moderate; 3–6: Considerable; >6: Very High
// ─────────────────────────────────────────────
export function computeContaminationFactor(concentrations) {
  const results = {};
  Object.keys(concentrations).forEach(metal => {
    if (!WHO_STANDARDS[metal]) return;
    const Cn = parseFloat(concentrations[metal]);
    const Cback = WHO_STANDARDS[metal].limit;
    const cf = Cn / Cback;
    results[metal] = {
      cf,
      classification: clasifyCF(cf),
    };
  });
  return results;
}

function clasifyCF(cf) {
  if (cf < 1) return { label: 'Low', class: 'safe', color: '#00b894' };
  if (cf < 3) return { label: 'Moderate', class: 'moderate', color: '#fdcb6e' };
  if (cf < 6) return { label: 'Considerable', class: 'high', color: '#e17055' };
  return { label: 'Very High', class: 'critical', color: '#d63031' };
}

// ─────────────────────────────────────────────
// 4. DEGREE OF CONTAMINATION (Cd)
// Cd = Σ CF_i - n (where n = number of metals)
// ─────────────────────────────────────────────
export function computeDegreeOfContamination(concentrations) {
  const cfResults = computeContaminationFactor(concentrations);
  const metals = Object.keys(cfResults);
  const n = metals.length;
  let sumCF = 0;
  metals.forEach(metal => { sumCF += cfResults[metal].cf; });
  const cd = sumCF - n;

  return {
    value: cd,
    classification: classifyCd(cd),
    formula: 'Cd = Σ CF_i − n',
    cf_breakdown: cfResults,
  };
}

function classifyCd(cd) {
  if (cd < 1) return { label: 'Low', class: 'safe', color: '#00b894' };
  if (cd < 3) return { label: 'Moderate', class: 'moderate', color: '#fdcb6e' };
  if (cd < 6) return { label: 'High', class: 'high', color: '#e17055' };
  return { label: 'Very High', class: 'critical', color: '#d63031' };
}

// ─────────────────────────────────────────────
// 5. ENTROPY WEIGHTED WATER QUALITY INDEX (EWQI)
// Used when multiple samples exist
// ─────────────────────────────────────────────
export function computeEntropyWeightedWQI(samples) {
  if (!samples || samples.length < 2) return null;

  const metals = Object.keys(samples[0].concentrations);
  const n = samples.length;
  const m = metals.length;

  // Step 1: Normalize (divide by sum per metal)
  const norm = {};
  metals.forEach(metal => {
    const values = samples.map(s => parseFloat(s.concentrations[metal] || 0));
    const total = values.reduce((a, b) => a + b, 0);
    norm[metal] = values.map(v => total > 0 ? v / total : 0);
  });

  // Step 2: Entropy (e_j = -k Σ p_ij * ln(p_ij))
  const k = 1 / Math.log(n);
  const entropy = {};
  metals.forEach(metal => {
    let e = 0;
    norm[metal].forEach(p => {
      if (p > 0) e -= p * Math.log(p);
    });
    entropy[metal] = k * e;
  });

  // Step 3: Weights (w_j = (1 - e_j) / Σ(1 - e_j))
  const diffs = metals.map(metal => 1 - entropy[metal]);
  const sumDiffs = diffs.reduce((a, b) => a + b, 0);
  const weights = {};
  metals.forEach((metal, i) => {
    weights[metal] = sumDiffs > 0 ? diffs[i] / sumDiffs : 1 / m;
  });

  // Step 4: EWQI per sample
  const ewqi_values = samples.map(sample => {
    let ewqi = 0;
    metals.forEach(metal => {
      const Cn = parseFloat(sample.concentrations[metal] || 0);
      const Sn = WHO_STANDARDS[metal]?.limit || 1;
      const Qn = 100 * (Cn / Sn);
      ewqi += weights[metal] * Qn;
    });
    return ewqi;
  });

  return { weights, ewqi_values, formula: 'EWQI = Σ w_j × Q_j' };
}

// ─────────────────────────────────────────────
// 6. HUMAN HEALTH RISK ASSESSMENT (HHRA)
// Non-Carcinogenic: HQ = CDI / RfD
// Carcinogenic: CR = CDI × SF
// CDI = Concentration × IR × EF × ED / (BW × AT)
// ─────────────────────────────────────────────
const RISK_PARAMS = {
  adult:   { IR: 2.0, BW: 70, EF: 365, ED: 30, AT_nc: 365 * 30, AT_c: 365 * 70 },
  child:   { IR: 1.0, BW: 15, EF: 350, ED: 6,  AT_nc: 365 * 6,  AT_c: 365 * 70 },
};

const TOXICITY = {
  As:  { RfD: 0.0003,  SF: 1.5e-4,  carcinogenic: true  },
  Cd:  { RfD: 0.0005,  SF: 0.0,     carcinogenic: false },
  Cr:  { RfD: 0.003,   SF: 5.0e-5,  carcinogenic: true  },
  Cu:  { RfD: 0.04,    SF: 0.0,     carcinogenic: false },
  Fe:  { RfD: 0.3,     SF: 0.0,     carcinogenic: false },
  Mn:  { RfD: 0.14,    SF: 0.0,     carcinogenic: false },
  Ni:  { RfD: 0.02,    SF: 0.0,     carcinogenic: false },
  Pb:  { RfD: 0.0035,  SF: 0.0,     carcinogenic: false },
  Zn:  { RfD: 0.3,     SF: 0.0,     carcinogenic: false },
  Hg:  { RfD: 0.0003,  SF: 0.0,     carcinogenic: false },
  Se:  { RfD: 0.005,   SF: 0.0,     carcinogenic: false },
  Co:  { RfD: 0.003,   SF: 0.0,     carcinogenic: false },
};

export function computeHHRA(concentrations) {
  const results = {};
  const groups = ['adult', 'child'];

  groups.forEach(group => {
    const params = RISK_PARAMS[group];
    const hq = {};
    const cr = {};
    let HI = 0; // Hazard Index = sum of HQ

    Object.keys(concentrations).forEach(metal => {
      const Cn = parseFloat(concentrations[metal]) * 1000; // convert mg/L to ug/L is fine; but CDI in mg/kg-day
      const tox = TOXICITY[metal];
      if (!tox) return;

      // CDI = Cn(mg/L) * IR(L/day) * EF * ED / BW / AT
      const CDI = (parseFloat(concentrations[metal]) * params.IR * params.EF * params.ED) / (params.BW * params.AT_nc);
      const HQ_val = CDI / tox.RfD;
      hq[metal] = HQ_val;
      HI += HQ_val;

      if (tox.carcinogenic && tox.SF > 0) {
        const CDI_c = (parseFloat(concentrations[metal]) * params.IR * params.EF * params.ED) / (params.BW * params.AT_c);
        cr[metal] = CDI_c * tox.SF;
      }
    });

    results[group] = {
      HQ: hq,
      HI,
      CR: cr,
      HI_class: HI > 1 ? { label: 'Unacceptable', color: '#d63031' } : { label: 'Acceptable', color: '#00b894' },
    };
  });

  return results;
}

// ─────────────────────────────────────────────
// UTILITY: Full Analysis on a Sample
// ─────────────────────────────────────────────
export function runFullAnalysis(sample) {
  return {
    sample_id: sample.id || 'S1',
    location: sample.location,
    coordinates: sample.coordinates,
    hmpi: computeHMPI(sample.concentrations),
    hei: computeHEI(sample.concentrations),
    cd: computeDegreeOfContamination(sample.concentrations),
    hhra: computeHHRA(sample.concentrations),
    timestamp: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────
// MOCK SAMPLE DATASET (Realistic Indian Groundwater)
// ─────────────────────────────────────────────
export const MOCK_SAMPLES = [
  {
    id: 'GW-001', location: 'Patna, Bihar', district: 'Patna', state: 'Bihar',
    coordinates: { lat: 25.5941, lng: 85.1376 }, depth: 45, source_type: 'Borewell', date: '2025-03-12',
    concentrations: { As: 0.025, Pb: 0.018, Cd: 0.004, Mn: 0.52, Fe: 0.88, Cr: 0.035, Cu: 0.68, Zn: 2.1, Ni: 0.04 },
  },
  {
    id: 'GW-002', location: 'Kanpur, UP', district: 'Kanpur', state: 'Uttar Pradesh',
    coordinates: { lat: 26.4499, lng: 80.3319 }, depth: 38, source_type: 'Open Well', date: '2025-03-14',
    concentrations: { As: 0.008, Pb: 0.032, Cd: 0.007, Mn: 0.15, Fe: 1.2, Cr: 0.065, Cu: 1.4, Zn: 3.8, Hg: 0.008 },
  },
  {
    id: 'GW-003', location: 'Bhilai, Chhattisgarh', district: 'Durg', state: 'Chhattisgarh',
    coordinates: { lat: 21.2094, lng: 81.4285 }, depth: 60, source_type: 'Borewell', date: '2025-03-18',
    concentrations: { Cr: 0.12, Ni: 0.09, Pb: 0.025, Fe: 2.8, Mn: 0.8, Cu: 0.45, Zn: 1.5, Co: 0.06 },
  },
  {
    id: 'GW-004', location: 'Jodhpur, Rajasthan', district: 'Jodhpur', state: 'Rajasthan',
    coordinates: { lat: 26.2389, lng: 73.0243 }, depth: 120, source_type: 'Borewell', date: '2025-04-01',
    concentrations: { As: 0.004, Pb: 0.007, Fe: 0.21, Mn: 0.18, Cu: 0.55, Zn: 1.8, Ni: 0.015, Cr: 0.02 },
  },
  {
    id: 'GW-005', location: 'Vapi, Gujarat', district: 'Valsad', state: 'Gujarat',
    coordinates: { lat: 20.3720, lng: 72.9060 }, depth: 28, source_type: 'Open Well', date: '2025-04-05',
    concentrations: { As: 0.003, Cd: 0.011, Pb: 0.055, Cr: 0.098, Hg: 0.012, Cu: 1.8, Ni: 0.12, Zn: 4.5, Fe: 0.45 },
  },
  {
    id: 'GW-006', location: 'Alappuzha, Kerala', district: 'Alappuzha', state: 'Kerala',
    coordinates: { lat: 9.4981, lng: 76.3388 }, depth: 15, source_type: 'Open Well', date: '2025-04-08',
    concentrations: { As: 0.006, Fe: 1.5, Mn: 0.62, Cu: 0.28, Zn: 0.9, Pb: 0.009, Ni: 0.02, Cr: 0.018 },
  },
];
