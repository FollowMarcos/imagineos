
"use client"

import React, { useState, useRef, useEffect } from "react"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { saveAs } from "file-saver"
import { DropZone } from "./drop-zone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { XIcon, ColumnsIcon, RowsIcon, GridIcon, DownloadIcon, Loader2Icon, TrashIcon, TwitterIcon, LayersIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

type LayoutMode = "vertical" | "horizontal" | "grid"

interface StitchedImage {
    id: string
    url: string
    width: number
    height: number
    file?: File
}

function SortableItem({ id, url, onRemove }: { id: string, url: string, onRemove: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : "auto",
        opacity: isDragging ? 0.5 : 1
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative aspect-square group bg-muted rounded-lg overflow-hidden border border-border/50 shadow-sm cursor-grab active:cursor-grabbing"
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Stitch item" className="w-full h-full object-cover" />

            <button
                onClick={(e) => {
                    e.stopPropagation() // Prevent drag start
                    onRemove(id)
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
            >
                <XIcon className="size-3" />
            </button>
        </div>
    )
}


export function ImageStitcher() {
    const [images, setImages] = useState<StitchedImage[]>([])
    const [twitterUrl, setTwitterUrl] = useState("")
    const [isLoadingTwitter, setIsLoadingTwitter] = useState(false)
    const [layout, setLayout] = useState<LayoutMode>("vertical")
    const [activeId, setActiveId] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDrop = async (files: File[]) => {
        const newImages: StitchedImage[] = []
        for (const file of files) {
            const url = URL.createObjectURL(file)
            await new Promise<void>((resolve) => {
                const img = new Image()
                img.onload = () => {
                    newImages.push({
                        id: Math.random().toString(36).substr(2, 9),
                        url,
                        width: img.width,
                        height: img.height,
                        file: file
                    })
                    resolve()
                }
                img.src = url
            })
        }
        setImages(prev => [...prev, ...newImages])
    }

    const importFromTwitter = async () => {
        if (!twitterUrl) return
        setIsLoadingTwitter(true)
        console.log("[Client] Requesting X import for:", twitterUrl);
        try {
            const res = await fetch(`/api/xpost?url=${encodeURIComponent(twitterUrl)}`)
            if (!res.ok) {
                const err = await res.json()
                console.error("[Client] API Error:", err.error);
                throw new Error(err.error || "Failed to fetch")
            }
            const data = await res.json()
            console.log("[Client] API Success, received base64 image");

            const img = new Image()
            img.onload = () => {
                setImages(prev => [...prev, {
                    id: Math.random().toString(36).substr(2, 9),
                    url: data.data,
                    width: img.width,
                    height: img.height
                }])
                setTwitterUrl("")
                setIsLoadingTwitter(false)
                toast.success("Imported from X")
            }
            img.src = data.data
        } catch (error: any) {
            toast.error(error.message)
            setIsLoadingTwitter(false)
        }
    }

    const handleRemove = (id: string) => {
        setImages(prev => prev.filter(img => img.id !== id))
    }

    const handleDragStart = (event: any) => setActiveId(event.active.id)

    const handleDragEnd = (event: any) => {
        const { active, over } = event
        if (active.id !== over?.id) {
            setImages((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id)
                const newIndex = items.findIndex(i => i.id === over.id)
                return arrayMove(items, oldIndex, newIndex)
            })
        }
        setActiveId(null)
    }

    const downloadStitched = () => {
        if (images.length === 0) return
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const finalDraw = async () => {
            const loadedImages = await Promise.all(images.map(src => {
                return new Promise<HTMLImageElement>((resolve) => {
                    const img = new Image()
                    img.crossOrigin = "anonymous"
                    img.onload = () => resolve(img)
                    img.src = src.url
                })
            }))

            let totalWidth = 0, totalHeight = 0
            if (layout === "vertical") {
                totalWidth = Math.max(...loadedImages.map(i => i.width))
                totalHeight = loadedImages.reduce((acc, img) => acc + (img.height * (totalWidth / img.width)), 0)
            } else if (layout === "horizontal") {
                totalHeight = Math.max(...loadedImages.map(i => i.height))
                totalWidth = loadedImages.reduce((acc, img) => acc + (img.width * (totalHeight / img.height)), 0)
            } else {
                const cols = Math.ceil(Math.sqrt(images.length))
                const cellW = Math.max(...loadedImages.map(i => i.width))
                const cellH = Math.max(...loadedImages.map(i => i.height))
                const rows = Math.ceil(images.length / cols)
                totalWidth = cellW * cols
                totalHeight = cellH * rows
            }

            canvas.width = totalWidth
            canvas.height = totalHeight
            ctx.fillStyle = "#ffffff"
            ctx.fillRect(0, 0, totalWidth, totalHeight)

            if (layout === "vertical") {
                let y = 0
                loadedImages.forEach(img => {
                    const h = img.height * (totalWidth / img.width)
                    ctx.drawImage(img, 0, 0, img.width, img.height, 0, y, totalWidth, h)
                    y += h
                })
            } else if (layout === "horizontal") {
                let x = 0
                loadedImages.forEach(img => {
                    const w = img.width * (totalHeight / img.height)
                    ctx.drawImage(img, 0, 0, img.width, img.height, x, 0, w, totalHeight)
                    x += w
                })
            } else {
                const cols = Math.ceil(Math.sqrt(loadedImages.length))
                const cellW = totalWidth / cols
                const cellH = totalHeight / Math.ceil(loadedImages.length / cols)
                loadedImages.forEach((img, i) => {
                    ctx.drawImage(img, 0, 0, img.width, img.height, (i % cols) * cellW, Math.floor(i / cols) * cellH, cellW, cellH)
                })
            }
            saveAs(canvas.toDataURL("image/png"), `stitch-${layout}.png`)
            toast.success("Ready for download!")
        }
        finalDraw()
    }

    if (!mounted) return null

    return (
        <div className="w-full max-w-5xl mx-auto space-y-4 pb-20">
            {/* Minimalist Top Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
                <div className="flex bg-muted/30 p-1 rounded-xl border border-border/20 backdrop-blur-md">
                    {[
                        { id: 'vertical', icon: RowsIcon },
                        { id: 'horizontal', icon: ColumnsIcon },
                        { id: 'grid', icon: GridIcon }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setLayout(item.id as LayoutMode)}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                layout === item.id ? "bg-background text-primary shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon size={16} />
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <TwitterIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50" />
                        <Input
                            placeholder="X.com URL..."
                            className="h-9 pl-9 text-xs bg-muted/20 border-border/50 focus:bg-background transition-all"
                            value={twitterUrl}
                            onChange={(e) => setTwitterUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && importFromTwitter()}
                        />
                        {isLoadingTwitter && <Loader2Icon className="absolute right-3 top-1/2 -translate-y-1/2 size-3 animate-spin text-primary" />}
                    </div>
                    <Button
                        size="sm"
                        className="h-9 px-4 font-bold rounded-xl shadow-lg shadow-primary/10"
                        onClick={downloadStitched}
                        disabled={images.length === 0}
                    >
                        Save
                    </Button>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="bg-background/40 backdrop-blur-sm border border-border/40 rounded-2xl p-4 min-h-[500px] relative">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={images.map(i => i.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {images.map((img) => (
                                <SortableItem key={img.id} id={img.id} url={img.url} onRemove={handleRemove} />
                            ))}

                            {/* Integrated Add Tile */}
                            <button
                                onClick={() => document.getElementById('dropzone')?.click()}
                                className="aspect-square rounded-lg border border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/[0.02] flex flex-col items-center justify-center gap-2 transition-all group"
                            >
                                <div className="size-8 rounded-full bg-muted/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <PlusIcon size={18} className="text-muted-foreground/60" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Add</span>
                            </button>
                        </div>
                    </SortableContext>

                    <DragOverlay>
                        {activeId ? (
                            <div className="size-32 rounded-lg overflow-hidden opacity-90 shadow-2xl ring-2 ring-primary cursor-grabbing scale-105 transition-transform">
                                <img src={images.find(i => i.id === activeId)?.url} alt="" className="w-full h-full object-cover" />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>

                {images.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full max-w-sm">
                            <DropZone onDrop={handleDrop} multiple className="h-40 border-none bg-transparent hover:bg-muted/5 transition-colors" />
                            <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 mt-4">
                                Drop images to start
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
