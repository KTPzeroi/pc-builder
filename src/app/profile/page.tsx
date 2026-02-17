"use client";

import React, { useState } from "react";
import {
  Card, CardBody, Avatar, Button, Tabs, Tab, 
  Chip, Divider, Modal, ModalContent, ModalHeader, 
  ModalBody, ModalFooter, useDisclosure, Input, Textarea, ScrollShadow
} from "@heroui/react";
import Link from "next/link";

// --- 🟢 ส่วนประกอบภายในไฟล์ (Internal Components) ---

function MyBuilds() {
  const mockBuilds = [
    { id: 1, name: "สเปกเล่นเกมงบ 30k", cpu: "i5-13400F", gpu: "RTX 4060", total: 31500 },
    { id: 2, name: "Workstation ขาวล้วน", cpu: "Ryzen 7 7700X", gpu: "RTX 4070 Ti", total: 65000 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {mockBuilds.map((build) => (
        <Card key={build.id} className="bg-black/40 border border-white/5 hover:border-blue-500/50 transition-all">
          <CardBody className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{build.name}</h3>
                <p className="text-xs text-gray-500">{build.cpu} + {build.gpu}</p>
              </div>
              <Chip color="success" variant="flat" size="sm">฿{build.total.toLocaleString()}</Chip>
            </div>
            <div className="flex gap-2">
              <Button size="sm" color="primary" variant="flat" className="flex-1 font-bold">Edit</Button>
              <Button size="sm" color="danger" variant="light" className="font-bold text-danger">Delete</Button>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function MyForum() {
  const mockMyPosts = [
    { id: 1, title: "ช่วยดูสเปกหน่อยครับ งบ 30,000 บาท รวมจอ", date: "12 ก.พ. 2026", status: "Public", replies: 15 },
    { id: 2, title: "รีวิวพัดลมเคสตัวใหม่ ลมแรงแต่เงียบมาก", date: "5 ก.พ. 2026", status: "Private", replies: 0 },
  ];

  return (
    <div className="flex flex-col gap-4 text-left">
      {mockMyPosts.map((post) => (
        <Card key={post.id} className="bg-black/40 border border-white/5 hover:border-blue-500/30 transition-all">
          <CardBody className="p-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-3 mb-2">
                  <Chip size="sm" variant="dot" color={post.status === "Public" ? "success" : "default"} className="border-none text-[10px] font-bold uppercase">
                    {post.status}
                  </Chip>
                  <span className="text-[10px] text-gray-500">{post.date}</span>
                </div>
                <h3 className="text-lg font-bold text-white truncate">{post.title}</h3>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button size="sm" variant="flat" color="primary" className="font-bold flex-1 md:flex-none">
                  {post.status === "Public" ? "Make Private" : "Make Public"}
                </Button>
                <Button size="sm" variant="flat" color="danger" className="font-bold flex-1 md:flex-none">Delete</Button>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function MyActivity() {
  const mockActivities = [
    { id: 101, postTitle: "แนะนำคีย์บอร์ด Custom งบไม่เกิน 5,000", comment: "ลองดู MonsGeek M1W ครับ คุ้มค่ามาก", time: "2 ชั่วโมงที่แล้ว" },
    { id: 102, postTitle: "จัดสเปกคอมทำงานตัดต่อวิดีโอ 4K", comment: "แนะนำให้ขยับไปใช้ RAM 32GB จะลื่นกว่ามาก", time: "1 วันที่แล้ว" },
  ];

  return (
    <div className="flex flex-col gap-4 text-left">
      {mockActivities.map((activity) => (
        <Card key={activity.id} className="bg-black/40 border border-white/5 shadow-lg">
          <CardBody className="p-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold uppercase tracking-widest">Commented on</span>
                <p className="text-[11px] text-gray-400 font-bold truncate">"{activity.postTitle}"</p>
              </div>
              <p className="text-sm text-gray-200 italic leading-relaxed">"{activity.comment}"</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] text-gray-500">{activity.time}</span>
                <button className="text-[11px] text-danger font-bold hover:underline">Remove Comment</button>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

// --- 🔵 หน้าหลัก (Main Page) ---

export default function ProfilePage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [userData, setUserData] = useState({
    username: "User01",
    bio: "กำลังหาทางอัปเกรดคอมงบ 30k ครับ",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
  });

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-12 font-sans">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        
        {/* 1. User Header Section */}
        <section className="mb-10 text-left">
          <Card className="bg-black/40 border border-white/10 p-8 shadow-xl">
            <CardBody className="flex flex-col md:flex-row items-center gap-8">
              <Avatar 
                src={userData.avatar}
                className="w-32 h-32 text-large border-4 border-blue-500/20 shadow-blue-500/10 shadow-2xl" 
              />
              <div className="flex flex-col gap-2 text-center md:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-3xl font-bold text-white">{userData.username}</h1>
                  <Chip color="primary" variant="flat" size="sm" className="font-bold">PC Builder Enthusiast</Chip>
                </div>
                <p className="text-gray-400 font-medium italic">"{userData.bio}"</p>
                <div className="flex justify-center md:justify-start gap-6 mt-2 text-sm text-gray-500">
                  <span><strong>12</strong> Builds</span>
                  <span><strong>5</strong> Posts</span>
                  <span><strong>42</strong> Comments</span>
                </div>
              </div>
              <Button 
                onPress={onOpen}
                color="primary" 
                variant="bordered" 
                className="font-bold border-white/10 text-white hover:bg-white/5 transition-all"
              >
                Edit Profile
              </Button>
            </CardBody>
          </Card>
        </section>

        {/* 2. Content Tabs Selection */}
        <section>
          <Tabs 
            aria-label="User Profile Sections" 
            color="primary" 
            variant="underlined"
            classNames={{
              tabList: "gap-8 border-b border-white/5 w-full",
              tab: "h-12 font-bold px-0",
              cursor: "bg-blue-500",
              panel: "pt-8"
            }}
          >
            <Tab key="builds" title="MY BUILDS">
              <MyBuilds />
            </Tab>
            <Tab key="forum" title="MY FORUM">
              <MyForum />
            </Tab>
            <Tab key="activity" title="MY ACTIVITY">
              <MyActivity />
            </Tab>
          </Tabs>
        </section>

        {/* 🟢 3. Edit Profile Modal (Framer Motion Integrated) */}
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          backdrop="blur"
          placement="center"
          motionProps={{
            variants: {
              enter: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
              exit: { y: 20, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
            }
          }}
          classNames={{
            base: "bg-slate-900 border border-white/10 text-white rounded-[2rem]",
            header: "border-b border-white/5 p-8",
            footer: "border-t border-white/5 p-6"
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1 text-left">
                  <h2 className="text-2xl font-bold">Edit Your Profile</h2>
                  <p className="text-xs text-gray-500 font-normal">ปรับแต่งข้อมูลส่วนตัวของคุณให้โดดเด่นในชุมชน</p>
                </ModalHeader>
                <ModalBody className="py-6 space-y-6 text-left">
                  <div className="flex items-center gap-6">
                    <Avatar src={userData.avatar} className="w-20 h-20 border-2 border-white/10" />
                    <Button size="sm" variant="flat" color="primary" className="font-bold uppercase text-[10px]">
                      Change Avatar
                    </Button>
                  </div>
                  <Input 
                    label="Username" 
                    placeholder="Enter your username" 
                    variant="bordered"
                    labelPlacement="outside"
                    defaultValue={userData.username}
                    classNames={{ label: "text-gray-300 font-bold uppercase tracking-wider text-[10px]" }}
                  />
                  <Textarea 
                    label="Bio" 
                    placeholder="เล่าเรื่องราวของคุณสั้นๆ..." 
                    variant="bordered"
                    labelPlacement="outside"
                    defaultValue={userData.bio}
                    minRows={3}
                    classNames={{ label: "text-gray-300 font-bold uppercase tracking-wider text-[10px]" }}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" color="danger" onPress={onClose} className="font-bold uppercase">Cancel</Button>
                  <Button 
                    color="primary" 
                    className="font-bold px-10 bg-blue-600 shadow-xl shadow-blue-500/20 uppercase"
                    onPress={onClose}
                  >
                    Save Changes
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

      </div>
    </main>
  );
}