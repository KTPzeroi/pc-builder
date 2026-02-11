"use client";

import React from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Chip,
  Tabs,
  Tab,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import Link from "next/link";

// ข้อมูลจำลองกระทู้
const posts = [
  {
    id: 1,
    title: "ช่วยดูสเปกหน่อยครับ งบ 30,000 บาท รวมจอ เน้นเล่นเกม",
    category: "Build Advice",
    author: "User01",
    date: "2 ชั่วโมงที่แล้ว",
    replies: 15,
    color: "primary",
  },
  {
    id: 2,
    title: "ประกอบเสร็จแล้วครับ! สเปกขาวล้วนในฝัน",
    category: "Showcase",
    author: "GamerPro",
    date: "5 ชั่วโมงที่แล้ว",
    replies: 42,
    color: "success",
  },
  {
    id: 3,
    title: "เปิดคอมแล้วค้างหน้า BIOS แก้ยังไงดีครับ?",
    category: "Troubleshoot",
    author: "NewbieBuilder",
    date: "1 วันที่แล้ว",
    replies: 8,
    color: "danger",
  },
];

// หมวดหมู่สำหรับการสร้างกระทู้
const categories = [
  { label: "Build Advice", value: "build", color: "primary" },
  { label: "Troubleshoot", value: "troubleshoot", color: "danger" },
  { label: "Showcase", value: "showcase", color: "success" },
];

