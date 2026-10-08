"use client";

import { useSyncExternalStore } from "react";
import { Check, Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem("smark-theme", theme);
  window.dispatchEvent(new Event("smark-theme-change"));
}

function themeSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribeTheme(callback: () => void) {
  window.addEventListener("smark-theme-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("smark-theme-change", callback);
    window.removeEventListener("storage", callback);
  };
}

export function ThemeSettings() {
  const theme = useSyncExternalStore(subscribeTheme, themeSnapshot, () => "light");

  function chooseTheme(next: Theme) {
    applyTheme(next);
  }

  return <div className="appearance-card">
    <div className="appearance-intro"><div><strong>Interface theme</strong><p>Choose how KREV AI appears on this browser. Your selection is applied across the dashboard, documents, reports, onboarding, and settings.</p></div><span>{theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}{theme === "dark" ? "Dark" : "Light"} active</span></div>
    <div className="theme-options" role="radiogroup" aria-label="Interface theme">
      <button type="button" role="radio" aria-checked={theme === "light"} className={theme === "light" ? "active" : ""} onClick={() => chooseTheme("light")}>
        <span className="theme-preview theme-preview-light"><i /><i /><i /><i /></span>
        <span><Sun size={16} /><span><strong>Light</strong><small>Warm paper surfaces with KREV AI purple accents.</small></span></span>
        {theme === "light" && <Check className="theme-check" size={16} />}
      </button>
      <button type="button" role="radio" aria-checked={theme === "dark"} className={theme === "dark" ? "active" : ""} onClick={() => chooseTheme("dark")}>
        <span className="theme-preview theme-preview-dark"><i /><i /><i /><i /></span>
        <span><Moon size={16} /><span><strong>Dark</strong><small>Near-black workspace, charcoal cards, warm text, and vivid accents.</small></span></span>
        {theme === "dark" && <Check className="theme-check" size={16} />}
      </button>
    </div>
    <p className="theme-note">Dark mode follows the visual direction you shared: quiet black surfaces, restrained borders, warm off-white type, and color reserved for functional signals.</p>
  </div>;
}
