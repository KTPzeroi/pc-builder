"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Card, CardBody, CardHeader, Button, Input, Select, SelectItem,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner,
    Chip,
    Tooltip, addToast, ScrollShadow
} from "@heroui/react";
import { IoCubeOutline, IoAddCircleOutline, IoPencil, IoTrash, IoSearch, IoCloudUploadOutline, IoImageOutline, IoLinkOutline, IoWarningOutline, IoDocumentTextOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline } from "react-icons/io5";
import Papa from "papaparse";

type ComponentData = {
    id: string;
    name: string;
    type: string;
    brand: string;
    price: number;
    image?: string | null;
    socket?: string | null;
    ramType?: string | null;
    formFactor?: string | null;
    capacity?: number | null;
    cpuSingleScore?: number | null;
    cpuMultiScore?: number | null;
    gpuScore?: number | null;
    vramGb?: number | null;
    ramSpeed?: number | null;
    readSpeed?: number | null;
    writeSpeed?: number | null;
    tdp?: number | null;
    lengthMm?: number | null;
    maxGpuLength?: number | null;
    maxCoolerHeight?: number | null;
    supportedMobo?: string | null;
    psuFormFactor?: string | null;
    createdAt?: string;
    description?: string | null;
    chipset?: string | null;
    coolingType?: string | null;
};

const TYPE_OPTIONS = [
    { label: "CPU", value: "CPU" },
    { label: "GPU", value: "GPU" },
    { label: "RAM", value: "RAM" },
    { label: "Motherboard (MB)", value: "MB" },
    { label: "Storage (SSD/HDD)", value: "STORAGE" },
    { label: "Power Supply (PSU)", value: "PSU" },
    { label: "Case", value: "CASE" },
    { label: "Cooling", value: "COOLING" }
];

