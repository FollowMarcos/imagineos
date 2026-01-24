"use client"

import { Button } from "@/components/ui/button"
import { GoogleIcon, XIcon } from "@/components/icons"

export default function LandingPage() {
    return (
        <div className="min-h-dvh w-full bg-background flex flex-col items-center justify-between p-4 relative font-sans text-foreground">

            <main className="flex-1 flex flex-col items-center justify-center text-center space-y-8 max-w-md w-full z-10">
                {/* Logo / Title */}
                <div className="space-y-4 animate-in fade-in zoom-in duration-700 slide-in-from-bottom-4">
                    <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-primary text-balance">
                        ImagineOS
                    </h1>
                    <p className="text-2xl md:text-3xl font-medium tracking-tight text-foreground/90 text-pretty">
                        Create endlessly.
                    </p>
                </div>

                {/* Divider / Text */}
                <div className="w-full flex items-center gap-4 text-sm font-medium text-muted-foreground pt-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150 fill-mode-backwards">
                    <div className="flex-1 h-[1px] bg-border"></div>
                    <span>Sign up or Login with</span>
                    <div className="flex-1 h-[1px] bg-border"></div>
                </div>

                {/* Auth Buttons */}
                <div className="w-full space-y-4 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300 fill-mode-backwards">
                    <Button
                        className="w-full h-12 rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium text-base transition hover:scale-[1.02] shadow-sm"
                    >
                        <GoogleIcon className="w-5 h-5 mr-2" />
                        Continue with Google
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full h-12 rounded-full border border-border bg-transparent text-foreground hover:bg-accent font-medium text-base transition hover:scale-[1.02]"
                    >
                        <XIcon className="w-4 h-4 mr-2" />
                        Continue with X
                    </Button>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full flex flex-col items-center gap-2 text-xs text-muted-foreground font-medium animate-in fade-in duration-1000 delay-500 pb-[env(safe-area-inset-bottom)]">
                <div>
                    © 2026 ImagineOS Inc.
                </div>
                <div className="flex gap-4">
                    <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                </div>
            </footer>
        </div>
    )
}
