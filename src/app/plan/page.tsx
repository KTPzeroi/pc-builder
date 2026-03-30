"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, CardBody, Spinner, Chip, Divider } from "@heroui/react";
import { useRouter } from "next/navigation";
import {
    IoGameControllerOutline, IoBriefcaseOutline, IoColorPaletteOutline,
    IoChevronBackOutline, IoChevronForwardOutline, IoSparklesOutline,
    IoHammerOutline, IoCheckmarkCircleOutline, IoLayersOutline,
    IoPricetagOutline, IoSearchOutline, IoInformationCircleOutline,
} from "react-icons/io5";
import { BsCpu, BsMotherboard, BsMemory, BsDeviceSsd } from "react-icons/bs";
import { PiGraphicsCardBold, PiFan } from "react-icons/pi";
import { BiTachometer } from "react-icons/bi";
import { LuPcCase } from "react-icons/lu";

// --- Types ---
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
}

const USAGE_CHOICES = [
    { value: "GAMING", label: "เล่นเกม", icon: <IoGameControllerOutline className="text-4xl" />, desc: "เน้นกราฟิกลื่น FPS สูง ภาพสวยอลังการ", color: "from-blue-600/20 to-blue-900/20", border: "border-blue-500/40", text: "text-blue-400" },
    { value: "WORKING", label: "ทำงาน", icon: <IoBriefcaseOutline className="text-4xl" />, desc: "เน้นเปิดหลายโปรแกรม ตอบสนองไว ทำงานลื่น", color: "from-green-600/20 to-green-900/20", border: "border-green-500/40", text: "text-green-400" },
    { value: "CREATIVE", label: "งาน 3D & ตัดต่อ", icon: <IoColorPaletteOutline className="text-4xl" />, desc: "เน้น Render, วิดีโอ, กราฟิกดีไซน์ หนักทุกมิติ", color: "from-purple-600/20 to-purple-900/20", border: "border-purple-500/40", text: "text-purple-400" },
];

const BUDGET_CHOICES = [
    { value: "ENTRY", label: "Entry", price: "< 15,000฿", desc: "ใช้งานพื้นฐาน ราคาประหยัด", color: "text-gray-400" },
    { value: "MID", label: "Mid Range", price: "15,000 - 30,000฿", desc: "สมดุลคุ้มค่า เล่นเกมได้ลื่นๆ", color: "text-blue-400" },
    { value: "HIGHEND", label: "Hi-End", price: "30,000 - 50,000฿", desc: "แรงจัดเต็ม เล่นทุกเกมอัลตร้า", color: "text-yellow-400" },
    { value: "ULTRA", label: "Ultra", price: "50,000฿+", desc: "ท็อปสุด ไม่ต้องประนีประนอม", color: "text-red-400" },
];

const typeIconMap: Record<string, React.ReactNode> = {
    CPU: <BsCpu />, GPU: <PiGraphicsCardBold />, RAM: <BsMemory />,
    Mainboard: <BsMotherboard />, Storage: <BsDeviceSsd />, PSU: <BiTachometer />,
    Case: <LuPcCase />, Cooler: <PiFan />,
};

