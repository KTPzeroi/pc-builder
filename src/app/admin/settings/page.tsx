"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Spinner } from "@heroui/react";
import { IoSettingsOutline, IoSaveOutline, IoWarningOutline } from "react-icons/io5";

export default function SystemConfigPage() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Config State — performance scoring now uses dynamic DB baselines with static weights.
    // Only forum policies are configurable here.
    const [config, setConfig] = useState({
        forum_rules: "1. กรุณาใช้คำสุภาพ\n2. ห้ามโพสต์สแปม\n3. เคารพความเห็นของผู้อื่น",
        forum_tags: "DISCUSSION, QUESTION, BUILD_ADVICE, NEWS_AND_RUMORS"
    });

    useEffect(() => {
        fetch("/api/admin/settings")
            .then(res => res.json())
            .then(data => {
                if (Object.keys(data).length > 0) {
                    setConfig(prev => ({ ...prev, ...data }));
                }
                setIsLoading(false);
            })
            .catch(console.error);
    }, []);

    const handleChange = (key: string, value: string) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async (onClose: () => void) => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
            });
            if (res.ok) {
                alert("บันทึกการตั้งค่าสำเร็จ!");
                onClose();
            } else {
                alert("Failed to save settings");
            }
        } catch (e) {
            console.error(e);
            alert("Error saving settings");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
    }

    return (
        <div className="flex flex-col gap-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2 md:gap-3">
                        <IoSettingsOutline className="text-blue-500" />
                        System Config
                    </h1>
                    <p className="text-gray-500 text-xs md:text-sm mt-1">จัดการกฎระเบียบ (Forum Policies) และหมวดหมู่ของบอร์ด</p>
                </div>
            </header>

            <section>
                <Card className="bg-black/40 border border-white/10 shadow-xl max-w-4xl">
                    <CardHeader className="p-6 border-b border-white/5 flex flex-col items-start gap-1">
                        <h4 className="text-lg font-bold text-white uppercase tracking-widest text-sm italic">Forum Policies</h4>
                        <p className="text-xs text-gray-400">จัดการกฎระเบียบและหมวดหมู่ของบอร์ดสนทนา</p>
                    </CardHeader>
                    <CardBody className="p-8 flex flex-col gap-6">
                        <div>
                            <h5 className="font-bold text-white mb-2">Forum Announcement &amp; Rules</h5>
                            <Textarea variant="bordered" minRows={4} value={config.forum_rules} onChange={(e) => handleChange("forum_rules", e.target.value)} />
                        </div>
                        <div>
                            <h5 className="font-bold text-white mb-2">Category Labels (Comma separated)</h5>
                            <Input variant="bordered" value={config.forum_tags} onChange={(e) => handleChange("forum_tags", e.target.value)} />
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button color="primary" className="font-bold px-8 shadow-lg shadow-blue-500/20" onPress={() => { onOpen(); }}>
                                <IoSaveOutline className="text-lg" />
                                Apply Changes
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </section>

            {/* Confirmation Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" classNames={{ base: "bg-slate-900 border border-white/10 text-white w-full max-w-[95vw] sm:max-w-md m-0 sm:m-auto" }}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 border-b border-white/10 p-6">
                                <h3 className="text-xl font-bold flex items-center gap-2 uppercase text-blue-500">
                                    <IoWarningOutline size={24} /> Confirm Policy Updates
                                </h3>
                            </ModalHeader>
                            <ModalBody className="p-6">
                                <p className="text-gray-300 font-medium text-lg">ยืนยันการอัปเดตกฎระเบียบของบอร์ด (Forum Policies/Tags) ใหม่?</p>
                            </ModalBody>
                            <ModalFooter className="border-t border-white/10 p-6">
                                <Button variant="light" onPress={onClose} className="font-bold" isDisabled={isSaving}>ยกเลิก</Button>
                                <Button color="primary" onPress={() => handleSave(onClose)} isLoading={isSaving} className="font-bold px-8 shadow-lg shadow-blue-500/30">
                                    ยืนยันและอัปเดตระบบ
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
