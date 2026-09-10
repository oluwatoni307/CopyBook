const THEME_KEY = "iweAkowe_theme";
const MOON_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
const SUN_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

function getPreferredTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch (e) {}
  return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
}

export function initTheme({ toggleBtnId = "themeToggle", iconId = "themeIcon", labelId = "themeLabel" } = {}) {
  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const iconEl = document.getElementById(iconId);
    const labelEl = document.getElementById(labelId);
    if (iconEl) iconEl.innerHTML = theme === "dark" ? MOON_SVG : SUN_SVG;
    if (labelEl) labelEl.textContent = theme === "dark" ? "Dark" : "Light";
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }

  let theme = getPreferredTheme();
  apply(theme);

  const btn = document.getElementById(toggleBtnId);
  if (btn) {
    btn.addEventListener("click", () => {
      theme = theme === "dark" ? "light" : "dark";
      apply(theme);
    });
  }
}
