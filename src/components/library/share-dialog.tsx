"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Loader2, UserPlusIcon } from "lucide-react";
import { Prompt } from "./prompt-card";

interface ShareDialogProps {
    prompt: Prompt | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ShareDialog({ prompt, isOpen, onClose }: ShareDialogProps) {
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const handleShare = async () => {
        if (!prompt || !username) return;
        setIsLoading(true);

        try {
            // 1. Find User ID by Username
            // Assuming a public 'profiles' table exists.
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', username)
                .single();

            if (profileError || !profile) {
                toast.error("User not found", { description: "Double check the username." });
                setIsLoading(false);
                return;
            }

            if (profile.id === prompt.user_id) {
                toast.error("You cannot share with yourself"); // Logic handled?
                setIsLoading(false);
                return;
            }

            // 2. Insert Share
            const { error: shareError } = await supabase
                .from('prompt_shares')
                .insert({
                    prompt_id: prompt.id,
                    shared_by_user_id: prompt.user_id,
                    shared_with_user_id: profile.id
                });

            if (shareError) {
                if (shareError.code === '23505') { // Unique violation if constrained
                    toast.error("Already shared with this user");
                } else {
                    toast.error("Failed to share", { description: shareError.message });
                }
            } else {
                toast.success(`Shared "${prompt.title}" with @${username}`);
                onClose();
                setUsername("");
            }

        } catch (e) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share Prompt</DialogTitle>
                    <DialogDescription>
                        Share <strong>{prompt?.title}</strong> with another user. They will see it in their "Shared with Me" library.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Recipient Username</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter exact username..."
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleShare()}
                            />
                            <Button disabled={!username || isLoading} onClick={handleShare}>
                                {isLoading ? <Loader2 className="animate-spin" /> : <UserPlusIcon size={16} />}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
