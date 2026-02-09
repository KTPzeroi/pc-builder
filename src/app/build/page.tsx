"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Slider,
  Progress,
  Select,
  SelectItem,
  Badge,
  Divider,
  ScrollShadow,
} from "@heroui/react";

// --- Types & Interfaces ---
interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  image: string;
  performance: {
    office: number;
    creative: number;
    gaming: number;
  };
}

interface FilterOption {
  label: string;
  key: string;
  options: string[];
}

const categoryFilters: Record<string, FilterOption[]> = {
  Processor: [
    { label: "Brand", key: "brand", options: ["All", "Intel", "AMD"] },
    { label: "Socket", key: "socket", options: ["LGA1700", "AM4", "AM5"] }
  ],
  Motherboard: [
    { label: "Brand", key: "brand", options: ["All", "ASUS", "MSI", "GIGABYTE", "ASROCK"] },
    { label: "Socket", key: "socket", options: ["LGA1700", "AM4", "AM5"] },
    { label: "Chipset", key: "chipset", options: ["B760", "B650", "Z790"] }
  ],
  "Graphics Card": [
    { label: "Brand", key: "brand", options: ["All", "GIGABYTE", "ASUS", "MSI"] },
    { label: "Series", key: "series", options: ["GeForce 50 Series", "GeForce 40 Series"] }
  ],
  Memory: [
    { label: "Brand", key: "brand", options: ["All", "Kingston", "Corsair", "ADATA"] },
    { label: "Type", key: "type", options: ["DDR4", "DDR5"] }
  ],
  Storage: [
    { label: "Brand", key: "brand", options: ["All", "Samsung", "Kingston", "Western Digital"] },
    { label: "Type", key: "type", options: ["NVMe SSD", "SATA SSD", "HDD"] }
  ],
  "Power Supply": [
    { label: "Brand", key: "brand", options: ["All", "Corsair", "Seasonic", "Cooler Master"] },
    { label: "Wattage", key: "wattage", options: ["550W", "650W", "750W", "850W"] }
  ],
  Case: [
    { label: "Brand", key: "brand", options: ["All", "NZXT", "Lian Li", "Corsair"] },
    { label: "Form Factor", key: "formFactor", options: ["Mid Tower", "Full Tower", "Mini-ITX"] }
  ],
  Cooling: [
    { label: "Brand", key: "brand", options: ["All", "Noctua", "Arctic", "Deepcool"] },
    { label: "Type", key: "type", options: ["Air Cooler", "AIO Liquid Cooler"] }
  ]
};