export default function InventoryCRUDPage() {
    const [components, setComponents] = useState<ComponentData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("ALL");

    // Modal State
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [modalMode, setModalMode] = useState<"ADD" | "EDIT" | "IMPORT_EDIT">("ADD");
    const [importEditIndex, setImportEditIndex] = useState<number | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageMode, setImageMode] = useState<"FILE" | "URL">("FILE");

    // Delete Modal State
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();
    const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // CSV Import State
    const csvInputRef = useRef<HTMLInputElement>(null);
    const [importType, setImportType] = useState<string>("");
    const [importList, setImportList] = useState<(Partial<ComponentData> & { isReady: boolean })[]>([]);
    const { isOpen: isStagingOpen, onOpen: onStagingOpen, onOpenChange: onStagingOpenChange } = useDisclosure();
    const [isBulkSaving, setIsBulkSaving] = useState(false);

    // Form Data
    const [formData, setFormData] = useState<Partial<ComponentData>>({
        name: "",
        type: "CPU",
        brand: "",
        price: 0,
        image: "",
        description: "",
        // optional fields
        socket: "", ramType: "", formFactor: "", capacity: undefined,
        cpuSingleScore: undefined, cpuMultiScore: undefined, gpuScore: undefined,
        vramGb: undefined, ramSpeed: undefined, readSpeed: undefined, writeSpeed: undefined,
        tdp: undefined, lengthMm: undefined, maxGpuLength: undefined,
        maxCoolerHeight: undefined, supportedMobo: "", psuFormFactor: "", chipset: "", coolingType: ""
    });

    useEffect(() => {
        fetchComponents();
    }, []);

    const fetchComponents = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/components");
            if (res.ok) {
                const data = await res.json();
                setComponents(data);
            }
        } catch (error) {
            console.error("Error fetching components", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setModalMode("ADD");
        setFormData({
            name: "", type: "CPU", brand: "", price: 0, image: "", description: "",
            socket: "", ramType: "", formFactor: "", capacity: undefined,
            cpuSingleScore: undefined, cpuMultiScore: undefined, gpuScore: undefined,
            vramGb: undefined, ramSpeed: undefined, readSpeed: undefined, writeSpeed: undefined,
            tdp: undefined, lengthMm: undefined, maxGpuLength: undefined,
            maxCoolerHeight: undefined, supportedMobo: "", psuFormFactor: "", chipset: "", coolingType: ""
        });
        setImageFile(null);
        setImagePreview(null);
        setImageMode("FILE");
        onOpen();
    };

    const handleOpenEditModal = (comp: ComponentData) => {
        setModalMode("EDIT");
        setSelectedId(comp.id);
        setFormData({
            name: comp.name, type: comp.type, brand: comp.brand, price: comp.price, image: comp.image, description: comp.description || "",
            socket: comp.socket || "", ramType: comp.ramType || "", formFactor: comp.formFactor || "",
            capacity: comp.capacity || undefined, cpuSingleScore: comp.cpuSingleScore || undefined,
            cpuMultiScore: comp.cpuMultiScore || undefined, gpuScore: comp.gpuScore || undefined,
            vramGb: comp.vramGb || undefined, ramSpeed: comp.ramSpeed || undefined,
            readSpeed: comp.readSpeed || undefined, writeSpeed: comp.writeSpeed || undefined,
            tdp: comp.tdp || undefined, lengthMm: comp.lengthMm || undefined,
            maxGpuLength: comp.maxGpuLength || undefined, maxCoolerHeight: comp.maxCoolerHeight || undefined,
            supportedMobo: comp.supportedMobo || "", psuFormFactor: comp.psuFormFactor || "",
            chipset: comp.chipset || "", coolingType: comp.coolingType || ""
        });
        setImageFile(null);
        setImagePreview(comp.image || null);
        setImageMode(comp.image ? "URL" : "FILE");
        onOpen();
    };

    const triggerDelete = (item: { id: string, name: string }) => {
        setItemToDelete(item);
        onDeleteOpen();
    };

    const confirmDelete = async (onClose: () => void) => {
        if (!itemToDelete) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/components/${itemToDelete.id}`, { method: "DELETE" });
            if (res.ok) {
                fetchComponents();
                onClose();
            } else {
                alert("เกิดข้อผิดพลาดในการลบข้อมูล");
            }
        } catch (error) {
            console.error("Error deleting", error);
            alert("เกิดข้อผิดพลาดในการลบข้อมูล");
        } finally {
            setIsDeleting(false);
            setItemToDelete(null);
        }
    };

    // === CSV Import Handlers ===
    const handleCsvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !importType) return;
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const rows = results.data as Record<string, any>[];
                const mapped = rows.map(row => ({
                    ...row,
                    type: importType, // force inject type
                    price: row.price ? parseFloat(row.price) : 0,
                    capacity: row.capacity ? parseInt(row.capacity) : undefined,
                    cpuSingleScore: row.cpuSingleScore ? parseInt(row.cpuSingleScore) : undefined,
                    cpuMultiScore: row.cpuMultiScore ? parseInt(row.cpuMultiScore) : undefined,
                    gpuScore: row.gpuScore ? parseInt(row.gpuScore) : undefined,
                    vramGb: row.vramGb ? parseInt(row.vramGb) : undefined,
                    ramSpeed: row.ramSpeed ? parseInt(row.ramSpeed) : undefined,
                    readSpeed: row.readSpeed ? parseInt(row.readSpeed) : undefined,
                    writeSpeed: row.writeSpeed ? parseInt(row.writeSpeed) : undefined,
                    tdp: row.tdp ? parseInt(row.tdp) : undefined,
                    lengthMm: row.lengthMm ? parseInt(row.lengthMm) : undefined,
                    maxGpuLength: row.maxGpuLength ? parseInt(row.maxGpuLength) : undefined,
                    maxCoolerHeight: row.maxCoolerHeight ? parseInt(row.maxCoolerHeight) : undefined,
                    chipset: row.chipset || "",
                    coolingType: row.coolingType || "",
                    isReady: false,
                }));
                setImportList(mapped);
                onStagingOpen();
            },
            error: (err) => {
                addToast({ title: `CSV Error: ${err.message}`, color: "danger" });
            }
        });
        // Reset file input so same file can be re-selected
        e.target.value = "";
    };

    const validateImportRow = (row: Partial<ComponentData> & { isReady: boolean }): string[] => {
        const missing: string[] = [];
        if (!row.name) missing.push("name");
        if (!row.brand) missing.push("brand");
        if (!row.price || row.price <= 0) missing.push("price");
        const t = row.type;
        if (t === "CPU") {
            if (!row.socket) missing.push("socket");
            if (!row.cpuSingleScore) missing.push("cpuSingleScore");
            if (!row.cpuMultiScore) missing.push("cpuMultiScore");
        }
        if (t === "GPU") {
            if (!row.vramGb) missing.push("vramGb");
            if (!row.gpuScore) missing.push("gpuScore");
        }
        if (t === "RAM") {
            if (!row.ramType) missing.push("ramType");
            if (!row.capacity) missing.push("capacity");
            if (!row.ramSpeed) missing.push("ramSpeed");
        }
        if (t === "MB") {
            if (!row.socket) missing.push("socket");
            if (!row.ramType) missing.push("ramType");
            if (!row.formFactor) missing.push("formFactor");
        }
        if (t === "STORAGE") {
            if (!row.capacity) missing.push("capacity");
            if (!row.readSpeed) missing.push("readSpeed");
            if (!row.writeSpeed) missing.push("writeSpeed");
        }
        if (t === "COOLING") {
            if (!row.coolingType) missing.push("coolingType");
        }
        return missing;
    };

    const handleVerifyRow = (idx: number) => {
        const row = importList[idx];
        const missing = validateImportRow(row);
        if (missing.length > 0) {
            addToast({ title: `ข้อมูลไม่ครบ: ${missing.join(", ")}`, color: "danger" });
            return;
        }
        setImportList(prev => prev.map((r, i) => i === idx ? { ...r, isReady: true } : r));
        addToast({ title: `"${row.name}" ผ่านการตรวจสอบแล้ว ✓`, color: "success" });
    };

    const handleEditImportRow = (idx: number) => {
        const row = importList[idx];
        setModalMode("IMPORT_EDIT");
        setImportEditIndex(idx);
        setFormData({ ...row });
        setImageFile(null);
        setImagePreview(row.image || null);
        setImageMode(row.image ? "URL" : "FILE");
        onOpen();
    };

    const handleBulkSubmit = async () => {
        if (importList.some(r => !r.isReady)) {
            addToast({ title: "กรุณา Verify ทุกรายการก่อน", color: "danger" });
            return;
        }
        setIsBulkSaving(true);
        try {
            // Clean up isReady field before sending
            const items = importList.map(({ isReady, ...rest }) => rest);
            const res = await fetch("/api/admin/components", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bulk: true, items })
            });
            if (res.ok) {
                const data = await res.json();
                addToast({ title: `นำเข้าสำเร็จ ${data.count} รายการ!`, color: "success" });
                setImportList([]);
                onStagingOpenChange();
                fetchComponents();
            } else {
                const err = await res.json();
                addToast({ title: err.error || "เกิดข้อผิดพลาด", color: "danger" });
            }
        } catch (e) {
            addToast({ title: "เกิดข้อผิดพลาดในการนำเข้าข้อมูล", color: "danger" });
        } finally {
            setIsBulkSaving(false);
        }
    };

    const handleSave = async (onClose: () => void) => {
        if (!formData.name || !formData.brand || formData.price === undefined || formData.price < 0) {
            alert("กรุณากรอกข้อมูลพื้นฐานให้ครบถ้วนและถูกต้อง (ชื่อ, แบรนด์, ราคาขั้นต่ำ 0)");
            return;
        }

        // IMPORT_EDIT mode: update the importList state instead of calling API
        if (modalMode === "IMPORT_EDIT" && importEditIndex !== null) {
            // อัปโหลดรูปภาพไป Cloudinary ก่อน (ถ้ามีไฟล์ใหม่)
            let importImageUrl = formData.image || null;
            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append("files", imageFile);
                try {
                    const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadFormData });
                    if (uploadRes.ok) {
                        const uploadData = await uploadRes.json();
                        importImageUrl = uploadData.urls?.[0] || null;
                    } else {
                        addToast({ title: "อัปโหลดรูปไม่สำเร็จ", color: "danger" });
                        return;
                    }
                } catch {
                    addToast({ title: "เกิดข้อผิดพลาดในการอัปโหลดรูป", color: "danger" });
                    return;
                }
            }
            setImportList(prev => prev.map((r, i) => i === importEditIndex ? { ...formData, image: importImageUrl, isReady: false } : r));
            addToast({ title: "อัปเดตข้อมูลในรายการนำเข้าแล้ว (ยังไม่ได้ Verify)", color: "warning" });
            onClose();
            return;
        }

        setIsSaving(true);
        try {
            const url = modalMode === "ADD" ? "/api/admin/components" : `/api/admin/components/${selectedId}`;
            const method = modalMode === "ADD" ? "POST" : "PUT";

            // อัปโหลดไฟล์รูปภาพไปยัง Cloudinary ก่อน (ถ้ามี)
            let finalImageUrl = formData.image || null;
            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append("files", imageFile);
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: uploadFormData,
                });
                if (!uploadRes.ok) {
                    alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
                    setIsSaving(false);
                    return;
                }
                const uploadData = await uploadRes.json();
                finalImageUrl = uploadData.urls?.[0] || null;
            }

            // สกัดค่าที่กรอกมาจัดการเป็น null กรณีว่าง
            let pCapacity = formData.capacity ? parseInt(String(formData.capacity)) : null;
            let pSingle = formData.cpuSingleScore ? parseInt(String(formData.cpuSingleScore)) : null;
            let pMulti = formData.cpuMultiScore ? parseInt(String(formData.cpuMultiScore)) : null;
            let pGpu = formData.gpuScore ? parseInt(String(formData.gpuScore)) : null;
            let pVram = formData.vramGb ? parseInt(String(formData.vramGb)) : null;
            let pRamSpd = formData.ramSpeed ? parseInt(String(formData.ramSpeed)) : null;
            let pReadSpd = formData.readSpeed ? parseInt(String(formData.readSpeed)) : null;
            let pWriteSpd = formData.writeSpeed ? parseInt(String(formData.writeSpeed)) : null;
            let pTdp = formData.tdp ? parseInt(String(formData.tdp)) : null;
            let pLengthMm = formData.lengthMm ? parseInt(String(formData.lengthMm)) : null;
            let pMaxGpuLen = formData.maxGpuLength ? parseInt(String(formData.maxGpuLength)) : null;
            let pMaxCoolerH = formData.maxCoolerHeight ? parseInt(String(formData.maxCoolerHeight)) : null;

            // ตรวจสอบความถูกต้องของคะแนนตามหมวดหมู่
            if (formData.type === "CPU" && (!formData.socket || !pSingle || !pMulti)) {
                return alert("กรุณากรอก Socket และคะแนน CPU (Single/Multi) ให้ครบถ้วน");
            }
            if (formData.type === "GPU" && (!pVram || !pGpu)) {
                return alert("กรุณากรอก VRAM และ GPU Score ให้ครบถ้วน");
            }
            if (formData.type === "RAM" && (!formData.ramType || !pCapacity || !pRamSpd)) {
                return alert("กรุณากรอกข้อมูล RAM (Type, Capacity, Speed) ให้ครบถ้วน");
            }
            if (formData.type === "MB" && (!formData.socket || !formData.ramType || !formData.formFactor)) {
                return alert("กรุณากรอก Socket, RAM Type และ Form Factor ให้ครบถ้วน");
            }
            if (formData.type === "STORAGE" && (!pCapacity || !pReadSpd || !pWriteSpd)) {
                return alert("กรุณากรอกความจุ (Capacity) และ Read/Write Speed ให้ครบถ้วน");
            }

            // กรองขยะ (Sanitization): ให้เหลือเฉพาะฟิลด์ของ Type นั้นเท่านั้น ฟิลด์อื่นบังคับ null ทิ้ง
            const type = formData.type;
            const payload = {
                name: formData.name,
                type: formData.type,
                brand: formData.brand,
                price: parseFloat(String(formData.price)),
                image: finalImageUrl,
                description: formData.description || null,

                // Allow only type-specific fields
                socket: ["CPU", "MB"].includes(type || "") ? (formData.socket || null) : null,
                ramType: ["RAM", "MB"].includes(type || "") ? (formData.ramType || null) : null,
                formFactor: ["MB", "CASE"].includes(type || "") ? (formData.formFactor || null) : null,
                capacity: ["RAM", "STORAGE", "PSU"].includes(type || "") ? pCapacity : null,
                cpuSingleScore: type === "CPU" ? pSingle : null,
                cpuMultiScore: type === "CPU" ? pMulti : null,
                gpuScore: type === "GPU" ? pGpu : null,
                vramGb: type === "GPU" ? pVram : null,
                ramSpeed: type === "RAM" ? pRamSpd : null,
                readSpeed: type === "STORAGE" ? pReadSpd : null,
                writeSpeed: type === "STORAGE" ? pWriteSpd : null,
                tdp: ["CPU", "GPU"].includes(type || "") ? pTdp : null,
                lengthMm: ["GPU", "COOLING"].includes(type || "") ? pLengthMm : null,
                maxGpuLength: type === "CASE" ? pMaxGpuLen : null,
                maxCoolerHeight: type === "CASE" ? pMaxCoolerH : null,
                supportedMobo: type === "CASE" ? (formData.supportedMobo || null) : null,
                psuFormFactor: type === "PSU" ? (formData.psuFormFactor || null) : null,
                chipset: ["CPU", "GPU", "MB"].includes(type || "") ? (formData.chipset || null) : null,
                coolingType: type === "COOLING" ? (formData.coolingType || null) : null,
            };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                fetchComponents();
                onClose();
            } else {
                const data = await res.json();
                alert(data.error || "เกิดข้อผิดพลาดในการบันทึก");
            }
        } catch (error) {
            console.error(error);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCloneSpecs = (compId: string) => {
        const source = components.find(c => c.id === compId);
        if (!source) return;
        setFormData(prev => ({
            ...prev,
            // คัดลอกเฉพาะสเปคเชิงลึก (ไม่ทับชื่อ แบรนด์ ราคา รูปภาพ)
            socket: source.socket || "",
            ramType: source.ramType || "",
            formFactor: source.formFactor || "",
            capacity: source.capacity || undefined,
            cpuSingleScore: source.cpuSingleScore || undefined,
            cpuMultiScore: source.cpuMultiScore || undefined,
            gpuScore: source.gpuScore || undefined,
            vramGb: source.vramGb || undefined,
            ramSpeed: source.ramSpeed || undefined,
            readSpeed: source.readSpeed || undefined,
            writeSpeed: source.writeSpeed || undefined,
            tdp: source.tdp || undefined,
            lengthMm: source.lengthMm || undefined,
            maxGpuLength: source.maxGpuLength || undefined,
            maxCoolerHeight: source.maxCoolerHeight || undefined,
            supportedMobo: source.supportedMobo || "",
            psuFormFactor: source.psuFormFactor || "",
            chipset: source.chipset || "",
            coolingType: source.coolingType || "",
            description: prev.description || source.description || "",
        }));
    };

    // Filter Logic
    const filteredComponents = components.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.brand.toLowerCase().includes(searchQuery.toLowerCase());
        const matchType = filterType === "ALL" || c.type === filterType;
        return matchSearch && matchType;
    });

    const renderDynamicFields = () => {
        const type = formData.type;
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="col-span-full">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest border-b border-blue-400/30 pb-2 mb-2">
                        {type} Specific Fields (ความเข้ากันได้ & ประสิทธิภาพ)
                    </h3>
                </div>

                {/* Compatibility: Socket */}
                {["CPU", "MB"].includes(type || "") && (
                    <Input label="Socket" placeholder="e.g. LGA1700, AM5" variant="bordered"
                        value={formData.socket || ""} onChange={e => setFormData({ ...formData, socket: e.target.value })} />
                )}

                {/* Compatibility: RAM Type */}
                {["RAM", "MB"].includes(type || "") && (
                    <Input label="RAM Type" placeholder="e.g. DDR4, DDR5" variant="bordered"
                        value={formData.ramType || ""} onChange={e => setFormData({ ...formData, ramType: e.target.value })} />
                )}

                {/* Compatibility: Form Factor */}
                {["MB", "CASE"].includes(type || "") && (
                    <Input label="Form Factor" placeholder="e.g. ATX, mATX, ITX" variant="bordered"
                        value={formData.formFactor || ""} onChange={e => setFormData({ ...formData, formFactor: e.target.value })} />
                )}

                {/* Capacity */}
                {["RAM", "STORAGE", "PSU"].includes(type || "") && (
                    <Input label={type === "PSU" ? "Capacity (Watt)" : "Capacity (GB)"} type="number" variant="bordered"
                        value={formData.capacity?.toString() || ""} onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })} />
                )}

                {/* GPU VRAM */}
                {type === "GPU" && (
                    <Input label="VRAM (GB)" type="number" variant="bordered"
                        value={formData.vramGb?.toString() || ""} onChange={e => setFormData({ ...formData, vramGb: Number(e.target.value) })} />
                )}

                {/* Performance: CPU */}
                {type === "CPU" && (
                    <>
                        <Input label="CPU Single Score" type="number" variant="bordered"
                            value={formData.cpuSingleScore?.toString() || ""} onChange={e => setFormData({ ...formData, cpuSingleScore: Number(e.target.value) })} />
                        <Input label="CPU Multi Score" type="number" variant="bordered"
                            value={formData.cpuMultiScore?.toString() || ""} onChange={e => setFormData({ ...formData, cpuMultiScore: Number(e.target.value) })} />
                    </>
                )}

                {/* Performance: GPU */}
                {type === "GPU" && (
                    <Input label="GPU Score (G3D Mark)" type="number" variant="bordered"
                        value={formData.gpuScore?.toString() || ""} onChange={e => setFormData({ ...formData, gpuScore: Number(e.target.value) })} />
                )}

                {/* Performance: RAM */}
                {type === "RAM" && (
                    <Input label="RAM Speed (MHz)" placeholder="e.g. 3200, 6000" type="number" variant="bordered"
                        value={formData.ramSpeed?.toString() || ""} onChange={e => setFormData({ ...formData, ramSpeed: Number(e.target.value) })} />
                )}

                {/* Performance: Storage */}
                {type === "STORAGE" && (
                    <>
                        <Input label="Read Speed (MB/s)" type="number" variant="bordered"
                            value={formData.readSpeed?.toString() || ""} onChange={e => setFormData({ ...formData, readSpeed: Number(e.target.value) })} />
                        <Input label="Write Speed (MB/s)" type="number" variant="bordered"
                            value={formData.writeSpeed?.toString() || ""} onChange={e => setFormData({ ...formData, writeSpeed: Number(e.target.value) })} />
                    </>
                )}

                {/* === NEW: Compatibility Fields === */}

                {/* Chipset (NVIDIA, AMD, Intel B650, Z790, etc.) */}
                {["GPU", "MB"].includes(type || "") && (
                    <Input label="Chipset" placeholder="e.g. NVIDIA, AMD, B650, Z790" variant="bordered"
                        value={formData.chipset || ""} onChange={e => setFormData({ ...formData, chipset: e.target.value })} />
                )}

                {/* TDP (Power Consumption) */}
                {["CPU", "GPU"].includes(type || "") && (
                    <Input label="TDP / การกินไฟ (Watt)" placeholder="e.g. 65, 200, 285" type="number" variant="bordered"
                        description="ดูได้จาก Passmark หรือสเปคผู้ผลิต"
                        value={formData.tdp?.toString() || ""} onChange={e => setFormData({ ...formData, tdp: Number(e.target.value) })} />
                )}

                {/* Physical Length (GPU, Cooling) */}
                {["GPU", "COOLING"].includes(type || "") && (
                    <Input label={type === "GPU" ? "ความยาวการ์ดจอ (mm)" : "ความสูง/ความยาวพัดลม (mm)"}
                        placeholder="e.g. 342" type="number" variant="bordered"
                        description="ค่า Length ความยาวของการ์ดจอ"
                        value={formData.lengthMm?.toString() || ""} onChange={e => setFormData({ ...formData, lengthMm: Number(e.target.value) })} />
                )}

                {/* Case-specific fields */}
                {type === "CASE" && (
                    <>
                        <Input label="Max GPU Length (mm)" placeholder="e.g. 360" type="number" variant="bordered"
                            description="ความยาวการ์ดจอสูงสุดที่เคสรองรับ"
                            value={formData.maxGpuLength?.toString() || ""} onChange={e => setFormData({ ...formData, maxGpuLength: Number(e.target.value) })} />
                        <Input label="Max CPU Cooler Height (mm)" placeholder="e.g. 160" type="number" variant="bordered"
                            description="ความสูงซิงก์พัดลม CPU สูงสุดที่ใส่ได้"
                            value={formData.maxCoolerHeight?.toString() || ""} onChange={e => setFormData({ ...formData, maxCoolerHeight: Number(e.target.value) })} />
                        <Input label="Supported Motherboard Sizes" placeholder="e.g. ATX, Micro-ATX, Mini-ITX" variant="bordered"
                            description="ระบุไซส์เมนบอร์ดที่รองรับ (คั่นด้วยคอมม่า)"
                            value={formData.supportedMobo || ""} onChange={e => setFormData({ ...formData, supportedMobo: e.target.value })} />
                    </>
                )}

                {/* PSU Form Factor */}
                {type === "PSU" && (
                    <Input label="PSU Form Factor" placeholder="e.g. ATX, SFX" variant="bordered"
                        description="รูปแบบขนาดของ PSU"
                        value={formData.psuFormFactor || ""} onChange={e => setFormData({ ...formData, psuFormFactor: e.target.value })} />
                )}

                {/* Cooling Type */}
                {type === "COOLING" && (
                    <Select label="Cooling Type" placeholder="เลือกประเภทชุดระบายความร้อน" variant="bordered"
                        selectedKeys={formData.coolingType ? new Set([formData.coolingType]) : new Set()}
                        onSelectionChange={(k) => setFormData({ ...formData, coolingType: Array.from(k)[0] as string })}>
                        <SelectItem key="Air Cooler">Air Cooler (ซิงค์ลม)</SelectItem>
                        <SelectItem key="Liquid Cooler">Liquid Cooler (ชุดน้ำ)</SelectItem>
                    </Select>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2 md:gap-3">
                        <IoCubeOutline className="text-blue-500" />
                        สินค้า (Component Inventory)
                    </h1>
                    <p className="text-gray-500 text-xs md:text-sm mt-1">ระบบเพิ่ม ลบ แก้ไข ข้อมูลสเปกคอมแยกตามหมวดหมู่อุปกรณ์</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
                    <Button color="primary" variant="shadow" className="font-bold tracking-wide w-full sm:w-auto" startContent={<IoAddCircleOutline size={20} />} onPress={handleOpenAddModal}>
                        เพิ่มสินค้าใหม่
                    </Button>
                    <div className="flex gap-2 items-center">
                        <Select
                            placeholder="เลือกประเภท..."
                            size="sm"
                            className="w-40"
                            variant="faded"
                            selectedKeys={importType ? new Set([importType]) : new Set()}
                            onSelectionChange={(keys) => setImportType(Array.from(keys)[0] as string || "")}
                        >
                            {TYPE_OPTIONS.map(opt => <SelectItem key={opt.value}>{opt.label}</SelectItem>)}
                        </Select>
                        <Button
                            color="secondary"
                            variant="flat"
                            className="font-bold"
                            startContent={<IoDocumentTextOutline size={18} />}
                            isDisabled={!importType}
                            onPress={() => csvInputRef.current?.click()}
                        >
                            Import CSV
                        </Button>
                        <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={handleCsvFileSelect} />
                    </div>
                </div>
            </header>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Input
                    placeholder="ค้นหาชื่อ หรือ แบรนด์สินค้า..."
                    startContent={<IoSearch className="text-gray-400" />}
                    variant="faded"
                    className="w-full sm:max-w-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Select
                    placeholder="แยกตามประเภท (Type)"
                    className="w-full sm:max-w-xs"
                    variant="faded"
                    selectedKeys={new Set([filterType])}
                    onSelectionChange={(keys) => setFilterType(Array.from(keys)[0] as string)}
                >
                    {[{ label: "ดูทุกประเภท", value: "ALL" }, ...TYPE_OPTIONS].map(opt => <SelectItem key={opt.value}>{opt.label}</SelectItem>)}
                </Select>
            </div>

            {/* Main Table Area */}
            <Card className="bg-black/40 border border-white/10 shadow-xl overflow-hidden">
                <CardBody className="p-0 overflow-x-auto custom-scrollbar w-full relative">
                    {isLoading ? (
                        <div className="py-20 flex justify-center items-center flex-col gap-4 min-w-[600px]">
                            <Spinner size="lg" color="primary" />
                            <p className="text-gray-400 animate-pulse">กำลังโหลดข้อมูลอุปกรณ์...</p>
                        </div>
                    ) : (
                        <Table aria-label="Inventory Table" classNames={{
                            wrapper: "bg-transparent shadow-none p-0 min-w-[700px]",
                            th: "bg-white/5 text-white font-bold tracking-wider",
                            td: "border-b border-white/5 py-4 whitespace-nowrap",
                        }}>
                            <TableHeader>
                                <TableColumn>IMAGE</TableColumn>
                                <TableColumn>NAME & BRAND</TableColumn>
                                <TableColumn>TYPE</TableColumn>
                                <TableColumn>PRICE</TableColumn>
                                <TableColumn>DETAILS</TableColumn>
                                <TableColumn align="center">ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody emptyContent="ไม่พบสินค้าในระบบ หรือไม่ตรงกับคำค้นหา">
                                {filteredComponents.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-white/5 transition-colors">
                                        <TableCell>
                                            <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center p-1 overflow-hidden">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                                                ) : (
                                                    <IoCubeOutline size={24} className="text-gray-500" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white text-base max-w-[250px] truncate">{item.name}</span>
                                                <span className="text-gray-400 text-xs mt-1 uppercase tracking-wider">{item.brand}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip size="sm" color="default" variant="flat" className="bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                                                {item.type}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-green-400 text-sm font-bold">
                                                ฿{item.price.toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {/* โชว์ข้อมูลคร่าวๆ แบบเร็วๆ */}
                                            <div className="flex flex-col gap-1 text-xs text-gray-400">
                                                {item.socket && <span>Socket: {item.socket}</span>}
                                                {item.ramType && <span>RAM: {item.ramType}</span>}
                                                {item.capacity && <span>Cap: {item.capacity} {item.type === 'PSU' ? 'W' : 'GB'}</span>}
                                                {item.formFactor && <span>Form: {item.formFactor}</span>}
                                                {item.tdp != null && <span>TDP: {item.tdp}W</span>}
                                                {item.lengthMm != null && <span>Length: {item.lengthMm}mm</span>}
                                                {item.maxGpuLength != null && <span>Max GPU: {item.maxGpuLength}mm</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-center gap-2">
                                                <Tooltip content="แก้ไข">
                                                    <Button isIconOnly size="sm" variant="light" color="warning" onPress={() => handleOpenEditModal(item)}>
                                                        <IoPencil size={18} />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content="ลบออกจากระบบ" color="danger">
                                                    <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => triggerDelete({ id: item.id, name: item.name })}>
                                                        <IoTrash size={18} />
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardBody>
            </Card>

            {/* Modal ADD / EDIT */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl" scrollBehavior="inside" classNames={{
                base: "bg-slate-900 border border-white/10 text-white w-full max-w-[95vw] md:max-w-3xl m-0 sm:m-auto",
                header: "border-b border-white/5 py-4 px-4 md:px-6",
                body: "py-6 px-4 md:px-6",
                footer: "border-t border-white/5 py-4 px-4 md:px-6",
            }}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    {modalMode === "ADD" ? <IoAddCircleOutline className="text-blue-500" /> : <IoPencil className="text-warning-500" />}
                                    {modalMode === "IMPORT_EDIT" ? "แก้ไขข้อมูล (CSV Import)" : modalMode === "ADD" ? "เพิ่มสินค้าใหม่เข้าสู่คลัง" : "แก้ไขข้อมูลสินค้า"}
                                </h2>
                                <p className="text-sm font-normal text-gray-400">
                                    เลือกระบุหมวดหมู่อุปกรณ์ที่ถูกต้อง (Type) เพื่อให้กำหนด ค่า Parameter สำหรับการจัดสเปคได้อย่างแม่นยำ
                                </p>
                            </ModalHeader>
                            <ModalBody className="flex flex-col gap-4">
                                {/* Basic Info Section */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-white/10 pb-2 mb-4">ข้อมูลพื้นฐานทั่วไป (Basic Info)</h3>

                                    {/* Auto-Clone Feature */}
                                    {modalMode === "ADD" && (
                                        <div className="mb-6 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex flex-col gap-3">
                                            <div className="flex items-center gap-2 text-blue-400 font-bold">
                                                <IoCubeOutline size={20} />
                                                <h4>ฟีเจอร์ โคลนสเปคออโต้! (Auto-Clone Specs)</h4>
                                            </div>
                                            <p className="text-xs text-gray-400">เลือกรุ่นที่มีอยู่แล้วเพื่อดึงค่าคะแนนและสเปคมาใส่ให้อัตโนมัติ (ประหยัดเวลาสุดๆ)</p>
                                            <Select
                                                label="อ้างอิงข้อมูลสเปคจาก"
                                                placeholder="เลือกสินค้าต้นแบบ..."
                                                variant="faded"
                                                color="primary"
                                                classNames={{ trigger: "bg-black/40" }}
                                                onSelectionChange={(keys) => {
                                                    const id = Array.from(keys)[0] as string;
                                                    if (id) handleCloneSpecs(id);
                                                }}
                                            >
                                                {components.filter(c => c.type === formData.type).map(comp => (
                                                    <SelectItem key={comp.id} textValue={comp.name}>
                                                        {comp.brand} - {comp.name}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Select
                                            label="Component Type (หมวดหมู่สินค้า)"
                                            variant="bordered"
                                            isRequired
                                            selectedKeys={new Set([formData.type || "CPU"])}
                                            onSelectionChange={(keys) => setFormData({ ...formData, type: Array.from(keys)[0] as string })}
                                        >
                                            {TYPE_OPTIONS.map(opt => <SelectItem key={opt.value}>{opt.label}</SelectItem>)}
                                        </Select>

                                        <Input label="Brand (แบรนด์)" placeholder="e.g. Intel, AMD, ASUS, Corsair" variant="bordered" isRequired
                                            value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />

                                        <div className="col-span-full md:col-span-1">
                                            <Input label="Name (ชื่อรุ่น/รหัสสินค้า)" placeholder="e.g. Core i5-13400F" variant="bordered" isRequired
                                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                        </div>

                                        <Input label="Price (ราคาตั้งต้น - บาท)" type="number" variant="bordered" isRequired
                                            value={formData.price?.toString()} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />

                                        <div className="col-span-full">
                                            <label className="text-sm font-medium mb-2 block text-gray-400">รูปภาพสินค้า</label>
                                            {/* Toggle buttons for image mode */}
                                            <div className="flex gap-2 mb-3">
                                                <Button
                                                    size="sm"
                                                    variant={imageMode === "FILE" ? "solid" : "bordered"}
                                                    color={imageMode === "FILE" ? "primary" : "default"}
                                                    startContent={<IoCloudUploadOutline size={16} />}
                                                    onPress={() => setImageMode("FILE")}
                                                    className="font-bold"
                                                >
                                                    อัปโหลดจากเครื่อง
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={imageMode === "URL" ? "solid" : "bordered"}
                                                    color={imageMode === "URL" ? "primary" : "default"}
                                                    startContent={<IoLinkOutline size={16} />}
                                                    onPress={() => setImageMode("URL")}
                                                    className="font-bold"
                                                >
                                                    ใส่ลิงก์ URL
                                                </Button>
                                            </div>

                                            {imageMode === "FILE" ? (
                                                <div className="space-y-3">
                                                    <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-white/20 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all group">
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            <IoCloudUploadOutline size={32} className="text-gray-400 group-hover:text-blue-400 transition-colors mb-2" />
                                                            <p className="text-sm text-gray-400 group-hover:text-gray-300">
                                                                <span className="font-bold text-blue-400">คลิกเพื่อเลือกไฟล์</span> หรือลากวาง
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP (สูงสุด 5MB)</p>
                                                        </div>
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/png,image/jpeg,image/webp,image/gif"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    if (file.size > 5 * 1024 * 1024) {
                                                                        alert("ไฟล์มีขนาดเกิน 5MB");
                                                                        return;
                                                                    }
                                                                    setImageFile(file);
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => {
                                                                        setImagePreview(reader.result as string);
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                    // Clear URL mode image
                                                                    setFormData({ ...formData, image: "" });
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                    {imageFile && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-300 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                                                            <IoImageOutline className="text-blue-400" size={18} />
                                                            <span className="truncate flex-1 font-medium">{imageFile.name}</span>
                                                            <span className="text-xs text-gray-500 shrink-0">{(imageFile.size / 1024).toFixed(1)} KB</span>
                                                            <Button size="sm" isIconOnly variant="light" color="danger" onPress={() => { setImageFile(null); setImagePreview(null); }}>
                                                                <IoTrash size={14} />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <Input label="Image URL (ลิงก์รูปภาพ)" placeholder="https://..." variant="bordered"
                                                    value={formData.image || ""} onChange={e => { setFormData({ ...formData, image: e.target.value }); setImagePreview(e.target.value || null); setImageFile(null); }} />
                                            )}

                                            {/* Image Preview */}
                                            {imagePreview && (
                                                <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                                                    <p className="text-xs text-gray-400 mb-2 font-bold">ตัวอย่างรูปภาพ:</p>
                                                    <div className="flex justify-center">
                                                        <img src={imagePreview} alt="Preview" className="max-h-40 max-w-full object-contain rounded-lg" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-span-full">
                                            {/* Import Textarea if not auto-imported, wait we can just use Input type="textarea" but let's use standard Input or text element if Textarea is not from heroui */}
                                            {/* HeroUI Textarea is available as Textarea but not imported. We will just use regular HTML textarea styled to look good or Import Textarea */}
                                        </div>
                                    </div>
                                    <div className="col-span-full mt-4">
                                        <label className="text-sm font-medium mb-1 block text-gray-400">Description (คุณสมบัติ/รายละเอียดทั้งหมด)</label>
                                        <textarea
                                            className="w-full bg-transparent border-2 border-default-200 rounded-xl p-3 outline-none text-white focus:border-default-400 transition-colors"
                                            rows={4}
                                            placeholder="กรอกคุณสมบัติเพิ่มเติม หรือคำอธิบายสินค้า..."
                                            value={formData.description || ""}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Fields based on Type */}
                                {renderDynamicFields()}

                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose} isDisabled={isSaving}>
                                    ยกเลิก
                                </Button>
                                <Button color="primary" variant="shadow" className="font-bold" isLoading={isSaving} onPress={() => handleSave(onClose)}>
                                    {modalMode === "ADD" ? "บันทึกข้อมูลสินค้า" : "บันทึกการปรับปรุง"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Modal Confirm Delete */}
            <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange} size="md" classNames={{
                base: "bg-slate-900 border border-white/10 text-white",
                header: "border-b border-white/5 py-4",
                body: "py-6",
                footer: "border-t border-white/5 py-4",
            }}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 items-center justify-center pt-8">
                                <div className="w-16 h-16 rounded-full bg-danger/10 text-danger flex items-center justify-center mb-2">
                                    <IoWarningOutline size={32} />
                                </div>
                                <h2 className="text-xl font-bold">ยืนยันการลบอุปกรณ์</h2>
                            </ModalHeader>
                            <ModalBody className="text-center">
                                <p className="text-gray-400">
                                    คุณแน่ใจหรือไม่ว่าต้องการลบอุปกรณ์ <br />
                                    <span className="text-white font-bold text-lg mt-2 inline-block">"{itemToDelete?.name}"</span>
                                </p>
                                <p className="text-sm text-danger mt-4 font-medium">
                                    * การกระทำนี้ไม่สามารถย้อนกลับได้
                                </p>
                            </ModalBody>
                            <ModalFooter className="flex justify-center gap-3 pb-8">
                                <Button
                                    color="default"
                                    variant="bordered"
                                    onPress={onClose}
                                    isDisabled={isDeleting}
                                    className="font-bold border-white/20 hover:bg-white/5"
                                >
                                    ยกเลิก
                                </Button>
                                <Button
                                    color="danger"
                                    variant="shadow"
                                    onPress={() => confirmDelete(onClose)}
                                    isLoading={isDeleting}
                                    className="font-bold px-8 shadow-danger/30"
                                >
                                    ยืนยันการลบ
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            {/* === CSV Import Staging Modal === */}
            <Modal isOpen={isStagingOpen} onOpenChange={onStagingOpenChange} size="full" scrollBehavior="inside" classNames={{
                base: "bg-slate-900 border border-white/10 text-white max-h-[95vh]",
                header: "border-b border-white/5 py-4 px-6",
                body: "p-0",
                footer: "border-t border-white/5 py-4 px-6",
            }}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <IoDocumentTextOutline className="text-secondary" />
                                    CSV Import Staging — {importType}
                                </h2>
                                <p className="text-sm font-normal text-gray-400">
                                    ตรวจสอบและยืนยันข้อมูลก่อนนำเข้าสู่ระบบ ({importList.length} รายการ, {importList.filter(r => r.isReady).length} verified)
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                <ScrollShadow className="w-full overflow-x-auto">
                                    <Table aria-label="CSV Staging Table" classNames={{
                                        wrapper: "bg-transparent shadow-none p-0 min-w-[800px]",
                                        th: "bg-white/5 text-white font-bold tracking-wider text-xs",
                                        td: "border-b border-white/5 py-3 whitespace-nowrap text-sm",
                                    }}>
                                        <TableHeader>
                                            <TableColumn>#</TableColumn>
                                            <TableColumn>IMAGE</TableColumn>
                                            <TableColumn>NAME</TableColumn>
                                            <TableColumn>BRAND</TableColumn>
                                            <TableColumn>PRICE</TableColumn>
                                            <TableColumn>KEY SPECS</TableColumn>
                                            <TableColumn>STATUS</TableColumn>
                                            <TableColumn align="center">ACTIONS</TableColumn>
                                        </TableHeader>
                                        <TableBody emptyContent="ไม่มีข้อมูลในไฟล์ CSV">
                                            {importList.map((row, idx) => (
                                                <TableRow key={idx} className={row.isReady ? "bg-success/5" : "hover:bg-white/5"}>
                                                    <TableCell><span className="text-gray-500 font-mono">{idx + 1}</span></TableCell>
                                                    <TableCell>
                                                        <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center p-1 overflow-hidden">
                                                            {row.image ? (
                                                                <img src={row.image} alt={row.name || ""} className="max-w-full max-h-full object-contain" />
                                                            ) : (
                                                                <IoCubeOutline size={20} className="text-gray-500" />
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell><span className="font-bold text-white truncate max-w-[200px] inline-block">{row.name || "-"}</span></TableCell>
                                                    <TableCell><span className="text-gray-300 uppercase text-xs tracking-wider">{row.brand || "-"}</span></TableCell>
                                                    <TableCell><span className="font-mono text-green-400">฿{(row.price || 0).toLocaleString()}</span></TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-0.5 text-xs text-gray-400">
                                                            {row.socket && <span>Socket: {row.socket}</span>}
                                                            {row.ramType && <span>RAM: {row.ramType}</span>}
                                                            {row.capacity != null && <span>Cap: {row.capacity}</span>}
                                                            {row.tdp != null && <span>TDP: {row.tdp}W</span>}
                                                            {row.gpuScore != null && <span>GPU: {row.gpuScore}</span>}
                                                            {row.cpuSingleScore != null && <span>CPU-S: {row.cpuSingleScore}</span>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.isReady ? (
                                                            <Chip color="success" variant="flat" size="sm" className="font-bold" startContent={<IoCheckmarkCircleOutline size={14} />}>VERIFIED</Chip>
                                                        ) : (
                                                            <Chip color="default" variant="flat" size="sm" className="font-bold text-gray-400">PENDING</Chip>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-center gap-1">
                                                            <Tooltip content="ตรวจสอบ (Verify)">
                                                                <Button isIconOnly size="sm" variant="flat" color="success" onPress={() => handleVerifyRow(idx)} isDisabled={row.isReady}>
                                                                    <IoCheckmarkCircleOutline size={16} />
                                                                </Button>
                                                            </Tooltip>
                                                            <Tooltip content="แก้ไข">
                                                                <Button isIconOnly size="sm" variant="flat" color="warning" onPress={() => handleEditImportRow(idx)}>
                                                                    <IoPencil size={16} />
                                                                </Button>
                                                            </Tooltip>
                                                            <Tooltip content="ลบ" color="danger">
                                                                <Button isIconOnly size="sm" variant="flat" color="danger" onPress={() => {
                                                                    if (window.confirm(`ยืนยันลบ "${row.name || `รายการที่ ${idx + 1}`}" ออกจากรายการนำเข้า?`)) {
                                                                        setImportList(prev => prev.filter((_, i) => i !== idx));
                                                                        addToast({ title: `ลบ "${row.name || `รายการที่ ${idx + 1}`}" ออกแล้ว`, color: "danger" });
                                                                    }
                                                                }}>
                                                                    <IoTrash size={16} />
                                                                </Button>
                                                            </Tooltip>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollShadow>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose} className="font-bold">ยกเลิก</Button>
                                <Button
                                    color="primary"
                                    variant="shadow"
                                    className="font-bold px-8"
                                    isLoading={isBulkSaving}
                                    isDisabled={importList.length === 0 || importList.some(r => !r.isReady)}
                                    onPress={handleBulkSubmit}
                                    startContent={<IoCloudUploadOutline size={18} />}
                                >
                                    Add to Inventory ({importList.filter(r => r.isReady).length}/{importList.length})
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
