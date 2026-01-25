"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface CustomTheme {
    primary?: string;
    background?: string;
    foreground?: string;
    radius?: string;
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
        if (theme.primary) root.style.setProperty("--primary", theme.primary);
        if (theme.primary) root.style.setProperty("--ring", theme.primary);
        if (theme.primary) root.style.setProperty("--sidebar-primary", theme.primary);

        if (theme.background) root.style.setProperty("--background", theme.background);
        if (theme.background) root.style.setProperty("--card", theme.background);
        if (theme.background) root.style.setProperty("--popover", theme.background);
        if (theme.background) root.style.setProperty("--sidebar", theme.background);

        if (theme.radius) root.style.setProperty("--radius", `${theme.radius}rem`);
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
        root.style.removeProperty("--primary");
        root.style.removeProperty("--ring");
        root.style.removeProperty("--sidebar-primary");
        root.style.removeProperty("--background");
        root.style.removeProperty("--card");
        root.style.removeProperty("--popover");
        root.style.removeProperty("--sidebar");
        root.style.removeProperty("--radius");
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
