"use client";

import React, { useState, useRef } from "react";
import { XIcon, UploadCloudIcon, PlusIcon, ImageIcon } from "lucide-react";
import { resizeImage } from "@/lib/image-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface PromptData {
    title: string;
    positive_prompt: string;
    negative_prompt: string;
    images: string[];
    models: string[];
    aspect_ratios: string[];
    tags: string[];
    content_type: string;
}

interface PromptFormProps {
    initialData?: Partial<PromptData>;
    onSubmit: (data: PromptData) => Promise<void>;
    isLoading?: boolean;
}

const CONTENT_TYPES = [
    { value: "concept", label: "Concept Art" },
    { value: "character", label: "Character Design" },
    { value: "environment", label: "Environment" },
    { value: "photography", label: "Photography" },
    { value: "illustration", label: "Illustration" },
    { value: "3d", label: "3D Render" },
    { value: "other", label: "Other" },
];

const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:5", "3:2", "2:3"];
const MODELS = ["Imagine V6", "Realism XL", "Turbo Render", "Flux Pro", "Stable Diffusion 3"];

export function PromptForm({ initialData, onSubmit, isLoading }: PromptFormProps) {
    const [formData, setFormData] = useState<PromptData>({
        title: initialData?.title || "",
        positive_prompt: initialData?.positive_prompt || "",
        negative_prompt: initialData?.negative_prompt || "",
        images: initialData?.images || [],
        models: initialData?.models || [],
        aspect_ratios: initialData?.aspect_ratios || [],
        tags: initialData?.tags || [],
        content_type: initialData?.content_type || "concept",
    });

    const [tagInput, setTagInput] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    };

    // --- Tags ---
    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            }
            setTagInput("");
        }
    };

    const removeTag = (tag: string) => {
        setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
    };

    // --- Images ---
    // --- Images ---
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const blob = await resizeImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.8 });

                const reader = new FileReader();
                reader.onload = (ev) => {
                    if (typeof ev.target?.result === "string") {
                        setFormData(prev => ({ ...prev, images: [...prev.images, ev.target!.result as string] }));
                        toast.success("Image added (Optimized)");
                    }
                };
                reader.readAsDataURL(blob);
            } catch (err) {
                toast.error("Failed to process image");
            }
        }
    };

    const removeImage = (index: number) => {
        setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    // --- Selection Helpers ---
    const toggleSelection = (field: 'models' | 'aspect_ratios', value: string) => {
        setFormData(prev => {
            const current = prev[field];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter(i => i !== value) };
            } else {
                return { ...prev, [field]: [...current, value] };
            }
        });
    };

    return (
        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>

            {/* Basic Info */}
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        placeholder="e.g. Cyberpunk City Street…"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        onKeyDown={handleKeyDown}
                        required
                        autoComplete="off"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Content Type</Label>
                        <Select
                            value={formData.content_type}
                            onValueChange={(val) => setFormData({ ...formData, content_type: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {CONTENT_TYPES.map(t => (
                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Tags</Label>
                        <div className="relative">
                            <Input
                                placeholder="Type and press Enter…"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={addTag}
                                autoComplete="off"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {formData.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="px-2 py-1 gap-1">
                                    {tag}
                                    <XIcon
                                        size={12}
                                        className="cursor-pointer hover:text-destructive transition-colors"
                                        onClick={() => removeTag(tag)}
                                        aria-label={`Remove tag ${tag}`}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && removeTag(tag)}
                                    />
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Prompts */}
            <div className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="positive" className="text-primary font-semibold">Positive Prompt</Label>
                    <Textarea
                        id="positive"
                        placeholder="What do you want to see?…"
                        className="min-h-[120px] font-mono text-sm bg-muted/30"
                        value={formData.positive_prompt}
                        onChange={(e) => setFormData({ ...formData, positive_prompt: e.target.value })}
                        autoComplete="off"
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="negative" className="text-muted-foreground">Negative Prompt</Label>
                    <Textarea
                        id="negative"
                        placeholder="What do you want to avoid? (e.g. blurry, low quality)…"
                        className="min-h-[80px] font-mono text-sm bg-muted/30"
                        value={formData.negative_prompt}
                        onChange={(e) => setFormData({ ...formData, negative_prompt: e.target.value })}
                        autoComplete="off"
                    />
                </div>
            </div>

            {/* Images */}
            <div className="grid gap-2">
                <Label>Reference / Example Images</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((img, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border bg-muted">
                            <img src={img} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Remove image"
                            >
                                <XIcon size={14} aria-hidden="true" />
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-[background-color,border-color] text-muted-foreground hover:text-primary"
                        onClick={() => fileInputRef.current?.click()}
                        aria-label="Upload reference image"
                    >
                        <UploadCloudIcon className="size-8 mb-2" aria-hidden="true" />
                        <span className="text-xs font-medium">Upload</span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                    </button>
                </div>
            </div>

            {/* Metadata helpers */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <Label>Recommended Models</Label>
                    <div className="flex flex-wrap gap-2">
                        {MODELS.map(m => (
                            <Badge
                                key={m}
                                variant={formData.models.includes(m) ? "default" : "outline"}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => toggleSelection('models', m)}
                            >
                                {m}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <Label>Aspect Ratios</Label>
                    <div className="flex flex-wrap gap-2">
                        {ASPECT_RATIOS.map(r => (
                            <Badge
                                key={r}
                                variant={formData.aspect_ratios.includes(r) ? "default" : "outline"}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => toggleSelection('aspect_ratios', r)}
                            >
                                {r}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={() => window.history.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving…" : "Save Prompt"}
                </Button>
            </div>

        </form>
    );
}
