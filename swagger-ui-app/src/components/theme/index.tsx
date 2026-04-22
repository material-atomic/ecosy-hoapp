/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type PropsWithChildren, type SetStateAction } from "react";

export type ThemeMode = "light" | "dark";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: SetStateAction<ThemeMode>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("@ecosy/hoapp/swagger/theme");
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  }
  return "light";
};

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);

  const setTheme = (newTheme: SetStateAction<ThemeMode>) => {
    setThemeState((prev) => {
      if (typeof newTheme === "string") {
        localStorage.setItem("@ecosy/hoapp/swagger/theme", newTheme);
        return newTheme;
      }

      const next = newTheme(prev);
      localStorage.setItem("@ecosy/hoapp/swagger/theme", next);
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Vẫn xuất ra data-theme tại root div cho độ an toàn CSS isolation
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
