"use client";

import React, { useState, useMemo } from "react";
import {
  Card, CardBody, Button, Input, Chip, Tabs, Tab, Avatar,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, Select, SelectItem, Textarea, Divider, ScrollShadow, Progress
} from "@heroui/react";
import Link from "next/link";

// --- Helper Component สำหรับ Benchmark ---
function HeroBenchmark({ label, value, color }: { label: string, value: number, color: any }) {
  return (
    <div className="space-y-3 w-full text-left">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-bold uppercase tracking-widest text-default-500">{label}</span>
        <span className={`text-sm font-bold text-${color}`}>{Math.round(value)}%</span>
      </div>
      <Progress size="sm" value={value} color={color} aria-label={label} />
    </div>
  );
}

const posts = [
  { id: 1, title: "ช่วยดูสเปกหน่อยครับ งบ 30,000 บาท รวมจอ เน้นเล่นเกม", category: "Build Advice", author: "User01", date: "2 ชั่วโมงที่แล้ว", replies: 15, color: "primary" },
  { id: 2, title: "ประกอบเสร็จแล้วครับ! สเปกขาวล้วนในฝัน", category: "Showcase", author: "GamerPro", date: "5 ชั่วโมงที่แล้ว", replies: 42, color: "success" },
  { id: 3, title: "เปิดคอมแล้วค้างหน้า BIOS แก้ยังไงดีครับ?", category: "Troubleshoot", author: "NewbieBuilder", date: "1 วันที่แล้ว", replies: 8, color: "danger" },
];

const categories = [
  { label: "Build Advice", value: "build", color: "primary" },
  { label: "Troubleshoot", value: "troubleshoot", color: "danger" },
  { label: "Showcase", value: "showcase", color: "success" },
];

