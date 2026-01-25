"use client";

import {
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
  LibraryIcon,
  FlaskConicalIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { ThemeCustomizer } from "./theme/theme-customizer";

import { useCreative } from "@/context/creative-context";

const MAIN_NAV = [
  { icon: HomeIcon, name: "home", href: "/" },
  { icon: LibraryIcon, name: "library", href: "/library" },
  { icon: ImageIcon, name: "gallery", href: "/gallery" },
  { icon: SparklesIcon, name: "create", href: null }, // The trigger
  { icon: FlaskConicalIcon, name: "lab", href: "/lab" },
  { icon: UserIcon, name: "profile", href: "/settings/profile" },
];

const ASPECT_RATIOS = ["1:1", "4:5", "16:9", "9:16"];
const MODELS = ["Imagine V6", "Realism XL", "Turbo Render"];

const BottomMenu = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    isOpen: isCreativeMode,
    setIsOpen: setIsCreativeMode,
    prompt,
    setPrompt,
    negativePrompt,
    setNegativePrompt,
    model,
    setModel,
    aspectRatio,
    setAspectRatio
  } = useCreative();

  const pathname = usePathname();

  const [count, setCount] = useState(1);
  const [isNegativeOpen, setIsNegativeOpen] = useState(false); // Internal UI state
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [seenFeatures, setSeenFeatures] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
    const seen = localStorage.getItem("imagineos-seen-features");
    if (seen) setSeenFeatures(JSON.parse(seen));
  }, []);

  const markAsSeen = (feature: string) => {
    const updated = { ...seenFeatures, [feature]: true };
    setSeenFeatures(updated);
    localStorage.setItem("imagineos-seen-features", JSON.stringify(updated));
  };

  // Generation State (Mockup)
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<{
    id: number;
    status: 'pending' | 'generating' | 'success' | 'failed';
    referenceImage?: string;
  }[]>([]);

  const startGeneration = () => {
    setIsGenerating(true);
    setGeneratedItems([
      { id: 0, status: 'success', referenceImage: "https://picsum.photos/id/64/100/100" },
      { id: 1, status: 'failed' },
      { id: 2, status: 'generating' },
      { id: 3, status: 'pending' },
    ]);
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
            className="bg-background/80 backdrop-blur-xl border border-border/50 shadow-xl rounded-full pl-2 pr-2 py-2 flex items-center gap-3 pointer-events-auto"
          >
            {/* Thumbnail Previews (Mock) */}
            <div className="flex gap-3">
              {generatedItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "w-12 h-12 rounded-full border-2 border-background overflow-hidden relative flex items-center justify-center transition-all bg-muted",
                    item.status === 'success' && "ring-2 ring-lime-500 ring-offset-2 ring-offset-background",
                    item.status === 'failed' && "ring-2 ring-red-500 ring-offset-2 ring-offset-background",
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-center transition-opacity duration-500",
                    item.status === 'success' ? "opacity-0" : "opacity-100"
                  )}>
                    {item.referenceImage ? (
                      <img src={item.referenceImage} className="w-full h-full object-cover opacity-80" alt="Reference" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                        <SparklesIcon size={14} className="text-primary/40" />
                      </div>
                    )}
                  </div>
                  {item.status === 'generating' && (
                    <>
                      <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay" />
                      <div className="absolute inset-0 rounded-full border-[2.5px] border-orange-500 border-t-transparent animate-spin z-30" style={{ animationDuration: '1s' }} />
                    </>
                  )}
                  {item.status === 'success' && (
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={`https://picsum.photos/seed/${i + 123}/200`}
                      className="w-full h-full object-cover relative z-20"
                      alt="Generated"
                    />
                  )}
                  {item.status === 'failed' && (
                    <div className="relative z-20 text-destructive font-bold text-xs bg-background/80 w-full h-full flex items-center justify-center">!</div>
                  )}

                </motion.div>
              ))}
            </div>

            <div className="flex flex-col justify-center px-1 min-w-[120px]">
              <span className="text-xs font-semibold">
                {generatedItems.some(i => i.status === 'generating') ? 'Generating...' : 'Finished'}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {generatedItems.filter(i => i.status === 'success').length} success, {generatedItems.filter(i => i.status === 'failed').length} failed
              </span>
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-muted -ml-1"
              onClick={() => setIsGenerating(false)}
            >
              <XIcon size={14} />
            </Button>

          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-auto w-full flex justify-center relative">
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
                      onClick={() => markAsSeen(item.name)}
                      className={cn(
                        "p-3 rounded-2xl transition-all duration-300 relative group",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:scale-105"
                      )}
                      aria-label={item.name}
                    >
                      <Icon size={20} className="relative z-10" />
                      {!seenFeatures[item.name] && (item.name === 'gallery') && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full z-20 animate-pulse border-2 border-background" />
                      )}
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

                <div className="w-px h-6 bg-border/50 mx-1" />

                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-3 rounded-2xl transition-all duration-300 relative group text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:scale-105"
                  aria-label="Toggle theme"
                >
                  {mounted ? (
                    theme === "dark" ? (
                      <SunIcon size={20} className="relative z-10" />
                    ) : (
                      <MoonIcon size={20} className="relative z-10" />
                    )
                  ) : (
                    <div className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsCustomizing(!isCustomizing);
                    markAsSeen('settings');
                  }}
                  className={cn(
                    "p-3 rounded-2xl transition-all duration-300 relative group hover:scale-105",
                    isCustomizing ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                  aria-label="Customize theme"
                >
                  <Settings2Icon size={20} className="relative z-10" />
                  {!seenFeatures['settings'] && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full z-20 animate-pulse border-2 border-background" />
                  )}
                </button>
              </motion.nav>
            ) : (
              <motion.div
                key="studio"
                initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col p-4 gap-6 w-full"
              >
                <div className="flex flex-col gap-2">
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
                        className="w-full bg-transparent border-none resize-none outline-none text-xl leading-relaxed min-h-[60px] pl-10 placeholder:text-muted-foreground/40 font-medium"
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') setIsCreativeMode(false);
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full h-8 w-8 ml-auto hover:bg-muted"
                        onClick={() => setIsCreativeMode(false)}
                      >
                        <XIcon size={18} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={cn("rounded-full h-8 w-8 ml-auto hover:bg-muted transition-transform", isNegativeOpen && "rotate-180 bg-muted/50")}
                        onClick={() => setIsNegativeOpen(!isNegativeOpen)}
                        title="Negative Prompt"
                      >
                        <ChevronRightIcon size={18} className="rotate-90" />
                      </Button>
                    </div>
                  </div>
                  {isNegativeOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="pl-10 pr-12 overflow-hidden"
                    >
                      <textarea
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="Negative prompt (what to avoid)..."
                        className="w-full bg-muted/30 rounded-lg p-2 text-sm border-none resize-none outline-none text-muted-foreground min-h-[40px] placeholder:text-muted-foreground/30 font-medium"
                      />
                    </motion.div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/40">
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mask-gradient-right pb-1 -mb-1">
                    <button className="flex items-center gap-2 h-9 px-3 rounded-xl bg-accent/50 hover:bg-accent text-xs font-medium transition-colors whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      {MODELS[0]}
                      <ChevronRightIcon size={12} className="opacity-50" />
                    </button>

                    <div className="w-px h-6 bg-border/60 mx-1" />

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

                    <button className="flex items-center gap-2 h-9 px-3 rounded-xl hover:bg-accent/50 text-xs font-medium transition-colors text-muted-foreground hover:text-foreground whitespace-nowrap">
                      <ZapIcon size={14} />
                      HD
                    </button>

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
        <ThemeCustomizer isOpen={isCustomizing} onClose={() => setIsCustomizing(false)} />
      </div>
    </div>
  );
};

export default BottomMenu;
