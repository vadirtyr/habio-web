import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const ThemeContext = createContext(null);

const STORAGE_KEY = "ourorbit_theme";

const THEMES = {
  light: {
    id: "light",
    name: "Daylight",
    vars: {
      "--bg": "#f7f4ea",
      "--surface": "#ffffff",
      "--primary": "#4f8f5b",
      "--primary-dark": "#2f5d3a",
      "--accent": "#f2b84b",
      "--text": "#1f2a24",
      "--muted": "#6f7a72",
      "--border": "#e3ded2",
      "--danger": "#d9534f",
      "--shadow": "0 10px 30px rgba(31, 42, 36, 0.08)",
    },
  },
  dark: {
    id: "dark",
    name: "Midnight",
    vars: {
      "--bg": "#111827",
      "--surface": "#1f2937",
      "--primary": "#60a5fa",
      "--primary-dark": "#3b82f6",
      "--accent": "#fbbf24",
      "--text": "#f9fafb",
      "--muted": "#cbd5e1",
      "--border": "#374151",
      "--danger": "#f87171",
      "--shadow": "0 10px 30px rgba(0, 0, 0, 0.28)",
    },
  },
  nature: {
    id: "nature",
    name: "Evergreen",
    vars: {
      "--bg": "#eef7ed",
      "--surface": "#ffffff",
      "--primary": "#3f7d45",
      "--primary-dark": "#255c31",
      "--accent": "#d9a441",
      "--text": "#18251b",
      "--muted": "#607061",
      "--border": "#d4e4d1",
      "--danger": "#d9534f",
      "--shadow": "0 10px 30px rgba(37, 92, 49, 0.12)",
    },
  },
  focus: {
    id: "focus",
    name: "Slate",
    vars: {
      "--bg": "#eef2f7",
      "--surface": "#ffffff",
      "--primary": "#475569",
      "--primary-dark": "#1e293b",
      "--accent": "#38bdf8",
      "--text": "#0f172a",
      "--muted": "#64748b",
      "--border": "#dbe3ed",
      "--danger": "#dc2626",
      "--shadow": "0 10px 30px rgba(15, 23, 42, 0.10)",
    },
  },
  amoled: {
    id: "amoled",
    name: "AMOLED",
    vars: {
      "--bg": "#000000",
      "--surface": "#0b0b0f",
      "--primary": "#22c55e",
      "--primary-dark": "#16a34a",
      "--accent": "#facc15",
      "--text": "#f8fafc",
      "--muted": "#a1a1aa",
      "--border": "#27272a",
      "--danger": "#ef4444",
      "--shadow": "0 10px 30px rgba(0, 0, 0, 0.55)",
    },
  },
  ocean: {
    id: "ocean",
    name: "Tidal",
    vars: {
      "--bg": "#e6f7fb",
      "--surface": "#ffffff",
      "--primary": "#0ea5e9",
      "--primary-dark": "#0369a1",
      "--accent": "#14b8a6",
      "--text": "#0f2533",
      "--muted": "#57707c",
      "--border": "#c7e7ef",
      "--danger": "#e11d48",
      "--shadow": "0 10px 30px rgba(3, 105, 161, 0.12)",
    },
  },
  coffee: {
    id: "coffee",
    name: "Ember",
    vars: {
      "--bg": "#f5eee6",
      "--surface": "#fffaf5",
      "--primary": "#9a5b2f",
      "--primary-dark": "#65371f",
      "--accent": "#d99b5f",
      "--text": "#2c1d16",
      "--muted": "#7a6253",
      "--border": "#e4d0bf",
      "--danger": "#c2410c",
      "--shadow": "0 10px 30px rgba(101, 55, 31, 0.12)",
    },
  },
  solsticeStore: {
    id: "solsticeStore",
    name: "Solstice",
    vars: {
      "--bg": "#fff4df",
      "--surface": "#ffffff",
      "--primary": "#e8791a",
      "--primary-dark": "#9a3412",
      "--accent": "#facc15",
      "--text": "#2b1706",
      "--muted": "#7c5d3f",
      "--border": "#f4d7a3",
      "--danger": "#dc2626",
      "--shadow": "0 10px 30px rgba(154, 52, 18, 0.14)",
    },
  },

  forestNight: {
    id: "forestNight",
    name: "Forest Night",
    vars: {
      "--bg": "#07140d",
      "--surface": "#102018",
      "--primary": "#34d399",
      "--primary-dark": "#059669",
      "--accent": "#a3e635",
      "--text": "#ecfdf5",
      "--muted": "#a7c7b5",
      "--border": "#1f3a2b",
      "--danger": "#fb7185",
      "--shadow": "0 10px 30px rgba(0, 0, 0, 0.38)",
    },
  },
  aurora: {
    id: "aurora",
    name: "Aurora",
    vars: {
      "--bg": "#101827",
      "--surface": "#172033",
      "--primary": "#22d3ee",
      "--primary-dark": "#0ea5e9",
      "--accent": "#a78bfa",
      "--text": "#f8fafc",
      "--muted": "#c4c9d8",
      "--border": "#2e3a55",
      "--danger": "#fb7185",
      "--shadow": "0 10px 30px rgba(14, 165, 233, 0.18)",
    },
  },
  solstice: {
    id: "solstice",
    name: "Solstice Crown",
    vars: {
      "--bg": "#fff1c7",
      "--surface": "#fffaf0",
      "--primary": "#d97706",
      "--primary-dark": "#92400e",
      "--accent": "#f43f5e",
      "--text": "#2f1604",
      "--muted": "#7c5a32",
      "--border": "#f2cc7c",
      "--danger": "#dc2626",
      "--shadow": "0 10px 30px rgba(146, 64, 14, 0.14)",
    },
  },
  midnightGold: {
    id: "midnightGold",
    name: "Obsidian Gold",
    vars: {
      "--bg": "#08070a",
      "--surface": "#15121a",
      "--primary": "#f59e0b",
      "--primary-dark": "#b45309",
      "--accent": "#fde68a",
      "--text": "#fff7ed",
      "--muted": "#c8b89d",
      "--border": "#332719",
      "--danger": "#ef4444",
      "--shadow": "0 10px 30px rgba(245, 158, 11, 0.16)",
    },
  },
  oceanBreeze: {
    id: "oceanBreeze",
    name: "Ocean Breeze",
    vars: {
      "--bg": "#eefcff",
      "--surface": "#ffffff",
      "--primary": "#06b6d4",
      "--primary-dark": "#0e7490",
      "--accent": "#2dd4bf",
      "--text": "#10303a",
      "--muted": "#5b7780",
      "--border": "#beeaf2",
      "--danger": "#e11d48",
      "--shadow": "0 10px 30px rgba(14, 116, 144, 0.12)",
    },
  },
  roseGarden: {
    id: "roseGarden",
    name: "Rose Garden",
    vars: {
      "--bg": "#fff1f5",
      "--surface": "#ffffff",
      "--primary": "#e11d48",
      "--primary-dark": "#9f1239",
      "--accent": "#fb7185",
      "--text": "#3b0a18",
      "--muted": "#8a5568",
      "--border": "#f8c9d6",
      "--danger": "#be123c",
      "--shadow": "0 10px 30px rgba(225, 29, 72, 0.12)",
    },
  },
  comet: {
    id: "comet",
    name: "Comet",
    vars: {
      "--bg": "#eef2ff",
      "--surface": "#ffffff",
      "--primary": "#6366f1",
      "--primary-dark": "#4338ca",
      "--accent": "#06b6d4",
      "--text": "#18173d",
      "--muted": "#60627e",
      "--border": "#d8ddff",
      "--danger": "#dc2626",
      "--shadow": "0 10px 30px rgba(67, 56, 202, 0.12)",
    },
  },
  nebula: {
    id: "nebula",
    name: "Nebula",
    vars: {
      "--bg": "#1a1028",
      "--surface": "#241736",
      "--primary": "#c084fc",
      "--primary-dark": "#9333ea",
      "--accent": "#f472b6",
      "--text": "#faf5ff",
      "--muted": "#d8c1e8",
      "--border": "#44245f",
      "--danger": "#fb7185",
      "--shadow": "0 10px 30px rgba(147, 51, 234, 0.20)",
    },
  },
  eclipse: {
    id: "eclipse",
    name: "Eclipse",
    vars: {
      "--bg": "#0f1117",
      "--surface": "#191c24",
      "--primary": "#94a3b8",
      "--primary-dark": "#64748b",
      "--accent": "#f97316",
      "--text": "#f8fafc",
      "--muted": "#b8c0cc",
      "--border": "#303642",
      "--danger": "#ef4444",
      "--shadow": "0 10px 30px rgba(0, 0, 0, 0.34)",
    },
  },
  cosmicGold: {
    id: "cosmicGold",
    name: "Cosmic Gold",
    vars: {
      "--bg": "#171104",
      "--surface": "#241b08",
      "--primary": "#eab308",
      "--primary-dark": "#ca8a04",
      "--accent": "#fef08a",
      "--text": "#fff7d6",
      "--muted": "#d6c28b",
      "--border": "#4a3710",
      "--danger": "#f87171",
      "--shadow": "0 10px 30px rgba(234, 179, 8, 0.18)",
    },
  },
};

