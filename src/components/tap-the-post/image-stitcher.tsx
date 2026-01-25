
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
import { XIcon, ColumnsIcon, RowsIcon, GridIcon, DownloadIcon, Loader2Icon, TrashIcon, TwitterIcon, LayersIcon } from "lucide-react"
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
    const canvasRef = useRef<HTMLCanvasElement>(null)

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
        try {
            const res = await fetch(`/api/xpost?url=${encodeURIComponent(twitterUrl)}`)
            if (!res.ok) throw new Error("Failed to fetch")
            const data = await res.json()

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
                toast.success("Image imported")
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
                const rows = Math.ceil(images.length / cols)
                const maxWidth = Math.max(...loadedImages.map(i => i.width))
                const maxHeight = Math.max(...loadedImages.map(i => i.height))
                totalWidth = maxWidth * cols
                totalHeight = maxHeight * rows
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

            saveAs(canvas.toDataURL("image/png"), `stitched-${layout}-${Date.now()}.png`)
            toast.success("Stitch saved!")
        }
        finalDraw()
    }

    if (!mounted) return null


    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 pb-24">
            {/* Step 1: Add Content - Compacted */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 bg-card/30 backdrop-blur-md border border-border/50 rounded-2xl p-4 shadow-xl ring-1 ring-white/10 group overflow-hidden relative">
                    <DropZone
                        onDrop={handleDrop}
                        multiple
                        className="h-32 border-none bg-transparent"
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none group-hover:opacity-100 opacity-60 transition-opacity">
                        <div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">1</div>
                        <span className="text-xs font-bold uppercase tracking-wider">Upload Images</span>
                    </div>
                </div>

                <div className="md:col-span-4 bg-card/30 backdrop-blur-md border border-border/50 rounded-2xl p-6 shadow-xl ring-1 ring-white/10 flex flex-col justify-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">2</div>
                        <h2 className="text-xs font-bold uppercase tracking-wider">Social Import</h2>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="X.com URL..."
                            className="bg-background/80 h-10 text-sm"
                            value={twitterUrl}
                            onChange={(e) => setTwitterUrl(e.target.value)}
                        />
                        <Button size="icon" className="h-10 w-10 shrink-0" onClick={importFromTwitter} disabled={isLoadingTwitter}>
                            {isLoadingTwitter ? <Loader2Icon className="size-4 animate-spin" /> : <TwitterIcon className="size-4 fill-current" />}
                        </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">Paste any post URL to extract images.</p>
                </div>
            </div>

            {/* Step 2: Arrange & Configure */}
            <section className={cn(
                "transition-all duration-500",
                images.length > 0 ? "opacity-100 translate-y-0" : "opacity-30 pointer-events-none translate-y-4"
            )}>
                <div className="sticky top-6 z-50 mb-6 bg-background/80 backdrop-blur-2xl border border-border/50 px-5 py-3 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-4 ring-1 ring-white/10">
                    <div className="flex items-center gap-5">
                        <h2 className="text-sm font-bold whitespace-nowrap hidden sm:block">Layout</h2>
                        <div className="flex bg-muted/50 p-1 rounded-xl gap-1 border border-border/20">
                            {[
                                { id: 'vertical', icon: RowsIcon, label: 'Vertical' },
                                { id: 'horizontal', icon: ColumnsIcon, label: 'Side' },
                                { id: 'grid', icon: GridIcon, label: 'Grid' }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setLayout(item.id as LayoutMode)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                                        layout === item.id ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-accent/30 text-muted-foreground"
                                    )}
                                >
                                    <item.icon size={14} />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        size="default"
                        className="rounded-xl px-6 font-bold shadow-lg shadow-primary/20 h-10"
                        onClick={downloadStitched}
                        disabled={images.length === 0}
                    >
                        <DownloadIcon className="mr-2 size-4" />
                        Download ({images.length})
                    </Button>
                </div>

                <div className="bg-card/10 border border-border/50 rounded-3xl p-6 min-h-[300px]">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={images.map(i => i.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {images.map((img) => (
                                    <SortableItem key={img.id} id={img.id} url={img.url} onRemove={handleRemove} />
                                ))}
                                {images.length > 0 && (
                                    <button
                                        onClick={() => document.getElementById('dropzone')?.click()}
                                        className="aspect-square rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 group"
                                    >
                                        <div className="size-8 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="text-xl text-muted-foreground">+</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground">Add</span>
                                    </button>
                                )}
                            </div>
                        </SortableContext>
                        <DragOverlay>
                            {activeId ? (
                                <div className="size-28 rounded-xl overflow-hidden opacity-90 shadow-2xl ring-2 ring-primary cursor-grabbing scale-105 transition-transform">
                                    <img src={images.find(i => i.id === activeId)?.url} alt="" className="w-full h-full object-cover" />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>

                    {images.length === 0 && (
                        <div className="h-32 flex flex-col items-center justify-center text-muted-foreground gap-1">
                            <LayersIcon className="size-10 opacity-10 mb-2" />
                            <p className="text-xs font-bold opacity-30 tracking-widest uppercase">Workspace Ready</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
