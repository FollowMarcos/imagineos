
"use client"

import React, { useCallback, useState } from "react"
// Note: I'm assuming we might not have a global upload context or might need one
// But for this feature, let's keep it self-contained first as requested.
import { cn } from "@/lib/utils"
import { UploadCloudIcon, ImagePlusIcon } from "lucide-react"

interface DropZoneProps {
    onDrop: (files: File[]) => void
    className?: string
    accept?: Record<string, string[]>
    maxFiles?: number
    multiple?: boolean
}

export function DropZone({ onDrop, className, multiple = false }: DropZoneProps) {
    const [isDragging, setIsDragging] = useState(false)

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = "copy"
        }
    }, [])

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(false)

            const files = Array.from(e.dataTransfer.files).filter((file) =>
                file.type.startsWith("image/")
            )

            if (files.length > 0) {
                onDrop(multiple ? files : [files[0]])
            }
        },
        [onDrop, multiple]
    )

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files.length > 0) {
                const files = Array.from(e.target.files).filter((file) =>
                    file.type.startsWith("image/")
                )
                if (files.length > 0) {
                    onDrop(multiple ? files : [files[0]])
                }
            }
        },
        [onDrop, multiple]
    )

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
                "relative rounded-xl border-2 border-dashed transition-all duration-200 ease-out flex flex-col items-center justify-center text-center p-8 bg-card/50",
                isDragging
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-border hover:border-primary/50 hover:bg-card",
                className
            )}
        >
            <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer p-0 m-0" // pointer-events-auto implicitly
                onChange={handleFileInput}
                accept="image/*"
                multiple={multiple}
                aria-label="Upload images"
            />

            <div className="pointer-events-none flex flex-col items-center gap-4">
                <div className={cn(
                    "p-4 rounded-full bg-background border shadow-sm transition-transform duration-300",
                    isDragging ? "scale-110 text-primary" : "text-muted-foreground"
                )}>
                    {multiple ? <ImagePlusIcon className="size-8" /> : <UploadCloudIcon className="size-8" />}
                </div>
                <div className="space-y-1">
                    <p className="text-lg font-medium tracking-tight">
                        {isDragging ? "Drop to upload" : "Drag & drop images here"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        or click to select {multiple ? "files" : "file"}
                    </p>
                </div>
            </div>
        </div>
    )
}
