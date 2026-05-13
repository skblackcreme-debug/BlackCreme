export type DeliveryZone = 'A' | 'B' | 'C';
export type SupportedState = 'Selangor' | 'Wilayah Persekutuan Kuala Lumpur';

export interface PostcodeEntry {
  city: string;
  state: SupportedState;
  zone: DeliveryZone;
}

export interface DeliveryInfo {
  zone: DeliveryZone;
  fee: number;
  label: string;
  estimatedTime: string;
}

export const BAKERY_INFO = {
  name: 'Black Crème',
  whatsapp: '60122064355',
} as const;

export const SUPPORTED_STATES: SupportedState[] = [
  'Selangor',
  'Wilayah Persekutuan Kuala Lumpur',
];

const ZONE_FEE: Record<DeliveryZone, number> = { A: 8, B: 12, C: 15 };
const ZONE_ETA: Record<DeliveryZone, string> = {
  A: '30–45 min',
  B: '45–60 min',
  C: '60–90 min',
};

// Delivery zones measured from Puchong Jaya (bakery base):
// Zone A  RM 8   ≤15 km  — Puchong, Subang Jaya/USJ, Petaling Jaya, Bangsar
// Zone B  RM 12  15–30km — Shah Alam, Central KL, Kajang/Bangi, Putrajaya, Cyberjaya
// Zone C  RM 15  30–40km — Klang, Kepong, North KL  (>40 km not serviced)

