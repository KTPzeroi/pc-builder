"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IoGridOutline, IoCubeOutline, IoShieldHalfOutline, IoSettingsOutline, IoLogOutOutline } from 'react-icons/io5';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-white pt-24 pb-12 px-4 md:px-0">
            {/* Sidebar */}
            <aside className="w-full md:w-64 md:border-r border-white/10 p-6 flex flex-col gap-8 flex-shrink-0">
                <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
                    <h2 className="text-xl font-bold tracking-widest uppercase text-blue-500">Admin Area</h2>
                    <p className="text-xs text-gray-500 font-medium">Control Panel & Dashboard</p>
                </div>

                <nav className="flex flex-col gap-2 flex-1">
                    <Link href="/admin">
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${pathname === '/admin' ? 'opacity-100 bg-blue-500/10 text-blue-400' : 'opacity-70 hover:opacity-100 hover:bg-white/5'}`}>
                            <IoGridOutline className="text-lg" />
                            <span className="text-sm font-bold tracking-wider uppercase">Dashboard</span>
                        </div>
                    </Link>
                    <Link href="/admin/inventory">
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${pathname === '/admin/inventory' ? 'opacity-100 bg-blue-500/10 text-blue-400' : 'opacity-70 hover:opacity-100 hover:bg-white/5'}`}>
                            <IoCubeOutline className="text-lg" />
                            <span className="text-sm font-bold tracking-wider uppercase">Hardware Library</span>
                        </div>
                    </Link>
                    <Link href="/admin/users">
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${pathname === '/admin/users' ? 'opacity-100 bg-blue-500/10 text-blue-400' : 'opacity-70 hover:opacity-100 hover:bg-white/5'}`}>
                            <IoShieldHalfOutline className="text-lg" />
                            <span className="text-sm font-bold tracking-wider uppercase">Member & Moderation</span>
                        </div>
                    </Link>
                    <Link href="/admin/settings">
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${pathname === '/admin/settings' ? 'opacity-100 bg-blue-500/10 text-blue-400' : 'opacity-70 hover:opacity-100 hover:bg-white/5'}`}>
                            <IoSettingsOutline className="text-lg" />
                            <span className="text-sm font-bold tracking-wider uppercase">System Config</span>
                        </div>
                    </Link>
                </nav>

                <div className="mt-auto pt-6 border-t border-white/10">
                    <Link href="/">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer">
                            <IoLogOutOutline className="text-lg" />
                            <span className="text-sm font-bold tracking-wider uppercase">Exit to App</span>
                        </div>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
