import type { WindowClass } from '../types';

/**
 * Adaptive Window Predicates following DESIGN.md 6.1:
 * - isCompact: width < 700dp
 * - isMedium: 700dp <= width < 1000dp
 * - isExpanded: width >= 1000dp
 * - hasSideRail: width >= 700dp
 * - hasSidePane: hasSideRail && height >= 600dp (Height gate is required!)
 */
export function getWindowClass(width: number, height: number): WindowClass {
  const isCompact = width < 700;
  const isMedium = width >= 700 && width < 1000;
  const isExpanded = width >= 1000;
  const hasSideRail = width >= 700;
  const hasSidePane = hasSideRail && height >= 600;

  return {
    width,
    height,
    isCompact,
    isMedium,
    isExpanded,
    hasSideRail,
    hasSidePane,
  };
}
