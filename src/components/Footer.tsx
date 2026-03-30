"use client";

import React from "react";
import Link from "next/link";
import { Divider } from "@heroui/react";
import { usePathname } from "next/navigation";
import {
    IoDesktopOutline,
    IoChatbubblesOutline,
    IoHammerOutline,
    IoBookOutline,
    IoShieldCheckmarkOutline,
    IoHeartOutline,
    IoSpeedometerOutline,
    IoInformationCircleOutline,
} from "react-icons/io5";

export default function AppFooter() {
    const pathname = usePathname();

    // ซ่อน Footer ในหน้า Admin เพราะมี Sidebar อยู่แล้ว
    if (pathname?.startsWith("/admin")) return null;

    return (
        <footer className="bg-slate-950 border-t border-white/5 mt-auto">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
                    {/* Col 1: Brand + คำอธิบายเว็บ */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <IoDesktopOutline className="text-blue-500 text-2xl" />
                            <h3 className="text-xl font-bold text-white tracking-tight">
                                PC <span className="text-blue-500">Builder</span>
                            </h3>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            แพลตฟอร์มจัดสเปกคอมพิวเตอร์ พร้อมระบบ Benchmark
                            อัจฉริยะ ที่ช่วยให้คุณประเมินประสิทธิภาพได้แม่นยำก่อนซื้อจริง
                        </p>
                    </div>

                    {/* Col 2: เมนูหลัก */}
                    <div className="flex flex-col gap-4">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest">
                            เมนูหลัก
                        </h4>
                        <nav className="flex flex-col gap-2.5">
                            <Link href="/" className="text-gray-500 hover:text-blue-400 transition-colors text-sm flex items-center gap-2 group">
                                <IoBookOutline className="group-hover:text-blue-400 transition-colors" />
                                หน้าแรก (Component Guide)
                            </Link>
                            <Link href="/build" className="text-gray-500 hover:text-blue-400 transition-colors text-sm flex items-center gap-2 group">
                                <IoHammerOutline className="group-hover:text-blue-400 transition-colors" />
                                จัดสเปกคอม (Build)
                            </Link>
                            <Link href="/forum" className="text-gray-500 hover:text-blue-400 transition-colors text-sm flex items-center gap-2 group">
                                <IoChatbubblesOutline className="group-hover:text-blue-400 transition-colors" />
                                ชุมชน (Forum)
                            </Link>
                            <Link href="/profile" className="text-gray-500 hover:text-blue-400 transition-colors text-sm flex items-center gap-2 group">
                                <IoShieldCheckmarkOutline className="group-hover:text-blue-400 transition-colors" />
                                โปรไฟล์ (Profile)
                            </Link>
                        </nav>
                    </div>

                    {/* Col 3: แหล่งอ้างอิง + Disclaimer */}
                    <div className="flex flex-col gap-4">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest">
                            อ้างอิงข้อมูลประสิทธิภาพ
                        </h4>
                        <p className="text-gray-500 text-xs leading-relaxed">
                            คะแนน Benchmark ในระบบถูกอ้างอิงจากฐานข้อมูลมาตรฐานสากล
                        </p>
                        <a
                            href="https://www.passmark.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 w-fit group"
                        >
                            <IoSpeedometerOutline className="text-blue-500 text-lg group-hover:scale-110 transition-transform" />
                            <div>
                                <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">PassMark Software®</span>
                                <p className="text-[10px] text-gray-600 mt-0.5">passmark.com</p>
                            </div>
                        </a>
                        <div className="flex items-start gap-2 mt-2">
                            <IoInformationCircleOutline className="text-gray-600 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-600 text-[11px] leading-relaxed">
                                คะแนนที่แสดงเป็นค่าประมาณเพื่อการเปรียบเทียบเท่านั้น ผลลัพธ์จริงอาจแตกต่างตามสภาพแวดล้อมการใช้งาน
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <Divider className="bg-white/5" />
            <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
                <p className="text-gray-600 text-xs text-center sm:text-left">
                    © {new Date().getFullYear()} PC Builder — All rights reserved.
                </p>
                <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                    <span>Developed with</span>
                    <IoHeartOutline className="text-blue-500" />
                </div>
            </div>
        </footer>
    );
}
