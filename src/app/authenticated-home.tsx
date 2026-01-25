"use client"

import { Button } from "@/components/ui/button"
import { motion, useReducedMotion } from "motion/react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { UserIcon, LogOutIcon, SparklesIcon, SettingsIcon } from "lucide-react"

export default function AuthenticatedHome({ user, username, fullName }: { user: any, username: string, fullName?: string | null }) {
    const router = useRouter()
    const supabase = createClient()
    const shouldReduceMotion = useReducedMotion()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <div className="min-h-dvh w-full bg-background flex flex-col items-center relative font-sans text-foreground overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true" />

            {/* Simple Nav */}
            <nav className="w-full max-w-7xl mx-auto px-6 py-4 flex justify-between items-center z-20">
                <span className="text-xl font-bold tracking-tighter text-primary">ImagineOS</span>
                <div className="flex items-center gap-3 md:gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/p/${username}`)}
                        className="rounded-full gap-2"
                    >
                        <UserIcon className="size-4" />
                        <span className="hidden sm:inline">Profile</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/settings/profile`)}
                        className="rounded-full gap-2"
                    >
                        <SettingsIcon className="size-4" />
                        <span className="hidden sm:inline">Settings</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSignOut}
                        className="rounded-full gap-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                        <LogOutIcon className="size-4" />
                        Sign Out
                    </Button>
                </div>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center text-center p-6 z-10">
                <motion.div
                    initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-4">
                        <SparklesIcon className="size-4" aria-hidden="true" />
                        Welcome Back, {fullName || username}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-balance max-w-3xl mx-auto leading-[1.1]">
                        This Is Where the <span className="text-primary italic">Magic</span> Will Happen
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-xl mx-auto text-pretty">
                        We're building your ultimate creative operating system. Stay tuned for a brand new dashboard experience.
                    </p>

                    <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                        {[
                            "Feed Coming Soon",
                            "New Projects",
                            "Global Discovery"
                        ].map((label, i) => (
                            <div key={i} className="px-6 py-8 rounded-2xl bg-card border border-border/50 backdrop-blur-sm flex items-center justify-center text-muted-foreground font-medium opacity-60 hover:opacity-100 hover:border-primary/30 transition-all duration-300">
                                {label}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
