import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div
            className="relative min-h-svh overflow-hidden bg-gradient-to-b from-[#0b0c0f] via-[#0f1117] to-[#0b0c0f] text-white"
            style={{
                backgroundImage:
                    "linear-gradient(to bottom, rgba(11,12,15,0.55), rgba(15,17,23,0.6)), url('/images/welcome.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.08),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.07),transparent_35%)]" />
            </div>
            <div className="relative mx-auto flex min-h-svh w-full max-w-5xl flex-col items-center justify-center px-4 py-8 md:px-10">
                <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-8 md:p-10 shadow-lg text-card-foreground">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <Link href={home()} className="flex flex-col items-center gap-2 font-medium group">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 ring-1 ring-border/50 shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/10">
                                    <AppLogoIcon className="size-8 fill-current text-primary" />
                                </div>
                                <span className="text-lg font-bold tracking-tight text-foreground transition-colors duration-150">ExaDocs</span>
                                <span className="sr-only">{title}</span>
                            </Link>
                            <div className="space-y-1.5 mt-2">
                                <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
                                <p className="text-xs text-muted-foreground font-medium px-4">{description}</p>
                            </div>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
