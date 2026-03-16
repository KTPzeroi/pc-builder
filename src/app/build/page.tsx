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
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-bold uppercase tracking-widest text-default-500">{label}</span>
        <span className={`text-sm font-bold text-${color}`}>{Math.round(value)}%</span>
      </div>
      <Progress size="sm" value={value} color={color} aria-label={label} />
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
  const [isSaving, setIsSaving] = useState(false);

  // เก็บข้อมูลสินค้าทั้งหมดจาก Database
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/components")
      .then(res => res.json())
      .then(data => {
        setComponents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch components", err);
        setLoading(false);
      });
  }, []);

  const [selectedProducts, setSelectedProducts] = useState<Record<string, Component | null>>({
    Processor: null, Motherboard: null, "Graphics Card": null, Memory: null, Storage: null, "Power Supply": null, Case: null, Cooling: null,
  });

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
  }, []);

  // Save to localStorage when selection changes
  useEffect(() => {
    localStorage.setItem('pc_builder_selection', JSON.stringify(selectedProducts));
  }, [selectedProducts]);

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

  // 🧮 คำนวณ % จาก Database
  const totals = useMemo(() => {
    const values = Object.values(selectedProducts).filter(p => p !== null) as Component[];
    const cpu = selectedProducts["Processor"];
    const gpu = selectedProducts["Graphics Card"];
    const ram = selectedProducts["Memory"];

    const cpuSingle = cpu?.cpuSingleScore || 0;
    const cpuMulti = cpu?.cpuMultiScore || 0;
    // ถ้าไม่มี GPU แยก ให้ใช้คะแนน GPU ในตารางที่อาจเป็น 0 ไปก่อน (เดี๋ยวค่อยลดลั่นไว้ทีหลัง)
    const gpuScore = gpu?.gpuScore || 0;
    const ramCapacity = ram?.capacity || 0;

    // 🎮 Gaming (100% = GPU 25k)
    let gaming = 0;
    if (gpu || cpu) {
      gaming += Math.min((gpuScore / 25000) * 100, 100) * 0.6;
      gaming += Math.min((cpuSingle / 4500) * 100, 100) * 0.3;
      const ramScoreG = ramCapacity >= 16 ? 100 : (ramCapacity >= 8 ? 50 : 20);
      gaming += ramScoreG * 0.1;
    }

    // 🎨 Creative/3D (100% = CPU Multi 40k, GPU 35k)
    let creative = 0;
    if (gpu || cpu) {
      creative += Math.min((cpuMulti / 40000) * 100, 100) * 0.45;
      creative += Math.min((gpuScore / 35000) * 100, 100) * 0.4;
      const ramScore3D = ramCapacity >= 64 ? 100 : (ramCapacity >= 32 ? 80 : (ramCapacity >= 16 ? 50 : 20));
      creative += ramScore3D * 0.15;
    }

    // 💼 Work/Office (100% = CPU Single 4.5k)
    let office = 0;
    if (cpu) {
      office += Math.min((cpuSingle / 4500) * 100, 100) * 0.5;
      const ramScoreW = ramCapacity >= 16 ? 100 : (ramCapacity >= 8 ? 80 : 50);
      office += ramScoreW * 0.4;
      office += Math.min((gpuScore / 15000) * 100, 100) * 0.1;
    }

    return {
      price: values.reduce((sum, p) => sum + p.price, 0),
      office: Math.min(office, 100),
      creative: Math.min(creative, 100),
      gaming: Math.min(gaming, 100),
    };
  }, [selectedProducts]);

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
    if (!buildName) {
      addToast({ title: "Please Enter Build Name", color: "danger" });
      return;
    }

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
                <div className="flex h-12 w-12 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[10px] md:text-[12px] font-bold text-gray-500 border border-white/5 shadow-inner">
                  {cat.substring(0, 3).toUpperCase()}
                </div>
                <div className="flex flex-col truncate flex-1">
                  <span className="text-[9px] md:text-[11px] font-semibold uppercase text-gray-500 tracking-wider mb-1">{cat}</span>
                  <h3 className={`text-base md:text-lg font-bold truncate ${selectedProducts[cat] ? 'text-white' : 'text-gray-400'}`}>
                    {selectedProducts[cat]?.name || 'เพิ่มอุปกรณ์'}
                  </h3>
                  {selectedProducts[cat] && <span className="text-xs md:text-sm font-bold text-blue-500 mt-1">฿{selectedProducts[cat]?.price.toLocaleString()}</span>}
                </div>
                <div className="ml-auto text-gray-500 font-light text-xl md:text-2xl">{!selectedProducts[cat] && "+"}</div>
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
                <Input label="ชื่อสเปก (Build Name)" placeholder="เช่น สเปกเล่นเกมงบ 30k" variant="bordered" labelPlacement="outside" value={buildName} onValueChange={setBuildName} classNames={{ label: "font-bold text-gray-400", input: "text-lg font-semibold" }} />
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
        classNames={{ 
          base: "bg-slate-900 border border-white/10 text-white md:rounded-[2.5rem]", 
          header: "border-b border-white/10 p-6 md:p-8 bg-slate-800/50",
          body: "p-0"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold uppercase text-white">{selectedCategory}</h3>
                    <p className="text-[10px] md:text-xs font-bold text-blue-400 uppercase tracking-widest">เลือกอุปกรณ์ที่ต้องการ</p>
                  </div>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col md:flex-row flex-1 h-full min-h-[60vh] md:h-[70vh]">
                  <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-white/10 p-4 md:p-8 space-y-4 bg-black/20 overflow-x-auto md:overflow-y-auto">
                    <div className="flex md:flex-col gap-4">
                      {categoryFilters[selectedCategory || ""]?.map((f) => (
                        <Select key={f.key} label={f.label} labelPlacement="outside" placeholder="ทั้งหมด" size="sm" className="min-w-[140px] md:w-full"
                          classNames={{ label: "text-gray-400 font-bold", trigger: "bg-white/5 border-white/10", popoverContent: "text-white" }}>
                          {f.options.map(opt => <SelectItem key={opt}>{opt}</SelectItem>)}
                        </Select>
                      ))}
                    </div>
                  </aside>
                  <ScrollShadow className="flex-1 p-4 md:p-8 bg-slate-950">
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

function SelectionGrid({ category, allComponents, onSelectProduct, onViewDetails, categoryToType }: { category: string, allComponents: Component[], onSelectProduct: (cat: string, p: Component) => void, onViewDetails: (p: Component) => void, categoryToType: Record<string, string> }) {
  const targetType = categoryToType[category];
  const products = allComponents.filter(c => c.type === targetType);

  if (products.length === 0) {
    return <div className="text-gray-400 text-center py-10">ยังไม่มีสินค้าในหมวดหมู่นี้</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-8">
      {products.map((product) => (
        <Card key={product.id} className="bg-black/40 border border-white/5 hover:border-blue-500/50 transition-all p-1">
          <CardBody className="p-0 flex flex-col h-full">
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
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-success">฿{product.price.toLocaleString()}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="flat" color="default" className="text-xs font-bold text-gray-300" onPress={() => onViewDetails(product)}>รายละเอียด</Button>
                    <Button size="sm" color="primary" className="text-xs font-bold shadow-lg shadow-blue-500/20" onPress={() => onSelectProduct(category, product)}>เลือก</Button>
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