export default function ForumPage() {
  // ควบคุมการเปิด Modal
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <main className="min-h-screen bg-slate-950 pt-20 md:pt-24 pb-12 px-4 sm:px-8 lg:px-24">
      
      {/* 1. Header & Search Section */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:justify-between md:items-end md:gap-6">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            COMMUNITY FORUM
          </h1>
          <p className="text-sm md:text-base text-gray-400">
            พูดคุย สอบถาม และแชร์สเปกคอมพิวเตอร์ของคุณ
          </p>
        </div>
        <div className="w-full md:w-1/3">
          <Input
            placeholder="ค้นหากระทู้..."
            variant="bordered"
            className="text-white"
            fullWidth
          />
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="mb-6 overflow-x-auto">
        <Tabs
          aria-label="Forum Categories"
          color="primary"
          variant="underlined"
          classNames={{ tabList: "gap-4 md:gap-8", tab: "px-2 h-10 md:h-12" }}
        >
          <Tab key="all" title="All" />
          <Tab key="build" title="Build Advice" />
          <Tab key="troubleshoot" title="Troubleshoot" />
          <Tab key="showcase" title="Showcase" />
        </Tabs>
      </div>

      {/* 3. Post List Section (เพิ่ม Link ไปหน้า Post Detail) */}
      <div className="flex flex-col gap-3">
        {posts.map((post) => (
          <Link href={`/forum/${post.id}`} key={post.id} className="block group">
            <Card
              isPressable
              className="bg-black/40 border border-white/10 group-hover:border-blue-500/50 transition-all w-full"
            >
              <CardBody className="p-4 md:p-6">
                <div className="flex items-start md:items-center justify-between gap-4">
                  <div className="flex items-start md:items-center gap-3 md:gap-6">
                    <Avatar
                      name={post.author}
                      className="hidden xs:flex shrink-0 border border-white/10"
                      size="sm"
                    />
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Chip
                          size="sm"
                          color={post.color as any}
                          variant="flat"
                          className="h-5 text-[10px]"
                        >
                          {post.category}
                        </Chip>
                        <h3 className="text-sm md:text-lg font-semibold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                          {post.title}
                        </h3>
                      </div>
                      <p className="text-xs md:text-sm text-gray-500">
                        โดย <span className="text-gray-300">{post.author}</span> • {post.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-blue-500 font-bold text-sm md:text-base">
                      {post.replies}
                    </span>
                    <span className="text-[10px] md:text-xs text-gray-500 uppercase">
                      Replies
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {/* 4. Floating Button สำหรับสร้างกระทู้ใหม่ */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onPress={onOpen}
          color="primary"
          size="md"
          className="shadow-2xl font-bold min-w-unit-12 md:px-8 bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all"
          radius="full"
        >
          <span className="hidden md:inline">+ NEW POST</span>
          <span className="md:hidden text-lg">+</span>
        </Button>
      </div>

      {/* 5. Create Post Modal (ขนาดใหญ่ 2 ฝั่ง พร้อมระบบ Upload รูปและเลือก Build) */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        size="5xl"
        scrollBehavior="inside"
        classNames={{
          base: "bg-slate-950 border border-white/10 text-white max-h-[90vh]",
          header: "border-b border-white/5 p-6",
          body: "p-0",
          footer: "border-t border-white/5 p-4",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <span className="text-2xl font-bold">
                  Create New Community Post
                </span>
                <p className="text-xs font-normal text-gray-500">
                  แบ่งปันความรู้หรือขอความช่วยเหลือจากเพื่อนสมาชิก
                </p>
              </ModalHeader>

              <ModalBody>
                <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
                  
                  {/* ฝั่งซ้าย: ฟอร์มเขียนกระทู้ + Upload รูป */}
                  <div className="lg:col-span-2 p-6 border-r border-white/5 flex flex-col gap-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    <div className="flex flex-col gap-6">
                      <Select
                        label="Category"
                        placeholder="Select a category"
                        variant="bordered"
                        labelPlacement="outside"
                      >
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </Select>

                      <Input
                        label="Topic Title"
                        placeholder="ระบุหัวข้อที่ต้องการพูดคุย..."
                        variant="bordered"
                        labelPlacement="outside"
                      />

                      <Textarea
                        label="Content Description"
                        placeholder="รายละเอียดเนื้อหา..."
                        variant="bordered"
                        labelPlacement="outside"
                        minRows={8}
                      />

                      {/* Image Upload Zone */}
                      <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-white/70">
                          Upload Images (Max 4 photos)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/5 hover:border-blue-500/50 transition-all group">
                            <span className="text-2xl group-hover:scale-110 transition-transform">📸</span>
                            <span className="text-[10px] text-gray-500 mt-1 text-center px-2">Add Photo</span>
                            <input type="file" className="hidden" accept="image/*" multiple />
                          </label>

                          {/* Placeholder สำหรับ Preview รูปภาพ */}
                          <div className="relative aspect-square rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center text-gray-700 text-[10px]">
                            Preview Box
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-500 italic">
                          * รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ฝั่งขวา: ส่วนเลือก Build ที่บันทึกไว้ */}
                  <div className="bg-black/20 p-6 flex flex-col gap-4">
                    <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
                      Attach Your Build
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">
                      เลือกสเปกที่คุณจัดไว้เพื่อแนบไปกับโพสต์
                    </p>

                    <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                      {[1, 2, 3].map((item) => (
                        <Card
                          key={item}
                          isPressable
                          className="bg-white/5 border border-white/10 hover:border-blue-500/50 p-3"
                        >
                          <p className="text-xs font-bold text-white mb-1">
                            สเปกเล่นเกมงบ {item}0k
                          </p>
                          <p className="text-[10px] text-gray-500 italic">
                            i5-13400F + RTX 4060
                          </p>
                        </Card>
                      ))}
                    </div>

                    <Button
                      variant="ghost"
                      color="primary"
                      size="sm"
                      className="mt-auto border-blue-500/30 hover:bg-blue-500/10"
                    >
                      Manage My Builds
                    </Button>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="light"
                  color="danger"
                  onPress={onClose}
                  className="font-bold"
                >
                  Discard
                </Button>
                <Button
                  color="primary"
                  onPress={onClose}
                  className="px-10 font-bold bg-blue-600 shadow-lg shadow-blue-500/20"
                >
                  Publish Post
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </main>
  );
}