export const POSTCODE_LOOKUP: Record<string, PostcodeEntry> = {
  // ── Zone A — Puchong (bakery base) ────────────────────────────────────────
  '47100': { city: 'Puchong', state: 'Selangor', zone: 'A' },
  '47110': { city: 'Puchong', state: 'Selangor', zone: 'A' },
  '47120': { city: 'Puchong', state: 'Selangor', zone: 'A' },
  '47130': { city: 'Puchong', state: 'Selangor', zone: 'A' },
  '47140': { city: 'Puchong', state: 'Selangor', zone: 'A' },
  '47150': { city: 'Puchong', state: 'Selangor', zone: 'A' },
  '47160': { city: 'Puchong', state: 'Selangor', zone: 'A' },
  '47170': { city: 'Puchong', state: 'Selangor', zone: 'A' },
  '47180': { city: 'Puchong', state: 'Selangor', zone: 'A' },
  '47190': { city: 'Puchong', state: 'Selangor', zone: 'A' },

  // ── Zone A — Petaling Jaya (~9 km) ────────────────────────────────────────
  '46000': { city: 'Petaling Jaya', state: 'Selangor', zone: 'A' },
  '46050': { city: 'Petaling Jaya', state: 'Selangor', zone: 'A' },
  '46100': { city: 'Petaling Jaya', state: 'Selangor', zone: 'A' },
  '46150': { city: 'Petaling Jaya', state: 'Selangor', zone: 'A' },
  '46200': { city: 'Petaling Jaya', state: 'Selangor', zone: 'A' },
  '46300': { city: 'Petaling Jaya', state: 'Selangor', zone: 'A' },
  '46350': { city: 'Petaling Jaya', state: 'Selangor', zone: 'A' },
  '46400': { city: 'Petaling Jaya', state: 'Selangor', zone: 'A' },
  '46450': { city: 'Petaling Jaya', state: 'Selangor', zone: 'A' },
  '46500': { city: 'Petaling Jaya', state: 'Selangor', zone: 'A' },
  '46550': { city: 'Petaling Jaya', state: 'Selangor', zone: 'A' },
  '46600': { city: 'Petaling Jaya', state: 'Selangor', zone: 'A' },
  '46700': { city: 'Petaling Jaya', state: 'Selangor', zone: 'A' },
  '47300': { city: 'Petaling Jaya', state: 'Selangor', zone: 'A' },
  '47400': { city: 'Petaling Jaya', state: 'Selangor', zone: 'A' },
  '47810': { city: 'Petaling Jaya', state: 'Selangor', zone: 'A' },
  '47820': { city: 'Petaling Jaya', state: 'Selangor', zone: 'A' },

  // ── Zone A — Subang Jaya / USJ (~8–10 km) ─────────────────────────────────
  '47000': { city: 'Subang Jaya', state: 'Selangor', zone: 'A' },
  '47200': { city: 'Subang Jaya', state: 'Selangor', zone: 'A' },
  '47500': { city: 'Subang Jaya', state: 'Selangor', zone: 'A' },
  '47600': { city: 'Subang Jaya', state: 'Selangor', zone: 'A' },
  '47610': { city: 'Subang Jaya', state: 'Selangor', zone: 'A' },
  '47620': { city: 'Subang Jaya', state: 'Selangor', zone: 'A' },
  '47630': { city: 'Subang Jaya', state: 'Selangor', zone: 'A' },

  // ── Zone A — Bangsar / Damansara / Mid Valley (~12 km) ────────────────────
  '50480': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'A' },
  '50490': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'A' },
  '50500': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'A' },
  '50550': { city: 'Bangsar',      state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'A' },
  '59000': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'A' },
  '59100': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'A' },
  '59200': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'A' },

  // ── Zone B — Shah Alam (~19 km) ───────────────────────────────────────────
  '40000': { city: 'Shah Alam', state: 'Selangor', zone: 'B' },
  '40100': { city: 'Shah Alam', state: 'Selangor', zone: 'B' },
  '40150': { city: 'Shah Alam', state: 'Selangor', zone: 'B' },
  '40160': { city: 'Shah Alam', state: 'Selangor', zone: 'B' },
  '40170': { city: 'Shah Alam', state: 'Selangor', zone: 'B' },
  '40200': { city: 'Shah Alam', state: 'Selangor', zone: 'B' },
  '40450': { city: 'Shah Alam', state: 'Selangor', zone: 'B' },
  '40460': { city: 'Shah Alam', state: 'Selangor', zone: 'B' },
  '40470': { city: 'Shah Alam', state: 'Selangor', zone: 'B' },

  // ── Zone B — Central KL (~15–17 km) ──────────────────────────────────────
  '50000': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'B' },
  '50100': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'B' },
  '50200': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'B' },
  '50300': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'B' },
  '50350': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'B' },
  '50400': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'B' },
  '50450': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'B' },
  '50460': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'B' },
  '50470': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'B' },
  '50603': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'B' },
  '50620': { city: 'Cheras',       state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'B' },
  '50630': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'B' },
  '55100': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'B' },
  '56000': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'B' },
  '57000': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'B' },
  '58000': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'B' },
  '58100': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'B' },

  // ── Zone B — Kajang / Seri Kembangan / Bangi (~20 km) ────────────────────
  '43000': { city: 'Kajang',            state: 'Selangor', zone: 'B' },
  '43100': { city: 'Hulu Langat',       state: 'Selangor', zone: 'B' },
  '43150': { city: 'Cheras',            state: 'Selangor', zone: 'B' },
  '43200': { city: 'Kajang',            state: 'Selangor', zone: 'B' },
  '43300': { city: 'Balakong',          state: 'Selangor', zone: 'B' },
  '43400': { city: 'Seri Kembangan',    state: 'Selangor', zone: 'B' },
  '43500': { city: 'Semenyih',          state: 'Selangor', zone: 'B' },
  '43600': { city: 'Bangi',             state: 'Selangor', zone: 'B' },
  '43650': { city: 'Bandar Baru Bangi', state: 'Selangor', zone: 'B' },
  '43700': { city: 'Beranang',          state: 'Selangor', zone: 'B' },
  '43800': { city: 'Dengkil',           state: 'Selangor', zone: 'B' },
  '43900': { city: 'Sepang',            state: 'Selangor', zone: 'B' },

  // ── Zone B — Putrajaya & Cyberjaya (~19 km) ───────────────────────────────
  '62000': { city: 'Putrajaya', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'B' },
  '62300': { city: 'Putrajaya', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'B' },
  '62502': { city: 'Putrajaya', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'B' },
  '63000': { city: 'Cyberjaya', state: 'Selangor', zone: 'B' },
  '63100': { city: 'Cyberjaya', state: 'Selangor', zone: 'B' },

  // ── Zone C — Klang (~35–38 km) ───────────────────────────────────────────
  '41000': { city: 'Klang', state: 'Selangor', zone: 'C' },
  '41100': { city: 'Klang', state: 'Selangor', zone: 'C' },
  '41200': { city: 'Klang', state: 'Selangor', zone: 'C' },
  '41300': { city: 'Klang', state: 'Selangor', zone: 'C' },
  '41400': { city: 'Klang', state: 'Selangor', zone: 'C' },
  '41500': { city: 'Klang', state: 'Selangor', zone: 'C' },
  // 41710 Pelabuhan Klang (~41 km) removed — over 40 km limit
  // 48000/48050 Rawang (~44 km) and 48100 Batu Arang removed — over 40 km limit

  // ── Zone C — Kepong / Setapak (North KL, ~28–30 km) ──────────────────────
  '52100': { city: 'Kepong',       state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'C' },
  '52200': { city: 'Kepong',       state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'C' },
  '53000': { city: 'Setapak',      state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'C' },
  '53200': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'C' },
  '54000': { city: 'Kuala Lumpur', state: 'Wilayah Persekutuan Kuala Lumpur', zone: 'C' },
};

// Cities per state, derived from POSTCODE_LOOKUP (sorted alphabetically)
export const STATE_CITIES: Record<SupportedState, string[]> = (() => {
  const map: Record<SupportedState, Set<string>> = {
    Selangor: new Set(),
    'Wilayah Persekutuan Kuala Lumpur': new Set(),
  };
  for (const entry of Object.values(POSTCODE_LOOKUP)) {
    map[entry.state].add(entry.city);
  }
  return {
    Selangor: [...map.Selangor].sort(),
    'Wilayah Persekutuan Kuala Lumpur': [...map['Wilayah Persekutuan Kuala Lumpur']].sort(),
  };
})();

export function isServiceablePostcode(postcode: string): boolean {
  return postcode in POSTCODE_LOOKUP;
}

export function getDeliveryFee(postcode: string): DeliveryInfo | null {
  const entry = POSTCODE_LOOKUP[postcode];
  if (!entry) return null;
  const fee = ZONE_FEE[entry.zone];
  return {
    zone: entry.zone,
    fee,
    label: `Zone ${entry.zone} – RM ${fee.toFixed(2)} delivery`,
    estimatedTime: ZONE_ETA[entry.zone],
  };
}