function getStoredTheme() {
  if (typeof window === "undefined") return "light";
  return localStorage.getItem(STORAGE_KEY) || "light";
}

function applyTheme(themeId) {
  const theme = THEMES[themeId] || THEMES.light;
  const root = document.documentElement;

  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  root.dataset.theme = theme.id;
  localStorage.setItem(STORAGE_KEY, theme.id);
}

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [themeId, setThemeId] = useState(getStoredTheme);

  useEffect(() => {
    const backendTheme = user?.selected_theme;

    if (backendTheme && THEMES[backendTheme]) {
      setThemeId(backendTheme);
      return;
    }

    setThemeId(getStoredTheme());
  }, [user?.selected_theme]);

  useEffect(() => {
    applyTheme(themeId);
  }, [themeId]);

  const selectTheme = useCallback(async (nextThemeId) => {
    if (!THEMES[nextThemeId]) return;

    setThemeId(nextThemeId);
    applyTheme(nextThemeId);

    await api.post("/themes/select", {
      theme_id: nextThemeId,
    });
  }, []);

  const previewTheme = useCallback((nextThemeId) => {
    if (!THEMES[nextThemeId]) return;
    setThemeId(nextThemeId);
    applyTheme(nextThemeId);
  }, []);

  const value = useMemo(
    () => ({
      themeId,
      theme: THEMES[themeId] || THEMES.light,
      themes: THEMES,
      selectTheme,
      previewTheme,
    }),
    [themeId, selectTheme, previewTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}