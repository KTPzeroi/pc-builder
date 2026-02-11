"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card, CardBody, CardHeader, Button, Progress,
  Select, SelectItem, Badge, Divider, ScrollShadow,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, Input, addToast
} from "@heroui/react";

// --- Types & Interfaces ---
interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  image: string;
  performance: { office: number; creative: number; gaming: number; };
}

interface FilterOption {
  label: string;
  key: string;
  options: string[];
}

const categoryFilters: Record<string, FilterOption[]> = {
  Processor: [{ label: "Brand", key: "brand", options: ["All", "Intel", "AMD"] }],
  Motherboard: [{ label: "Brand", key: "brand", options: ["All", "ASUS", "MSI"] }],
  "Graphics Card": [{ label: "Brand", key: "brand", options: ["All", "GIGABYTE", "ASUS"] }],
  Memory: [{ label: "Type", key: "type", options: ["DDR4", "DDR5"] }],
  Storage: [{ label: "Type", key: "type", options: ["NVMe", "SATA"] }],
  "Power Supply": [{ label: "Wattage", key: "wattage", options: ["650W", "750W", "850W"] }],
  Case: [{ label: "Form", key: "form", options: ["Mid Tower", "ITX"] }],
  Cooling: [{ label: "Type", key: "type", options: ["Air", "Liquid"] }]
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { isOpen: isSaveOpen, onOpen: onSaveOpen, onOpenChange: onSaveChange } = useDisclosure();
  const [buildName, setBuildName] = useState("");

  const [selectedProducts, setSelectedProducts] = useState<Record<string, Product | null>>({
    Processor: { id: "cpu-1", name: "Intel Core i5-13400F", category: "Processor", brand: "Intel", price: 6890, image: "https://via.placeholder.com/150", performance: { office: 90, creative: 40, gaming: 30 } },
    Motherboard: null, "Graphics Card": null, Memory: null, Storage: null, "Power Supply": null, Case: null, Cooling: null,
  });

  const totals = useMemo(() => {
    const values = Object.values(selectedProducts).filter(p => p !== null) as Product[];
    return {
      price: values.reduce((sum, p) => sum + p.price, 0),
      office: values.length > 0 ? (values.reduce((sum, p) => sum + p.performance.office, 0) / values.length) : 0,
      creative: values.length > 0 ? (values.reduce((sum, p) => sum + p.performance.creative, 0) / values.length) : 0,
      gaming: values.length > 0 ? (values.reduce((sum, p) => sum + p.performance.gaming, 0) / values.length) : 0,
    };
  }, [selectedProducts]);

  const handleSelectProduct = (category: string, product: Product) => {
    setSelectedProducts((prev) => ({ ...prev, [category]: product }));
    setSelectedCategory(null);
  };

  const handleSaveBuild = (onClose: () => void) => {
    if (!buildName) {
      addToast({ title: "Please Enter Build Name", color: "danger" });
      return;
    }
    addToast({ title: "Build Saved!", color: "success" });
    onClose();
    setBuildName("");
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
              <Badge variant="flat" color="success">
                <div className="flex items-center gap-2 px-1 py-1 text-success">
                  <div className="h-2 w-2 rounded-full bg-success shadow-[0_0_10px_rgba(24,201,100,0.5)]"></div>
                  <span className="font-bold text-[10px] md:text-xs uppercase tracking-widest">Compatibility: OK</span>
                </div>
              </Badge>
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
          <Button variant="bordered" className="w-full sm:w-32 h-14 border-white/10 text-white font-bold text-lg uppercase" radius="xl"
            onPress={() => setSelectedProducts({ Processor: null, Motherboard: null, "Graphics Card": null, Memory: null, Storage: null, "Power Supply": null, Case: null, Cooling: null })}>
            Clear
          </Button>
          <Button color="primary" className="flex-1 sm:flex-none sm:px-16 h-14 font-bold text-xl uppercase" variant="ghost" onPress={onSaveOpen}>
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
                <Button color="primary" className="font-bold px-10 bg-blue-600 uppercase shadow-xl shadow-blue-500/20" onPress={() => handleSaveBuild(onClose)}>Save Build</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* 5. Selection Modal */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => setSelectedCategory(null)} />
            <motion.div className="relative flex h-[95vh] md:h-[85vh] w-full max-w-6xl flex-col bg-slate-900 border border-white/10 shadow-2xl overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem]" initial={{ y: 50, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 50, opacity: 0, scale: 0.95 }}>
              
              <Card className="flex-1 bg-transparent border-none shadow-none">
                <CardHeader className="flex justify-between p-6 md:p-8 border-b border-white/10 bg-slate-800/50">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold uppercase text-white">{selectedCategory}</h3>
                    <p className="text-[10px] md:text-xs font-bold text-blue-400 uppercase tracking-widest">เลือกอุปกรณ์ที่ต้องการ</p>
                  </div>
                  <Button isIconOnly variant="light" className="text-white text-xl" onPress={() => setSelectedCategory(null)}>&times;</Button>
                </CardHeader>

                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                  <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-white/10 p-4 md:p-8 space-y-4 bg-black/20 overflow-x-auto md:overflow-y-auto">
                    <div className="flex md:flex-col gap-4">
                      {categoryFilters[selectedCategory]?.map((f) => (
                        <Select key={f.key} label={f.label} labelPlacement="outside" placeholder="ทั้งหมด" size="sm" className="min-w-[140px] md:w-full"
                          classNames={{ label: "text-gray-400 font-bold", trigger: "bg-white/5 border-white/10" }}>
                          {f.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </Select>
                      ))}
                    </div>
                  </aside>
                  <CardBody className="p-0 bg-slate-950">
                    <ScrollShadow className="flex-1 p-4 md:p-8">
                      <SelectionGrid category={selectedCategory} onSelectProduct={handleSelectProduct} />
                    </ScrollShadow>
                  </CardBody>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SelectionGrid({ category, onSelectProduct }: { category: string, onSelectProduct: (cat: string, p: Product) => void }) {
  const products: Product[] = [
    { id: "p1", name: `${category} X-Pro`, category, brand: "BrandA", price: 12500, image: "https://via.placeholder.com/200?text=Product+1", performance: { office: 70, creative: 60, gaming: 80 } },
    { id: "p2", name: `${category} Lite-Z`, category, brand: "BrandB", price: 8900, image: "https://via.placeholder.com/200?text=Product+2", performance: { office: 60, creative: 50, gaming: 70 } },
    { id: "p3", name: `${category} Master`, category, brand: "BrandC", price: 18000, image: "https://via.placeholder.com/200?text=Product+3", performance: { office: 85, creative: 75, gaming: 95 } },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-8">
      {products.map((product) => (
        <Card key={product.id} isPressable onPress={() => onSelectProduct(category, product)} className="bg-black/40 border border-white/5 hover:border-blue-500/50 transition-all p-1">
          <CardBody className="p-0">
            <div className="aspect-square bg-white m-2 rounded-xl flex items-center justify-center overflow-hidden">
               <img src={product.image} alt={product.name} className="max-w-[80%] max-h-[80%] object-contain"/>
            </div>
            <div className="p-4 space-y-3 text-left">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{product.brand}</p>
              <h4 className="text-sm font-bold text-white leading-tight truncate">{product.name}</h4>
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-success">฿{product.price.toLocaleString()}</span>
                <div className="inline-flex items-center justify-center h-7 px-3 text-[9px] font-bold text-blue-500 uppercase rounded-lg bg-blue-500/10">เลือก</div>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}