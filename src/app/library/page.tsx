"use client";

import React, { useEffect, useState } from "react";
import { PlusIcon, SearchIcon, InboxIcon, Sparkles } from "lucide-react";
import NextLink from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PromptCard, Prompt } from "@/components/library/prompt-card";
import { ShareDialog } from "@/components/library/share-dialog";
import { createClient } from "@/utils/supabase/client"; // Assuming client utils exist
import { toast } from "sonner";
import { useCreative } from "@/context/creative-context";

export default function LibraryPage() {
    const [activeTab, setActiveTab] = useState("my-prompts");
    const [searchQuery, setSearchQuery] = useState("");
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [sharedPrompts, setSharedPrompts] = useState<Prompt[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Share Dialog State
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

    const { usePrompt } = useCreative();
    const supabase = createClient();

    useEffect(() => {
        fetchPrompts();
    }, []);

    const fetchPrompts = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Fetch My Prompts
        const { data: myData } = await supabase
            .from('prompts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (myData) setPrompts(myData as Prompt[]);

        // 2. Fetch Shared Prompts (Inbox)
        // 2. Fetch Shared Prompts (Inbox)
        const { data: shareData, error } = await supabase
            .from('prompt_shares')
            .select(`
            shared_by_user_id,
            prompt:prompts (
                *
            )
        `)
            .eq('shared_with_user_id', user.id);

        if (error) {
            console.error("Share Fetch Error:", error);
            toast.error("Failed to load shared prompts");
        }

        if (shareData) {
            console.log("Raw Share Data:", shareData);
            // Map and Filter
            const mapped = shareData
                .filter((item: any) => item.prompt) // Ensure prompt exists
                .map((item: any) => ({
                    ...item.prompt,
                    shared_by: { username: "User" } // Temporary placeholder to avoid join issues
                }));

            // Deduplicate by ID
            const unique = Array.from(new Map(mapped.map((p: any) => [p.id, p])).values());

            console.log("Mapped Shared Prompts:", unique);
            setSharedPrompts(unique as Prompt[]);
        }

        setIsLoading(false);
    };

    const handleClone = async (prompt: Prompt) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { id, user_id, created_at, shared_by, ...cloneData } = prompt;

        const { error } = await supabase.from('prompts').insert({
            ...cloneData,
            title: `${cloneData.title} (Copy)`,
            user_id: user.id
        });

        if (!error) {
            toast.success("Prompt saved to your library");
            fetchPrompts(); // Refresh
            setActiveTab("my-prompts");
        } else {
            toast.error("Failed to copy prompt");
        }
    };

    const handleDelete = async (prompt: Prompt) => {
        // If shared, remove share. If owned, delete prompt.
        if (activeTab === 'shared') {
            // Remove share logic (Need share_id or just composite key delete)
            // For simplicity we use delete by composite if RLS allows or fetch share ID.
            // RLS: "auth.uid() = shared_with_user_id" allow delete.
            const { error } = await supabase.from('prompt_shares')
                .delete()
                .eq('prompt_id', prompt.id)
                .eq('shared_with_user_id', (await supabase.auth.getUser()).data.user?.id);

            if (!error) {
                toast.success("Removed from shared library");
                setSharedPrompts(prev => prev.filter(p => p.id !== prompt.id));
            }
        } else {
            // Permanently delete owned prompt
            if (!window.confirm("Are you sure? This cannot be undone.")) return;

            const { error } = await supabase.from('prompts').delete().eq('id', prompt.id);
            if (!error) {
                toast.success("Prompt deleted");
                setPrompts(prev => prev.filter(p => p.id !== prompt.id));
            } else {
                toast.error("Failed to delete");
            }
        }
    };

    const handleUsePrompt = (prompt: Prompt) => {
        usePrompt({
            prompt: prompt.positive_prompt,
            negativePrompt: prompt.negative_prompt || "",
            model: prompt.models?.[0] || "Imagine V6",
            aspectRatio: prompt.aspect_ratios?.[0] || "4:5"
        });
    };

    const currentList = activeTab === "my-prompts" ? prompts : sharedPrompts;

    // Client-Side Search
    const filteredList = currentList.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="flex flex-col min-h-dvh bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">Prompt Library</h1>
                    <p className="text-muted-foreground text-sm font-medium opacity-80">Manage and organize your creative DNA.</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <Input
                            placeholder="Search prompts..."
                            className="pl-9 bg-muted/50 border-none blur-none focus-visible:ring-1 focus-visible:ring-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search prompt library"
                        />
                    </div>
                    <NextLink href="/library/create">
                        <Button className="gap-2">
                            <PlusIcon size={16} /> <span className="hidden sm:inline">New Prompt</span>
                        </Button>
                    </NextLink>
                </div>
            </header>

            <main className="flex-1 p-6 md:px-8 max-w-7xl mx-auto w-full space-y-8">

                {/* Tabs */}
                <div className="flex justify-center">
                    <ToggleGroup type="single" value={activeTab} onValueChange={(v) => v && setActiveTab(v)}>
                        <ToggleGroupItem value="my-prompts" className="px-6 data-[state=on]:bg-primary/10 data-[state=on]:text-primary">
                            My Prompts
                        </ToggleGroupItem>
                        <ToggleGroupItem value="shared" className="px-6 data-[state=on]:bg-primary/10 data-[state=on]:text-primary">
                            <InboxIcon size={16} className="mr-2" />
                            Shared with Me
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-[4/5] rounded-xl bg-muted animate-pulse" />
                        ))}
                    </div>
                ) : filteredList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                        {filteredList.map(prompt => (
                            <PromptCard
                                key={prompt.id}
                                prompt={prompt}
                                isShared={activeTab === "shared"}
                                onClone={handleClone}
                                onDelete={handleDelete}
                                onShare={(p) => {
                                    setSelectedPrompt(p);
                                    setIsShareOpen(true);
                                }}
                                onUse={handleUsePrompt}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            {activeTab === 'my-prompts' ? <Sparkles /> : <InboxIcon />}
                        </div>
                        <p>No prompts found. {activeTab === 'my-prompts' ? 'Create your first one!' : 'Nobody has shared anything with you yet.'}</p>
                        {activeTab === 'my-prompts' && (
                            <NextLink href="/library/create">
                                <Button variant="outline">Create Prompt</Button>
                            </NextLink>
                        )}
                    </div>
                )}

            </main>

            {/* Share Dialog */}
            <ShareDialog
                prompt={selectedPrompt}
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
            />
        </div>
    );
}
