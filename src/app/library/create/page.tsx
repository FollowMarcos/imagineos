"use client";

import { PromptForm, PromptData } from "@/components/library/prompt-form";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CreatePromptPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (data: PromptData) => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            toast.error("You must be logged in");
            setIsLoading(false);
            return;
        }

        const { error } = await supabase.from('prompts').insert({
            ...data,
            user_id: user.id
        });

        if (error) {
            toast.error("Failed to create prompt", { description: error.message });
        } else {
            toast.success("Prompt created successfully");
            router.push("/library");
        }
        setIsLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Create New Prompt</h1>
                <p className="text-muted-foreground mt-2">Save your best generations for future use.</p>
            </div>
            <PromptForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
    );
}
