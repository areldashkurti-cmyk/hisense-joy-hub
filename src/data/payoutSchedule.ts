// Hi-PRO Rewards payout schedule. All amounts USD.
// Source: Hi-PRO Rewards payout sheet.

export type PayoutRow = { label: string; amount: number; note?: string };
export type PayoutSeries = { series: string; rows: PayoutRow[] };
export type PayoutCategory = {
  id: "hd" | "ductless" | "multi";
  title: string;
  description: string;
  groups: PayoutSeries[];
};

export const PAYOUT_SCHEDULE: PayoutCategory[] = [
  {
    id: "hd",
    title: "HD Systems",
    description: "Complete ducted split systems.",
    groups: [
      {
        series: "Hi-UNI complete systems",
        rows: [
          { label: "5 Ton", amount: 100 },
          { label: "4 Ton", amount: 90 },
          { label: "3 Ton", amount: 65 },
          { label: "2 Ton", amount: 50 },
          { label: "1.5 Ton", amount: 40 },
        ],
      },
      {
        series: "Hi-PRO HD complete systems",
        rows: [
          { label: "5 Ton", amount: 85 },
          { label: "4 Ton", amount: 85 },
          { label: "3 Ton", amount: 65 },
          { label: "2 Ton", amount: 50 },
        ],
      },
      {
        series: "Hi-ULTRA HD complete systems",
        rows: [
          { label: "5 Ton", amount: 75 },
          { label: "4 Ton", amount: 75 },
          { label: "3 Ton", amount: 55 },
          { label: "2 Ton", amount: 40 },
        ],
      },
      {
        series: "Hi-EDGE HD complete systems",
        rows: [
          { label: "5 Ton", amount: 65 },
          { label: "4 Ton", amount: 60 },
          { label: "3 Ton", amount: 45 },
          { label: "2.5 Ton", amount: 40 },
          { label: "2 Ton", amount: 35 },
          { label: "1.5 Ton", amount: 35 },
        ],
      },
    ],
  },
  {
    id: "ductless",
    title: "Ductless Systems",
    description: "Single-zone ductless installations.",
    groups: [
      {
        series: "Hi-UNI Ductless systems",
        rows: [
          { label: "36k", amount: 60, note: "Slim Ducted" },
          { label: "24k", amount: 40, note: "Ducted / Cassette" },
          { label: "18k", amount: 35, note: "Slim Ducted" },
          { label: "9k / 12k", amount: 25, note: "Ducted / Cassette" },
        ],
      },
      {
        series: "Hi-PRO Ductless systems",
        rows: [{ label: "9k / 12k / 15k", amount: 25 }],
      },
      {
        series: "Hi-ULTRA Ductless systems",
        rows: [
          { label: "24k", amount: 35 },
          { label: "18k", amount: 30 },
          { label: "9k / 12k", amount: 20 },
        ],
      },
      {
        series: "Hi-EDGE Ductless systems",
        rows: [
          { label: "36k", amount: 40 },
          { label: "30k", amount: 35 },
          { label: "24k", amount: 25 },
          { label: "18k", amount: 25 },
          { label: "9k / 12k", amount: 15 },
        ],
      },
    ],
  },
  {
    id: "multi",
    title: "Multi-Zone Systems",
    description: "Outdoor units and matching indoor heads.",
    groups: [
      {
        series: "Outdoor Unit",
        rows: [
          { label: "45k", amount: 45 },
          { label: "36k", amount: 40 },
          { label: "27k", amount: 35 },
          { label: "18k", amount: 25 },
        ],
      },
      {
        series: "Wall Mounted Indoor",
        rows: [
          { label: "9k / 12k / 15k", amount: 5 },
          { label: "18k / 24k", amount: 10 },
        ],
      },
      {
        series: "Console Indoor",
        rows: [{ label: "9k / 12k / 18k", amount: 10 }],
      },
      {
        series: "Cassette Indoor",
        rows: [
          { label: "9k / 12k / 18k", amount: 10 },
          { label: "24k / 36k", amount: 15 },
        ],
      },
      {
        series: "Slim Ducted Indoor",
        rows: [
          { label: "9k / 12k", amount: 10 },
          { label: "18k / 24k", amount: 15 },
        ],
      },
      {
        series: "Air Handler Indoor",
        rows: [
          { label: "18k", amount: 40 },
          { label: "24k", amount: 50 },
        ],
      },
    ],
  },
];

export const MAX_PAYOUT = 100;
