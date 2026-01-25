
"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { DropZone } from "./drop-zone"
import { Button } from "@/components/ui/button"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import { DownloadIcon, XIcon, RefreshCwIcon, Loader2Icon } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { toast } from "sonner"

const SLICE_COUNT = 4

export function ImageSlicer() {
    const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [slices, setSlices] = useState<string[]>([]) // Base64 URLs
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const handleDrop = useCallback((files: File[]) => {
        const file = files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
                setSourceImage(img)
                processSlices(img)
            }
            img.src = e.target?.result as string
        }
        reader.readAsDataURL(file)
    }, [])

    const processSlices = (img: HTMLImageElement) => {
        // Splitting into 4 equal horizontal segments (segmenting height)

        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
            toast.error("Could not create canvas context")
            return
        }

        const segmentHeight = img.height / SLICE_COUNT
        const width = img.width

        const newSlices: string[] = []

        for (let i = 0; i < SLICE_COUNT; i++) {
            canvas.width = width
            canvas.height = segmentHeight

            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(
                img,
                0, i * segmentHeight, width, segmentHeight, // Source
                0, 0, width, segmentHeight // Dest
            )

            newSlices.push(canvas.toDataURL("image/jpeg", 0.95))
        }

        setSlices(newSlices)
    }

    const handleDownload = async () => {
        if (slices.length === 0) return
        setIsProcessing(true)

        try {
            const zip = new JSZip()

            slices.forEach((slice, i) => {
                // Remove data:image/jpeg;base64, prefix
                const data = slice.split(",")[1]
                zip.file(`slice-${i + 1}.jpg`, data, { base64: true })
            })

            const content = await zip.generateAsync({ type: "blob" })
            saveAs(content, "horizontal-slices.zip")
            toast.success("Download started!")
        } catch (err) {
            console.error(err)
            toast.error("Failed to generate ZIP")
        } finally {
            setIsProcessing(false)
        }
    }

    const reset = () => {
        setSourceImage(null)
        setSlices([])
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8">
            {!sourceImage ? (
                <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <DropZone onDrop={handleDrop} className="h-64" />
                    <p className="mt-4 text-center text-sm text-muted-foreground w-full">
                        Upload an image to split it into {SLICE_COUNT} horizontal segments.
                    </p>
                </motion.div>
            ) : (
                <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                >
                    {/* Preview Grid - Stacked Vertically */}
                    <div className="flex flex-col gap-1 overflow-hidden rounded-xl border bg-background/50 p-2 md:p-4 shadow-sm">
                        {slices.map((slice, i) => (
                            <div key={i} className="relative bg-muted rounded-md overflow-hidden shadow-inner w-full">
                                <span className="absolute top-2 left-2 z-10 size-6 flex items-center justify-center rounded-full bg-black/50 text-white text-xs font-bold backdrop-blur-md">
                                    {i + 1}
                                </span>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={slice} alt={`Slice ${i + 1}`} className="w-full h-auto block" />
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            size="lg"
                            onClick={handleDownload}
                            disabled={isProcessing}
                            className="w-full sm:w-auto min-w-[200px] rounded-full text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2Icon className="mr-2 size-5 animate-spin" />
                                    Zipping...
                                </>
                            ) : (
                                <>
                                    <DownloadIcon className="mr-2 size-5" />
                                    Download All Slices
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={reset}
                            className="w-full sm:w-auto rounded-full"
                        >
                            <RefreshCwIcon className="mr-2 size-4" />
                            Start Over
                        </Button>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
