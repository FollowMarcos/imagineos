
import React from 'react';
import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import Image from "next/image"
import {
    CalendarIcon,
    MapPinIcon,
    BriefcaseIcon,
    GlobeIcon,
    Edit3Icon,
    UserIcon,
    SettingsIcon
} from "lucide-react"

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ username: string }>
}) {
    const { username } = await params
    const supabase = await createClient()

    const [profileResponse, userResponse] = await Promise.all([
        supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single(),
        supabase.auth.getUser()
    ])

    // Fetch profile
    const profile = profileResponse.data

    if (!profile) {
        notFound()
    }

    // Check if current user is the owner
    const user = userResponse.data.user
    const isOwner = user?.id === profile.id

    // Format date
    const joinDate = new Date(profile.date_joined).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    })

    return (
        <div className="min-h-dvh bg-background w-full relative">
            {/* Banner */}
            <div className="h-64 md:h-80 w-full bg-muted relative overflow-hidden group">
                {profile.banner_url ? (
                    <Image
                        src={profile.banner_url}
                        alt="Profile banner"
                        fill
                        priority
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-muted animate-in fade-in duration-1000" />
                )}
                <div className="absolute inset-0 bg-background/10" />
            </div>

            {/* Profile Content */}
            <main className="container max-w-4xl mx-auto px-4 sm:px-6 -mt-24 relative z-10 pb-20">
                <div className="flex flex-col md:flex-row gap-6 items-start">

                    {/* Avatar */}
                    <div className="relative group">
                        <div className="size-32 md:size-40 rounded-full border-4 border-background overflow-hidden bg-muted shadow-2xl ring-2 ring-border/50">
                            {profile.avatar_url ? (
                                <Image
                                    src={profile.avatar_url}
                                    alt={profile.full_name || username}
                                    fill
                                    sizes="(max-width: 768px) 128px, 160px"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground">
                                    <UserIcon className="size-12 md:size-16 opacity-50" aria-hidden="true" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info & Actions */}
                    <div className="flex-1 space-y-4 pt-2 md:pt-24 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground break-words text-balance">
                                {profile.full_name || username}
                            </h1>
                            <p className="text-lg text-muted-foreground font-medium">
                                @{profile.username}
                            </p>
                        </div>
                        {isOwner && (
                            <Link href="/settings/profile">
                                <Button variant="outline" size="sm" className="gap-2 rounded-full hidden md:flex hover:bg-muted/50 transition-colors">
                                    <Edit3Icon className="size-4" />
                                    Edit Profile
                                </Button>
                            </Link>
                        )}
                    </div>

                    {profile.profession && (
                        <Badge variant="secondary" className="rounded-full px-4 py-1 text-sm font-normal">
                            {profile.profession}
                        </Badge>
                    )}

                    {profile.bio && (
                        <p className="text-base md:text-lg text-foreground/90 leading-relaxed max-w-2xl text-pretty">
                            {profile.bio}
                        </p>
                    )}

                    {/* Meta Details */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground pt-2">
                        {profile.location && (
                            <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                                <MapPinIcon className="size-4" />
                                <span>{profile.location}</span>
                            </div>
                        )}
                        {profile.website && (profile.website.startsWith('http://') || profile.website.startsWith('https://')) && (
                            <a
                                href={profile.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 hover:text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
                                aria-label={`Visit website: ${new URL(profile.website).hostname} (opens in a new tab)`}
                            >
                                <GlobeIcon className="size-4" aria-hidden="true" />
                                <span>{new URL(profile.website).hostname}</span>
                            </a>
                        )}
                        <div className="flex items-center gap-1.5">
                            <CalendarIcon className="size-4" />
                            <span>Joined {joinDate}</span>
                        </div>
                    </div>
                </div>

                {/* Separator / Additional Content Area (Placeholder) */}
                <Separator className="my-10" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Placeholder Cards for future content (Posts, Projects, etc) */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="aspect-video rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground text-sm">
                            Content Placeholder {i}
                        </div>
                    ))}
                </div>
            </main >

            {/* Mobile FAB for Edit */}
            {
                isOwner && (
                    <Link href="/settings/profile">
                        <Button
                            size="icon"
                            className="fixed bottom-6 right-6 size-14 rounded-full shadow-lg md:hidden z-50 mb-[env(safe-area-inset-bottom)]"
                        >
                            <Edit3Icon className="size-6" />
                            <span className="sr-only">Edit Profile</span>
                        </Button>
                    </Link>
                )
            }
        </div >
    );
}
