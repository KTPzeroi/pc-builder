"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardBody, CardHeader, Divider, Button, Input, Textarea, Tabs, Tab, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Spinner, Chip } from "@heroui/react";
import { IoSettingsOutline, IoSaveOutline, IoWarningOutline, IoCheckmarkCircleOutline, IoAlertCircleOutline } from "react-icons/io5";

export default function SystemConfigPage() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [modalType, setModalType] = useState<"system" | "rules">("system");
    
    // Config State
    const [config, setConfig] = useState({
        gaming_gpu_baseline: "25000",
        working_cpu_baseline: "4500", // Single Thread baseline
        creative_gpu_baseline: "35000",
        creative_cpu_baseline: "40000", // Multi Thread baseline
        // weights (gaming)
        w_gaming_gpu: "60",
        w_gaming_cpu: "30",
        w_gaming_ram: "10",
        // weights (working)
        w_working_cpu: "50",
        w_working_ram: "40",
        w_working_gpu: "10",
        // weights (creative)
        w_creative_cpu: "40",
        w_creative_gpu: "35",
        w_creative_ram: "15",
        w_creative_vram: "10",
        // rules
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

    // --- Weight Validation (Real-time) ---
    const gamingSum = useMemo(() => (parseInt(config.w_gaming_gpu) || 0) + (parseInt(config.w_gaming_cpu) || 0) + (parseInt(config.w_gaming_ram) || 0), [config.w_gaming_gpu, config.w_gaming_cpu, config.w_gaming_ram]);
    const workingSum = useMemo(() => (parseInt(config.w_working_cpu) || 0) + (parseInt(config.w_working_ram) || 0) + (parseInt(config.w_working_gpu) || 0), [config.w_working_cpu, config.w_working_ram, config.w_working_gpu]);
    const creativeSum = useMemo(() => (parseInt(config.w_creative_cpu) || 0) + (parseInt(config.w_creative_gpu) || 0) + (parseInt(config.w_creative_ram) || 0) + (parseInt(config.w_creative_vram) || 0), [config.w_creative_cpu, config.w_creative_gpu, config.w_creative_ram, config.w_creative_vram]);
    const allWeightsValid = gamingSum === 100 && workingSum === 100 && creativeSum === 100;

    const WeightBadge = ({ label, sum }: { label: string; sum: number }) => (
        <Chip
            startContent={sum === 100 ? <IoCheckmarkCircleOutline size={16} /> : <IoAlertCircleOutline size={16} />}
            color={sum === 100 ? "success" : "danger"}
            variant="flat"
            size="sm"
            className="font-bold"
        >
            {label}: {sum}%
        </Chip>
    );

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
                    <p className="text-gray-500 text-xs md:text-sm mt-1">ปรับแต่งเกณฑ์คะแนน (Baseline), น้ำหนักความสำคัญของสเปกคอม, หมวดหมู่ และกฎของบอร์ด</p>
                </div>
            </header>

            <section>
                <Tabs aria-label="Settings Options" color="primary" variant="underlined" classNames={{
                    tabList: "gap-8 border-b border-white/5 w-full",
                    tab: "h-12 font-bold px-0",
                    cursor: "bg-blue-500",
                    panel: "pt-8"
                }}>
                    <Tab key="baselines" title="PERFORMANCE BASELINES">
                        <Card className="bg-black/40 border border-white/10 shadow-xl max-w-4xl">
                            <CardHeader className="p-6 border-b border-white/5 flex flex-col items-start gap-1">
                                <h4 className="text-lg font-bold text-white uppercase tracking-widest text-sm italic">Metric Baselines</h4>
                                <p className="text-xs text-gray-400">กำหนดตัวเลข PassMark เริ่มต้นที่เป็นเกณฑ์คะแนน (100%) สำหรับการจัดสเปกแต่ละสายงาน</p>
                            </CardHeader>
                            <CardBody className="p-8 flex flex-col gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input type="number" label="Gaming Baseline Score (GPU G3D)" variant="faded"
                                        value={config.gaming_gpu_baseline} onChange={(e) => handleChange("gaming_gpu_baseline", e.target.value)} />
                                    <Input type="number" label="Working Baseline Score (CPU Single)" variant="faded"
                                        value={config.working_cpu_baseline} onChange={(e) => handleChange("working_cpu_baseline", e.target.value)} />
                                    <Input type="number" label="Creative Score (CPU Multi)" variant="faded"
                                        value={config.creative_cpu_baseline} onChange={(e) => handleChange("creative_cpu_baseline", e.target.value)} />
                                    <Input type="number" label="Creative Score (GPU G3D)" variant="faded"
                                        value={config.creative_gpu_baseline} onChange={(e) => handleChange("creative_gpu_baseline", e.target.value)} />
                                </div>
                                <div className="flex justify-end mt-4">
                                    <Button color="primary" className="font-bold px-8 shadow-lg shadow-blue-500/20" onPress={() => { setModalType("system"); onOpen(); }}>
                                        <IoSaveOutline className="text-lg" />
                                        Save Baselines
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>

                    <Tab key="weights" title="WEIGHTING CONFIG">
                        <Card className="bg-black/40 border border-white/10 shadow-xl max-w-4xl">
                            <CardHeader className="p-4 md:p-6 border-b border-white/5 flex flex-col items-start gap-1">
                                <h4 className="text-base md:text-lg font-bold text-white uppercase tracking-widest italic">Calculation Weights</h4>
                                <p className="text-xs text-gray-400">สัดส่วนเปอร์เซ็นต์ของฮาร์ดแวร์ในสมการประเมินความแรง (ถ้ารวมแล้วเกิน 100% ตัวกราฟจะเพี้ยน)</p>
                            </CardHeader>
                            <CardBody className="p-4 md:p-8 flex flex-col gap-8">
                                <div>
                                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                        <h5 className="font-bold text-blue-400 flex items-center gap-2">Gaming Weight %</h5>
                                        <WeightBadge label="Sum" sum={gamingSum} />
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                                        <Input type="number" label="GPU Weight" className="w-full" color={gamingSum !== 100 ? "danger" : "default"} value={config.w_gaming_gpu} onChange={(e) => handleChange("w_gaming_gpu", e.target.value)} />
                                        <Input type="number" label="CPU Weight" className="w-full" color={gamingSum !== 100 ? "danger" : "default"} value={config.w_gaming_cpu} onChange={(e) => handleChange("w_gaming_cpu", e.target.value)} />
                                        <Input type="number" label="RAM Weight" className="w-full" color={gamingSum !== 100 ? "danger" : "default"} value={config.w_gaming_ram} onChange={(e) => handleChange("w_gaming_ram", e.target.value)} />
                                    </div>
                                </div>
                                <Divider className="bg-white/5" />
                                <div>
                                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                        <h5 className="font-bold text-green-400 flex items-center gap-2">Working Weight %</h5>
                                        <WeightBadge label="Sum" sum={workingSum} />
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                                        <Input type="number" label="CPU Weight" className="w-full" color={workingSum !== 100 ? "danger" : "default"} value={config.w_working_cpu} onChange={(e) => handleChange("w_working_cpu", e.target.value)} />
                                        <Input type="number" label="RAM Weight" className="w-full" color={workingSum !== 100 ? "danger" : "default"} value={config.w_working_ram} onChange={(e) => handleChange("w_working_ram", e.target.value)} />
                                        <Input type="number" label="GPU Weight" className="w-full" color={workingSum !== 100 ? "danger" : "default"} value={config.w_working_gpu} onChange={(e) => handleChange("w_working_gpu", e.target.value)} />
                                    </div>
                                </div>
                                <Divider className="bg-white/5" />
                                <div>
                                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                        <h5 className="font-bold text-purple-400 flex items-center gap-2">Creative & Render Weight %</h5>
                                        <WeightBadge label="Sum" sum={creativeSum} />
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                                        <Input type="number" label="CPU Multi" className="w-full" color={creativeSum !== 100 ? "danger" : "default"} value={config.w_creative_cpu} onChange={(e) => handleChange("w_creative_cpu", e.target.value)} />
                                        <Input type="number" label="GPU" className="w-full" color={creativeSum !== 100 ? "danger" : "default"} value={config.w_creative_gpu} onChange={(e) => handleChange("w_creative_gpu", e.target.value)} />
                                        <Input type="number" label="RAM Cap" className="w-full" color={creativeSum !== 100 ? "danger" : "default"} value={config.w_creative_ram} onChange={(e) => handleChange("w_creative_ram", e.target.value)} />
                                        <Input type="number" label="VRAM" className="w-full" color={creativeSum !== 100 ? "danger" : "default"} value={config.w_creative_vram} onChange={(e) => handleChange("w_creative_vram", e.target.value)} />
                                    </div>
                                </div>

                                {/* Weight Validation Summary */}
                                {!allWeightsValid && (
                                    <div className="bg-danger/10 border border-danger/30 p-4 rounded-xl flex items-start gap-3">
                                        <IoAlertCircleOutline className="text-danger text-2xl flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-danger font-bold text-sm">ค่า Weight ไม่ถูกต้อง — ไม่สามารถบันทึกได้!</p>
                                            <p className="text-gray-400 text-xs mt-1">ทุกหมวดหมู่ต้องมีผลรวมเท่ากับ 100% พอดี กรุณาตรวจสอบและปรับเปลี่ยนค่าให้ถูกต้องก่อนบันทึก</p>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                <WeightBadge label="Gaming" sum={gamingSum} />
                                                <WeightBadge label="Working" sum={workingSum} />
                                                <WeightBadge label="Creative" sum={creativeSum} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end mt-4">
                                    <Button 
                                        color={allWeightsValid ? "primary" : "default"} 
                                        className={`font-bold px-8 w-full sm:w-auto ${allWeightsValid ? 'shadow-lg shadow-blue-500/20' : 'opacity-60 cursor-not-allowed'}`}
                                        isDisabled={!allWeightsValid}
                                        onPress={() => { setModalType("system"); onOpen(); }}
                                    >
                                        <IoSaveOutline className="text-lg" />
                                        {allWeightsValid ? "Save Weights" : "กรุณาปรับ Weight ให้ครบ 100%"}
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>

                    <Tab key="categories" title="CATEGORIES & RULES">
                        <Card className="bg-black/40 border border-white/10 shadow-xl max-w-4xl">
                            <CardHeader className="p-6 border-b border-white/5 flex flex-col items-start gap-1">
                                <h4 className="text-lg font-bold text-white uppercase tracking-widest text-sm italic">Forum Policies</h4>
                            </CardHeader>
                            <CardBody className="p-8 flex flex-col gap-6">
                                <div>
                                    <h5 className="font-bold text-white mb-2">Forum Announcement & Rules</h5>
                                    <Textarea variant="bordered" minRows={4} value={config.forum_rules} onChange={(e) => handleChange("forum_rules", e.target.value)} />
                                </div>
                                <div>
                                    <h5 className="font-bold text-white mb-2">Category Labels (Comma separated)</h5>
                                    <Input variant="bordered" value={config.forum_tags} onChange={(e) => handleChange("forum_tags", e.target.value)} />
                                </div>
                                <div className="flex justify-end mt-4">
                                    <Button color="primary" className="font-bold px-8 shadow-lg shadow-blue-500/20" onPress={() => { setModalType("rules"); onOpen(); }}>
                                        <IoSaveOutline className="text-lg" />
                                        Apply Changes
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>
                </Tabs>
            </section>

            {/* Confirmation Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" classNames={{ base: "bg-slate-900 border border-white/10 text-white w-full max-w-[95vw] sm:max-w-md m-0 sm:m-auto" }}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 border-b border-white/10 p-6">
                                <h3 className={`text-xl font-bold flex items-center gap-2 uppercase ${modalType === 'system' ? 'text-danger' : 'text-blue-500'}`}>
                                    <IoWarningOutline size={24} /> {modalType === 'system' ? 'Confirm System Updates' : 'Confirm Policy Updates'}
                                </h3>
                            </ModalHeader>
                            <ModalBody className="p-6">
                                {modalType === "system" ? (
                                    <>
                                        <p className="text-gray-300 font-medium">คุณกำลังจะทำการเปลี่ยนBaseline หรือ Weight สมการในระบบ</p>
                                        <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl mt-2">
                                            <p className="text-sm text-danger font-semibold">
                                                โปรดระวัง: การปรับเปลี่ยนตัวเลขเหล่านี้จะมีผลต่อ "เปอร์เซ็นต์คะแนน Benchmark" ในหน้าจัดสเปคทันที! อาจทำให้สเปกคอมที่เคยจัดไว้มีคะแนนเปลี่ยนไป
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-gray-300 font-medium text-lg">ยืนยันการอัปเดตกฎระเบียบของบอร์ด (Forum Policies/Tags) ใหม่?</p>
                                )}
                            </ModalBody>
                            <ModalFooter className="border-t border-white/10 p-6">
                                <Button variant="light" onPress={onClose} className="font-bold" isDisabled={isSaving}>ยกเลิก</Button>
                                <Button color={modalType === "system" ? "danger" : "primary"} onPress={() => handleSave(onClose)} isLoading={isSaving} className={`font-bold px-8 shadow-lg ${modalType === 'system' ? 'shadow-danger-500/30' : 'shadow-blue-500/30'}`}>
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
