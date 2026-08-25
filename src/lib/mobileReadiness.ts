/** Mobile-safe navigation and interaction primitives. No UI framework dependency. */

export interface TouchTargetPolicy {
  minCssPx: number;
  spacingCssPx: number;
}

export const DEFAULT_TOUCH_TARGET: TouchTargetPolicy = {
  minCssPx: 44,
  spacingCssPx: 8,
};

export interface MobileReadinessPolicy {
  touchTarget: TouchTargetPolicy;
  reduceMotion: boolean;
  compactNavigation: boolean;
  preserveDeepLinks: boolean;
  rtlSafe: boolean;
}

export function createMobileReadinessPolicy(prefersReducedMotion = false): MobileReadinessPolicy {
  return {
    touchTarget: DEFAULT_TOUCH_TARGET,
    reduceMotion: prefersReducedMotion,
    compactNavigation: true,
    preserveDeepLinks: true,
    rtlSafe: true,
  };
}

/**
 * Keeps a deep-link target constrained to an application-owned path.
 * Returns null for external or malformed URLs rather than navigating blindly.
 */
export function safeInternalPath(input: string, origin: string): string | null {
  try {
    const url = new URL(input, origin);
    const base = new URL(origin);
    if (url.origin !== base.origin) return null;
    if (!url.pathname.startsWith('/')) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
