"use client";

import {
  SearchIcon,
  BellIcon,
  UserIcon,
  HomeIcon,
  SparklesIcon,
  XIcon,
  Image as ImageIcon,
  ZapIcon,
  LayersIcon,
  Wand2Icon,
  PlusIcon,
  Settings2Icon,
  ChevronRightIcon,
  HistoryIcon
} from "lucide-react";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const MAIN_NAV = [
  { icon: HomeIcon, name: "home", href: "/" },
  { icon: SearchIcon, name: "search", href: "/search" },
  { icon: BellIcon, name: "notifications", href: "/notifications" },
  { icon: UserIcon, name: "profile", href: "/settings/profile" },
  { icon: SparklesIcon, name: "create", href: null }, // The trigger
];

const ASPECT_RATIOS = ["1:1", "4:5", "16:9", "9:16"];
const MODELS = ["Imagine V6", "Realism XL", "Turbo Render"];

const BottomMenu = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCreativeMode, setIsCreativeMode] = useState(false);
  const pathname = usePathname();

  // Creative Mode State
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("4:5");
  const [count, setCount] = useState(1);
  const [model, setModel] = useState(MODELS[0]);

  // Generation State (Mockup)
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const startGeneration = () => {
    setIsGenerating(true);
    setProgress(0);

    // Simulate generation progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsGenerating(false), 1000); // Wait bit before hiding
          return 100;
        }
        return prev + 2; // Progress speed
      });
    }, 50);
  };

  // Close creative mode on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsCreativeMode(false);
      }
    };

    if (isCreativeMode) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCreativeMode]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center w-full max-w-2xl px-4 pointer-events-none gap-3"
    >
      {/* Generation Status Indicator */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="bg-background/80 backdrop-blur-xl border border-border/50 shadow-xl rounded-2xl p-3 flex items-center gap-4 pointer-events-auto min-w-[300px]"
          >
            {/* Thumbnail Previews (Mock) */}
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-muted to-muted/50 border border-white/10 ring-2 ring-background overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-white/10 animate-pulse" />
                </motion.div>
              ))}
            </div>

            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-foreground/90">Generating 4 images...</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-auto w-full flex justify-center">
        <motion.div
          layout
          transition={{
            type: "spring",
            bounce: 0.2,
            duration: 0.6
          }}
          className={cn(
            "bg-background/80 backdrop-blur-2xl border border-border/50 shadow-2xl shadow-primary/5 overflow-hidden",
            isCreativeMode ? "rounded-[32px] w-[95vw] max-w-[800px]" : "rounded-[24px]"
          )}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {!isCreativeMode ? (
              // ----------------------------------------------------------------------
              // DEFAULT DOCK MODE
              // ----------------------------------------------------------------------
              <motion.nav
                key="dock"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-1.5 p-2"
              >
                {MAIN_NAV.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  if (item.name === "create") {
                    return (
                      <button
                        key={item.name}
                        onClick={() => setIsCreativeMode(true)}
                        className="p-3 rounded-2xl transition-all duration-300 group relative text-foreground hover:bg-primary/20 hover:scale-105"
                        aria-label="Create new image"
                      >
                        <motion.div
                          className="absolute inset-0 bg-primary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                          layoutId="dock-hover"
                        />
                        <Icon size={20} className="relative z-10 text-primary" strokeWidth={2.5} />
                      </button>
                    )
                  }

                  return (
                    <Link
                      key={item.name}
                      href={item.href || "#"}
                      className={cn(
                        "p-3 rounded-2xl transition-all duration-300 relative group",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:scale-105"
                      )}
                      aria-label={item.name}
                    >
                      <Icon size={20} className="relative z-10" />
                      {isActive && (
                        <motion.div
                          layoutId="dock-active"
                          className="absolute inset-0 bg-primary rounded-2xl -z-0"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </motion.nav>
            ) : (
              // ----------------------------------------------------------------------
              // CREATIVE STUDIO MODE (Expanded)
              // ----------------------------------------------------------------------
              <motion.div
                key="studio"
                initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col p-4 gap-6 w-full"
              >
                {/* Top Row: Input */}
                <div className="flex items-start gap-4">
                  <div className="flex-1 relative pt-1">
                    <Button variant="ghost" size="icon" className="absolute left-0 top-1 h-8 w-8 text-muted-foreground/70 hover:text-foreground rounded-full">
                      <PlusIcon size={18} />
                    </Button>
                    <textarea
                      autoFocus
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the scene you imagine..."
                      className="w-full bg-transparent border-none resize-none outline-none text-xl leading-relaxed min-h-[80px] pl-10 placeholder:text-muted-foreground/40 font-medium"
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setIsCreativeMode(false);
                      }}
                    />
                  </div>

                  {/* Action Buttons: Close & Generate */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full h-8 w-8 ml-auto hover:bg-muted"
                      onClick={() => setIsCreativeMode(false)}
                    >
                      <XIcon size={18} />
                    </Button>
                  </div>
                </div>

                {/* Bottom Row: Controls */}
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/40">

                  {/* Left Controls */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mask-gradient-right pb-1 -mb-1">
                    {/* Model Selector */}
                    <button className="flex items-center gap-2 h-9 px-3 rounded-xl bg-accent/50 hover:bg-accent text-xs font-medium transition-colors whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      {MODELS[0]}
                      <ChevronRightIcon size={12} className="opacity-50" />
                    </button>

                    <div className="w-px h-6 bg-border/60 mx-1" />

                    {/* Aspect Ratio */}
                    <button
                      className="flex items-center gap-2 h-9 px-3 rounded-xl hover:bg-accent/50 text-xs font-medium transition-colors text-muted-foreground hover:text-foreground whitespace-nowrap"
                      onClick={() => {
                        const idx = ASPECT_RATIOS.indexOf(aspectRatio);
                        setAspectRatio(ASPECT_RATIOS[(idx + 1) % ASPECT_RATIOS.length])
                      }}
                    >
                      <ImageIcon size={14} />
                      {aspectRatio}
                    </button>

                    {/* Quality/Zap */}
                    <button className="flex items-center gap-2 h-9 px-3 rounded-xl hover:bg-accent/50 text-xs font-medium transition-colors text-muted-foreground hover:text-foreground whitespace-nowrap">
                      <ZapIcon size={14} />
                      HD
                    </button>

                    {/* Batch Count */}
                    <div className="flex items-center gap-1 h-9 px-2 rounded-xl bg-muted/30">
                      <button
                        onClick={() => count > 1 && setCount(c => c - 1)}
                        className="w-6 h-full flex items-center justify-center hover:text-foreground text-muted-foreground transition-colors"
                      >
                        -
                      </button>
                      <span className="text-xs font-medium w-3 text-center">{count}</span>
                      <button
                        onClick={() => count < 4 && setCount(c => c + 1)}
                        className="w-6 h-full flex items-center justify-center hover:text-foreground text-muted-foreground transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Generate Button (Main Action) */}
                  <Button
                    size="lg"
                    className="h-11 rounded-xl px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 font-semibold text-sm shrink-0"
                    onClick={startGeneration}
                  >
                    Generate
                    <Wand2Icon className="ml-2 h-4 w-4" />
                  </Button>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default BottomMenu;
