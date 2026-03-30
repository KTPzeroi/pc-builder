"use client";

import React, { useState, useEffect } from "react";
import {
    Card, CardBody, CardHeader, Button, Input, Textarea, Select, SelectItem,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    useDisclosure, Spinner, Chip, Divider, Switch, Autocomplete, AutocompleteItem
} from "@heroui/react";
import {
    IoLayersOutline, IoAddCircleOutline, IoTrashOutline, IoCreateOutline,
    IoGameControllerOutline, IoBriefcaseOutline, IoColorPaletteOutline,
    IoCubeOutline, IoPricetagOutline, IoListOutline
} from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";

const USAGE_OPTIONS = [
    { label: "Gaming", value: "GAMING", icon: <IoGameControllerOutline className="text-blue-500" /> },
    { label: "Working", value: "WORKING", icon: <IoBriefcaseOutline className="text-green-500" /> },
    { label: "Creative & 3D", value: "CREATIVE", icon: <IoColorPaletteOutline className="text-purple-500" /> },
];

const BUDGET_OPTIONS = [
    { label: "Entry (< 15,000฿)", value: "ENTRY" },
    { label: "Mid (15,000 - 30,000฿)", value: "MID" },
    { label: "Hi-End (30,000 - 50,000฿)", value: "HIGHEND" },
    { label: "Ultra (50,000฿+)", value: "ULTRA" },
];

// mapping ชื่อหมวด Preset → type ใน DB
const PRESET_TYPE_MAP: Record<string, string> = {
    CPU: "CPU",
    GPU: "GPU",
    RAM: "RAM",
    Mainboard: "MB",
    Storage: "STORAGE",
    PSU: "PSU",
    Case: "CASE",
    Cooler: "COOLING",
};
const COMPONENT_TYPES = Object.keys(PRESET_TYPE_MAP);

interface PresetComponent {
    type: string;
    name: string;
    reason: string;
    price: number;
}

interface PresetBuild {
    id: string;
    name: string;
    usage: string;
    budget: string;
    description: string | null;
    components: PresetComponent[];
    totalPrice: number;
    isActive: boolean;
}

interface DBComponent {
    id: string;
    name: string;
    type: string;
    brand: string;
    price: number;
}