export default function BuildPage() {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [selectedProducts, setSelectedProducts] = useState<Record<string, Product | null>>({
    Processor: { 
      id: "cpu-1", name: "Intel Core i5-13400F", category: "Processor", brand: "Intel", 
      price: 6890, image: "https://via.placeholder.com/150", performance: { office: 90, creative: 40, gaming: 30 } 
    },
    Motherboard: null,
    "Graphics Card": null,
    Memory: null,
    Storage: null,
    "Power Supply": null,
    Case: null,
    Cooling: null,
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
    setSelectedProducts(prev => ({ ...prev, [category]: product }));
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark font-sans">
      <main className="mx-auto max-w-5xl px-6 pb-32 pt-24 md:pt-28 space-y-12">
        <header className="space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tight italic">
            Configuration <span className="text-primary">.</span>
          </h1>
          <p className="text-default-500 font-medium">Build your custom PC with HeroUI Intelligence</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(selectedProducts).map((cat) => (
            <Card 
              isPressable 
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              className={`border-none h-32 ${selectedProducts[cat] ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-content1'}`}
              shadow="sm"
            >
              <CardBody className="flex-row items-center gap-6 p-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-content2 text-[12px] font-black text-default-400 border border-white/5 shadow-inner">
                  {cat.substring(0, 3).toUpperCase()}
                </div>
                
                <div className="flex flex-col truncate">
                  <span className="text-[11px] font-bold uppercase text-default-500 tracking-[0.2em] mb-1">
                    {cat}
                  </span>
                  <h3 className={`text-xl font-bold truncate ${selectedProducts[cat] ? 'text-white' : 'text-slate-400'}`}>
                    {selectedProducts[cat]?.name || 'Add Component'}
                  </h3>
                  {selectedProducts[cat] && (
                    <span className="text-sm font-black text-default-600 mt-1">
                      ฿{selectedProducts[cat]?.price.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="ml-auto text-default-300 font-light text-2xl">
                   {!selectedProducts[cat] && "+"}
                </div>
              </CardBody>
            </Card>
          ))}
        </section>

        <Card className="p-8 border-none bg-content1/50" shadow="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-4 space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-default-500 uppercase tracking-widest">Estimated Total Price</p>
                <div className="flex items-baseline gap-1">
                  <h2 className="text-5xl font-black">฿{totals.price.toLocaleString()}</h2>
                  <span className="text-sm font-bold text-default-400">.00</span>
                </div>
              </div>
              <Badge variant="flat" color="success">
                <div className="flex items-center gap-2 px-1">
                  <div className="h-2 w-2 rounded-full bg-success shadow-[0_0_10px_rgba(24,201,100,0.5)]"></div>
                  <span className="text-default-600 font-semibold">Compatibility: 100% OK</span>
                </div>
              </Badge>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
              <HeroBenchmark label="Work & Office" value={totals.office} color="success" />
              <HeroBenchmark label="Creative / 3D" value={totals.creative} color="primary" />
              <HeroBenchmark label="Gaming Power" value={totals.gaming} color="secondary" />
            </div>
          </div>
        </Card>
      </main>

      <AnimatePresence>
        {selectedCategory && (
          <SelectionModal 
            category={selectedCategory}
            onClose={() => setSelectedCategory(null)}
            onSelectProduct={handleSelectProduct}
          />
        )}
      </AnimatePresence>

        {/* <div className="fixed bottom-8 right-8 z-[60] flex flex-col items-end gap-4">
            {isAiOpen && (
            <Card className="w-80 border-none bg-content1 shadow-2xl animate-in fade-in slide-in-from-bottom-4" radius="lg">
                <CardHeader className="bg-primary p-4 text-white flex justify-between font-black italic text-[10px] uppercase tracking-widest">
                <span>Gemini PC Expert</span>
                <Button isIconOnly size="sm" variant="light" className="text-white" onPress={() => setIsAiOpen(false)}>✕</Button>
                </CardHeader>
                <CardBody className="h-64 p-4 text-[11px] leading-relaxed overflow-y-auto">
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl rounded-tl-none text-blue-100">
                    หน้า BUILD ของคุณตอนนี้มี Modal ที่สวยงามพร้อม Animation ด้วย Framer Motion แล้วครับ! ยอดเยี่ยมเลย!
                </div>
                </CardBody>
            </Card>
            )}
            <Button 
            isIconOnly 
            radius="full" 
            size="lg" 
            color="primary" 
            shadow="lg"
            onPress={() => setIsAiOpen(!isAiOpen)}
            className="h-16 w-16 shadow-primary/40 text-2xl font-black italic"
            >
            AI
            </Button>
        </div> */}
    </div>
  );
}

function HeroBenchmark({ label, value, color }: { label: string, value: number, color: any }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-bold uppercase tracking-widest text-default-500">{label}</span>
        <span className={`text-sm font-black text-${color}`}>{Math.round(value)}%</span>
      </div>
      <Progress size="sm" value={value} color={color} aria-label={label} />
    </div>
  );
}

interface SelectionModalProps {
  category: string;
  onClose: () => void;
  onSelectProduct: (category: string, product: Product) => void;
}

const SelectionModal: React.FC<SelectionModalProps> = ({ category, onClose, onSelectProduct }) => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const mockProducts: Product[] = useMemo(() => {
    const baseProducts = [
      { id: "p1", name: `${category} X-Pro`, category: category, brand: "BrandA", price: 12500, image: "https://via.placeholder.com/200?text=Product+1", performance: { office: 70, creative: 60, gaming: 80 } },
      { id: "p2", name: `${category} Lite-Z`, category: category, brand: "BrandB", price: 8900, image: "https://via.placeholder.com/200?text=Product+2", performance: { office: 60, creative: 50, gaming: 70 } },
      { id: "p3", name: `${category} Master`, category: category, brand: "BrandC", price: 18000, image: "https://via.placeholder.com/200?text=Product+3", performance: { office: 85, creative: 75, gaming: 95 } },
      { id: "p4", name: `${category} Entry`, category: category, brand: "BrandA", price: 5500, image: "https://via.placeholder.com/200?text=Product+4", performance: { office: 50, creative: 30, gaming: 40 } },
      { id: "p5", name: `${category} Gaming`, category: category, brand: "BrandB", price: 15000, image: "https://via.placeholder.com/200?text=Product+5", performance: { office: 65, creative: 70, gaming: 90 } },
      { id: "p6", name: `${category} Workstation`, category: category, brand: "BrandC", price: 22000, image: "https://via.placeholder.com/200?text=Product+6", performance: { office: 95, creative: 80, gaming: 70 } },
    ];
    return baseProducts; 
  }, [category, activeFilters]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-background/60 backdrop-blur-md"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      
      <motion.div
        className="relative flex h-[85vh] w-full max-w-6xl flex-col bg-[#162031] border-none shadow-2xl overflow-hidden rounded-[2.5rem]"
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 20, stiffness: 100, duration: 0.3 }}
      >
        <Card className="flex-1 border-none bg-transparent">
          <CardHeader className="flex justify-between p-8 border-b border-white/10 bg-[#1c283d] rounded-t-lg">
            <div>
              <h3 className="text-2xl font-black uppercase italic text-white">{category}</h3>
              <p className="text-xs font-bold text-primary uppercase">HeroUI Smart Selection</p>
            </div>
            <Button isIconOnly variant="light" className="text-white" onPress={onClose}>&times;</Button>
          </CardHeader>

          <div className="flex flex-1 overflow-hidden">
            <aside className="w-72 border-r border-white/10 p-8 space-y-8 bg-[#1c283d]/50 overflow-y-auto">
              {categoryFilters[category]?.map((f) => (
                <Select
                  key={f.key}
                  label={f.label}
                  labelPlacement="outside"
                  placeholder="Select option"
                  size="sm"
                  className="max-w-xs"
                  onChange={(e) => setActiveFilters({...activeFilters, [f.key]: e.target.value})}
                >
                  {f.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </Select>
              ))}
              
              <div className="pt-4">
                <Slider 
                  label="Price Range"
                  step={500} 
                  maxValue={50000} 
                  minValue={0} 
                  defaultValue={[15000, 18000]}
                  formatOptions={{style: "currency", currency: "THB"}}
                  className="max-w-md"
                  size="sm"
                  color="success"
                />
              </div>
            </aside>

            <ScrollShadow className="flex-1 p-8 bg-[#162031]">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {mockProducts.map((product) => (
                  <Card 
                    shadow="sm" 
                    isPressable 
                    key={product.id} 
                    onPress={() => onSelectProduct(category, product)}
                    className="bg-[#0f172a]/60 border-none hover:bg-content2 transition p-1"
                  >
                    <CardBody className="p-0">
                      <div className="aspect-square bg-white m-2 rounded-xl flex items-center justify-center">
                         <img src={product.image} alt={product.name} className="max-w-[80%] max-h-[80%] object-contain"/>
                      </div>
                      <div className="p-4 space-y-3">
                        <p className="text-[10px] font-bold text-default-500 uppercase tracking-widest">{product.brand}</p>
                        <h4 className="text-sm font-bold text-white leading-tight truncate">{product.name}</h4>
                        <Divider className="opacity-10" />
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-black text-success tracking-tighter uppercase">฿{product.price.toLocaleString()}</span>
                          {/* แก้ไข: เปลี่ยน Button เป็น div ตกแต่ง เพื่อเลี่ยง Nested Button Error */}
                          <div className="inline-flex items-center justify-center h-8 px-3 text-[10px] font-bold text-primary uppercase transition-colors rounded-lg bg-primary/20 hover:bg-primary hover:text-white">
                            Select
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </ScrollShadow>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};