"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { GoogleIcon, XIcon } from "@/components/icons"
import { createClient } from "@/utils/supabase/client"
import { motion, Variants, useReducedMotion } from "motion/react"

export default function LandingPageClient() {
    const shouldReduceMotion = useReducedMotion()

    const handleLogin = async (provider: 'google' | 'x') => {
        const supabase = createClient()
        await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
    }

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
            }
        }
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    }

    return (
        <div className="min-h-dvh w-full bg-background flex flex-col items-center justify-between p-4 relative font-sans text-foreground overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                <div className="absolute top-[-10%] left-[-10%] size-[40%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] size-[40%] bg-primary/5 blur-[120px] rounded-full" />
            </div>

            <motion.main
                variants={containerVariants}
                initial={shouldReduceMotion ? "visible" : "hidden"}
                animate="visible"
                className="flex-1 flex flex-col items-center justify-center text-center space-y-8 max-w-md w-full z-10"
            >
                {/* Logo / Title */}
                <motion.div variants={itemVariants} className="space-y-4">
                    <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-primary text-balance">
                        ImagineOS
                    </h1>
                    <p className="text-2xl md:text-3xl font-medium tracking-tight text-foreground/90 text-pretty">
                        Create Endlessly
                    </p>
                </motion.div>

                {/* Divider / Text */}
                <motion.div variants={itemVariants} className="w-full flex items-center gap-4 text-sm font-medium text-muted-foreground pt-2">
                    <div className="flex-1 h-[1px] bg-border"></div>
                    <span>Sign Up or Log In With</span>
                    <div className="flex-1 h-[1px] bg-border"></div>
                </motion.div>

                {/* Auth Buttons */}
                <motion.div variants={itemVariants} className="w-full space-y-4 flex flex-col items-center">
                    <Button
                        onClick={() => handleLogin('google')}
                        className="w-full h-12 rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium text-base transition hover:scale-[1.02] shadow-sm"
                    >
                        <GoogleIcon className="size-5 mr-2" />
                        Continue With Google
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleLogin('x')}
                        className="w-full h-12 rounded-full border border-border bg-transparent text-foreground hover:bg-accent font-medium text-base transition hover:scale-[1.02]"
                    >
                        <XIcon className="size-4 mr-2" />
                        Continue With X
                    </Button>
                </motion.div>
            </motion.main>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="w-full flex flex-col items-center gap-2 text-xs text-muted-foreground font-medium pb-[env(safe-area-inset-bottom)] z-10"
            >
                <div>
                    © 2026 ImagineOS Inc.
                </div>
                <div className="flex gap-4">
                    <Link href="/privacy" className="hover:text-foreground transition-colors text-pretty focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none rounded-sm">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-foreground transition-colors text-pretty focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none rounded-sm">Terms of Service</Link>
                </div>
            </motion.footer>
        </div>
    )
}
