/** Light, dark, or whatever the device is set to. Remembered per browser. */
export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "theme";

/**
 * Runs in <head> before the first paint, so the page never flashes the wrong
 * theme. Kept as a string because it has to execute before React loads.
 */
export const THEME_SCRIPT = `(function(){try{var p=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});var d=p==="dark"||(p!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light"}catch(e){document.documentElement.dataset.theme="light"}})()`;
