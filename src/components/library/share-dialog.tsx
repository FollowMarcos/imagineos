"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Loader2, UserPlusIcon, XIcon } from "lucide-react";
import { Prompt } from "./prompt-card";

interface ShareDialogProps {
    prompt: Prompt | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ShareDialog({ prompt, isOpen, onClose }: ShareDialogProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<{ id: string; username: string; full_name: string }[]>([]);
    const [selectedUser, setSelectedUser] = useState<{ id: string; username: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const supabase = createClient();

    // Debounced search
    useEffect(() => {
        const searchUsers = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }
            setIsSearching(true);

            const { data } = await supabase
                .from('profiles')
                .select('id, username, full_name')
                .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
                .limit(5);

            if (data) setResults(data);
            setIsSearching(false);
        };

        const timer = setTimeout(searchUsers, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const handleShare = async () => {
        if (!prompt || !selectedUser) return;
        setIsLoading(true);

        try {
            if (selectedUser.id === prompt.user_id) {
                toast.error("You cannot share with yourself");
                return;
            }

            // 2. Insert Share
            const { error: shareError } = await supabase
                .from('prompt_shares')
                .insert({
                    prompt_id: prompt.id,
                    shared_by_user_id: prompt.user_id,
                    shared_with_user_id: selectedUser.id
                });

            if (shareError) {
                if (shareError.code === '23505') {
                    toast.error("Already shared with this user");
                } else {
                    toast.error("Failed to share", { description: shareError.message });
                }
            } else {
                toast.success(`Shared "${prompt.title}" with @${selectedUser.username}`);
                onClose();
                setQuery("");
                setSelectedUser(null);
            }

        } catch (e) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Prompt</DialogTitle>
                    <DialogDescription>
                        Share <strong>{prompt?.title}</strong> with another user.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2 relative">
                        <Label>Recipient</Label>

                        {selectedUser ? (
                            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                                <div className="flex-1 font-medium">@{selectedUser.username}</div>
                                <Button size="sm" variant="ghost" onClick={() => { setSelectedUser(null); setQuery(""); }}>
                                    <XIcon size={14} />
                                </Button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Input
                                    placeholder="Search by username..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                {isSearching && <div className="absolute right-3 top-2.5"><Loader2 className="animate-spin h-4 w-4 text-muted-foreground" /></div>}

                                {/* Dropdown Results */}
                                {results.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-md z-50 overflow-hidden">
                                        {results.map(user => (
                                            <div
                                                key={user.id}
                                                className="px-3 py-2 hover:bg-muted cursor-pointer flex flex-col"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setResults([]);
                                                }}
                                            >
                                                <span className="font-medium text-sm">@{user.username}</span>
                                                {user.full_name && <span className="text-xs text-muted-foreground">{user.full_name}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button disabled={!selectedUser || isLoading} onClick={handleShare}>
                        {isLoading ? "Sharing..." : "Share Prompt"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
