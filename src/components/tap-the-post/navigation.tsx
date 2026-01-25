
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScissorsIcon, LayersIcon, PointerIcon } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "motion/react"

const TOOLS = [
    {
        name: "Slicer",
        href: "/tap-the-post",
        icon: ScissorsIcon,
        description: "Split images for carousel"
    },
    {
        name: "Stitcher",
        href: "/tap-the-post/stitch",
        icon: LayersIcon,
        description: "Combine images into one"
    },
]

export function TapNavigation() {
    const pathname = usePathname()

    return (
        <TooltipProvider delayDuration={0}>
            {/* Desktop Dock (Right Side) */}
            <aside className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-6 py-6 px-3 bg-background/60 backdrop-blur-xl border border-border/50 rounded-[calc(var(--radius)*4)] shadow-2xl shadow-primary/5 ring-1 ring-white/10 transition-all duration-500 hover:bg-background/80">

                {/* Header */}
                <div className="flex flex-col items-center gap-1">
                    <div className="p-2 text-muted-foreground opacity-50 select-none">
                        <PointerIcon className="size-4" />
                    </div>
                    <div className="w-4 h-px bg-border/50 my-1" />
                </div>

                {/* Tools List */}
                <nav className="flex flex-col gap-3">
                    {TOOLS.map((tool) => {
                        const Icon = tool.icon
                        const isActive = pathname === tool.href
                        const isScissors = tool.icon === ScissorsIcon

                        const link = (
                            <Link
                                href={tool.href}
                                className={cn(
                                    "p-3 rounded-2xl transition-all duration-300 relative group hover:scale-110",
                                    isActive
                                        ? "text-primary-foreground"
                                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                )}
                            >
                                <Icon className="size-5 relative z-10" />
                                {isActive && (
                                    <motion.div
                                        layoutId="tap-dock-active"
                                        className="absolute inset-0 bg-primary rounded-2xl shadow-lg shadow-primary/25"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </Link>
                        )

                        if (isScissors) return <div key={tool.href}>{link}</div>

                        return (
                            <Tooltip key={tool.href}>
                                <TooltipTrigger asChild>
                                    {link}
                                </TooltipTrigger>
                                <TooltipContent side="left" className="mr-2 font-medium bg-background/80 backdrop-blur-lg border-border/50 px-3 py-1.5 rounded-xl">
                                    <div className="space-y-0.5 text-right">
                                        <p className="text-xs font-bold">{tool.name}</p>
                                        <p className="text-[10px] text-muted-foreground font-normal leading-tight max-w-[120px]">
                                            {tool.description}
                                        </p>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        )
                    })}
                </nav>

                <div className="flex-1 min-h-[40px]" />
            </aside>

            {/* Mobile Navigation (Floating Pill) */}
            <div className="lg:hidden flex items-center justify-center p-1 rounded-full bg-background/60 backdrop-blur-xl border border-border/50 relative mb-8 w-fit mx-auto ring-1 ring-white/10 shadow-xl">
                {TOOLS.map((tool) => {
                    const Icon = tool.icon
                    const isActive = pathname === tool.href
                    return (
                        <Link
                            key={tool.href}
                            href={tool.href}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2 rounded-full text-xs font-medium transition-all duration-300 relative group overflow-hidden",
                                isActive
                                    ? "text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                            )}
                        >
                            <Icon className="size-3.5 relative z-10" />
                            <span className="relative z-10">{tool.name}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="tap-mobile-active"
                                    className="absolute inset-0 bg-primary shadow-lg shadow-primary/20"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </Link>
                    )
                })}
            </div>
        </TooltipProvider>
    )
}
