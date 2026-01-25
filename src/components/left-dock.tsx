
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { SettingsIcon, ScissorsIcon, LayersIcon } from "lucide-react"
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

    return (
        <TooltipProvider delayDuration={0}>
            <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-6 py-6 px-3 bg-background/60 backdrop-blur-xl border border-border/50 rounded-full shadow-2xl shadow-primary/5 ring-1 ring-white/10">

                {/* Header */}
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground vertical-text opacity-50 select-none" style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}>
                        TOOLS
                    </span>
                    <div className="w-4 h-px bg-border/50 my-2" />
                </div>

                {/* Tools List */}
                <nav className="flex flex-col gap-3">
                    {TOOLS.map((tool) => {
                        const Icon = tool.icon
                        const isActive = pathname.startsWith(tool.href)
                        const isScissors = tool.icon === ScissorsIcon

                        const content = (
                            <Link
                                href={tool.href}
                                className={cn(
                                    "p-3 rounded-full transition-all duration-300 relative group hover:scale-110",
                                    isActive
                                        ? "text-primary-foreground"
                                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                )}
                            >
                                <Icon className="size-5 relative z-10" />
                                {isActive && (
                                    <motion.div
                                        layoutId="left-dock-active"
                                        className="absolute inset-0 bg-primary rounded-full shadow-lg shadow-primary/25"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </Link>
                        )

                        if (isScissors) return <div key={tool.href}>{content}</div>

                        return (
                            <Tooltip key={tool.href}>
                                <TooltipTrigger asChild>
                                    {content}
                                </TooltipTrigger>
                                <TooltipContent side="right" className="ml-2 font-medium bg-background/80 backdrop-blur-lg border-border/50 px-3 py-1.5 rounded-xl">
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

                {/* Spacer */}
                <div className="flex-1 min-h-[40px]" />

                {/* Settings */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-4 h-px bg-border/50" />
                    <Link
                        href="/settings/profile"
                        className={cn(
                            "p-3 rounded-full transition-all duration-300 relative group hover:scale-110",
                            pathname.startsWith("/settings")
                                ? "text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        <SettingsIcon className="size-5 relative z-10" />
                        {pathname.startsWith("/settings") && (
                            <motion.div
                                layoutId="left-dock-active"
                                className="absolute inset-0 bg-primary rounded-full shadow-lg shadow-primary/25"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </Link>
                </div>
            </aside>
        </TooltipProvider>
    )
}
