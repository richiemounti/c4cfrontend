// components/charts/analytics/colors.ts
// Status triad validated for CVD-safe separation (dataviz skill's
// validate_palette.js) — must match c4cbackend/lib/surveyAnalytics/chartStats.ts.
import { QuestionStatus } from '@/types';

export const STATUS_COLORS: Record<QuestionStatus, string> = {
  on_track: '#2C6E49',
  caution: '#CD8028',
  risk: '#B3261E',
  neutral: '#6B7280',
};

export const STATUS_LABELS: Record<QuestionStatus, string> = {
  on_track: 'On track',
  caution: 'Caution',
  risk: 'At risk',
  neutral: 'No target set',
};

export const PRIMARY_COLOR = '#272236';
export const SURFACE_GRID_COLOR = '#E4E0E1';

// Fixed-order categorical set for option identity (donut/bar option slices).
// Existing brand tones (stratosphere/sky/grass) — every slice using these also
// carries a direct label + legend, since color alone doesn't clear CVD separation.
export const CATEGORICAL_COLORS = ['#272236', '#89A0AE', '#65865A', '#CD8028', '#6B7280'];

export function categoricalColor(index: number): string {
  return CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length];
}

export function formatSignedPct(value: number | null | undefined): string {
  if (value == null) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
