"use client";

import React, { useState, useEffect } from "react";
import { 
    Card, CardBody, CardHeader, Button, Input, Select, SelectItem, 
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, 
    Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner,
    Chip,
    Tooltip
} from "@heroui/react";
import { IoCubeOutline, IoAddCircleOutline, IoPencil, IoTrash, IoSearch, IoCloudUploadOutline, IoImageOutline, IoLinkOutline } from "react-icons/io5";

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
    readWriteSpeed?: number | null;
    createdAt?: string;
    description?: string | null;
};

const TYPE_OPTIONS = [
    { label: "CPU", value: "CPU" },
    { label: "GPU", value: "GPU" },
    { label: "RAM", value: "RAM" },
    { label: "Motherboard (MB)", value: "MB" },
    { label: "Storage (SSD/HDD)", value: "STORAGE" },
    { label: "Power Supply (PSU)", value: "PSU" },
    { label: "Case", value: "CASE" }
];

export default function InventoryCRUDPage() {
    const [components, setComponents] = useState<ComponentData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("ALL");

    // Modal State
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageMode, setImageMode] = useState<"FILE" | "URL">("FILE");

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
        vramGb: undefined, ramSpeed: undefined, readWriteSpeed: undefined
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
            vramGb: undefined, ramSpeed: undefined, readWriteSpeed: undefined
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
            readWriteSpeed: comp.readWriteSpeed || undefined
        });
        setImageFile(null);
        setImagePreview(comp.image || null);
        setImageMode(comp.image ? "URL" : "FILE");
        onOpen();
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ ${name}?`)) return;

        try {
            const res = await fetch(`/api/admin/components/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchComponents();
            } else {
                alert("เกิดข้อผิดพลาดในการลบข้อมูล");
            }
        } catch (error) {
            console.error("Error deleting", error);
        }
    };

    const handleSave = async (onClose: () => void) => {
        if (!formData.name || !formData.brand || formData.price === undefined || formData.price < 0) {
            alert("กรุณากรอกข้อมูลพื้นฐานให้ครบถ้วนและถูกต้อง (ชื่อ, แบรนด์, ราคาขั้นต่ำ 0)");
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
            let pRw = formData.readWriteSpeed ? parseInt(String(formData.readWriteSpeed)) : null;

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
            if (formData.type === "STORAGE" && (!pCapacity || !pRw)) {
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
                readWriteSpeed: type === "STORAGE" ? pRw : null,
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
            readWriteSpeed: source.readWriteSpeed || undefined,
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
                        value={formData.socket || ""} onChange={e => setFormData({...formData, socket: e.target.value})} />
                )}

                {/* Compatibility: RAM Type */}
                {["RAM", "MB"].includes(type || "") && (
                    <Input label="RAM Type" placeholder="e.g. DDR4, DDR5" variant="bordered" 
                        value={formData.ramType || ""} onChange={e => setFormData({...formData, ramType: e.target.value})} />
                )}

                {/* Compatibility: Form Factor */}
                {["MB", "CASE"].includes(type || "") && (
                    <Input label="Form Factor" placeholder="e.g. ATX, mATX, ITX" variant="bordered" 
                        value={formData.formFactor || ""} onChange={e => setFormData({...formData, formFactor: e.target.value})} />
                )}

                {/* Capacity */}
                {["RAM", "STORAGE", "PSU"].includes(type || "") && (
                    <Input label={type === "PSU" ? "Capacity (Watt)" : "Capacity (GB)"} type="number" variant="bordered" 
                        value={formData.capacity?.toString() || ""} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} />
                )}

                {/* GPU VRAM */}
                {type === "GPU" && (
                    <Input label="VRAM (GB)" type="number" variant="bordered" 
                        value={formData.vramGb?.toString() || ""} onChange={e => setFormData({...formData, vramGb: Number(e.target.value)})} />
                )}
                
                {/* Performance: CPU */}
                {type === "CPU" && (
                    <>
                        <Input label="CPU Single Score" type="number" variant="bordered" 
                            value={formData.cpuSingleScore?.toString() || ""} onChange={e => setFormData({...formData, cpuSingleScore: Number(e.target.value)})} />
                        <Input label="CPU Multi Score" type="number" variant="bordered" 
                            value={formData.cpuMultiScore?.toString() || ""} onChange={e => setFormData({...formData, cpuMultiScore: Number(e.target.value)})} />
                    </>
                )}

                {/* Performance: GPU */}
                {type === "GPU" && (
                    <Input label="GPU Score (G3D Mark)" type="number" variant="bordered" 
                        value={formData.gpuScore?.toString() || ""} onChange={e => setFormData({...formData, gpuScore: Number(e.target.value)})} />
                )}

                {/* Performance: RAM */}
                {type === "RAM" && (
                    <Input label="RAM Speed (MHz)" placeholder="e.g. 3200, 6000" type="number" variant="bordered" 
                        value={formData.ramSpeed?.toString() || ""} onChange={e => setFormData({...formData, ramSpeed: Number(e.target.value)})} />
                )}

                {/* Performance: Storage */}
                {type === "STORAGE" && (
                    <Input label="Read/Write Speed (MB/s)" type="number" variant="bordered" 
                        value={formData.readWriteSpeed?.toString() || ""} onChange={e => setFormData({...formData, readWriteSpeed: Number(e.target.value)})} />
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
                <Button color="primary" variant="shadow" className="font-bold tracking-wide w-full sm:w-auto" startContent={<IoAddCircleOutline size={20} />} onPress={handleOpenAddModal}>
                    เพิ่มสินค้าใหม่
                </Button>
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
                    {[ {label: "ดูทุกประเภท", value: "ALL"}, ...TYPE_OPTIONS ].map(opt => <SelectItem key={opt.value}>{opt.label}</SelectItem>)}
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
                                                    <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDelete(item.id, item.name)}>
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
                                    {modalMode === "ADD" ? "เพิ่มสินค้าใหม่เข้าสู่คลัง" : "แก้ไขข้อมูลสินค้า"}
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
                                            onSelectionChange={(keys) => setFormData({...formData, type: Array.from(keys)[0] as string})}
                                        >
                                            {TYPE_OPTIONS.map(opt => <SelectItem key={opt.value}>{opt.label}</SelectItem>)}
                                        </Select>

                                        <Input label="Brand (แบรนด์)" placeholder="e.g. Intel, AMD, ASUS, Corsair" variant="bordered" isRequired
                                            value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                                        
                                        <div className="col-span-full md:col-span-1">
                                            <Input label="Name (ชื่อรุ่น/รหัสสินค้า)" placeholder="e.g. Core i5-13400F" variant="bordered" isRequired
                                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                        </div>

                                        <Input label="Price (ราคาตั้งต้น - บาท)" type="number" variant="bordered" isRequired
                                            value={formData.price?.toString()} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />

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
                                                                    setFormData({...formData, image: ""});
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
                                                    value={formData.image || ""} onChange={e => { setFormData({...formData, image: e.target.value}); setImagePreview(e.target.value || null); setImageFile(null); }} />
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
                                            onChange={e => setFormData({...formData, description: e.target.value})}
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
        </div>
    );
}
