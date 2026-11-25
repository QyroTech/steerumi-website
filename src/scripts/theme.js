(() => {
  const storageKey = "steerumi-theme";
  const root = document.documentElement;
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const validPreference = (value) =>
    value === "light" || value === "dark" ? value : null;
  let preference = null;
  try {
    preference = validPreference(window.localStorage.getItem(storageKey));
  } catch {
    preference = null;
  }

  function applyTheme() {
    const dark = preference ? preference === "dark" : systemTheme.matches;
    root.dataset.theme = dark ? "dark" : "light";
    themeColor?.setAttribute("content", dark ? "#111722" : "#ffffff");
    const button = document.querySelector("[data-theme-toggle]");
    if (button) {
      button.hidden = false;
      button.setAttribute("aria-pressed", String(dark));
      button.title = dark ? "Switch to light mode" : "Switch to dark mode";
    }
  }

  applyTheme();
  systemTheme.addEventListener("change", () => {
    if (!preference) applyTheme();
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== storageKey && event.key !== null) return;
    preference = validPreference(event.newValue);
    applyTheme();
  });
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    document
      .querySelector("[data-theme-toggle]")
      ?.addEventListener("click", () => {
        preference = root.dataset.theme === "dark" ? "light" : "dark";
        try {
          window.localStorage.setItem(storageKey, preference);
        } catch {
          // Theme switching still works when browser storage is unavailable.
        }
        applyTheme();
      });
  });
})();
