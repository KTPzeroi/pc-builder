"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IoGridOutline, IoCubeOutline, IoShieldHalfOutline, IoSettingsOutline, IoLogOutOutline, IoRocketOutline } from 'react-icons/io5';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-white pt-24 pb-12 px-4 md:px-0">
            {/* Sidebar / Bottom Nav (Mobile) */}
            <aside className="w-full md:w-64 md:border-r border-white/10 p-4 md:p-6 flex flex-col gap-4 md:gap-8 flex-shrink-0">
                <div className="flex flex-col gap-1 md:gap-2 border-b border-white/10 pb-4 md:pb-6">
                    <h2 className="text-lg md:text-xl font-bold tracking-widest uppercase text-blue-500">Admin Area</h2>
                    <p className="text-[10px] md:text-xs text-gray-500 font-medium hidden md:block">Control Panel & Dashboard</p>
                </div>

                <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar flex-1 items-center md:items-stretch">
                    <Link href="/admin">
                        <div className={`flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-lg flex-shrink-0 transition-colors cursor-pointer ${pathname === '/admin' ? 'opacity-100 bg-blue-500/10 text-blue-400' : 'opacity-70 hover:opacity-100 hover:bg-white/5'}`}>
                            <IoGridOutline className="text-lg" />
                            <span className="text-[11px] md:text-sm font-bold tracking-wider uppercase whitespace-nowrap">Dashboard</span>
                        </div>
                    </Link>
                    <Link href="/admin/inventory">
                        <div className={`flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-lg flex-shrink-0 transition-colors cursor-pointer ${pathname === '/admin/inventory' ? 'opacity-100 bg-blue-500/10 text-blue-400' : 'opacity-70 hover:opacity-100 hover:bg-white/5'}`}>
                            <IoCubeOutline className="text-lg" />
                            <span className="text-[11px] md:text-sm font-bold tracking-wider uppercase whitespace-nowrap">Hardware</span>
                        </div>
                    </Link>
                    <Link href="/admin/presets">
                        <div className={`flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-lg flex-shrink-0 transition-colors cursor-pointer ${pathname === '/admin/presets' ? 'opacity-100 bg-blue-500/10 text-blue-400' : 'opacity-70 hover:opacity-100 hover:bg-white/5'}`}>
                            <IoRocketOutline className="text-lg" />
                            <span className="text-[11px] md:text-sm font-bold tracking-wider uppercase whitespace-nowrap">Presets</span>
                        </div>
                    </Link>
                    <Link href="/admin/users">
                        <div className={`flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-lg flex-shrink-0 transition-colors cursor-pointer ${pathname === '/admin/users' ? 'opacity-100 bg-blue-500/10 text-blue-400' : 'opacity-70 hover:opacity-100 hover:bg-white/5'}`}>
                            <IoShieldHalfOutline className="text-lg" />
                            <span className="text-[11px] md:text-sm font-bold tracking-wider uppercase whitespace-nowrap">Members</span>
                        </div>
                    </Link>
                    <Link href="/admin/settings">
                        <div className={`flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-lg flex-shrink-0 transition-colors cursor-pointer ${pathname === '/admin/settings' ? 'opacity-100 bg-blue-500/10 text-blue-400' : 'opacity-70 hover:opacity-100 hover:bg-white/5'}`}>
                            <IoSettingsOutline className="text-lg" />
                            <span className="text-[11px] md:text-sm font-bold tracking-wider uppercase whitespace-nowrap">Logs & Config</span>
                        </div>
                    </Link>
                </nav>

                <div className="mt-auto hidden md:block pt-6 border-t border-white/10">
                    <Link href="/">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer">
                            <IoLogOutOutline className="text-lg" />
                            <span className="text-sm font-bold tracking-wider uppercase">Exit to App</span>
                        </div>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-10 w-full overflow-hidden">
                {children}
            </main>
        </div>
    );
}
