"use client";

{/* import React, { useState, useRef, MouseEvent, TouchEvent } from "react";กุลิ้งไม่ได้ลองทำลิ้งให้หน่อยของปุ่ม plan your build */ }
{/* import Link from "next/link"; // <--- เพิ่มบรรทัดนี้  กุลิ้งไม่ได้ลองทำลิ้งให้หน่อยของปุ่ม plan your build*/ }
import React, { useState, useMemo, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Progress,
  Select, SelectItem, Badge, Divider, ScrollShadow,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, Input, addToast, Spinner
} from "@heroui/react";
import type { Component } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// --- Types & Interfaces ---
interface FilterOption {
  label: string;
  key: string;
  options: string[];
}

const categoryFilters: Record<string, FilterOption[]> = {
  Processor: [{ label: "Brand", key: "brand", options: ["All", "Intel", "AMD"] }],
  Motherboard: [{ label: "Brand", key: "brand", options: ["All", "ASUS", "MSI"] }],
  "Graphics Card": [{ label: "Brand", key: "brand", options: ["All", "Nvidia", "AMD"] }],
  Memory: [{ label: "Type", key: "type", options: ["DDR4", "DDR5"] }],
  Storage: [{ label: "Type", key: "type", options: ["NVMe", "SATA"] }],
  "Power Supply": [{ label: "Wattage", key: "wattage", options: ["650W", "750W", "850W"] }],
  Case: [{ label: "Form", key: "form", options: ["Mid Tower", "ITX"] }],
  Cooling: [{ label: "Type", key: "type", options: ["Air", "Liquid"] }]
};

const categoryToTypeMap: Record<string, string> = {
  Processor: "CPU",
  Motherboard: "MB",
  "Graphics Card": "GPU",
  Memory: "RAM",
  Storage: "STORAGE",
  "Power Supply": "PSU",
  Case: "CASE",
  Cooling: "COOLING"
};

// --- Helper Components ---
function HeroBenchmark({ label, value, color }: { label: string, value: number, color: any }) {
  const safeValue = isNaN(value) ? 0 : Math.max(0, Math.round(value));
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-bold uppercase tracking-widest text-default-500">{label}</span>
        <span className={`text-sm font-bold text-${color}`}>{safeValue}%</span>
      </div>
      <Progress size="sm" value={safeValue} color={color} aria-label={label} />
    </div>
  );
}

