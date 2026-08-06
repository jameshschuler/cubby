export const MIN_CHART_WIDTH = 280;
export const MAX_CHART_WIDTH = 420;
export const CHART_WIDTH_PADDING = 28;

export function getChartWidth(screenWidth: number, padding = CHART_WIDTH_PADDING): number {
  const usableWidth = Math.max(0, screenWidth - padding);
  return Math.min(MAX_CHART_WIDTH, Math.max(MIN_CHART_WIDTH, usableWidth));
}
