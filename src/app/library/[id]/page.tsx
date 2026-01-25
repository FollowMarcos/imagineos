"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, CopyIcon, EditIcon, Share2Icon, DownloadCloudIcon, ChevronLeftIcon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";
import { PromptData } from "@/components/library/prompt-form";
import Link from "next/link";
import { ShareDialog } from "@/components/library/share-dialog";
import { useCreative } from "@/context/creative-context";

// Extended Prompt type
interface Prompt extends PromptData {
    id: string;
    user_id: string;
    created_at: string;
    shared_by?: {
        username: string;
    };
}

export default function SinglePromptPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const supabase = createClient();

    const [prompt, setPrompt] = useState<Prompt | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<string | null>(null);

    // Dialog State
    const [isShareOpen, setIsShareOpen] = useState(false);

    const { usePrompt } = useCreative();

    useEffect(() => {
        fetchPrompt();
    }, [id]);

    const fetchPrompt = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user?.id || null);

        // 1. Try fetching from 'prompts' (Owner view)
        const { data: promptData, error: promptError } = await supabase
            .from('prompts')
            .select('*')
            .eq('id', id)
            .single();

        if (promptData) {
            setPrompt(promptData);
        } else {
            // 2. Try fetching from 'prompt_shares' (Shared view)
            // We need to join to get the underlying prompt data if the user doesn't own it but it's shared with them.
            // Or, RLS on 'prompts' might allow SELECT if it's shared.
            // Let's check RLS: "Users can view prompts shared with them" -> "exists (select 1 from prompt_shares ...)"
            // So actually, if RLS works, the first query should have returned the prompt even if I don't own it, 
            // PROVIDED that I query by ID.
            // Wait, the RLS policy "Users can view prompts shared with them" enables SELECT on `prompts`.
            // So `select * from prompts where id = ...` SHOULD work if shared.

            // If it failed, it might mean it's not found or not shared.
            toast.error("Prompt not found or access denied.");
            router.push("/library");
        }
        setIsLoading(false);
    };

    const handleCopyText = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    const handleClone = async () => {
        if (!prompt || !currentUser) return;

        const { id, user_id, created_at, shared_by, ...cloneData } = prompt;

        const { error } = await supabase.from('prompts').insert({
            ...cloneData,
            title: `${cloneData.title} (Copy)`,
            user_id: currentUser
        });

        if (!error) {
            toast.success("Saved to your library!");
            router.push("/library");
        } else {
            toast.error("Failed to save copy");
        }
    };

    const handleUsePrompt = () => {
        if (!prompt) return;
        usePrompt({
            prompt: prompt.positive_prompt,
            negativePrompt: prompt.negative_prompt || "",
            model: prompt.models?.[0] || "Imagine V6",
            aspectRatio: prompt.aspect_ratios?.[0] || "4:5"
        });
    };

    if (isLoading) {
        return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-muted-foreground w-8 h-8" /></div>;
    }

    if (!prompt) return null;

    const isOwner = currentUser === prompt.user_id;

    return (
        <div className="max-w-5xl mx-auto p-6 md:py-10 space-y-8">
            {/* Back */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="-ml-2 text-muted-foreground hover:text-foreground"
                aria-label="Go back to library"
            >
                <ChevronLeftIcon className="w-4 h-4 mr-1" /> Back to Library
            </Button>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left: Images */}
                <div className="space-y-4">
                    <div className="aspect-[4/5] bg-muted rounded-2xl overflow-hidden border">
                        {prompt.images?.[0] ? (
                            <img src={prompt.images[0]} alt={prompt.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">No preview image</div>
                        )}
                    </div>
                    {/* Thumbnails if any */}
                    {prompt.images?.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {prompt.images.map((img, i) => (
                                <button
                                    key={i}
                                    className="w-20 h-20 shrink-0 rounded-lg overflow-hidden border bg-muted cursor-pointer hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                                    onClick={() => {/* Suggestion: Add logic to switch main image if desired */ }}
                                    aria-label={`View image thumbnail ${i + 1}`}
                                >
                                    <img
                                        src={img}
                                        alt={`Thumbnail ${i + 1} of ${prompt.title}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Details */}
                <div className="space-y-8">
                    <div>
                        <div className="flex items-start justify-between gap-4">
                            <h1 className="text-3xl font-bold leading-tight text-balance">{prompt.title}</h1>
                            {/* Actions */}
                            <div className="flex gap-2 shrink-0">
                                {isOwner ? (
                                    <>
                                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg" onClick={handleUsePrompt}>
                                            <SparklesIcon className="w-4 h-4 mr-2" /> Use
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => setIsShareOpen(true)} aria-label="Share prompt">
                                            <Share2Icon className="w-4 h-4" />
                                        </Button>
                                        <Link href={`/library/${prompt.id}/edit`}>
                                            <Button variant="outline" size="icon" aria-label="Edit prompt">
                                                <EditIcon className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg" onClick={handleUsePrompt}>
                                            <SparklesIcon className="w-4 h-4 mr-2" /> Use
                                        </Button>
                                        <Button onClick={handleClone} className="gap-2" variant="secondary">
                                            <DownloadCloudIcon className="w-4 h-4" /> Save Copy
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                            <Badge variant="outline">{prompt.content_type}</Badge>
                            {prompt.models?.map(m => <Badge key={m} variant="secondary">{m}</Badge>)}
                            {prompt.aspect_ratios?.map(r => <Badge key={r} variant="secondary">{r}</Badge>)}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-muted/30 p-4 rounded-xl border relative group">
                            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Positive Prompt</h3>
                            <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap">{prompt.positive_prompt}</p>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity h-8 w-8"
                                onClick={() => handleCopyText(prompt.positive_prompt, "Positive Prompt")}
                                aria-label="Copy positive prompt"
                            >
                                <CopyIcon className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="bg-muted/30 p-4 rounded-xl border relative group">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Negative Prompt</h3>
                            <p className="font-mono text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{prompt.negative_prompt}</p>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity h-8 w-8 text-muted-foreground"
                                onClick={() => handleCopyText(prompt.negative_prompt, "Negative Prompt")}
                                aria-label="Copy negative prompt"
                            >
                                <CopyIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {prompt.tags?.map(tag => (
                                <span key={tag} className="text-xs bg-muted px-2.5 py-1 rounded-md text-foreground/80 font-medium">#{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <ShareDialog
                prompt={prompt}
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
            />
        </div>
    );
}