export default function PlanPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedUsage, setSelectedUsage] = useState<string | null>(null);
    const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
    const [results, setResults] = useState<PresetBuild[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchResults = async (usage: string, budget: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/presets?usage=${usage}&budget=${budget}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUsageSelect = (usage: string) => {
        setSelectedUsage(usage);
        setStep(2);
    };

    const handleBudgetSelect = (budget: string) => {
        setSelectedBudget(budget);
        setStep(3);
        fetchResults(selectedUsage!, budget);
    };

    const handleBack = () => {
        if (step === 3) { setStep(2); setResults([]); }
        else if (step === 2) { setStep(1); }
    };

    const handleContinueToBuild = async (preset: PresetBuild) => {
        setIsLoading(true);
        try {
            // โหลดข้อมูล Components ทั้งหมดจาก Database
            const res = await fetch("/api/components");
            const dbComps = await res.json();

            // เตรียม Object เปล่าสำหรับ Build
            const newSelection: Record<string, any> = {
                Processor: null, Motherboard: null, "Graphics Card": null, Memory: null, Storage: null, "Power Supply": null, Case: null, Cooling: null,
            };

            // แมปข้อมูลจาก Preset ไปเป็น Category ของระบบ Build
            const categoryMap: Record<string, string> = {
                CPU: "Processor",
                MB: "Motherboard",
                GPU: "Graphics Card",
                RAM: "Memory",
                STORAGE: "Storage",
                PSU: "Power Supply",
                CASE: "Case",
                COOLING: "Cooling"
            };

            const categoryToDbMap: Record<string, string> = {
                CPU: "CPU",
                MB: "MB",
                GPU: "GPU",
                RAM: "RAM",
                STORAGE: "STORAGE",
                PSU: "PSU",
                CASE: "CASE",
                COOLING: "COOLING"
            };

            const presetComps = preset.components as PresetComponent[];
            presetComps.forEach((comp, index) => {
                if (!comp.name || comp.name.trim() === "") return;
                
                const cat = categoryMap[comp.type];
                if (cat) {
                    // ค้นหาเปรียบเทียบชื่ออุปกรณ์จาก Database เพื่อให้ได้ ID และข้อมูลฉบับเต็ม
                    const fullComp = dbComps.find((c: any) => c.name === comp.name);
                    if (fullComp) {
                        newSelection[cat] = fullComp;
                    } else {
                        // หากมีชื่อแต่หาใน DB ไม่เจอ ให้สร้าง Mock Object โชว์ชื่อกับราคาไปก่อน
                        newSelection[cat] = {
                            id: `custom-${index}`,
                            name: comp.name,
                            type: categoryToDbMap[comp.type] || comp.type,
                            price: comp.price || 0,
                            gpuScore: 0,
                            cpuSingleScore: 0,
                            cpuMultiScore: 0,
                            vramGb: 0,
                            capacity: 0,
                            rating: 0,
                        };
                    }
                }
            });

            // บันทึกลง Local Storage แล้วพาผู้ใช้ไปหน้า Build
            localStorage.setItem("pc_builder_selection", JSON.stringify(newSelection));
            router.push("/build");
        } catch (e) {
            console.error("Failed to map preset components", e);
            router.push("/build");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Progress Indicator */}
                <div className="flex items-center justify-center gap-2 mb-10">
                    {[1, 2, 3].map(s => (
                        <React.Fragment key={s}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= s
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-white/10 text-gray-500'
                                }`}>
                                {step > s ? <IoCheckmarkCircleOutline /> : s}
                            </div>
                            {s < 3 && <div className={`w-12 sm:w-20 h-0.5 transition-all duration-300 ${step > s ? 'bg-blue-500' : 'bg-white/10'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step 1: เลือกประเภทการใช้งาน */}
                {step === 1 && (
                    <div className="animate-appearance-in">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                                <IoSparklesOutline className="inline text-blue-500 mr-2" />
                                คุณอยากใช้คอมทำอะไร?
                            </h1>
                            <p className="text-gray-400 text-sm md:text-base">เลือกสิ่งที่ตรงกับคุณมากที่สุด เราจะจัดสเปกให้เหมาะสม</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            {USAGE_CHOICES.map(choice => (
                                <Card
                                    key={choice.value}
                                    isPressable
                                    onPress={() => handleUsageSelect(choice.value)}
                                    className={`bg-gradient-to-br ${choice.color} border ${choice.border} hover:scale-[1.03] transition-all duration-300 cursor-pointer`}
                                >
                                    <CardBody className="p-8 flex flex-col items-center text-center gap-4">
                                        <div className={`${choice.text}`}>{choice.icon}</div>
                                        <h3 className="text-white font-bold text-xl">{choice.label}</h3>
                                        <p className="text-gray-400 text-sm">{choice.desc}</p>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: เลือกงบประมาณ */}
                {step === 2 && (
                    <div className="animate-appearance-in">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                                <IoPricetagOutline className="inline text-blue-500 mr-2" />
                                งบประมาณของคุณอยู่ที่เท่าไหร่?
                            </h1>
                            <p className="text-gray-400 text-sm md:text-base">ไม่ต้องกังวล ทุกช่วงราคาเราจัดสเปกให้คุ้มค่าที่สุด</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {BUDGET_CHOICES.map(choice => (
                                <Card
                                    key={choice.value}
                                    isPressable
                                    onPress={() => handleBudgetSelect(choice.value)}
                                    className="bg-black/40 border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                                >
                                    <CardBody className="p-6 flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-white font-bold text-lg">{choice.label}</h3>
                                            <span className={`font-bold text-sm ${choice.color}`}>{choice.price}</span>
                                        </div>
                                        <p className="text-gray-500 text-sm">{choice.desc}</p>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                        <div className="flex justify-start mt-8">
                            <Button variant="light" startContent={<IoChevronBackOutline />} onPress={handleBack}>ย้อนกลับ</Button>
                        </div>
                    </div>
                )}

                {/* Step 3: แสดงผลลัพธ์ */}
                {step === 3 && (
                    <div className="animate-appearance-in">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                                <IoLayersOutline className="inline text-blue-500 mr-2" />
                                สเปกที่แนะนำสำหรับคุณ
                            </h1>
                            <div className="flex justify-center gap-2 mt-3">
                                <Chip color="primary" variant="flat" size="sm">{USAGE_CHOICES.find(c => c.value === selectedUsage)?.label}</Chip>
                                <Chip color="secondary" variant="flat" size="sm">{BUDGET_CHOICES.find(c => c.value === selectedBudget)?.label}</Chip>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center gap-4">
                                <Spinner size="lg" color="primary" />
                                <p className="text-gray-400 animate-pulse">กำลังค้นหาสเปกที่เหมาะกับคุณ...</p>
                            </div>
                        ) : results.length === 0 ? (
                            <Card className="bg-black/40 border border-white/10">
                                <CardBody className="py-16 flex flex-col items-center gap-4 text-center">
                                    <IoSearchOutline className="text-5xl text-gray-600" />
                                    <p className="text-white font-bold text-lg">ยังไม่มีสเปกแนะนำในหมวดนี้</p>
                                    <p className="text-gray-500 text-sm max-w-md">ขณะนี้ทีมงานกำลังเพิ่มข้อมูลอยู่ครับ ลองดูงบประมาณอื่น หรือกดจัดสเปกเองที่หน้า Build ได้เลย!</p>
                                    <div className="flex gap-3 mt-4 flex-wrap justify-center">
                                        <Button variant="flat" color="primary" onPress={() => { setStep(2); setResults([]); }}>เลือกงบใหม่</Button>
                                        <Button color="primary" variant="shadow" onPress={() => router.push("/build")}>จัดสเปกเอง</Button>
                                    </div>
                                </CardBody>
                            </Card>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {results.map(preset => (
                                    <Card key={preset.id} className="bg-black/40 border border-blue-500/20 shadow-xl shadow-blue-500/5">
                                        <CardBody className="p-0">
                                            {/* Header */}
                                            <div className="p-5 md:p-6 border-b border-white/5">
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                                    <div>
                                                        <h2 className="text-white font-bold text-xl">{preset.name}</h2>
                                                        {preset.description && <p className="text-gray-400 text-sm mt-1">{preset.description}</p>}
                                                    </div>
                                                    <Chip color="success" variant="shadow" size="lg" className="font-bold text-lg px-4">
                                                        ฿{preset.totalPrice.toLocaleString()}
                                                    </Chip>
                                                </div>
                                            </div>

                                            {/* Component List */}
                                            <div className="p-5 md:p-6 flex flex-col gap-4">
                                                {(preset.components as PresetComponent[]).map((comp, i) => (
                                                    <div key={i} className="flex items-start gap-4 bg-white/5 rounded-xl p-4 border border-white/5 hover:border-blue-500/20 transition-colors">
                                                        <div className="text-blue-400 text-2xl flex-shrink-0 mt-1">
                                                            {typeIconMap[comp.type] || <BsCpu />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-baseline justify-between gap-2 flex-wrap">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">{comp.type}</span>
                                                                    <span className="text-white font-semibold text-sm">{comp.name}</span>
                                                                </div>
                                                                <span className="text-gray-400 text-sm font-bold flex-shrink-0">฿{Number(comp.price).toLocaleString()}</span>
                                                            </div>
                                                            {comp.reason && (
                                                                <p className="text-gray-500 text-xs mt-1.5 leading-relaxed flex items-start gap-1">
                                                                    <IoInformationCircleOutline className="text-blue-500 flex-shrink-0 mt-0.5" /> {comp.reason}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Footer Actions */}
                                            <Divider className="bg-white/5" />
                                            <div className="p-5 md:p-6 flex flex-col sm:flex-row gap-3 justify-end">
                                                <Button
                                                    color="primary"
                                                    variant="shadow"
                                                    size="lg"
                                                    className="font-bold px-8"
                                                    startContent={<IoHammerOutline />}
                                                    onPress={() => handleContinueToBuild(preset)}
                                                >
                                                    ปรับแต่งสเปกนี้ต่อในหน้า Build
                                                </Button>
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between mt-8">
                            <Button variant="light" startContent={<IoChevronBackOutline />} onPress={handleBack}>เลือกงบใหม่</Button>
                            <Button variant="flat" color="primary" onPress={() => router.push("/build")} endContent={<IoChevronForwardOutline />}>ข้ามไปจัดสเปกเอง</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
