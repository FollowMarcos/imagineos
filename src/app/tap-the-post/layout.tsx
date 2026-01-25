
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { TapNavigation } from "@/components/tap-the-post/navigation"

export const metadata = {
    title: "Tap The Post | ImagineOS",
    description: "Premium image utilities for social media power users.",
}

export default async function TapThePostLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        // Redirect to login if not authenticated
        return redirect("/login")
    }

    return (
        <div className="min-h-dvh bg-background w-full">
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                <div className="absolute top-[-20%] right-[-10%] size-[60%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] size-[50%] bg-primary/10 blur-[100px] rounded-full" />
            </div>

            <main className="relative z-10 container mx-auto px-4 py-12 md:py-24 space-y-8 flex flex-col items-center">
                <div className="space-y-2 text-center max-w-lg mx-auto">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
                        Tap The <span className="text-primary italic">Post</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Premium tools for your social media content.
                    </p>
                </div>

                <TapNavigation />

                {children}

                <footer className="pt-12 text-center text-xs text-muted-foreground/50">
                    <p>Processed locally on your device. Zero server uploads.</p>
                </footer>
            </main>
        </div>
    )
}
