"use client";

import { PromptForm, PromptData } from "@/components/library/prompt-form";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function EditPromptPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [initialData, setInitialData] = useState<PromptData | null>(null);

    const supabase = createClient();

    useEffect(() => {
        fetchPrompt();
    }, [id]);

    const fetchPrompt = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('prompts')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            toast.error("Prompt not found");
            router.push("/library");
            return;
        }

        if (data.user_id !== user.id) {
            toast.error("You can only edit your own prompts", { description: "Redirecting to clone..." });
            // Logic to redirect to clone handling if we wanted, for now just block.
            // In plan: "Shared prompts redirect to copy flow". 
            // For MVP, just redirect to library where they can click "Copy".
            router.push("/library");
            return;
        }

        setInitialData(data);
        setIsFetching(false);
    };

    const handleSubmit = async (data: PromptData) => {
        setIsLoading(true);

        const { error } = await supabase
            .from('prompts')
            .update(data)
            .eq('id', id);

        if (error) {
            toast.error("Failed to update prompt");
        } else {
            toast.success("Prompt updated");
            router.push("/library");
        }
        setIsLoading(false);
    };

    if (isFetching) {
        return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 md:py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-balance">Edit Prompt</h1>
            </div>
            {initialData && <PromptForm initialData={initialData} onSubmit={handleSubmit} isLoading={isLoading} />}
        </div>
    );
}