export default function ForumPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // 🟢 1. เพิ่ม State สำหรับเก็บค่าการค้นหาและหมวดหมู่ที่เลือก
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 🟢 2. Logic การกรองกระทู้ตามเงื่อนไข
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // ตรวจสอบหมวดหมู่ (ถ้าเป็น all ให้ผ่านหมด ถ้าไม่ใช่ต้องตรงกัน)
      const matchesTab = selectedTab === "all" || post.category.toLowerCase().replace(/\s+/g, '') === selectedTab;
      
      // ตรวจสอบคำค้นหาในหัวข้อกระทู้
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesTab && matchesSearch;
    });
  }, [selectedTab, searchQuery]);

  return (
    <main className="min-h-screen bg-slate-950 pt-20 md:pt-28 pb-12">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 uppercase tracking-tight">COMMUNITY FORUM</h1>
          <p className="text-sm md:text-base text-gray-400 font-medium">พูดคุย สอบถาม และแชร์สเปกคอมพิวเตอร์ของคุณ</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 1. Sidebar Section (3/12) */}
          <aside className="lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1 w-full">
            <Card className="bg-black/40 border border-white/5 p-5 shadow-xl sticky top-28 w-full">
              <div className="flex flex-col gap-8">
                {/* แถบค้นหาใน Sidebar พร้อมเชื่อม Logic */}
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1">ค้นหากระทู้</p>
                  <Input 
                    placeholder="ค้นหา..." 
                    variant="bordered" 
                    className="text-white" 
                    fullWidth 
                    value={searchQuery}
                    onValueChange={setSearchQuery} // เชื่อมต่อช่องค้นหา
                    startContent={<span className="text-gray-500">🔍</span>}
                  />
                </div>

                <Divider className="bg-white/5" />

                {/* หมวดหมู่ใน Sidebar พร้อมเชื่อม Logic */}
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1">หมวดหมู่</p>
                  <Tabs 
                    aria-label="Categories" 
                    color="primary" 
                    variant="underlined" 
                    isVertical 
                    className="w-full"
                    selectedKey={selectedTab}
                    onSelectionChange={(key) => setSelectedTab(key as string)} // เชื่อมต่อการเลือก Tab
                    classNames={{
                      tabList: "w-full gap-2 border-l-2 border-white/5",
                      tab: "justify-start h-11 font-bold px-4",
                      cursor: "w-full bg-blue-500/20"
                    }}
                  >
                    <Tab key="all" title="All Posts" />
                    <Tab key="buildadvice" title="Build Advice" />
                    <Tab key="troubleshoot" title="Troubleshoot" />
                    <Tab key="showcase" title="Showcase" />
                  </Tabs>
                </div>
              </div>
            </Card>

            <Card className="bg-blue-600/5 border border-blue-500/10 p-5 hidden lg:block">
               <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 italic">Guidelines</h4>
               <p className="text-[11px] text-gray-500 leading-relaxed font-medium">โปรดรักษามารยาทในการพูดคุยเพื่อให้สังคมน่าอยู่ครับ</p>
            </Card>
          </aside>

          {/* 2. Main Content Section (9/12) */}
          <div className="lg:col-span-9 space-y-4 order-1 lg:order-2 flex flex-col w-full">
            <div className="flex flex-col gap-3 w-full">
              {/* 🟢 แสดงรายการที่กรองแล้ว */}
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <Link href={`/forum/${post.id}`} key={post.id} className="w-full block group">
                    <Card 
                      isPressable 
                      className="bg-black/40 border border-white/5 hover:border-blue-500/40 transition-all shadow-lg w-full"
                    >
                      <CardBody className="p-5 md:p-6 text-left w-full">
                        <div className="flex items-center justify-between gap-4 w-full">
                          <div className="flex items-center gap-4 overflow-hidden flex-1">
                            <Avatar name={post.author} className="hidden sm:flex shrink-0 border border-white/10" size="sm" />
                            <div className="flex flex-col gap-1.5 overflow-hidden flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <Chip size="sm" color={post.color as any} variant="flat" className="h-5 text-[10px] font-bold uppercase p-0 px-2">
                                  {post.category}
                                </Chip>
                                <h3 className="text-base md:text-lg font-bold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                                  {post.title}
                                </h3>
                              </div>
                              <p className="text-xs text-gray-500 font-medium">
                                โดย <span className="text-gray-300 font-semibold">{post.author}</span> • {post.date}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end shrink-0 min-w-[60px]">
                            <span className="text-blue-500 font-bold text-sm md:text-base leading-none">{post.replies}</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Replies</span>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Link>
                ))
              ) : (
                // แสดงเมื่อไม่พบข้อมูล
                <Card className="bg-black/20 border border-dashed border-white/10 p-12">
                   <CardBody className="flex flex-col items-center gap-2 text-gray-500">
                      <span className="text-4xl">📄</span>
                      <p className="font-bold">ไม่พบกระทู้ที่ค้นหา</p>
                   </CardBody>
                </Card>
              )}
            </div>
          </div>

        </div>

        {/* 3. Floating Button สำหรับ New Post */}
        <div className="fixed bottom-8 right-8 z-50">
          <Button 
            onPress={onOpen}
            color="primary" 
            size="lg"
            className="shadow-2xl font-bold bg-blue-600 rounded-full h-14 md:h-16 px-8 hover:scale-105 active:scale-95 transition-all"
          >
            <span className="text-xl mr-2">+</span> NEW POST
          </Button>
        </div>

      </div>

      {/* 4. New Post Modal (โค้ดเดิมของคุณทั้งหมด) */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange} 
        backdrop="blur" 
        size="5xl" 
        scrollBehavior="inside"
        classNames={{
          base: "bg-slate-950 border border-white/10 text-white max-h-[90vh]",
          header: "border-b border-white/5 p-6",
          footer: "border-t border-white/5 p-4",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <span className="text-2xl font-bold">Create New Community Post</span>
                <p className="text-xs font-normal text-gray-500">แบ่งปันความรู้หรือขอความช่วยเหลือจากเพื่อนสมาชิก</p>
              </ModalHeader>
              <ModalBody className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
                  <div className="lg:col-span-2 p-6 border-r border-white/5 flex flex-col gap-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    <div className="flex flex-col gap-6">
                      <Select label="Category" placeholder="Select a category" variant="bordered" labelPlacement="outside">
                        {categories.map((cat) => (
                          <SelectItem key={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </Select>
                      <Input label="Topic Title" placeholder="ระบุหัวข้อที่ต้องการพูดคุย..." variant="bordered" labelPlacement="outside" />
                      <Textarea label="Content Description" placeholder="รายละเอียดเนื้อหา..." variant="bordered" labelPlacement="outside" minRows={6} />
                      <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-white/70 font-bold">Upload Images</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/5 hover:border-blue-500/50 transition-all group">
                            <span className="text-2xl group-hover:scale-110 transition-transform">📸</span>
                            <span className="text-[10px] text-gray-500 mt-1 font-bold">Add Photo</span>
                            <input type="file" className="hidden" accept="image/*" multiple />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/20 p-6 flex flex-col gap-4">
                    <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider italic">Attach Your Build</h4>
                    <p className="text-xs text-gray-500 mb-2 font-medium text-left">เลือกสเปกที่คุณจัดไว้เพื่อแนบไปกับโพสต์</p>
                    <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                      {[1, 2, 3].map((item) => (
                        <Card key={item} isPressable className="bg-white/5 border border-white/10 hover:border-blue-500/50 p-3">
                          <p className="text-xs font-bold text-white mb-1">สเปกเล่นเกมงบ {item}0k</p>
                          <p className="text-[10px] text-gray-500 font-semibold italic">i5-13400F + RTX 4060</p>
                        </Card>
                      ))}
                    </div>
                    <Button variant="ghost" color="primary" size="sm" className="mt-auto border-blue-500/30 hover:bg-blue-500/10 font-bold uppercase">Manage My Builds</Button>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" color="danger" onPress={onClose} className="font-bold uppercase">Discard</Button>
                <Button color="primary" onPress={onClose} className="px-10 font-bold bg-blue-600 shadow-lg shadow-blue-500/20 uppercase">Publish Post</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </main>
  );
}