export default function AdminPresetsPage() {
    const [presets, setPresets] = useState<PresetBuild[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [editingPreset, setEditingPreset] = useState<PresetBuild | null>(null);

    // ข้อมูลอุปกรณ์จาก Database
    const [dbComponents, setDbComponents] = useState<DBComponent[]>([]);

    // Form state
    const [formName, setFormName] = useState("");
    const [formUsage, setFormUsage] = useState("GAMING");
    const [formBudget, setFormBudget] = useState("ENTRY");
    const [formDescription, setFormDescription] = useState("");
    const [formComponents, setFormComponents] = useState<PresetComponent[]>(
        COMPONENT_TYPES.map(t => ({ type: t, name: "", reason: "", price: 0 }))
    );
    const [isSaving, setIsSaving] = useState(false);

    const fetchPresets = async () => {
        try {
            const res = await fetch("/api/admin/presets?all=true");
            if (res.ok) {
                const data = await res.json();
                setPresets(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchComponents = async () => {
        try {
            const res = await fetch("/api/components");
            if (res.ok) {
                const data = await res.json();
                setDbComponents(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchPresets();
        fetchComponents();
    }, []);

    // กรองอุปกรณ์จาก DB ตาม type ของ preset
    const getComponentsForType = (presetType: string): DBComponent[] => {
        const dbType = PRESET_TYPE_MAP[presetType];
        if (!dbType) return [];
        return dbComponents.filter(c => c.type === dbType);
    };

    const handleOpenAdd = () => {
        setEditingPreset(null);
        setFormName("");
        setFormUsage("GAMING");
        setFormBudget("ENTRY");
        setFormDescription("");
        setFormComponents(COMPONENT_TYPES.map(t => ({ type: t, name: "", reason: "", price: 0 })));
        onOpen();
    };

    const handleOpenEdit = (preset: PresetBuild) => {
        setEditingPreset(preset);
        setFormName(preset.name);
        setFormUsage(preset.usage);
        setFormBudget(preset.budget);
        setFormDescription(preset.description || "");
        const merged = COMPONENT_TYPES.map(t => {
            const existing = (preset.components as PresetComponent[]).find(c => c.type === t);
            return existing || { type: t, name: "", reason: "", price: 0 };
        });
        setFormComponents(merged);
        onOpen();
    };

    const handleComponentChange = (index: number, field: keyof PresetComponent, value: string | number) => {
        setFormComponents(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    };

    // เมื่อเลือกอุปกรณ์จาก DB → auto-fill ชื่อ + ราคา
    const handleSelectDBComponent = (index: number, componentId: string) => {
        const comp = dbComponents.find(c => c.id === componentId);
        if (comp) {
            setFormComponents(prev => {
                const copy = [...prev];
                copy[index] = {
                    ...copy[index],
                    name: comp.name,
                    price: comp.price,
                };
                return copy;
            });
        }
    };

    const computedTotal = formComponents.reduce((sum, c) => sum + (Number(c.price) || 0), 0);

    const handleSave = async (onClose: () => void) => {
        if (!formName.trim()) { toast.error("กรุณากรอกชื่อ Preset"); return; }
        const filledComponents = formComponents.filter(c => c.name.trim() !== "");
        if (filledComponents.length === 0) { toast.error("กรุณาเลือกอุปกรณ์อย่างน้อย 1 ชิ้น"); return; }

        setIsSaving(true);
        try {
            const payload = {
                name: formName,
                usage: formUsage,
                budget: formBudget,
                description: formDescription || null,
                components: filledComponents,
                totalPrice: computedTotal,
            };

            const url = editingPreset ? `/api/admin/presets/${editingPreset.id}` : "/api/admin/presets";
            const method = editingPreset ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success(editingPreset ? "อัปเดต Preset สำเร็จ!" : "สร้าง Preset ใหม่สำเร็จ!");
                fetchPresets();
                onClose();
            } else {
                toast.error("เกิดข้อผิดพลาด");
            }
        } catch (e) {
            toast.error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("ยืนยันลบ Preset นี้?")) return;
        try {
            const res = await fetch(`/api/admin/presets/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("ลบ Preset สำเร็จ");
                setPresets(prev => prev.filter(p => p.id !== id));
            }
        } catch (e) {
            toast.error("เกิดข้อผิดพลาด");
        }
    };

    const handleToggleActive = async (preset: PresetBuild) => {
        try {
            const res = await fetch(`/api/admin/presets/${preset.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !preset.isActive }),
            });
            if (res.ok) {
                setPresets(prev => prev.map(p => p.id === preset.id ? { ...p, isActive: !p.isActive } : p));
                toast.success(preset.isActive ? "ปิดการแสดงผล Preset" : "เปิดการแสดงผล Preset");
            }
        } catch (e) {
            toast.error("เกิดข้อผิดพลาด");
        }
    };

    const getUsageIcon = (v: string) => USAGE_OPTIONS.find(o => o.value === v)?.icon;
    const getUsageLabel = (v: string) => USAGE_OPTIONS.find(o => o.value === v)?.label || v;
    const getBudgetLabel = (v: string) => BUDGET_OPTIONS.find(o => o.value === v)?.label || v;

    return (
        <div className="flex flex-col gap-8">
            <Toaster position="bottom-right" />
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2 md:gap-3">
                        <IoLayersOutline className="text-blue-500" />
                        สเปกแนะนำ (Presets)
                    </h1>
                    <p className="text-gray-500 text-xs md:text-sm mt-1">จัดการสเปกแนะนำสำหรับ Build Wizard — ผู้ใช้จะเห็น Preset ที่เปิดใช้งาน (Active) เท่านั้น</p>
                </div>
                <Button color="primary" variant="shadow" className="font-bold tracking-wide w-full sm:w-auto" startContent={<IoAddCircleOutline size={20} />} onPress={handleOpenAdd}>
                    เพิ่ม Preset ใหม่
                </Button>
            </header>

            {isLoading ? (
                <div className="py-20 flex justify-center items-center flex-col gap-4">
                    <Spinner size="lg" color="primary" />
                    <p className="text-gray-400 animate-pulse">กำลังโหลด...</p>
                </div>
            ) : presets.length === 0 ? (
                <Card className="bg-black/40 border border-white/10 shadow-xl">
                    <CardBody className="py-20 flex flex-col items-center gap-4 text-center">
                        <IoLayersOutline className="text-5xl text-gray-600" />
                        <p className="text-white font-bold">ยังไม่มี Preset สเปกแนะนำ</p>
                        <p className="text-gray-500 text-sm">กดปุ่ม "เพิ่ม Preset ใหม่" เพื่อสร้างสเปกแนะนำให้ผู้ใช้ในหน้า Build Wizard</p>
                    </CardBody>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {presets.map(preset => (
                        <Card key={preset.id} className={`bg-black/40 border shadow-xl transition-all ${preset.isActive ? 'border-blue-500/30' : 'border-white/10 opacity-60'}`}>
                            <CardHeader className="p-4 md:p-5 flex justify-between items-start gap-3 flex-wrap">
                                <div className="flex flex-col gap-2 flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-white font-bold text-base truncate">{preset.name}</h3>
                                        {!preset.isActive && <Chip size="sm" color="default" variant="flat">ซ่อนอยู่</Chip>}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        <Chip size="sm" color="primary" variant="flat" startContent={getUsageIcon(preset.usage)}>{getUsageLabel(preset.usage)}</Chip>
                                        <Chip size="sm" color="secondary" variant="flat">{getBudgetLabel(preset.budget)}</Chip>
                                        <Chip size="sm" color="success" variant="flat">฿{preset.totalPrice.toLocaleString()}</Chip>
                                    </div>
                                </div>
                                <Switch size="sm" isSelected={preset.isActive} onValueChange={() => handleToggleActive(preset)} />
                            </CardHeader>
                            <Divider className="bg-white/5" />
                            <CardBody className="p-4 md:p-5 flex flex-col gap-3">
                                {preset.description && <p className="text-gray-400 text-xs">{preset.description}</p>}
                                <div className="flex flex-col gap-1.5">
                                    {(preset.components as PresetComponent[]).map((c, i) => (
                                        <div key={i} className="flex items-baseline gap-2 text-xs">
                                            <span className="text-blue-400 font-bold uppercase w-20 flex-shrink-0">{c.type}</span>
                                            <span className="text-white truncate flex-1">{c.name}</span>
                                            <span className="text-gray-500 flex-shrink-0">฿{Number(c.price).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 mt-2 justify-end">
                                    <Button size="sm" variant="flat" color="primary" startContent={<IoCreateOutline />} onPress={() => handleOpenEdit(preset)}>แก้ไข</Button>
                                    <Button size="sm" variant="flat" color="danger" startContent={<IoTrashOutline />} onPress={() => handleDelete(preset.id)}>ลบ</Button>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal สร้าง/แก้ไข Preset */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl" scrollBehavior="inside" classNames={{
                base: "bg-slate-900 border border-white/10 text-white w-full max-w-[95vw] md:max-w-4xl m-0 sm:m-auto",
                header: "border-b border-white/5 py-4 px-4 md:px-6",
                body: "py-6 px-4 md:px-6",
                footer: "border-t border-white/5 py-4 px-4 md:px-6",
            }}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex items-center gap-2">
                                {editingPreset
                                    ? <><IoCreateOutline className="text-blue-500" /> <span className="text-xl font-bold">แก้ไข Preset</span></>
                                    : <><IoAddCircleOutline className="text-blue-500" /> <span className="text-xl font-bold">สร้าง Preset สเปกแนะนำ</span></>
                                }
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-6">
                                    {/* ข้อมูลหลัก */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input label="ชื่อ Preset" placeholder='เช่น "สเปกเล่นเกม งบ 15,000"' value={formName} onChange={(e) => setFormName(e.target.value)} variant="faded" isRequired />
                                        <Textarea label="คำอธิบาย (ไม่บังคับ)" placeholder="อธิบายสั้นๆ ว่า Preset นี้เหมาะกับใคร" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} variant="faded" minRows={1} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Select label="ประเภทการใช้งาน" variant="faded" selectedKeys={new Set([formUsage])} onSelectionChange={(keys) => setFormUsage(Array.from(keys)[0] as string)}>
                                            {USAGE_OPTIONS.map(o => <SelectItem key={o.value}>{o.label}</SelectItem>)}
                                        </Select>
                                        <Select label="ระดับงบประมาณ" variant="faded" selectedKeys={new Set([formBudget])} onSelectionChange={(keys) => setFormBudget(Array.from(keys)[0] as string)}>
                                            {BUDGET_OPTIONS.map(o => <SelectItem key={o.value}>{o.label}</SelectItem>)}
                                        </Select>
                                    </div>

                                    <Divider className="bg-white/5" />

                                    {/* รายการอุปกรณ์ — ดึงจาก Database */}
                                    <div>
                                        <h4 className="font-bold text-white mb-1 flex items-center gap-2">
                                            <IoCubeOutline className="text-blue-500" />
                                            รายการอุปกรณ์แนะนำ
                                        </h4>
                                        <p className="text-gray-500 text-xs mb-4">เลือกจากอุปกรณ์ที่มีใน Database หรือพิมพ์ชื่อเองก็ได้ (ข้ามได้ถ้าไม่มีชิ้นนั้น)</p>
                                        <div className="flex flex-col gap-4">
                                            {formComponents.map((comp, i) => {
                                                const options = getComponentsForType(comp.type);
                                                return (
                                                    <div key={comp.type} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                        <p className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-3">{comp.type}</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                            {/* เลือกจาก DB หรือพิมพ์เอง */}
                                                            {options.length > 0 ? (
                                                                <Select
                                                                    size="md"
                                                                    label="เลือกอุปกรณ์"
                                                                    placeholder="เลือกจากรายการ"
                                                                    variant="faded"
                                                                    labelPlacement="outside"
                                                                    classNames={{
                                                                        value: "truncate text-ellipsis",
                                                                        innerWrapper: "overflow-hidden"
                                                                    }}
                                                                    selectedKeys={comp.name ? new Set([
                                                                        options.find(o => o.name === comp.name)?.id || ""
                                                                    ].filter(Boolean)) : new Set([])}
                                                                    onSelectionChange={(keys) => {
                                                                        const selectedId = Array.from(keys)[0] as string;
                                                                        if (selectedId) handleSelectDBComponent(i, selectedId);
                                                                    }}
                                                                >
                                                                    {options.map(o => (
                                                                        <SelectItem key={o.id} textValue={o.name}>
                                                                            <div className="flex justify-between items-center w-full">
                                                                                <span className="truncate max-w-[150px] sm:max-w-[180px]">{o.name}</span>
                                                                                <span className="text-gray-500 text-xs ml-2">฿{o.price.toLocaleString()}</span>
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))}
                                                                </Select>
                                                            ) : (
                                                                <Input size="md" label="ชื่อรุ่น" placeholder="พิมพ์ชื่อเอง" value={comp.name} onChange={(e) => handleComponentChange(i, "name", e.target.value)} />
                                                            )}
                                                            <Input size="md" label="เหตุผลที่แนะนำ" placeholder="เล่นเกมลื่น ราคาคุ้ม" value={comp.reason} onChange={(e) => handleComponentChange(i, "reason", e.target.value)} />
                                                            <Input size="md" label="ราคา (บาท)" type="number" placeholder="0" value={String(comp.price || "")} onChange={(e) => handleComponentChange(i, "price", parseInt(e.target.value) || 0)} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* ราคารวม */}
                                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex justify-between items-center">
                                        <span className="text-blue-400 font-bold text-sm flex items-center gap-2">
                                            <IoPricetagOutline />
                                            ราคารวมประมาณ
                                        </span>
                                        <span className="text-white font-bold text-xl">฿{computedTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose} isDisabled={isSaving}>ยกเลิก</Button>
                                <Button color="primary" className="font-bold px-8 shadow-lg shadow-blue-500/20" onPress={() => handleSave(onClose)} isLoading={isSaving}>
                                    {editingPreset ? "อัปเดต Preset" : "สร้าง Preset"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
