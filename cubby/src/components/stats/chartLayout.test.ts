import { describe, expect, it } from 'vitest';

import { getChartWidth, MAX_CHART_WIDTH, MIN_CHART_WIDTH } from './chartLayout';

describe('getChartWidth', () => {
  it('returns the minimum width for narrow screens', () => {
    expect(getChartWidth(200)).toBe(MIN_CHART_WIDTH);
  });

  it('caps the width at the maximum value', () => {
    expect(getChartWidth(1000)).toBe(MAX_CHART_WIDTH);
  });

  it('uses the available space when it is between the min and max bounds', () => {
    expect(getChartWidth(360)).toBe(332);
  });
});
