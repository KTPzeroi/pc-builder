"use client";

import React, { useState, useEffect } from "react";
import { 
    Card, CardBody, CardHeader, Divider, Button, Chip, Spinner, 
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure
} from "@heroui/react";
import { IoWarningOutline, IoArrowBackOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";

export default function AdminReportsPage() {
    const router = useRouter();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // สำหรับ Modal เปลี่ยนสถานะการจัดการ
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/reports");
            if (res.ok) {
                const data = await res.json();
                setReports(data.reports || []);
            }
        } catch (error) {
            console.error("Failed to fetch reports:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const openManageModal = (id: string) => {
        setSelectedReportId(id);
        onOpen();
    };

    const handleAction = async (action: "resolve" | "ignore" | "hide_target", onClose: () => void) => {
        if (!selectedReportId) return;

        setIsProcessing(true);
        try {
            const res = await fetch(`/api/admin/reports/${selectedReportId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action })
            });

            if (!res.ok) throw new Error("ไม่สามารถจัดการรายงานได้");

            toast.success("จัดการรายงานสำเร็จ!");
            // รีเฟรชข้อมูลล่าสุด
            fetchReports();
            onClose();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
                <Spinner size="lg" color="danger" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm animate-pulse">Loading Reports...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
            <Toaster position="bottom-right" />
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button isIconOnly variant="flat" color="default" onPress={() => router.push('/admin')}>
                        <IoArrowBackOutline className="text-xl" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            <IoWarningOutline className="text-danger" />
                            Reports Management
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">จัดการรายงานปัญหาและการทำผิดกฎในระบบทั้งหมด</p>
                    </div>
                </div>
            </header>

            <Card className="bg-black/40 border border-white/10 shadow-xl">
                <CardHeader className="flex flex-col items-start px-6 py-6 font-bold uppercase tracking-widest text-sm text-white">
                    All Reports List
                </CardHeader>
                <Divider className="bg-white/5" />
                <CardBody className="p-0">
                    {reports.length === 0 ? (
                         <div className="flex flex-col items-center justify-center py-20 bg-white/5">
                            <IoCheckmarkCircleOutline className="text-5xl text-gray-600 mb-4 opacity-50" />
                            <p className="text-white font-medium">ยังไม่มีรายงานในระบบ</p>
                            <p className="text-gray-500 text-sm mt-1">ขอบคุณที่ช่วยดูแลระบบให้ปลอดภัยครับ</p>
                         </div>
                    ) : (
                        <div className="overflow-x-auto w-full">
                            <Table aria-label="Reports Table" classNames={{ wrapper: "bg-transparent shadow-none" }}>
                                <TableHeader>
                                    <TableColumn className="bg-white/5 text-white/70">TYPE</TableColumn>
                                    <TableColumn className="bg-white/5 text-white/70">REASON</TableColumn>
                                    <TableColumn className="bg-white/5 text-white/70">REPORTED USER & CONTENT</TableColumn>
                                    <TableColumn className="bg-white/5 text-white/70">STATUS</TableColumn>
                                    <TableColumn className="bg-white/5 text-white/70 text-right">ACTIONS</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {reports.map((report) => (
                                        <TableRow key={report.id} className="border-b border-white/5">
                                            <TableCell>
                                                <span className="font-bold text-gray-300">{report.type}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-white">{report.reason}</span>
                                                    <span className="text-xs text-gray-500 truncate max-w-[200px]">{report.description || `Target ID: ${report.targetId}`}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1 max-w-[300px]">
                                                    <span className="text-xs font-bold text-danger">@{report.targetAuthor || "Unknown"}</span>
                                                    <span className="text-xs text-gray-300 truncate" title={report.targetContent}>
                                                        {report.targetContent ? `"${report.targetContent}"` : "[No Content]"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Chip size="sm" color={report.status === 'PENDING' ? 'danger' : (report.status === 'RESOLVED' ? 'success' : 'default')} variant="dot">
                                                    {report.status}
                                                </Chip>
                                            </TableCell>
                                            <TableCell className="text-right flex gap-2 justify-end items-center">
                                                {report.targetUrl && (
                                                    <Button size="sm" variant="light" color="primary" onPress={() => window.open(report.targetUrl, '_blank')}>
                                                        ดูต้นทาง
                                                    </Button>
                                                )}
                                                {report.status === 'PENDING' ? (
                                                    <Button size="sm" variant="flat" color="danger" onPress={() => openManageModal(report.id)}>
                                                        จัดการ
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" variant="flat" isDisabled>จัดการแล้ว</Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardBody>
            </Card>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} classNames={{ base: "bg-slate-900 border border-white/10 text-white" }}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="border-b border-white/5">ตัวเลือกการจัดการ</ModalHeader>
                            <ModalBody className="py-6">
                                <p className="text-sm text-gray-400 mb-4">คุณต้องการดำเนินการกับรายงานนี้อย่างไร?</p>
                                <div className="flex flex-col gap-3">
                                    <Button 
                                        color="danger" 
                                        variant="flat" 
                                        className="justify-start font-bold"
                                        isLoading={isProcessing}
                                        onPress={() => handleAction("hide_target", onClose)}
                                    >
                                        ❌ ลบ/ซ่อนโพสต์เป้าหมาย และ ปิดคดี (Resolve)
                                    </Button>
                                    <Button 
                                        color="success" 
                                        variant="flat" 
                                        className="justify-start font-bold"
                                        isLoading={isProcessing}
                                        onPress={() => handleAction("resolve", onClose)}
                                    >
                                        ✔️ ยอมรับว่าผิด แต่แค่ตักเตือน (Resolve)
                                    </Button>
                                    <Button 
                                        color="default" 
                                        variant="flat" 
                                        className="justify-start font-bold"
                                        isLoading={isProcessing}
                                        onPress={() => handleAction("ignore", onClose)}
                                    >
                                        👀 ผู้ใช้เข้าใจผิด (Ignore Report)
                                    </Button>
                                </div>
                            </ModalBody>
                            <ModalFooter className="border-t border-white/5">
                                <Button variant="light" onPress={onClose} isDisabled={isProcessing}>ปิด</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
