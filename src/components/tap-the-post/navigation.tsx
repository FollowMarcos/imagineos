
"use client"

import React from "react"

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
        <div className="flex items-center justify-center p-1.5 rounded-[calc(var(--radius)*2)] bg-background/40 backdrop-blur-xl border border-border/50 relative w-fit mx-auto ring-1 ring-white/10 overflow-hidden">
            {TOOLS.map((tool) => {
                const Icon = tool.icon
                const isActive = pathname === tool.href
                return (
                    <Link
                        key={tool.href}
                        href={tool.href}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-[calc(var(--radius)*1.5)] text-sm font-semibold transition-all duration-300 relative group z-10",
                            isActive
                                ? "text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        )}
                    >
                        <Icon className="size-4 relative z-10" />
                        <span className="relative z-10">{tool.name}</span>
                        {isActive && (
                            <motion.div
                                layoutId="tap-nav-active"
                                className="absolute inset-0 bg-primary"
                                style={{ borderRadius: "calc(var(--radius) * 1.5)" }}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </Link>
                )
            })}
        </div>
    )
}
