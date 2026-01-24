"use client";

import {
  SearchIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  UserIcon,
  HomeIcon,
  Settings2Icon,
  LogOutIcon,
  PlusIcon,
  SparklesIcon,
  ChevronLeftIcon,
  PencilIcon
} from "lucide-react";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

const MAIN_NAV = [
  { icon: HomeIcon, name: "home", href: "/" },
  { icon: SearchIcon, name: "search", href: "/search" },
  { icon: SparklesIcon, name: "imagine" }, // Changed name to 'imagine'
  { icon: BellIcon, name: "notifications", href: "/notifications" },
  { icon: UserIcon, name: "profile", href: "/settings/profile" },
];

const ASPECT_RATIOS = ["1:1", "4:5", "16:9", "9:16", "2:3", "3:2"];

const BottomMenu = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [elementRef] = useMeasure();
  const [hiddenRef, hiddenBounds] = useMeasure();
  const [view, setView] = useState<"default" | "theme" | "search" | "imagine">("default");
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  // Imagine State
  const [prompt, setPrompt] = useState("");
  const [batchSize, setBatchSize] = useState(1);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setView("default");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const submenuContent = useMemo(() => {
    switch (view) {
      case "search":
        return (
          <div className="p-2 min-w-[260px]">
            <div className="relative group">
              <SearchIcon
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
              />
              <input
                type="text"
                autoFocus
                placeholder="Search ImagineOS..."
                className="w-full pl-10 pr-4 py-2 text-sm text-foreground bg-muted/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [view]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center w-full max-w-fit px-4"
    >
      {/* Hidden for measurement */}
      <div
        ref={hiddenRef}
        className="absolute left-[-9999px] top-[-9999px] invisible pointer-events-none"
      >
        <div className="rounded-2xl bg-background/80 backdrop-blur-2xl border border-border/50 py-1">
          {submenuContent}
        </div>
      </div>

      {/* Animated submenu */}
      <AnimatePresence mode="wait">
        {(view === "search") && (
          <motion.div
            key="submenu"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: hiddenBounds.height || "auto",
              width: hiddenBounds.width || "auto"
            }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 overflow-hidden"
          >
            <div
              ref={elementRef}
              className="rounded-2xl bg-background/80 backdrop-blur-2xl border border-border/50 shadow-2xl"
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(4px)" }}
                  transition={{ duration: 0.15 }}
                >
                  {submenuContent}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Bar / Dock */}
      <motion.nav
        layout
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        className={cn(
          "flex items-center bg-background/90 backdrop-blur-2xl border border-border/50 shadow-2xl transition-all",
          view === 'imagine'
            ? "rounded-3xl p-3 w-[min(90vw,600px)] lg:w-[700px] flex-col gap-3"
            : "rounded-[24px] p-2 gap-1.5 hover:bg-background/80"
        )}
      >
        {view === 'imagine' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col gap-3"
          >
            {/* Top Row: Input & Generate */}
            <div className="flex gap-2 items-center">
              <div className="flex-1 bg-muted/30 rounded-2xl flex items-center px-4 py-2 gap-3 border border-border/20 focus-within:border-primary/30 transition-colors">
                <div className="size-6 rounded-lg bg-background/50 border border-border/30 flex items-center justify-center shrink-0">
                  <PlusIcon size={14} className="text-muted-foreground" />
                </div>
                <input
                  autoFocus
                  placeholder="Describe the scene you imagine"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-muted-foreground/50"
                />
              </div>

              <button className="h-[46px] px-6 bg-[#bdff00] hover:bg-[#a6e600] text-black font-bold text-sm rounded-2xl flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-[#bdff00]/10">
                Generate
                <SparklesIcon size={14} />
                <span className="opacity-50 font-medium">2</span>
              </button>
            </div>

            {/* Bottom Row: Settings */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded-xl text-[11px] font-semibold text-foreground border border-border/20 hover:bg-muted transition-colors">
                <span className="text-[#bdff00]">G</span>
                Nano Banana Pro
                <ChevronLeftIcon size={12} className="rotate-180 opacity-50" />
              </button>

              <button className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded-xl text-[11px] font-semibold text-foreground border border-border/20 hover:bg-muted transition-colors">
                <MonitorIcon size={12} className="opacity-50" />
                4:5
              </button>

              <button className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded-xl text-[11px] font-semibold text-foreground border border-border/20 hover:bg-muted transition-colors">
                <SparklesIcon size={12} className="opacity-50 text-blue-400" />
                2K
              </button>

              <div className="shrink-0 flex items-center gap-2 px-2 py-1 bg-muted/40 rounded-xl border border-border/20">
                <button
                  onClick={() => setBatchSize(Math.max(1, batchSize - 1))}
                  className="size-6 flex items-center justify-center hover:bg-muted rounded-lg transition-colors"
                >
                  <PlusIcon size={12} className="rotate-45 opacity-50 translate-x-[1px]" />
                </button>
                <span className="text-[11px] font-bold min-w-[3ch] text-center">{batchSize}/4</span>
                <button
                  onClick={() => setBatchSize(Math.min(4, batchSize + 1))}
                  className="size-6 flex items-center justify-center hover:bg-muted rounded-lg transition-colors"
                >
                  <PlusIcon size={12} className="opacity-50" />
                </button>
              </div>

              <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded-xl border border-border/20 group cursor-pointer hover:bg-muted transition-colors">
                <span className="text-[11px] font-bold text-[#bdff00]">Unlimited</span>
                <div className="w-8 h-4 bg-[#bdff00]/20 rounded-full relative p-0.5">
                  <div className="size-3 bg-[#bdff00] rounded-full shadow-sm translate-x-3.5" />
                </div>
              </div>

              <button className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded-xl text-[11px] font-semibold text-foreground border border-border/20 hover:bg-muted transition-colors">
                <PencilIcon size={12} className="opacity-50" />
                Draw
              </button>
            </div>
          </motion.div>
        ) : (
          MAIN_NAV.map((item) => {
            const isActive = pathname === item.href;
            const isExpanding = view === item.name;
            const Icon = item.icon;

            if (item.href) {
              return (
                <Link
                  key={item.name}
                  href={item.href}
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
            }

            return (
              <button
                key={item.name}
                onClick={() => setView(isExpanding ? "default" : (item.name as any))}
                className={cn(
                  "p-3 rounded-2xl transition-all duration-300 group relative",
                  isExpanding
                    ? "bg-accent text-foreground scale-105"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:scale-105"
                )}
                aria-label={item.name}
              >
                <Icon size={20} />
              </button>
            );
          })
        )}
      </motion.nav>
    </div>
  );
};

export default BottomMenu;
