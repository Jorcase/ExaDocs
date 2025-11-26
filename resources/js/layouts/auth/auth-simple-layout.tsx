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
            <div className="relative mx-auto flex min-h-svh w-full max-w-5xl flex-col items-center justify-center px-6 py-10 md:px-10">
                <div className="w-full max-w-xl rounded-3xl border border-white/20 bg-black/55 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <Link href={home()} className="flex flex-col items-center gap-2 font-medium">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                                    <AppLogoIcon className="size-9 fill-current text-white" />
                                </div>
                                <span className="text-lg font-semibold">ExaDocs</span>
                                <span className="sr-only">{title}</span>
                            </Link>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-semibold">{title}</h1>
                                <p className="text-sm text-white/70">{description}</p>
                            </div>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
