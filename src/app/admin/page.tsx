"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Divider, Button, Chip, Spinner } from "@heroui/react";
import {
    IoPeopleOutline,
    IoDesktopOutline,
    IoWarningOutline,
    IoServerOutline,
    IoCloudDoneOutline,
    IoGridOutline,
    IoShieldCheckmarkOutline
} from "react-icons/io5";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";

// --- 📊 ข้อมูลเริ่มแรกสำหรับกราฟช่วง Loading ---
const defaultActivityData = [
    { name: "Mon", posts: 0, comments: 0 },
    { name: "Tue", posts: 0, comments: 0 },
    { name: "Wed", posts: 0, comments: 0 },
    { name: "Thu", posts: 0, comments: 0 },
    { name: "Fri", posts: 0, comments: 0 },
    { name: "Sat", posts: 0, comments: 0 },
    { name: "Sun", posts: 0, comments: 0 },
];

// --- 🔵 คอมโพเนนต์การ์ดสถิติ (Stat Card) ---
interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
    return (
        <Card className="bg-black/40 border border-white/10 shadow-xl">
            <CardBody className="flex flex-row items-center gap-5 p-6">
                <div className={`p-4 rounded-2xl ${color} bg-opacity-20 text-2xl`}>
                    {icon}
                </div>
                <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
                </div>
            </CardBody>
        </Card>
    );
}

