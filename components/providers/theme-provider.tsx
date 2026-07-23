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

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const storageKey = "guidance-counselor-theme"

const validThemes: Theme[] = ["light", "dark", "system"]

function isTheme(value: string | null): value is Theme {
  return value !== null && validThemes.includes(value as Theme)
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return "system"
  }

  const storedTheme = window.localStorage.getItem(storageKey)

  return isTheme(storedTheme) ? storedTheme : "system"
}

function subscribeToSystemTheme(callback: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

  mediaQuery.addEventListener("change", callback)

  return () => {
    mediaQuery.removeEventListener("change", callback)
  }
}

function getSystemThemeSnapshot(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function getSystemThemeServerSnapshot(): ResolvedTheme {
  return "light"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)

  const systemTheme = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemThemeSnapshot,
    getSystemThemeServerSnapshot,
  )

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme

  useEffect(() => {
    const root = document.documentElement

    root.classList.toggle("dark", resolvedTheme === "dark")
    root.dataset.theme = theme
    root.style.colorScheme = resolvedTheme
  }, [resolvedTheme, theme])

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

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }

  return context
}
