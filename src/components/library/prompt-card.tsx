"use client";

import React from "react";
import {
    Share2Icon,
    Trash2Icon,
    EditIcon,
    DownloadCloudIcon,
    UserIcon,
    SparklesIcon,
    MoreHorizontalIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PromptData } from "./prompt-form";
import { motion } from "motion/react";

export interface Prompt extends PromptData {
    id: string;
    user_id: string;
    created_at: string;
    shared_by?: {
        username: string;
        avatar_url?: string;
    };
}

interface PromptCardProps {
    prompt: Prompt;
    isShared?: boolean;
    onShare?: (prompt: Prompt) => void;
    onDelete?: (prompt: Prompt) => void;
    onClone?: (prompt: Prompt) => void;
    onUse?: (prompt: Prompt) => void;
}

export function PromptCard({ prompt, isShared, onShare, onDelete, onClone, onUse }: PromptCardProps) {
    const coverImage = prompt.images?.[0] || null;

    return (
        <motion.div
            className={cn(
                "relative z-20 w-full aspect-[4/5] rounded-[32px] overflow-hidden group hover:z-50 bg-background border border-border/40 shadow-sm hover:shadow-2xl transition-all duration-500 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
                y: -4,
                transition: { duration: 0.3, ease: "easeOut" },
            }}
        >
            {/* Image Layer */}
            <Link href={`/library/${prompt.id}`} className="block w-full h-full cursor-pointer relative font-sans">
                {coverImage ? (
                    <img
                        src={coverImage}
                        alt={prompt.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] transform-gpu"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/30 text-muted-foreground/40">
                        <span className="text-xs font-medium tracking-widest uppercase">No Preview</span>
                    </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
            </Link>

            {/* Top Badge (Content Type) */}
            <div className="absolute top-4 left-4 z-30">
                <div className="bg-white/95 dark:bg-black/90 py-1.5 px-3 rounded-full text-xs font-bold tracking-wider text-foreground uppercase shadow-sm border border-white/10 dark:border-white/5">
                    {prompt.content_type}
                </div>
            </div>

            {/* Top Right (Shared Badge) */}
            {isShared && prompt.shared_by && (
                <div className="absolute top-4 right-4 z-30">
                    <div className="bg-primary text-white py-1.5 px-3 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg flex items-center gap-1.5">
                        <UserIcon size={12} />
                        @{prompt.shared_by.username}
                    </div>
                </div>
            )}

            {/* Content Layer (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-30 flex flex-col gap-3">
                <Link href={`/library/${prompt.id}`} className="group/title">
                    <h3 className="text-white font-bold text-xl leading-tight tracking-tight line-clamp-2 group-hover/title:text-primary transition-colors text-balance">
                        {prompt.title}
                    </h3>
                </Link>

                {/* Subtitle / Model Info */}
                <div className="flex items-center gap-2">
                    <div className="h-px bg-white/20 flex-1" />
                    <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold">
                        {prompt.models?.[0] || "Unknown"}
                    </span>
                </div>

                {/* Tags (Visible on Hover) - Properly using compositor props */}
                <div className="flex flex-wrap gap-1.5 h-6">
                    {prompt.tags.slice(0, 3).map((tag, idx) => (
                        <motion.span
                            key={tag}
                            initial={false}
                            animate={{
                                opacity: 1,
                                y: 0,
                                transition: { delay: 0.05 * idx }
                            }}
                            className="text-xs text-white/90 bg-white/20 px-2.5 py-1 rounded-md font-medium backdrop-blur-sm opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                        >
                            #{tag}
                        </motion.span>
                    ))}
                </div>

                {/* Actions (Visible on Hover) */}
                <div className="grid grid-cols-4 gap-2 mt-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                    {activeActions(isShared, prompt, onShare, onClone, onDelete, onUse).map((action, i) => (
                        <Button
                            key={i}
                            variant="secondary"
                            size="icon"
                            className={cn(
                                "h-10 w-full rounded-2xl bg-white/15 hover:bg-white text-white hover:text-black border-none transition-all shadow-xl",
                                action.variant === 'destructive' && "hover:bg-red-500 hover:text-white",
                                action.variant === 'primary' && "bg-white text-black hover:bg-primary hover:text-white"
                            )}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                action.onClick(prompt);
                            }}
                            title={action.label}
                            aria-label={action.label}
                        >
                            {action.icon}
                        </Button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

// Helper to organize buttons based on ownership
function activeActions(
    isShared: boolean | undefined,
    prompt: Prompt,
    onShare?: (p: Prompt) => void,
    onClone?: (p: Prompt) => void,
    onDelete?: (p: Prompt) => void,
    onUse?: (p: Prompt) => void
) {
    if (isShared) {
        return [
            { icon: <DownloadCloudIcon size={16} />, label: "Save Copy", onClick: (p: Prompt) => onClone?.(p), variant: 'primary' },
            { icon: <SparklesIcon size={16} />, label: "Use", onClick: (p: Prompt) => onUse?.(p), variant: 'primary' },
            // Placeholder for alignment if fewer buttons
        ].filter(Boolean);
    }

    return [
        { icon: <SparklesIcon size={16} />, label: "Use", onClick: (p: Prompt) => onUse?.(p), variant: 'primary' },
        { icon: <EditIcon size={16} />, label: "Edit", onClick: (p: Prompt) => window.location.href = `/library/${p.id}/edit`, variant: 'secondary' },
        { icon: <Share2Icon size={16} />, label: "Share", onClick: (p: Prompt) => onShare?.(p), variant: 'secondary' },
        { icon: <Trash2Icon size={16} />, label: "Delete", onClick: (p: Prompt) => onDelete?.(p), variant: 'destructive' },
    ];
}
