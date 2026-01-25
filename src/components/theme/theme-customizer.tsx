"use client";

import React from "react";
import { X, RotateCcw, Settings2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomTheme } from "@/context/custom-theme-context";
import { motion, AnimatePresence } from "motion/react";

const GOOGLE_FONTS = [
    "Figtree",
    "Inter",
    "Roboto",
    "Montserrat",
    "Open Sans",
    "Lato",
    "Poppins",
    "Playfair Display",
    "Merriweather",
    "Raleway",
    "Oswald"
];

export function ThemeCustomizer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { config, setThemeConfig, resetTheme } = useCustomTheme();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="absolute bottom-20 right-0 z-[110] w-80 bg-background/90 backdrop-blur-xl border border-border/50 shadow-2xl rounded-[32px] p-6 flex flex-col gap-6 pointer-events-auto max-h-[70vh] overflow-y-auto no-scrollbar"
                >
                    <div className="flex items-center justify-between sticky top-0 bg-transparent z-10">
                        <div className="flex items-center gap-2">
                            <Settings2Icon size={18} className="text-primary" />
                            <h3 className="font-bold text-lg">Settings</h3>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
                            <X size={16} />
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {/* Primary Color */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Primary Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={config.primary || "#FF4400"}
                                    onChange={(e) => setThemeConfig({ primary: e.target.value })}
                                    className="h-10 w-10 rounded-xl cursor-pointer border-none bg-transparent"
                                />
                                <span className="font-mono text-sm uppercase">{config.primary || "#FF4400"}</span>
                            </div>
                        </div>

                        {/* Background Color */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Background Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={config.background || "#FDF8F2"}
                                    onChange={(e) => setThemeConfig({ background: e.target.value })}
                                    className="h-10 w-10 rounded-xl cursor-pointer border-none bg-transparent"
                                />
                                <span className="font-mono text-sm uppercase">{config.background || "#FDF8F2"}</span>
                            </div>
                        </div>

                        {/* Text Color */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Text Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={config.foreground || "#2B231D"}
                                    onChange={(e) => setThemeConfig({ foreground: e.target.value })}
                                    className="h-10 w-10 rounded-xl cursor-pointer border-none bg-transparent"
                                />
                                <span className="font-mono text-sm uppercase">{config.foreground || "#2B231D"}</span>
                            </div>
                        </div>

                        {/* Font Family */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Font Family</label>
                            <select
                                value={config.fontFamily || "Figtree"}
                                onChange={(e) => setThemeConfig({ fontFamily: e.target.value })}
                                className="w-full bg-muted/50 border border-border/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                                style={{
                                    fontFamily: config.fontFamily || "Figtree"
                                }}
                            >
                                {GOOGLE_FONTS.map(font => (
                                    <option key={font} value={font} style={{ fontFamily: font }}>
                                        {font}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Border Radius */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Corner Radius</label>
                                <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded-full">{config.radius || "0.5"}rem</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={config.radius || "0.5"}
                                onChange={(e) => setThemeConfig({ radius: e.target.value })}
                                className="w-full accent-primary"
                            />
                        </div>

                        {/* Reset */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resetTheme}
                            className="w-full rounded-2xl gap-2 text-xs font-bold border-dashed hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all mt-2"
                        >
                            <RotateCcw size={14} />
                            Reset to Defaults
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
