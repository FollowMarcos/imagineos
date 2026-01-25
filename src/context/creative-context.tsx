"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface CreativeState {
    isOpen: boolean;
    prompt: string;
    negativePrompt: string;
    model: string;
    aspectRatio: string;
}

interface CreativeContextType extends CreativeState {
    setIsOpen: (open: boolean) => void;
    setPrompt: (prompt: string) => void;
    setNegativePrompt: (negativePrompt: string) => void;
    setModel: (model: string) => void;
    setAspectRatio: (ratio: string) => void;
    usePrompt: (data: Partial<CreativeState>) => void;
}

const CreativeContext = createContext<CreativeContextType | undefined>(undefined);

export function CreativeProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [negativePrompt, setNegativePrompt] = useState("");
    const [model, setModel] = useState("Imagine V6");
    const [aspectRatio, setAspectRatio] = useState("4:5");

    const usePrompt = (data: Partial<CreativeState>) => {
        if (data.prompt !== undefined) setPrompt(data.prompt);
        if (data.negativePrompt !== undefined) setNegativePrompt(data.negativePrompt);
        if (data.model) setModel(data.model);
        if (data.aspectRatio) setAspectRatio(data.aspectRatio);
        setIsOpen(true);
    };

    return (
        <CreativeContext.Provider
            value={{
                isOpen,
                prompt,
                negativePrompt,
                model,
                aspectRatio,
                setIsOpen,
                setPrompt,
                setNegativePrompt,
                setModel,
                setAspectRatio,
                usePrompt,
            }}
        >
            {children}
        </CreativeContext.Provider>
    );
}

export const useCreative = () => {
    const context = useContext(CreativeContext);
    if (context === undefined) {
        throw new Error("useCreative must be used within a CreativeProvider");
    }
    return context;
};