export default function BuildPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewDetailsComp, setViewDetailsComp] = useState<Component | null>(null);
  const { isOpen: isSaveOpen, onOpen: onSaveOpen, onOpenChange: onSaveChange, onClose: onSaveClose } = useDisclosure();
  const { isOpen: isLoginAlertOpen, onOpen: onLoginAlertOpen, onOpenChange: onLoginAlertChange } = useDisclosure();

  const [buildName, setBuildName] = useState("");
  const [buildNameError, setBuildNameError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // เก็บข้อมูลสินค้าทั้งหมดจาก Database
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [sysConfig, setSysConfig] = useState<any>(null);

  // Filter state for selection modal
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  // Reset filters when category changes
  useEffect(() => {
    setActiveFilters({});
  }, [selectedCategory]);

  useEffect(() => {
    Promise.all([
      fetch("/api/components").then(res => res.json()),
      fetch("/api/admin/settings").then(res => res.json())
    ])
    .then(([compsData, settingsData]) => {
      setComponents(compsData);
      setSysConfig(settingsData);
      setLoading(false);
    })
    .catch(err => {
      console.error("Failed to fetch data", err);
      setLoading(false);
    });
  }, []);

  const [selectedProducts, setSelectedProducts] = useState<Record<string, Component | null>>({
    Processor: null, Motherboard: null, "Graphics Card": null, Memory: null, Storage: null, "Power Supply": null, Case: null, Cooling: null,
  });

  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pc_builder_selection');
    if (saved) {
      try {
        setSelectedProducts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved build");
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when selection changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('pc_builder_selection', JSON.stringify(selectedProducts));
    }
  }, [selectedProducts, isLoaded]);

  // 🛡 เช็คความเข้ากันได้
  const checkCompatibility = useMemo(() => {
    const issues: string[] = [];
    const cpu = selectedProducts["Processor"];
    const mb = selectedProducts["Motherboard"];
    const ram = selectedProducts["Memory"];

    if (cpu && mb && cpu.socket && mb.socket && cpu.socket !== mb.socket) {
      issues.push(`Socket ${cpu.socket} (CPU) ไม่เข้ากับ ${mb.socket} (Motherboard)`);
    }

    if (mb && ram) {
      const mbDdr = mb.ramType || "";
      const ramDdr = ram.ramType || "";
      if (mbDdr && ramDdr && !mbDdr.includes(ramDdr) && !ramDdr.includes(mbDdr)) {
        issues.push(`Motherboard รองรับ ${mbDdr} แต่ RAM เป็น ${ramDdr}`);
      }
    } else if (cpu && ram && !mb) {
      const cpuDdr = cpu.ramType || "";
      const ramDdr = ram.ramType || "";
      if (cpuDdr && ramDdr && !cpuDdr.includes(ramDdr) && !ramDdr.includes(cpuDdr)) {
        issues.push(`CPU รองรับ ${cpuDdr} แต่ระบบ RAM เป็น ${ramDdr}`);
      }
    }

    return {
      isOk: issues.length === 0,
      issues
    };
  }, [selectedProducts]);

  // 🧮 คำนวณ % จาก Database + Dynamic Settings
  const totals = useMemo(() => {
    const values = Object.values(selectedProducts).filter(p => p !== null) as Component[];
    const cpu = selectedProducts["Processor"];
    const gpu = selectedProducts["Graphics Card"];
    const ram = selectedProducts["Memory"];

    const cpuSingle = cpu?.cpuSingleScore || 0;
    const cpuMulti = cpu?.cpuMultiScore || 0;
    const gpuScore = gpu?.gpuScore || 0;
    const ramCapacity = ram?.capacity || 0;

    // Dynamic Baselines
    const G_BASE = Number(sysConfig?.gaming_gpu_baseline || 25000);
    const W_BASE = Number(sysConfig?.working_cpu_baseline || 4500);
    const C_CPU = Number(sysConfig?.creative_cpu_baseline || 40000);
    const C_GPU = Number(sysConfig?.creative_gpu_baseline || 35000);

    // Dynamic Weights
    const w_gaming_gpu = Number(sysConfig?.w_gaming_gpu ?? 60) / 100;
    const w_gaming_cpu = Number(sysConfig?.w_gaming_cpu ?? 30) / 100;
    const w_gaming_ram = Number(sysConfig?.w_gaming_ram ?? 10) / 100;

    const w_working_cpu = Number(sysConfig?.w_working_cpu ?? 50) / 100;
    const w_working_ram = Number(sysConfig?.w_working_ram ?? 40) / 100;
    const w_working_gpu = Number(sysConfig?.w_working_gpu ?? 10) / 100;

    const w_creative_cpu = Number(sysConfig?.w_creative_cpu ?? 40) / 100;
    const w_creative_gpu = Number(sysConfig?.w_creative_gpu ?? 35) / 100;
    const w_creative_ram = Number(sysConfig?.w_creative_ram ?? 15) / 100;
    const w_creative_vram = Number(sysConfig?.w_creative_vram ?? 10) / 100;

    // 🎮 Gaming
    let gaming = 0;
    if (gpu || cpu) {
      gaming += Math.min((gpuScore / G_BASE) * 100, 100) * w_gaming_gpu;
      gaming += Math.min((cpuSingle / W_BASE) * 100, 100) * w_gaming_cpu;
      const ramScoreG = ramCapacity >= 16 ? 100 : (ramCapacity >= 8 ? 50 : 20);
      gaming += ramScoreG * w_gaming_ram;
    }

    // 🎨 Creative/3D
    let creative = 0;
    if (gpu || cpu) {
      creative += Math.min((cpuMulti / C_CPU) * 100, 100) * w_creative_cpu;
      creative += Math.min((gpuScore / C_GPU) * 100, 100) * w_creative_gpu;
      
      const vram = gpu?.vramGb || 0;
      const vramScore = vram >= 16 ? 100 : (vram >= 12 ? 80 : (vram >= 8 ? 50 : 20));
      creative += vramScore * w_creative_vram;

      const ramScore3D = ramCapacity >= 64 ? 100 : (ramCapacity >= 32 ? 80 : (ramCapacity >= 16 ? 50 : 20));
      creative += ramScore3D * w_creative_ram;
    }

    // 💼 Work/Office
    let office = 0;
    if (cpu || gpu) {
      if (cpu) office += Math.min((cpuSingle / W_BASE) * 100, 100) * w_working_cpu;
      const ramScoreW = ramCapacity >= 16 ? 100 : (ramCapacity >= 8 ? 80 : 50);
      office += ramScoreW * w_working_ram;
      if (gpu) office += Math.min((gpuScore / (G_BASE * 0.6)) * 100, 100) * w_working_gpu; // simplified baseline for office GPU
    }

    return {
      price: values.reduce((sum, p) => sum + p.price, 0),
      office: Math.min(office, 100),
      creative: Math.min(creative, 100),
      gaming: Math.min(gaming, 100),
    };
  }, [selectedProducts, sysConfig]);

  const handleSelectProduct = (category: string, product: Component) => {
    setSelectedProducts((prev) => ({ ...prev, [category]: product }));
    setSelectedCategory(null);
  };

  const handleSaveBuildClick = () => {
    if (status === "unauthenticated") {
      onLoginAlertOpen();
    } else {
      onSaveOpen();
    }
  };

  const handleSaveBuildSubmit = async () => {
    if (!buildName.trim()) {
      setBuildNameError("กรุณากรอกชื่อสเปก");
      addToast({ title: "Please Enter Build Name", color: "danger" });
      return;
    }
    setBuildNameError("");

    setIsSaving(true);
    try {
      const payload = {
        name: buildName,
        cpuId: selectedProducts["Processor"]?.id,
        gpuId: selectedProducts["Graphics Card"]?.id,
        ramId: selectedProducts["Memory"]?.id,
        motherboardId: selectedProducts["Motherboard"]?.id,
        storageId: selectedProducts["Storage"]?.id,
        psuId: selectedProducts["Power Supply"]?.id,
        caseId: selectedProducts["Case"]?.id,
        totalPrice: totals.price,
        gamingScore: totals.gaming,
        workingScore: totals.office,
        renderScore: totals.creative
      };

      const res = await fetch('/api/builds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        addToast({ title: "Build Saved successfully!", color: "success" });
        onSaveClose();
        setBuildName("");
        // Optionally clear localStorage or leave it as is
      } else {
        const err = await res.json();
        addToast({ title: `Error: ${err.error || 'Failed to save build'}`, color: "danger" });
      }
    } catch (e) {
      console.error(e);
      addToast({ title: "Internal server error", color: "danger" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-foreground dark font-sans">
      <main className="mx-auto max-w-5xl px-4 sm:px-6 pb-32 pt-24 md:pt-32 space-y-8 md:space-y-12">
        <header className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-white">Configuration<span className="text-blue-500">.</span></h1>
          <p className="text-gray-400 font-medium text-sm md:text-base">เลือกอุปกรณ์และจัดสเปกคอมพิวเตอร์ของคุณ</p>
        </header>

        {/* 1. Component Selection Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {Object.keys(selectedProducts).map((cat) => (
            <Card isPressable key={cat} onPress={() => setSelectedCategory(cat)}
              className={`bg-black/40 border border-white/10 hover:border-blue-500/50 transition-all h-28 md:h-32 ${selectedProducts[cat] ? 'ring-1 ring-blue-500/30' : ''}`}>
              <CardBody className="flex-row items-center gap-4 md:gap-6 p-4 md:p-6 text-left">
                {selectedProducts[cat]?.image ? (
                  <div className="flex h-12 w-12 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-xl bg-white overflow-hidden border border-white/10 shadow-inner p-1">
                    <img src={selectedProducts[cat]!.image!} alt={selectedProducts[cat]!.name} className="max-w-full max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[10px] md:text-[12px] font-bold text-gray-500 border border-white/5 shadow-inner">
                    {cat.substring(0, 3).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col truncate flex-1">
                  <span className="text-[9px] md:text-[11px] font-semibold uppercase text-gray-500 tracking-wider mb-1">{cat}</span>
                  <h3 className={`text-base md:text-lg font-bold truncate ${selectedProducts[cat] ? 'text-white' : 'text-gray-400'}`}>
                    {selectedProducts[cat]?.name || 'เพิ่มอุปกรณ์'}
                  </h3>
                  {selectedProducts[cat] && <span className="text-xs md:text-sm font-bold text-blue-500 mt-1">฿{selectedProducts[cat]?.price.toLocaleString()}</span>}
                </div>
                <div className="ml-auto shrink-0">
                  {selectedProducts[cat] ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProducts(prev => ({ ...prev, [cat]: null }));
                      }}
                      className="flex items-center justify-center h-8 w-8 rounded-full bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                      title={`ลบ ${cat}`}
                    >
                      ✕
                    </button>
                  ) : (
                    <span className="text-gray-500 font-light text-xl md:text-2xl">+</span>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </section>

        {/* 2. Total Summary Card */}
        <Card className="bg-black/40 border border-white/10 p-6 md:p-8" shadow="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-center text-left">
            <div className="lg:col-span-4 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Estimated Total Price</p>
                <h2 className="text-4xl md:text-5xl font-bold text-white">฿{totals.price.toLocaleString()}</h2>
              </div>

              {/* ตราประทับ Compatibility */}
              {Object.values(selectedProducts).some(p => p !== null) && (
                <div className="space-y-2">
                  <Badge variant="flat" color={checkCompatibility.isOk ? "success" : "danger"} className="mb-2">
                    <div className={`flex items-center gap-2 px-1 py-1 text-${checkCompatibility.isOk ? "success" : "danger"}`}>
                      <div className={`h-2 w-2 rounded-full bg-${checkCompatibility.isOk ? "success" : "danger"} shadow-[0_0_10px_currentColor]`}></div>
                      <span className="font-bold text-[10px] md:text-xs uppercase tracking-widest">
                        {checkCompatibility.isOk ? "Compatibility: OK" : "Compatibility: Issues Found"}
                      </span>
                    </div>
                  </Badge>

                  {!checkCompatibility.isOk && (
                    <div className="bg-danger/10 border border-danger/20 rounded-md p-3 text-xs text-danger font-medium space-y-1">
                      {checkCompatibility.issues.map((issue, idx) => (
                        <p key={idx}>⚠️ {issue}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
              <HeroBenchmark label="Work & Office" value={totals.office} color="success" />
              <HeroBenchmark label="Creative / 3D" value={totals.creative} color="primary" />
              <HeroBenchmark label="Gaming Power" value={totals.gaming} color="secondary" />
            </div>
          </div>
        </Card>

        {/* 3. Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
          <Button
            variant="bordered"
            className="w-full sm:w-32 h-14 border-white/10 text-white font-bold text-lg uppercase"
            radius="lg"
            onPress={() => setSelectedProducts({ Processor: null, Motherboard: null, "Graphics Card": null, Memory: null, Storage: null, "Power Supply": null, Case: null, Cooling: null })}
          >
            Clear
          </Button>

          <Button
            color="primary"
            variant="ghost"
            className="w-full sm:w-auto sm:px-16 h-14 font-bold text-xl uppercase"
            radius="lg"
            onPress={handleSaveBuildClick}
          >
            Save Build
          </Button>
        </div>
      </main>

      {/* 4. Modal: Save Build */}
      <Modal isOpen={isSaveOpen} onOpenChange={onSaveChange} backdrop="blur" size="2xl" classNames={{ base: "bg-slate-900 border border-white/10 text-white rounded-[2rem]" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 p-8 border-b border-white/5">
                <h3 className="text-2xl font-bold uppercase">ยืนยันการบันทึกสเปก</h3>
                <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">ตรวจสอบข้อมูลและตั้งชื่อสเปกของคุณ</p>
              </ModalHeader>
              <ModalBody className="p-8 space-y-6">
                <Input 
                  label="ชื่อสเปก (Build Name)" 
                  placeholder="เช่น สเปกเล่นเกมงบ 30k" 
                  variant="bordered" 
                  labelPlacement="outside" 
                  value={buildName} 
                  onValueChange={(val) => {
                    setBuildName(val);
                    if (val.trim()) setBuildNameError("");
                  }} 
                  isRequired
                  isInvalid={!!buildNameError}
                  errorMessage={buildNameError}
                  classNames={{ label: "font-bold text-gray-400", input: "text-lg font-semibold" }} 
                />
                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl space-y-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">All Part</p>
                  <ScrollShadow className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {Object.entries(selectedProducts).map(([cat, prod]) => (
                      <div key={cat} className="flex justify-between text-sm border-b border-white/5 pb-1">
                        <span className="text-gray-500 text-[10px] uppercase font-bold">{cat}</span>
                        <span className="font-semibold text-white truncate max-w-[240px] text-right">{prod?.name || "-"}</span>
                      </div>
                    ))}
                  </ScrollShadow>
                  <Divider className="my-4 bg-white/10" />
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-blue-500 uppercase tracking-widest">Estimated Total Price</span>
                    <span className="text-2xl font-bold tracking-tighter">฿{totals.price.toLocaleString()}</span>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="p-8 border-t border-white/5">
                <Button variant="light" color="danger" onPress={onClose} className="font-bold uppercase">Cancel</Button>
                <Button color="primary" className="font-bold px-10 bg-blue-600 uppercase shadow-xl shadow-blue-500/20" onPress={handleSaveBuildSubmit} isLoading={isSaving}>Save Build</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Login Alert Modal */}
      <Modal isOpen={isLoginAlertOpen} onOpenChange={onLoginAlertChange} backdrop="blur" classNames={{ base: "bg-slate-900 border border-white/10 text-white rounded-[1.5rem]" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 p-6 border-b border-white/5">
                <h3 className="text-xl font-bold uppercase text-danger">Authentication Required</h3>
              </ModalHeader>
              <ModalBody className="p-6">
                <p className="text-gray-300">
                  คุณจะต้องเข้าสู่ระบบก่อนเพื่อทำการบันทึกสเปกคอมพิวเตอร์ของคุณ
                  สเปกปัจจุบันของคุณจะถูกบันทึกไว้ชั่วคราวและจะไม่หายไปเมื่อคุณกลับมาหลังจากเข้าสู่ระบบ
                </p>
              </ModalBody>
              <ModalFooter className="p-6 border-t border-white/5">
                <Button variant="light" onPress={onClose} className="font-bold uppercase">Cancel</Button>
                <Button color="primary" className="font-bold px-8 uppercase" onPress={() => router.push("/api/auth/signin")}>
                  Login Now
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* 5. Selection Modal */}
      <Modal 
        isOpen={!!selectedCategory} 
        onOpenChange={(isOpen) => !isOpen && setSelectedCategory(null)} 
        size="5xl" 
        scrollBehavior="inside"
        placement="bottom-center"
        classNames={{ 
          wrapper: "sm:p-4",
          base: "bg-slate-900 border border-white/10 text-white m-0 rounded-none sm:rounded-[2.5rem] w-full max-h-[90vh] sm:max-h-[85vh]", 
          header: "border-b border-white/10 p-4 md:p-8 bg-slate-800/50",
          body: "p-0 flex flex-col"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold uppercase text-white">{selectedCategory}</h3>
                    <p className="text-[10px] md:text-xs font-bold text-blue-400 uppercase tracking-widest">เลือกอุปกรณ์ที่ต้องการ</p>
                  </div>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col md:flex-row flex-1 h-full min-h-0">
                  <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-white/10 p-4 md:p-8 bg-black/20 shrink-0 overflow-hidden">
                    <div className="flex flex-row md:flex-col flex-wrap gap-3 md:gap-6 w-full items-start">
                      {categoryFilters[selectedCategory || ""]?.map((f) => (
                        <Select 
                          key={f.key} 
                          label={f.label} 
                          labelPlacement="outside" 
                          placeholder="ทั้งหมด" 
                          size="sm" 
                          className="w-[47%] md:w-full flex-grow"
                          selectedKeys={activeFilters[f.key] ? new Set([activeFilters[f.key]]) : new Set(["All"])}
                          onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0] as string;
                            setActiveFilters(prev => ({ ...prev, [f.key]: selected || "All" }));
                          }}
                          classNames={{ label: "text-gray-400 font-bold", trigger: "bg-white/5 border-white/10 h-10 min-h-10", popoverContent: "bg-slate-800 text-white" }}
                        >
                          {f.options.map(opt => <SelectItem key={opt}>{opt}</SelectItem>)}
                        </Select>
                      ))}
                    </div>
                  </aside>
                  <ScrollShadow className="flex-1 p-3 md:p-8 bg-slate-950">
                    {loading ? (
                      <div className="flex justify-center items-center h-full min-h-[300px]">
                        <Spinner color="primary" size="lg" />
                      </div>
                    ) : (
                      <SelectionGrid 
                        category={selectedCategory || ""} 
                        allComponents={components} 
                        onSelectProduct={handleSelectProduct} 
                        onViewDetails={setViewDetailsComp}
                        categoryToType={categoryToTypeMap}
                        activeFilters={activeFilters}
                      />
                    )}
                  </ScrollShadow>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* 6. Product Details Modal */}
      <Modal isOpen={!!viewDetailsComp} onOpenChange={(isOpen) => !isOpen && setViewDetailsComp(null)} size="2xl" classNames={{ base: "bg-slate-900 border border-white/10 text-white" }} scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="border-b border-white/10 p-6">
                <h3 className="text-xl font-bold">รายละเอียดอุปกรณ์</h3>
              </ModalHeader>
              <ModalBody className="p-6 space-y-6">
                {viewDetailsComp && (
                  <>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-1/3 aspect-square bg-white rounded-xl flex justify-center items-center p-4">
                        {viewDetailsComp.image ? (
                          <img src={viewDetailsComp.image} alt={viewDetailsComp.name} className="max-w-full max-h-full object-contain" />
                        ) : (
                          <span className="text-gray-400 text-sm">No Image</span>
                        )}
                      </div>
                      <div className="w-full md:w-2/3 space-y-2">
                        <p className="text-sm font-bold text-gray-500 uppercase">{viewDetailsComp.brand}</p>
                        <h4 className="text-2xl font-bold">{viewDetailsComp.name}</h4>
                        <p className="text-xl font-bold text-success mt-2">฿{viewDetailsComp.price.toLocaleString()}</p>
                        
                        <div className="pt-4 grid grid-cols-2 gap-4 text-sm mt-4">
                            {viewDetailsComp.socket && <div><span className="text-gray-500 block text-xs">Socket</span><span className="font-semibold">{viewDetailsComp.socket}</span></div>}
                            {viewDetailsComp.ramType && <div><span className="text-gray-500 block text-xs">RAM Type</span><span className="font-semibold">{viewDetailsComp.ramType}</span></div>}
                            {viewDetailsComp.formFactor && <div><span className="text-gray-500 block text-xs">Form Factor</span><span className="font-semibold">{viewDetailsComp.formFactor}</span></div>}
                            {viewDetailsComp.capacity !== null && viewDetailsComp.capacity !== undefined && <div><span className="text-gray-500 block text-xs">Capacity</span><span className="font-semibold">{viewDetailsComp.capacity} {viewDetailsComp.type === 'PSU' ? 'W' : 'GB'}</span></div>}
                            {viewDetailsComp.cpuSingleScore !== null && viewDetailsComp.cpuSingleScore !== undefined && <div><span className="text-gray-500 block text-xs">CPU Single Score</span><span className="font-semibold">{viewDetailsComp.cpuSingleScore}</span></div>}
                            {viewDetailsComp.cpuMultiScore !== null && viewDetailsComp.cpuMultiScore !== undefined && <div><span className="text-gray-500 block text-xs">CPU Multi Score</span><span className="font-semibold">{viewDetailsComp.cpuMultiScore}</span></div>}
                            {viewDetailsComp.gpuScore !== null && viewDetailsComp.gpuScore !== undefined && <div><span className="text-gray-500 block text-xs">GPU Score</span><span className="font-semibold">{viewDetailsComp.gpuScore}</span></div>}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                        <h5 className="font-bold border-b border-white/10 pb-2 text-blue-400">คุณสมบัติ / รายละเอียด (Description)</h5>
                        <div className="text-gray-300 text-sm whitespace-pre-line leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5">
                            {(viewDetailsComp as any).description || "ไม่มีรายละเอียดเพิ่มเติมระบุไว้"}
                        </div>
                    </div>
                  </>
                )}
              </ModalBody>
              <ModalFooter className="p-6 border-t border-white/10">
                <Button variant="light" onPress={onClose} className="font-bold">ปิด</Button>
                <Button color="primary" onPress={() => {
                  if (selectedCategory && viewDetailsComp) {
                    handleSelectProduct(selectedCategory, viewDetailsComp);
                    setViewDetailsComp(null);
                  }
                }} className="font-bold px-8 shadow-lg shadow-blue-500/30">เลือกชิ้นส่วนนี้</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

function SelectionGrid({ category, allComponents, onSelectProduct, onViewDetails, categoryToType, activeFilters }: { category: string, allComponents: Component[], onSelectProduct: (cat: string, p: Component) => void, onViewDetails: (p: Component) => void, categoryToType: Record<string, string>, activeFilters: Record<string, string> }) {
  const targetType = categoryToType[category];

  // Filter by type, then by active filters (brand, type, etc.)
  const products = useMemo(() => {
    let filtered = allComponents.filter(c => c.type === targetType);

    // Apply brand filter
    const brandFilter = activeFilters["brand"];
    if (brandFilter && brandFilter !== "All") {
      filtered = filtered.filter(c =>
        c.brand.toLowerCase().includes(brandFilter.toLowerCase())
      );
    }

    // Apply type filter (for RAM, Storage, etc.)
    const typeFilter = activeFilters["type"];
    if (typeFilter && typeFilter !== "All") {
      filtered = filtered.filter(c => {
        const name = c.name.toLowerCase();
        const ramType = c.ramType?.toLowerCase() || "";
        const filterLower = typeFilter.toLowerCase();
        return name.includes(filterLower) || ramType.includes(filterLower);
      });
    }

    return filtered;
  }, [allComponents, targetType, activeFilters]);

  if (products.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <div className="text-4xl">🔍</div>
        <p className="text-gray-400 text-lg font-semibold">ไม่พบสินค้า</p>
        <p className="text-gray-500 text-sm">ลองเปลี่ยนตัวกรองหรือคำค้นหา</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-8">
      {products.map((product) => (
        <Card key={product.id} shadow="sm" className="bg-black/40 border border-white/5 hover:border-blue-500/50 transition-all p-1 overflow-hidden">
          <CardBody className="p-0 flex flex-col h-full overflow-hidden">
            <div className="aspect-square bg-white m-2 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => onSelectProduct(category, product)}>
              {product.image ? (
                <img src={product.image} alt={product.name} className="max-w-[80%] max-h-[80%] object-contain" />
              ) : (
                <span className="text-gray-400 text-xs">No Image</span>
              )}
            </div>
            <div className="p-4 flex flex-col flex-1 text-left space-y-3">
              <div>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{product.brand}</p>
                <h4 className="text-sm font-bold text-white leading-tight line-clamp-2" title={product.name}>{product.name}</h4>
              </div>
              <div className="mt-auto">
                <div className="flex flex-col gap-2">
                  <span className="text-base font-bold text-success">฿{product.price.toLocaleString()}</span>
                  <div className="flex gap-2 w-full">
                    <Button size="sm" variant="flat" color="default" className="text-xs font-bold text-gray-300 flex-1" onPress={() => onViewDetails(product)}>รายละเอียด</Button>
                    <Button size="sm" color="primary" className="text-xs font-bold shadow-lg shadow-blue-500/20 flex-1" onPress={() => onSelectProduct(category, product)}>เลือก</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}