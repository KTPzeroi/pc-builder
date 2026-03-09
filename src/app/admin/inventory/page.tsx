"use client";

import React from "react";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { IoCubeOutline } from "react-icons/io5";

export default function InventoryCRUDPage() {
    return (
        <div className="flex flex-col gap-8">
            {/* 1. Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <IoCubeOutline className="text-blue-500" />
                        Inventory CRUD
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">ระบบเพิ่ม ลบ แก้ไข ข้อมูลสเปกคอม (CPU, GPU, RAM, ฯลฯ)</p>
                </div>
            </header>

            {/* 2. Main Work Area (Placeholder) */}
            <section>
                <Card className="bg-black/40 border border-white/10 shadow-xl">
                    <CardHeader className="p-6 border-b border-white/5">
                        <h4 className="text-lg font-bold text-white uppercase tracking-widest text-sm italic">Component Database</h4>
                    </CardHeader>
                    <CardBody className="p-10 flex flex-col items-center justify-center text-center">
                        <p className="text-gray-400 font-medium mb-4">พื้นที่สำหรับสร้างตารางจัดการข้อมูลอุปกรณ์ต่างๆ</p>
                        <p className="text-xs text-gray-500 italic">จะทำการเชื่อมต่อและสร้างหน้าจอ CRUD ให้ทำงานกับ <strong>prisma.component</strong> ในขั้นตอนถัดไป</p>
                    </CardBody>
                </Card>
            </section>
        </div>
    );
}
