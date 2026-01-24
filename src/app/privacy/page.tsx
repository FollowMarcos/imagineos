
import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-dvh w-full bg-background flex flex-col items-center justify-start p-6 md:p-12 relative font-sans text-foreground">
            <main className="max-w-3xl w-full space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="space-y-2">
                    <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-primary">
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Last updated: January 24, 2026
                    </p>
                </div>

                <section className="space-y-4 text-foreground/90 leading-relaxed">
                    <p>
                        At ImagineOS, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services.
                    </p>

                    <h2 className="text-2xl font-semibold tracking-tight text-foreground pt-4">I. Information We Collect</h2>
                    <p>
                        We collect information you provide directly to us, such as when you create an account, update your profile, or interact with our content. This may include your name, email address, and any content you create or share on the platform.
                    </p>

                    <h2 className="text-2xl font-semibold tracking-tight text-foreground pt-4">II. How We Use Your Information</h2>
                    <p>
                        We use the information we collect to operate, maintain, and improve our services, to communicate with you, and to personalize your experience. We do not sell your personal data to third parties.
                    </p>

                    <h2 className="text-2xl font-semibold tracking-tight text-foreground pt-4">III. Data Security</h2>
                    <p>
                        We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
                    </p>

                    <h2 className="text-2xl font-semibold tracking-tight text-foreground pt-4">IV. Cookies</h2>
                    <p>
                        We may use cookies and similar tracking technologies to enhance your experience on our website. You can control the use of cookies at the individual browser level.
                    </p>

                    <h2 className="text-2xl font-semibold tracking-tight text-foreground pt-4">V. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                    </p>

                    <h2 className="text-2xl font-semibold tracking-tight text-foreground pt-4">VI. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at support@imagineos.com.
                    </p>
                </section>
            </main>
        </div>
    );
}
