import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

type PixelThemeMode = "pink" | "purple";

export type PixelTheme = {
  backgroundAsset: number;
  backgroundTint: string;
  panelBg: string;
  panelBorder: string;
  panelShadow: string;
  title: string;
  subtitle: string;
  pixelDot: string;
  buttonPrimary: string;
  buttonSecondary: string;
  buttonDanger: string;
  buttonText: string;
  inputBg: string;
  inputBorder: string;
  chipBg: string;
  chipBorder: string;
  chipText: string;
  pageTitle: string;
  tabActive: string;
  tabInactive: string;
  tabBg: string;
  tabBorder: string;
  iconFrame: string;
  iconFrameFocused: string;
  iconInner: string;
  iconInnerFocused: string;
};

const STORAGE_KEY = "piclog.pixel-theme-mode";

const themes: Record<PixelThemeMode, PixelTheme> = {
  pink: {
    backgroundAsset: require("../../assets/images/backgrounds/backgorund.gif"),
    backgroundTint: "rgba(255, 245, 250, 0.35)",
    panelBg: "#ffe4f1",
    panelBorder: "#ff9ac5",
    panelShadow: "#c14d82",
    title: "#7f1d49",
    subtitle: "#8f2b57",
    pixelDot: "#ff7fb3",
    buttonPrimary: "#ff7fb3",
    buttonSecondary: "#ff9ac5",
    buttonDanger: "#ff6ea9",
    buttonText: "#fff7fb",
    inputBg: "#fff7fb",
    inputBorder: "#ff9ac5",
    chipBg: "#ffd0e7",
    chipBorder: "#ff9ac5",
    chipText: "#8f2b57",
    pageTitle: "#7f1d49",
    tabActive: "#8f2b57",
    tabInactive: "#b85a89",
    tabBg: "#ffe4f1",
    tabBorder: "#ff9ac5",
    iconFrame: "#ffd4e9",
    iconFrameFocused: "#ffbedd",
    iconInner: "#fff1f8",
    iconInnerFocused: "#ffffff",
  },
  purple: {
    backgroundAsset: require("../../assets/images/backgrounds/background-dark.gif"),
    backgroundTint: "rgba(20, 12, 45, 0.55)",
    panelBg: "#1d1135",
    panelBorder: "#7f5dff",
    panelShadow: "#120b22",
    title: "#d8c8ff",
    subtitle: "#b89cff",
    pixelDot: "#8e74ff",
    buttonPrimary: "#4f3aa8",
    buttonSecondary: "#6a52d6",
    buttonDanger: "#5b41c5",
    buttonText: "#f2ecff",
    inputBg: "#26184a",
    inputBorder: "#7f5dff",
    chipBg: "#312061",
    chipBorder: "#7f5dff",
    chipText: "#d8c8ff",
    pageTitle: "#d8c8ff",
    tabActive: "#d8c8ff",
    tabInactive: "#9f8ae0",
    tabBg: "#1d1135",
    tabBorder: "#7f5dff",
    iconFrame: "#342061",
    iconFrameFocused: "#4b3294",
    iconInner: "#26184a",
    iconInnerFocused: "#312061",
  },
};

type PixelThemeContextValue = {
  mode: PixelThemeMode;
  theme: PixelTheme;
  setMode: (mode: PixelThemeMode) => void;
  toggleTheme: () => void;
};

const PixelThemeContext = createContext<PixelThemeContextValue | null>(null);

export function PixelThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<PixelThemeMode>("pink");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!active) return;
        if (stored === "pink" || stored === "purple") {
          setModeState(stored);
        }
      } catch {
        // Ignore read errors and keep default mode.
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const setMode = useCallback((nextMode: PixelThemeMode) => {
    setModeState(nextMode);
    void AsyncStorage.setItem(STORAGE_KEY, nextMode);
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(mode === "pink" ? "purple" : "pink");
  }, [mode, setMode]);

  const value = useMemo(
    () => ({
      mode,
      theme: themes[mode],
      setMode,
      toggleTheme,
    }),
    [mode, setMode, toggleTheme],
  );

  return (
    <PixelThemeContext.Provider value={value}>
      {children}
    </PixelThemeContext.Provider>
  );
}

export function usePixelTheme() {
  const ctx = useContext(PixelThemeContext);
  if (!ctx) {
    throw new Error("usePixelTheme must be used inside PixelThemeProvider");
  }
  return ctx;
}