// --- 🏠 หน้าหลัก Dashboard ---

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/admin/stats");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch admin stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
                <Spinner size="lg" color="primary" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm animate-pulse">Loading Admin Data...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            {/* 1. Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <IoGridOutline className="text-blue-500" />
                        Admin Overview
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">ยินดีต้อนรับกลับมา! นี่คือสรุปกิจกรรมล่าสุดในระบบของคุณ</p>
                </div>
                <Button onPress={() => alert('ฟีเจอร์ดาวน์โหลดรายงาน กำลังอยู่ระหว่างการพัฒนา')} color="primary" variant="flat" className="font-bold uppercase tracking-widest text-[10px]">
                    Download Report
                </Button>
            </header>

            {/* 2. Key Metrics Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={<IoPeopleOutline className="text-blue-500" />}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Total Builds"
                    value={stats?.totalBuilds || 0}
                    icon={<IoDesktopOutline className="text-purple-500" />}
                    color="bg-purple-500"
                />

                <div onClick={() => window.location.href = '/admin/reports'} className="cursor-pointer transition-transform hover:scale-105 active:scale-95">
                    <StatCard
                        title="Active Reports"
                        value={stats?.activeReports || 0}
                        icon={<IoWarningOutline className="text-danger" />}
                        color="bg-danger"
                    />
                </div>
            </section>

            {/* 3. Charts Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* กราฟกิจกรรมชุมชน */}
                <Card className="bg-black/40 border border-white/10 p-4 shadow-xl">
                    <CardHeader className="flex flex-col items-start px-4">
                        <h4 className="text-lg font-bold text-white">Community Engagement</h4>
                        <p className="text-xs text-gray-500">สถิติการสร้างโพสต์และคอมเมนต์ในรอบ 7 วัน</p>
                    </CardHeader>
                    <Divider className="my-4 bg-white/5" />
                    <CardBody className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats?.activityData || defaultActivityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
                                    itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                                />
                                <Line type="monotone" dataKey="posts" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="comments" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>

                {/* กราฟสเปกคอมยอดนิยม */}
                <Card className="bg-black/40 border border-white/10 p-4 shadow-xl">
                    <CardHeader className="flex flex-col items-start px-4">
                        <h4 className="text-lg font-bold text-white">Popular Build Categories</h4>
                        <p className="text-xs text-gray-500">สัดส่วนการจัดสเปกคอมแยกตามจุดประสงค์</p>
                    </CardHeader>
                    <Divider className="my-4 bg-white/5" />
                    <CardBody className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.categoriesData || [
                                { category: "Gaming", count: 0 },
                                { category: "Working", count: 0 },
                                { category: "3D/Render", count: 0 }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
                                />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>
            </section>

            {/* 4. System Health & Urgent Reports */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* System Health */}
                <Card className="bg-black/40 border border-white/10 shadow-xl">
                    <CardHeader className="p-6 border-b border-white/5">
                        <h4 className="text-lg font-bold text-white uppercase tracking-widest text-sm italic">System Health</h4>
                    </CardHeader>
                    <CardBody className="p-6 flex flex-col gap-6">
                        <div className="flex items-center justify-between border border-white/5 bg-white/5 p-4 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${stats?.dbStatus === "Connected" ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                    <IoServerOutline className="text-2xl" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white uppercase tracking-widest">Database</p>
                                    <p className="text-xs text-gray-400">PostgreSQL (Prisma)</p>
                                </div>
                            </div>
                            <Chip color={stats?.dbStatus === "Connected" ? "success" : "danger"} variant="flat" size="sm" className="font-bold tracking-widest uppercase text-[10px]">
                                {stats?.dbStatus || "Unknown"}
                            </Chip>
                        </div>
                        <div className="flex items-center justify-between border border-white/5 bg-white/5 p-4 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${stats?.cloudinaryStatus === "Operational" ? 'bg-blue-500/20 text-blue-500' : 'bg-warning-500/20 text-warning-500'}`}>
                                    <IoCloudDoneOutline className="text-2xl" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white uppercase tracking-widest">Cloudinary</p>
                                    <p className="text-xs text-gray-400">Image Storage Service</p>
                                </div>
                            </div>
                            <Chip color={stats?.cloudinaryStatus === "Operational" ? "success" : "warning"} variant="flat" size="sm" className="font-bold tracking-widest uppercase text-[10px]">
                                {stats?.cloudinaryStatus || "Unknown"}
                            </Chip>
                        </div>
                    </CardBody>
                </Card>

                {/* Recent Reports Table / Urgent Reports */}
                <Card className="bg-black/40 border border-white/10 shadow-xl">
                    <CardHeader className="p-6 border-b border-white/5">
                        <div className="flex justify-between items-center w-full">
                            <h4 className="text-lg font-bold text-white uppercase tracking-widest text-sm italic">Urgent Reports</h4>
                            <Button size="sm" variant="light" color="danger" className="font-bold text-[10px]" onPress={() => window.location.href = '/admin/reports'}>View All</Button>
                        </div>
                    </CardHeader>
                    <CardBody className="p-0">
                        {(!stats?.urgentReports || stats.urgentReports.length === 0) ? (
                            <div className="px-6 py-12 text-center bg-white/5 h-full flex flex-col items-center justify-center min-h-[220px]">
                                <IoShieldCheckmarkOutline className="text-gray-500 text-5xl mx-auto mb-4 opacity-50" />
                                <p className="text-gray-400 font-medium">ระบบปกติ ไม่มีรายงานด่วนในขณะนี้</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 p-4 h-full min-h-[220px]">
                                {stats.urgentReports.map((report: any) => (
                                    <div key={report.id} className="flex justify-between items-center bg-danger/10 border-l-4 border-danger p-3 rounded-md">
                                        <div className="flex flex-col">
                                            <span className="text-danger font-bold text-sm">{report.type}: {report.reason}</span>
                                            <span className="text-gray-400 text-xs truncate max-w-[200px]">{report.description || `Target ID: ${report.targetId}`}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {report.targetUrl && (
                                                <Button size="sm" color="default" variant="flat" onPress={() => window.open(report.targetUrl, '_blank')}>ดูต้นทาง</Button>
                                            )}
                                            <Button size="sm" color="danger" variant="flat" onPress={() => window.location.href = '/admin/reports'}>จัดการ</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardBody>
                </Card>
            </section>
        </div>
    );
}