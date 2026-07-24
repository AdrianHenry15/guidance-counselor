"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react"

export type Theme = "light" | "dark" | "system"
type ResolvedTheme = Exclude<Theme, "system">

/**
 * Shared theme state and updater.
 */
interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const storageKey = "guidance-counselor-theme"

const validThemes: Theme[] = ["light", "dark", "system"]

/**
 * Validates stored theme values.
 */
function isTheme(value: string | null): value is Theme {
  return value !== null && validThemes.includes(value as Theme)
}

/**
 * Returns the saved theme or the system default.
 */
function getStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return "system"
  }

  const storedTheme = window.localStorage.getItem(storageKey)

  return isTheme(storedTheme) ? storedTheme : "system"
}

/**
 * Subscribes to operating-system theme changes.
 */
function subscribeToSystemTheme(callback: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

  mediaQuery.addEventListener("change", callback)

  return () => {
    mediaQuery.removeEventListener("change", callback)
  }
}

/**
 * Returns the current system color scheme.
 */
function getSystemThemeSnapshot(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

/**
 * Provides a stable server-rendering fallback.
 */
function getSystemThemeServerSnapshot(): ResolvedTheme {
  return "light"
}

/**
 * Provides theme state and synchronizes it with the document.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)

  const systemTheme = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemThemeSnapshot,
    getSystemThemeServerSnapshot,
  )

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme

  /**
   * Applies the resolved theme to the root document element.
   */
  useEffect(() => {
    const root = document.documentElement

    root.classList.toggle("dark", resolvedTheme === "dark")
    root.dataset.theme = theme
    root.style.colorScheme = resolvedTheme
  }, [resolvedTheme, theme])

  /**
   * Saves and applies the selected theme.
   */
  const setTheme = useCallback((nextTheme: Theme) => {
    window.localStorage.setItem(storageKey, nextTheme)
    setThemeState(nextTheme)
  }, [])

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * Returns the active theme context.
 */
export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }

  return context
}
