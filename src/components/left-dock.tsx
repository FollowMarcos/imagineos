"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { SettingsIcon, ScissorsIcon, LayersIcon, WrenchIcon, ArrowLeftRightIcon } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip"
import { motion } from "motion/react"

const TOOLS = [
    {
        name: "Tap The Post",
        href: "/tap-the-post",
        icon: ScissorsIcon,
        description: "Image Slicer & Stitcher"
    },
    // Future tools can be added here
]

export default function LeftDock() {
    const pathname = usePathname()
    const [dockPosition, setDockPosition] = useState<'left' | 'right'>('left')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem("imagineos-dock-position") as 'left' | 'right'
        if (saved) setDockPosition(saved)
        setMounted(true)
    }, [])

    const togglePosition = () => {
        const newPos = dockPosition === 'left' ? 'right' : 'left'
        setDockPosition(newPos)
        localStorage.setItem("imagineos-dock-position", newPos)
    }

    if (!mounted) return null

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    "fixed top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-1.5 p-2 bg-background/80 backdrop-blur-2xl border border-border/50 rounded-[calc(var(--radius)*4)] shadow-2xl shadow-primary/5 ring-1 ring-white/10 transition-all duration-300",
                    dockPosition === 'left' ? "left-6" : "right-6"
                )}
            >

                {/* Header/Indicator */}
                <div className="flex flex-col items-center gap-1.5">
                    <div className="p-3 text-muted-foreground opacity-30 select-none">
                        <WrenchIcon className="size-5" strokeWidth={2.5} />
                    </div>
                    <div className="w-6 h-px bg-border/50 mb-1.5" />
                </div>

                {/* Tools List */}
                <nav className="flex flex-col gap-1.5">
                    {TOOLS.map((tool) => {
                        const Icon = tool.icon
                        const isActive = pathname.startsWith(tool.href)
                        const isScissors = tool.icon === ScissorsIcon

                        const link = (
                            <Link
                                href={tool.href}
                                className={cn(
                                    "p-3 flex items-center justify-center transition-all duration-300 relative group hover:scale-105",
                                    isActive
                                        ? "text-primary-foreground"
                                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                )}
                                style={{ borderRadius: "calc(var(--radius) * 1.5)" }}
                            >
                                <Icon className="size-5 relative z-10" />
                                {isActive && (
                                    <motion.div
                                        layoutId="left-dock-active"
                                        className="absolute inset-0 bg-primary shadow-lg shadow-primary/25"
                                        style={{ borderRadius: "calc(var(--radius) * 1.5)" }}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </Link>
                        )

                        if (isScissors) return <React.Fragment key={tool.href}>{link}</React.Fragment>

                        return (
                            <Tooltip key={tool.href}>
                                <TooltipTrigger asChild>
                                    {link}
                                </TooltipTrigger>
                                <TooltipContent
                                    side={dockPosition === 'left' ? "right" : "left"}
                                    className={cn(
                                        "font-medium bg-background/80 backdrop-blur-lg border-border/50 px-3 py-1.5 rounded-xl",
                                        dockPosition === 'left' ? "ml-2" : "mr-2"
                                    )}
                                >
                                    <div className="space-y-0.5">
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

                {/* Settings & Toggle */}
                <div className="flex flex-col items-center gap-1.5">
                    <div className="w-6 h-px bg-border/50 my-1.5" />

                    <Link
                        href="/settings/profile"
                        className={cn(
                            "p-3 flex items-center justify-center transition-all duration-300 relative group hover:scale-105",
                            pathname.startsWith("/settings")
                                ? "text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                        style={{ borderRadius: "calc(var(--radius) * 1.5)" }}
                    >
                        <SettingsIcon className="size-5 relative z-10" />
                        {pathname.startsWith("/settings") && (
                            <motion.div
                                layoutId="left-dock-active"
                                className="absolute inset-0 bg-primary shadow-lg shadow-primary/25"
                                style={{ borderRadius: "calc(var(--radius) * 1.5)" }}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </Link>

                    <button
                        onClick={togglePosition}
                        className="p-3 flex items-center justify-center transition-all duration-300 relative group hover:scale-105 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        style={{ borderRadius: "calc(var(--radius) * 1.5)" }}
                    >
                        <ArrowLeftRightIcon className="size-5" />
                    </button>
                </div>
            </aside>
        </TooltipProvider>
    )
}
