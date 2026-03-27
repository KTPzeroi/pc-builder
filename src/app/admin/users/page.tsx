"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Avatar, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { IoShieldHalfOutline, IoSearchOutline } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";

type UserData = {
    id: string;
    name: string | null;
    username: string | null;
    email: string | null;
    image: string | null;
    role: string;
    status: string;
    reportCount: number;
    _count: {
        posts: number;
        comments: number;
    }
};

export default function UsersModerationPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [actionUser, setActionUser] = useState<UserData | null>(null);
    const [actionType, setActionType] = useState<"MAKE_ADMIN" | "DEMOTE" | "BAN" | "UNBAN" | "DELETE" | "">("");

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenModal = (user: UserData, type: "MAKE_ADMIN" | "DEMOTE" | "BAN" | "UNBAN" | "DELETE") => {
        setActionUser(user);
        setActionType(type);
        onOpen();
    };

    const confirmAction = async () => {
        if (!actionUser) return;

        if (actionType === "DELETE") {
            try {
                const res = await fetch(`/api/admin/users/${actionUser.id}`, { method: "DELETE" });
                if (res.ok) {
                    toast.success("ลบบัญชีสำเร็จ");
                    setUsers(prev => prev.filter(u => u.id !== actionUser.id));
                } else {
                    toast.error("เกิดข้อผิดพลาด");
                }
            } catch (error) {
                toast.error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
            }
        } else {
            let updateField = "";
            let updateValue = "";
            if (actionType === "BAN") { updateField = "status"; updateValue = "BANNED"; }
            else if (actionType === "UNBAN") { updateField = "status"; updateValue = "ACTIVE"; }
            else if (actionType === "MAKE_ADMIN") { updateField = "role"; updateValue = "ADMIN"; }
            else if (actionType === "DEMOTE") { updateField = "role"; updateValue = "USER"; }

            try {
                const res = await fetch(`/api/admin/users/${actionUser.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ [updateField]: updateValue })
                });
                if (res.ok) {
                    toast.success("อัปเดตข้อมูลสำเร็จ");
                    fetchUsers();
                } else {
                    toast.error("เกิดข้อผิดพลาด");
                }
            } catch (error) {
                toast.error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
            }
        }
    };

    const filteredUsers = users.filter((u) => {
        const text = (u.username + " " + u.name + " " + u.email).toLowerCase();
        return text.includes(searchTerm.toLowerCase());
    });
    return (
        <div className="flex flex-col gap-8">
            <Toaster position="bottom-right" />
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2 md:gap-3">
                        <IoShieldHalfOutline className="text-blue-500" />
                        Member & Moderation
                    </h1>
                    <p className="text-gray-500 text-xs md:text-sm mt-1">จัดการรายชื่อสมาชิก, สิทธิ์การใช้งานแอคเคาท์ (Role) และรายงานการประพฤติผิด</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button color="danger" variant="flat" className="font-bold text-[10px] uppercase tracking-widest w-full md:w-auto">
                        Review Reports (0)
                    </Button>
                </div>
            </header>

            <section>
                <Card className="bg-black/40 border border-white/10 shadow-xl overflow-hidden">
                    <CardHeader className="p-4 md:p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <h4 className="text-base md:text-lg font-bold text-white uppercase tracking-widest text-sm italic whitespace-nowrap">User Database</h4>
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-2 md:py-1.5 rounded-lg border border-white/10 w-full md:max-w-sm">
                            <IoSearchOutline className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by username, email..."
                                className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-gray-600"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardBody className="p-0 overflow-x-auto custom-scrollbar w-full">
                        <Table aria-label="Users Table" removeWrapper classNames={{ wrapper: "min-w-[700px]", th: "bg-white/5 text-gray-400 border-b border-white/5", td: "border-b border-white/5 py-4 whitespace-nowrap" }}>
                            <TableHeader>
                                <TableColumn>USER</TableColumn>
                                <TableColumn>ROLE</TableColumn>
                                <TableColumn>POSTS / COMMENTS</TableColumn>
                                <TableColumn>REPORTS</TableColumn>
                                <TableColumn align="center">ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody
                                items={filteredUsers}
                                isLoading={loading}
                                loadingContent={<Spinner color="primary" />}
                                emptyContent={loading ? " " : "ไม่พบรายชื่อสมาชิกที่ค้นหา"}
                            >
                                {(user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar src={user.image || ""} name={user.username?.[0] || user.name?.[0] || "U"} size="sm" />
                                                <div>
                                                    <p className="text-white font-bold text-sm">
                                                        {user.username || user.name || "Unknown"}
                                                        {user.status !== "ACTIVE" && <span className="text-danger ml-2 text-xs italic">({user.status})</span>}
                                                    </p>
                                                    <p className="text-gray-500 text-xs">{user.email || ""}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip color={user.role === "ADMIN" ? "secondary" : "default"} variant="flat" size="sm" className="font-bold">
                                                {user.role}
                                            </Chip>
                                        </TableCell>
                                        <TableCell><span className="text-gray-400 text-sm">{user._count.posts} / {user._count.comments}</span></TableCell>
                                        <TableCell><span className={user.reportCount > 5 ? "text-danger font-bold text-sm" : "text-gray-400 text-sm"}>{user.reportCount}</span></TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {user.status === "ACTIVE" ? (
                                                    <Button size="sm" className="w-24 text-[10px] font-bold bg-warning/20 text-warning" onPress={() => handleOpenModal(user, "BAN")}>BAN</Button>
                                                ) : (
                                                    <Button size="sm" className="w-24 text-[10px] font-bold bg-success/20 text-success" onPress={() => handleOpenModal(user, "UNBAN")}>UNBAN</Button>
                                                )}

                                                {user.role === "USER" ? (
                                                    <Button size="sm" className="w-24 text-[10px] font-bold bg-secondary/20 text-secondary" onPress={() => handleOpenModal(user, "MAKE_ADMIN")}>MAKE ADMIN</Button>
                                                ) : (
                                                    <Button size="sm" className="w-24 text-[10px] font-bold bg-white/10 text-white" onPress={() => handleOpenModal(user, "DEMOTE")}>DEMOTE</Button>
                                                )}
                                                <Button size="sm" className="w-24 text-[10px] font-bold bg-danger/20 text-danger" onPress={() => handleOpenModal(user, "DELETE")}>DEL ACC</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </section>

            {/* Modal for Confirmations */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" classNames={{
                base: "w-full max-w-[95vw] sm:max-w-md m-0 sm:m-auto"
            }}>
                <ModalContent className="bg-slate-900 border border-white/10 text-white">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">ยืนยันการดำเนินการ</ModalHeader>
                            <ModalBody>
                                <p>
                                    คุณแน่ใจหรือไม่ที่จะ
                                    <span className={`font-bold mx-2 ${actionType === 'DELETE' || actionType === 'BAN' ? 'text-danger' : 'text-primary'}`}>
                                        {actionType === "BAN" ? "แบนผู้ใช้นี้" : actionType === "UNBAN" ? "ปลดแบนผู้ใช้นี้" : actionType === "MAKE_ADMIN" ? "ตั้งสิทธิ์ผู้ใช้นี้เป็น Admin" : actionType === "DEMOTE" ? "ลดสิทธิ์เป็น User ปกติ" : "ลบแอดเคาท์นี้ทิ้งอย่างถาวร"}
                                    </span>
                                    ?
                                </p>
                                <p className="text-sm text-gray-400 mt-2">
                                    บัญชีผู้ใช้: <span className="text-white font-bold">{actionUser?.username || actionUser?.name || actionUser?.email}</span>
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>
                                    ยกเลิก
                                </Button>
                                <Button
                                    color={actionType === 'DELETE' || actionType === 'BAN' ? 'danger' : 'primary'}
                                    onPress={() => {
                                        confirmAction();
                                        onClose();
                                    }}
                                >
                                    ยืนยัน
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
