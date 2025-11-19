/**
 * Helpers for safely accessing browser-only globals. These are necessary because
 * TraceJS can be imported in non-browser contexts (SSR, Node) where globals like
 * window, document, or navigator do not exist.
 */

export const getGlobalWindow = (): (Window & typeof globalThis) | null => {
  return typeof window !== "undefined" ? window : null;
};

export const getDocument = (): Document | null => {
  return typeof document !== "undefined" ? document : null;
};

export const getNavigator = (): Navigator | null => {
  if (typeof navigator !== "undefined") {
    return navigator;
  }

  const win = getGlobalWindow();
  return win?.navigator ?? null;
};

export const getLocalStorage = (): Storage | null => {
  const win = getGlobalWindow();
  if (!win || !("localStorage" in win)) {
    return null;
  }

  try {
    return win.localStorage;
  } catch {
    return null;
  }
};
