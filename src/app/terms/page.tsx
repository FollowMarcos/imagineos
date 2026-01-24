
import React from 'react';
import Link from 'next/link';

export default function TermsOfService() {
    return (
        <div className="min-h-dvh w-full bg-background flex flex-col items-center justify-start p-6 md:p-12 relative font-sans text-foreground">
            <main className="max-w-3xl w-full space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="space-y-2">
                    <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-primary">
                        Terms of Service
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Last updated: January 24, 2026
                    </p>
                </div>

                <section className="space-y-4 text-foreground/90 leading-relaxed">
                    <p>
                        Welcome to ImagineOS. By accessing or using our website and services, you agree to be bound by these Terms of Service.
                    </p>

                    <h2 className="text-2xl font-semibold tracking-tight text-foreground pt-4">1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using our services, you agree to be bound by these Terms. If you do not agree to all the terms and conditions, then you may not access the service.
                    </p>

                    <h2 className="text-2xl font-semibold tracking-tight text-foreground pt-4">2. Use of License</h2>
                    <p>
                        Permission is granted to temporarily download one copy of the materials (information or software) on ImagineOS's website for personal, non-commercial transitory viewing only.
                    </p>

                    <h2 className="text-2xl font-semibold tracking-tight text-foreground pt-4">3. User Accounts</h2>
                    <p>
                        When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our service.
                    </p>

                    <h2 className="text-2xl font-semibold tracking-tight text-foreground pt-4">4. Content</h2>
                    <p>
                        Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post to the service, including its legality, reliability, and appropriateness.
                    </p>

                    <h2 className="text-2xl font-semibold tracking-tight text-foreground pt-4">5. Termination</h2>
                    <p>
                        We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>

                    <h2 className="text-2xl font-semibold tracking-tight text-foreground pt-4">6. Changes</h2>
                    <p>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                    </p>

                    <h2 className="text-2xl font-semibold tracking-tight text-foreground pt-4">7. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms, please contact us at support@imagineos.com.
                    </p>
                </section>
            </main>
        </div>
    );
}
