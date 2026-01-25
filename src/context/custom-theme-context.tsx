"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface CustomTheme {
    primary?: string;
    background?: string;
    foreground?: string;
    radius?: string;
    fontFamily?: string;
}

interface CustomThemeContextType {
    config: CustomTheme;
    setThemeConfig: (config: CustomTheme) => void;
    resetTheme: () => void;
}

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(undefined);

const STORAGE_KEY = "imagineos-custom-theme";

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<CustomTheme>({});

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setConfig(parsed);
                applyTheme(parsed);
            } catch (e) {
                console.error("Failed to parse saved theme", e);
            }
        }
    }, []);

    const applyTheme = (theme: CustomTheme) => {
        const root = document.documentElement;
        if (theme.primary) {
            root.style.setProperty("--primary", theme.primary);
            root.style.setProperty("--ring", theme.primary);
            root.style.setProperty("--sidebar-primary", theme.primary);
        }

        if (theme.background) {
            root.style.setProperty("--background", theme.background);
            root.style.setProperty("--card", theme.background);
            root.style.setProperty("--popover", theme.background);
            root.style.setProperty("--sidebar", theme.background);
        }

        if (theme.foreground) {
            root.style.setProperty("--foreground", theme.foreground);
            root.style.setProperty("--card-foreground", theme.foreground);
            root.style.setProperty("--popover-foreground", theme.foreground);
            root.style.setProperty("--sidebar-foreground", theme.foreground);
        }

        if (theme.radius) root.style.setProperty("--radius", `${theme.radius}rem`);

        if (theme.fontFamily) {
            root.style.setProperty("--font-figtree", theme.fontFamily + ", sans-serif");
            loadFont(theme.fontFamily);
        }
    };

    const loadFont = (fontName: string) => {
        if (fontName === "Figtree" || !fontName) return;
        const fontId = `font-${fontName.toLowerCase().replace(/\s+/g, "-")}`;
        if (document.getElementById(fontId)) return;

        const link = document.createElement("link");
        link.id = fontId;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, "+")}:wght@400;500;600;700&display=swap`;
        document.head.appendChild(link);
    };

    const setThemeConfig = (newConfig: CustomTheme) => {
        const updated = { ...config, ...newConfig };
        setConfig(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        applyTheme(updated);
    };

    const resetTheme = () => {
        setConfig({});
        localStorage.removeItem(STORAGE_KEY);
        // Clear inline styles
        const root = document.documentElement;
        [
            "--primary", "--ring", "--sidebar-primary",
            "--background", "--card", "--popover", "--sidebar",
            "--foreground", "--card-foreground", "--popover-foreground", "--sidebar-foreground",
            "--radius", "--font-figtree"
        ].forEach(prop => root.style.removeProperty(prop));
    };

    return (
        <CustomThemeContext.Provider value={{ config, setThemeConfig, resetTheme }}>
            {children}
        </CustomThemeContext.Provider>
    );
}

export const useCustomTheme = () => {
    const context = useContext(CustomThemeContext);
    if (!context) throw new Error("useCustomTheme must be used within a CustomThemeProvider");
    return context;
}
