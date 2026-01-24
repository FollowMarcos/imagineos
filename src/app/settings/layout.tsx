'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    UserIcon,
    Settings2Icon,
    BellIcon,
    ShieldCheckIcon,
    ChevronLeftIcon,
    MenuIcon,
    ArrowLeftIcon,
    SparklesIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

const sidebarItems = [
    {
        title: "Profile",
        href: "/settings/profile",
        icon: UserIcon,
        description: "Public identity and branding"
    },
    {
        title: "Account",
        href: "/settings/account",
        icon: Settings2Icon,
        description: "Email and session management",
        disabled: true
    },
    {
        title: "Notifications",
        href: "/settings/notifications",
        icon: BellIcon,
        description: "Preferences and alerts",
        disabled: true
    },
    {
        title: "Security",
        href: "/settings/security",
        icon: ShieldCheckIcon,
        description: "Password and 2FA",
        disabled: true
    },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    return (
        <div className="flex min-h-dvh bg-background text-foreground selection:bg-primary/10">
            {/* Sidebar Container */}
            <aside
                className={cn(
                    "sticky top-0 h-dvh flex flex-col border-r border-border/40 bg-card/30 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-40",
                    collapsed ? "w-20" : "w-80"
                )}
            >
                {/* Collapse Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    aria-expanded={!collapsed}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="absolute -right-4 top-10 z-50 h-8 w-8 rounded-full border border-border bg-background shadow-sm hover:scale-110 transition-transform hidden lg:flex"
                >
                    <ChevronLeftIcon className={cn("h-4 w-4 transition-transform duration-500", collapsed && "rotate-180")} aria-hidden="true" />
                </Button>

                {/* Header / Brand */}
                <div className="flex h-20 items-center px-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                            <SparklesIcon className="size-5" />
                        </div>
                        {!collapsed && (
                            <span className="font-bold text-xl tracking-tighter opacity-100 transition-opacity duration-300">
                                ImagineOS
                            </span>
                        )}
                    </Link>
                </div>

                <ScrollArea className="flex-1 px-4 py-6">
                    <nav className="space-y-2">
                        <div className={cn("mb-4 px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-opacity", collapsed ? "opacity-0" : "opacity-100")}>
                            Settings
                        </div>
                        {sidebarItems.map((item) => {
                            const isActive = pathname === item.href
                            const Icon = item.icon

                            return (
                                <Link
                                    key={item.href}
                                    href={item.disabled ? "#" : item.href}
                                    className={cn(
                                        "group flex items-center gap-4 rounded-2xl px-3 py-3.5 transition-all duration-300 relative",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10"
                                            : "hover:bg-accent/50 text-muted-foreground hover:text-foreground",
                                        item.disabled && "cursor-not-allowed opacity-40 hover:bg-transparent"
                                    )}
                                >
                                    <Icon className={cn("size-5 shrink-0 transition-transform duration-300", !isActive && "group-hover:scale-110")} />
                                    {!collapsed && (
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="font-semibold text-sm leading-none whitespace-nowrap overflow-hidden text-ellipsis">
                                                {item.title}
                                            </span>
                                            <span className={cn(
                                                "text-[10px] mt-1 whitespace-nowrap overflow-hidden text-ellipsis",
                                                isActive ? "text-primary-foreground/70" : "text-muted-foreground/60"
                                            )}>
                                                {item.description}
                                            </span>
                                        </div>
                                    )}
                                    {isActive && !collapsed && (
                                        <div className="size-1.5 rounded-full bg-primary-foreground absolute right-4" />
                                    )}
                                </Link>
                            )
                        })}
                    </nav>
                </ScrollArea>

                {/* Footer / Back */}
                <div className="p-4 border-t border-border/40">
                    <Link href="/">
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start rounded-xl group px-3 h-12 transition-all",
                                collapsed ? "justify-center" : ""
                            )}
                        >
                            <ArrowLeftIcon className="size-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
                            {!collapsed && <span className="ml-3 font-medium">Back to Home</span>}
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative pb-20">
                <div className="max-w-5xl px-8 py-12 lg:px-16 lg:py-16">
                    {children}
                </div>
            </main>
        </div>
    )
}
