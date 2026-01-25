"use client";

import React from "react";
import { X, RotateCcw, Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomTheme } from "@/context/custom-theme-context";
import { motion, AnimatePresence } from "motion/react";

export function ThemeCustomizer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { config, setThemeConfig, resetTheme } = useCustomTheme();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="absolute bottom-20 right-0 z-[110] w-72 bg-background/90 backdrop-blur-xl border border-border/50 shadow-2xl rounded-[32px] p-6 flex flex-col gap-6 pointer-events-auto"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Paintbrush size={18} className="text-primary" />
                            <h3 className="font-bold text-lg">Customize</h3>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
                            <X size={16} />
                        </Button>
                    </div>

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
                        className="w-full rounded-2xl gap-2 text-xs font-bold border-dashed hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all"
                    >
                        <RotateCcw size={14} />
                        Reset to Defaults
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
