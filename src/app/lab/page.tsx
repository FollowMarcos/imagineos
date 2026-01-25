"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    UploadCloud,
    ScanLine,
    Hand,
    MousePointer2,
    ThumbsUp,
    Maximize2,
    CheckCircle2,
    XCircle,
    Sparkles,
    Loader2,
    Move,
    Search,
    Pointer,
    Grab,
    Scissors,
    PenTool,
    Wand2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";

// --- Mock Data ---

const POSES = [
    { id: "natural", name: "Natural Relaxed", icon: Hand },
    { id: "fist", name: "Closed Fist", icon: Grab },
    { id: "point", name: "Pointer Finger", icon: Pointer },
    { id: "peace", name: "Peace Sign", icon: Scissors }, // Close enough
    { id: "open", name: "Open Palm", icon: Hand }, // Duplicate icon but different intent
    { id: "thumb", name: "Thumbs Up", icon: ThumbsUp },
];

const MOCK_DETECTED_HANDS = [
    { id: 1, x: 35, y: 40, width: 15, height: 20, label: "Left Hand" },
    { id: 2, x: 60, y: 35, width: 15, height: 20, label: "Right Hand" },
];

export default function LabHandFixerPage() {
    // --- State ---
    const [image, setImage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [handsDetected, setHandsDetected] = useState<typeof MOCK_DETECTED_HANDS>([]);
    const [selectedHandId, setSelectedHandId] = useState<number | null>(null);
    const [selectedPoseId, setSelectedPoseId] = useState<string | null>(null);
    const [isFixing, setIsFixing] = useState(false);

    // --- Handlers ---

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        let file: File | null = null;
        if ("dataTransfer" in e) {
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                file = e.dataTransfer.files[0];
            }
        } else if (e.target.files && e.target.files.length > 0) {
            file = e.target.files[0];
        }

        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (typeof ev.target?.result === "string") {
                    setImage(ev.target.result);
                    // Auto-detect after a delay
                    detectHands();
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const detectHands = () => {
        setIsProcessing(true);
        setHandsDetected([]);
        setSelectedHandId(null);
        setSelectedPoseId(null);

        setTimeout(() => {
            setIsProcessing(false);
            setHandsDetected(MOCK_DETECTED_HANDS);
            toast.success("Hands detected successfully", {
                description: "Found 2 hands in the image.",
            });
        }, 2000);
    };

    const handleApplyFix = () => {
        if (!selectedHandId || !selectedPoseId) return;
        setIsFixing(true);
        setTimeout(() => {
            setIsFixing(false);
            toast.success("Hand fix applied!", {
                description: "The selected hand has been updated.",
            });
            // Deselect to show cleaner view
            setSelectedHandId(null);
            setSelectedPoseId(null);
        }, 1500);
    };

    const clearImage = () => {
        setImage(null);
        setHandsDetected([]);
        setSelectedHandId(null);
        setSelectedPoseId(null);
    };

    // --- UI Components ---

    return (
        <div className="min-h-dvh bg-background text-foreground selection:bg-primary/20 flex flex-col items-center py-8 relative overflow-hidden">
            {/* Ambient Background Gradient */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="z-10 w-full max-w-6xl px-4 flex flex-col h-full grow gap-6">

                {/* Header */}
                <header className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />
                            Hand Fixer
                            <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-wider font-bold border border-primary/20">LAB</span>
                        </h1>
                        <p className="text-muted-foreground text-sm text-balance max-w-md">
                            Upload an image to detect hands and apply perfect poses with AI precision.
                        </p>
                    </div>

                    {image && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearImage}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Reset lab and clear image"
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reset
                        </Button>
                    )}
                </header>

                {/* Main Canvas Area */}
                <main className="flex-1 rounded-[32px] border border-border/50 bg-muted/20 backdrop-blur-sm relative overflow-hidden flex flex-col shadow-inner min-h-[500px]">

                    {!image ? (
                        // Upload State
                        <div
                            className={cn(
                                "absolute inset-0 flex flex-col items-center justify-center transition-all duration-300",
                                isDragging ? "bg-primary/5 ring-2 ring-primary scale-[0.99]" : "bg-transparent"
                            )}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleImageUpload}
                        >
                            <div className="bg-background rounded-full p-6 shadow-xl shadow-primary/5 mb-6 group transition-transform hover:scale-105">
                                <UploadCloud className="w-10 h-10 text-primary group-hover:text-primary/80 transition-colors" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Drag & drop your image</h2>
                            <p className="text-muted-foreground mb-6">or click to browse from your computer</p>

                            <div className="relative group/upload">
                                <Button size="lg" className="rounded-full px-8 relative z-10 pointer-events-none group-hover/upload:bg-primary/90">
                                    Select Image
                                </Button>
                                <input
                                    id="hand-fixer-upload"
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                    onChange={handleImageUpload}
                                    aria-label="Upload source image for hand fixing"
                                />
                            </div>
                        </div>
                    ) : (
                        // Editor State
                        <div className="relative w-full h-full flex items-center justify-center p-8">

                            <div className="relative max-w-full max-h-full shadow-2xl rounded-lg overflow-hidden group">
                                {/* The Image */}
                                <img
                                    src={image}
                                    alt="Source image for hand fixing"
                                    className={cn(
                                        "max-w-full max-h-[70vh] object-contain transition-all duration-700 rounded-lg",
                                        isProcessing ? "blur-md scale-[0.98] opacity-80" : "blur-0 scale-100 opacity-100"
                                    )}
                                />

                                {/* Processing Overlay */}
                                <AnimatePresence>
                                    {isProcessing && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex items-center justify-center z-50"
                                        >
                                            <div className="bg-background/80 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
                                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                                <span className="font-medium text-sm">Detecting hands...</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Bounding Boxes */}
                                {!isProcessing && handsDetected.map((hand) => {
                                    const isSelected = selectedHandId === hand.id;
                                    return (
                                        <motion.button
                                            key={hand.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={cn(
                                                "absolute border-2 rounded-lg cursor-pointer transition-all duration-300 backdrop-blur-[2px] focus-visible:ring-4 focus-visible:ring-primary focus-visible:outline-none",
                                                isSelected
                                                    ? "border-primary bg-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.3)] z-30"
                                                    : "border-white/50 bg-white/10 hover:border-primary/60 hover:bg-primary/5 z-20"
                                            )}
                                            style={{
                                                left: `${hand.x}%`,
                                                top: `${hand.y}%`,
                                                width: `${hand.width}%`,
                                                height: `${hand.height}%`
                                            }}
                                            onClick={() => setSelectedHandId(hand.id)}
                                            aria-label={`Select ${hand.label}`}
                                            aria-pressed={isSelected}
                                        >
                                            <div className={cn(
                                                "absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-background/95 backdrop-blur-sm text-[10px] font-bold shadow-md border border-border transition-all pointer-events-none uppercase tracking-wider",
                                                isSelected ? "opacity-100 translate-y-0" : "opacity-0 group-hover:opacity-100 translate-y-1"
                                            )}>
                                                {hand.label}
                                            </div>

                                            {/* Selected Indicator Corner (Apple-style) */}
                                            {isSelected && (
                                                <div className="absolute -right-2 -bottom-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-background">
                                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </motion.button>
                                    );
                                })}

                                {/* Fix Loading State overlay on hand */}
                                {isFixing && selectedHandId && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute z-40 bg-white/20 backdrop-blur-md flex items-center justify-center"
                                        style={{
                                            left: `${MOCK_DETECTED_HANDS.find(h => h.id === selectedHandId)?.x}%`,
                                            top: `${MOCK_DETECTED_HANDS.find(h => h.id === selectedHandId)?.y}%`,
                                            width: `${MOCK_DETECTED_HANDS.find(h => h.id === selectedHandId)?.width}%`,
                                            height: `${MOCK_DETECTED_HANDS.find(h => h.id === selectedHandId)?.height}%`
                                        }}
                                    >
                                        <Wand2 className="w-8 h-8 text-primary animate-pulse" />
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )}
                </main>

                {/* Tools Panel */}
                <AnimatePresence>
                    {selectedHandId && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            transition={{ type: "spring", bounce: 0.3 }}
                            className="fixed bottom-24 bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-3xl p-4 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Hand className="w-4 h-4" />
                                        Fixing {MOCK_DETECTED_HANDS.find(h => h.id === selectedHandId)?.label}
                                    </span>
                                    {selectedPoseId && (
                                        <Button size="sm" onClick={handleApplyFix} disabled={isFixing} className="rounded-full px-6">
                                            {isFixing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                                            Apply Fix
                                        </Button>
                                    )}
                                </div>

                                {/* Pose Selector */}
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                    {POSES.map((pose) => (
                                        <button
                                            key={pose.id}
                                            onClick={() => setSelectedPoseId(pose.id)}
                                            aria-label={`Change pose to ${pose.name}`}
                                            aria-pressed={selectedPoseId === pose.id}
                                            className={cn(
                                                "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                                                selectedPoseId === pose.id
                                                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                                                    : "bg-muted/30 border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <pose.icon className={cn("w-5 h-5", selectedPoseId === pose.id ? "text-primary-foreground" : "text-current")} />
                                            <span className="text-xs font-medium text-center leading-tight">{pose.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
