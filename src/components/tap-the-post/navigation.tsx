
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScissorsIcon, LayersIcon } from "lucide-react"

export function TapNavigation() {
    const pathname = usePathname()

    // Normalization logic if needed, but simple exact match or startsWith works 
    // Slicer is at /tap-the-post
    // Stitcher is at /tap-the-post/stitch

    const isStitchActive = pathname === "/tap-the-post/stitch"
    const isSliceActive = pathname === "/tap-the-post"

    return (
        <div className="flex items-center justify-center p-1 rounded-full bg-muted/50 border border-border/50 backdrop-blur-sm relative mb-8 w-fit mx-auto">
            <Link
                href="/tap-the-post"
                className={cn(
                    "relative z-10 flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200",
                    isSliceActive
                        ? "text-primary-foreground bg-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
            >
                <ScissorsIcon className="size-4" />
                <span>Slicer</span>
            </Link>
            <Link
                href="/tap-the-post/stitch"
                className={cn(
                    "relative z-10 flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200",
                    pathname === "/tap-the-post/stitch"
                        ? "text-primary-foreground bg-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
            >
                <LayersIcon className="size-4" />
                <span>Stitcher</span>
            </Link>
        </div>
    )
}
