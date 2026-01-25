"use client";

import React from "react";
import {
    MoreVerticalIcon,
    Share2Icon,
    CopyIcon,
    Trash2Icon,
    EditIcon,
    DownloadCloudIcon,
    UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";


import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PromptData } from "./prompt-form";

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
}

export function PromptCard({ prompt, isShared, onShare, onDelete, onClone }: PromptCardProps) {
    const coverImage = prompt.images?.[0] || null;

    return (
        <Card className="group relative overflow-hidden flex flex-col h-full border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">

            {/* Cover Image Area */}
            <div className="relative aspect-[4/5] bg-muted overflow-hidden">
                {coverImage ? (
                    <img
                        src={coverImage}
                        alt={prompt.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/50 text-muted-foreground/50">
                        <span className="text-xs font-mono">No Preview</span>
                    </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Top Badges */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    <Badge variant="secondary" className="backdrop-blur-md bg-white/20 text-white border-none text-[10px] h-5">
                        {prompt.content_type}
                    </Badge>
                    {isShared && prompt.shared_by && (
                        <Badge variant="default" className="bg-primary/90 text-[10px] h-5 gap-1">
                            <UserIcon size={10} />
                            {prompt.shared_by.username}
                        </Badge>
                    )}
                </div>

                {/* Hover Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-between gap-2">

                    {/* Primary Action */}
                    {isShared ? (
                        <Button
                            size="sm"
                            className="w-full bg-white text-black hover:bg-white/90"
                            onClick={() => onClone?.(prompt)}
                        >
                            <DownloadCloudIcon className="w-4 h-4 mr-2" />
                            Save Copy
                        </Button>
                    ) : (
                        <div className="flex w-full gap-2">
                            <Link href={`/library/${prompt.id}/edit`} className="flex-1">
                                <Button size="sm" variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-md">
                                    <EditIcon className="w-4 h-4 mr-1" /> Edit
                                </Button>
                            </Link>
                            <Button
                                size="icon"
                                variant="secondary"
                                className="bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-md"
                                onClick={() => onShare?.(prompt)}
                            >
                                <Share2Icon className="w-4 h-4" />
                            </Button>
                            <Button
                                size="icon"
                                variant="destructive"
                                className="bg-red-500/80 hover:bg-red-500 text-white border-none backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity delay-75"
                                onClick={() => onDelete?.(prompt)}
                            >
                                <Trash2Icon className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Content */}
            <div className="p-3 flex flex-col gap-1 flex-1 bg-card">
                <h3 className="font-semibold text-sm truncate leading-tight" title={prompt.title}>
                    {prompt.title}
                </h3>
                <div className="flex items-center gap-2 overflow-hidden text-xs text-muted-foreground">
                    <span className="truncate max-w-full">
                        {prompt.models?.[0] || "Unknown Model"}
                    </span>
                    {prompt.aspect_ratios?.[0] && (
                        <>
                            <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                            <span className="shrink-0">{prompt.aspect_ratios[0]}</span>
                        </>
                    )}
                </div>

                {/* Tags */}
                <div className="flex gap-1 overflow-hidden mt-1 h-5">
                    {prompt.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] bg-muted px-1.5 rounded-sm text-muted-foreground whitespace-nowrap">
                            #{tag}
                        </span>
                    ))}
                    {prompt.tags.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{prompt.tags.length - 3}</span>
                    )}
                </div>
            </div>

        </Card>
    );
}
