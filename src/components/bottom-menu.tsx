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
  SparklesIcon
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
  { icon: BellIcon, name: "notifications", href: "/notifications" },
  { icon: UserIcon, name: "profile", href: "/settings/profile" },
  { icon: SparklesIcon, name: "theme" },
];

const THEME_OPTIONS = [
  { key: "light", icon: SunIcon, text: "Light" },
  { key: "dark", icon: MoonIcon, text: "Dark" },
  { key: "system", icon: MonitorIcon, text: "System" },
];

const BottomMenu = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [elementRef] = useMeasure();
  const [hiddenRef, hiddenBounds] = useMeasure();
  const [view, setView] = useState<"default" | "theme" | "search">("default");
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

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

  const content = useMemo(() => {
    switch (view) {
      case "theme":
        return (
          <div className="flex items-center justify-between gap-1 min-w-[240px] p-1.5">
            {THEME_OPTIONS.map(({ key, icon: Icon, text }) => (
              <button
                key={key}
                onClick={() => {
                  setTheme(key);
                  setView("default");
                }}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 transition-all duration-200",
                  theme === key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon size={16} />
                <span className="text-xs font-medium">{text}</span>
              </button>
            ))}
          </div>
        );

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
  }, [view, theme, setTheme]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center"
    >
      {/* Hidden for measurement */}
      <div
        ref={hiddenRef}
        className="absolute left-[-9999px] top-[-9999px] invisible pointer-events-none"
      >
        <div className="rounded-2xl bg-background/80 backdrop-blur-2xl border border-border/50 py-1">
          {content}
        </div>
      </div>

      {/* Animated submenu */}
      <AnimatePresence mode="wait">
        {view !== "default" && (
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
                  {content}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dock */}
      <nav className="flex items-center gap-1.5 bg-background/60 backdrop-blur-2xl border border-border/50 rounded-[24px] p-2 shadow-2xl shadow-black/10 transition-all hover:bg-background/80">
        {MAIN_NAV.map((item) => {
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
        })}
      </nav>
    </div>
  );
};

export default BottomMenu;
