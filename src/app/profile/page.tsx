"use client";

import React, { useState, useEffect } from "react";
import {
  Card, CardBody, Avatar, Button, Tabs, Tab, 
  Chip, Divider, Modal, ModalContent, ModalHeader, 
  ModalBody, ModalFooter, useDisclosure, Input, Textarea, Spinner
} from "@heroui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// --- 🟢 ส่วนประกอบย่อย (Internal Components) ---
function MyBuilds() {
  return <div className="text-gray-500 py-10">ยังไม่มีข้อมูลสเปกที่บันทึกไว้</div>;
}

function MyForum() {
  return <div className="text-gray-500 py-10">ยังไม่มีกระทู้ที่คุณสร้าง</div>;
}

function MyActivity() {
  return <div className="text-gray-500 py-10">ยังไม่มีกิจกรรมล่าสุด</div>;
}

// --- 🔵 หน้าหลัก (Main Page) ---

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 1. State สำหรับข้อมูลผู้ใช้จริง
  const [userData, setUserData] = useState({
    id: "",
    username: "",
    bio: "",
    avatar: ""
  });

  // 2. State สำหรับเก็บค่าชั่วขณะที่พิมพ์ใน Modal
  const [tempData, setTempData] = useState({ ...userData });

  useEffect(() => {
    const fetchUserData = async () => {
      // 🟢 1. รอจนกว่าสถานะ Session จะนิ่ง (ไม่เป็น loading)
      if (status === "loading") return;

      // 🟢 2. ถ้าตรวจสอบแล้วว่าไม่ได้ล็อกอินจริงๆ ให้เด้งกลับหน้า Home
      if (status === "unauthenticated") {
        router.push("/");
        return;
      }

      // 🟢 3. ถ้าล็อกอินสำเร็จ ให้ดึงข้อมูลจาก DB โดยส่งทั้ง ID และ Email เพื่อความแม่นยำ
      if (status === "authenticated" && session?.user) {
        try {
          const userEmail = session.user.email || "";
          const userId = (session.user as any).id || "";
          
          const res = await fetch(`/api/user/profile?id=${userId}&email=${userEmail}`);
          
          if (res.ok) {
            const data = await res.json();
            const newUserData = {
              id: data.id,
              username: data.username || session.user.name || "User",
              bio: data.bio || "ยังไม่มีคำอธิบาย...",
              avatar: data.image || session.user.image || "https://i.pravatar.cc/150"
            };
            setUserData(newUserData);
            setTempData(newUserData);
          } else {
            // กรณีหาใน DB ไม่เจอ ให้ใช้ข้อมูลเบื้องต้นจาก Session ไปก่อน
            const fallbackData = {
              id: userId,
              username: session.user.name || "User",
              bio: "ยังไม่มีคำอธิบาย...",
              avatar: session.user.image || "https://i.pravatar.cc/150"
            };
            setUserData(fallbackData);
            setTempData(fallbackData);
          }
        } catch (err) {
          console.error("Fetch profile error:", err);
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    fetchUserData();
  }, [session, status, router]);

  // 🟢 ฟังก์ชันสำหรับเปิด Modal และรีเซ็ตค่าสำรองให้ตรงกับข้อมูลปัจจุบัน
  const handleOpenEdit = () => {
    setTempData({ ...userData });
    onOpen();
  };

  // 🟢 ฟังก์ชันบันทึกข้อมูลลง Database
  const handleUpdateProfile = async (onClose: () => void) => {
    if (!userData.id) {
        alert("ไม่พบ ID ผู้ใช้ กรุณาลองใหม่");
        return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch("/api/auth/credentials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userData.id,
          username: tempData.username,
          bio: tempData.bio,
        }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        const finalData = {
          ...userData,
          username: updatedUser.username,
          bio: updatedUser.bio
        };
        setUserData(finalData);
        setTempData(finalData);
        alert("บันทึกข้อมูลสำเร็จ!");
        onClose();
      } else {
        const error = await res.json();
        alert(error.message || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsUpdating(false);
    }
  };

  if (status === "loading" || isLoadingData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <Spinner size="lg" color="primary" />
        <p className="font-bold animate-pulse uppercase tracking-widest text-sm">Loading Profile...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-12 font-sans text-left">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        
        {/* 1. User Header Section */}
        <section className="mb-10">
          <Card className="bg-black/40 border border-white/10 p-8 shadow-xl">
            <CardBody className="flex flex-col md:flex-row items-center gap-8 p-0 overflow-visible">
              <Avatar 
                src={userData.avatar}
                className="w-32 h-32 text-large border-4 border-blue-500/20 shadow-blue-500/10 shadow-2xl" 
              />
              <div className="flex flex-col gap-2 text-center md:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-3xl font-bold text-white">{userData.username}</h1>
                  <Chip color="primary" variant="flat" size="sm" className="font-bold uppercase tracking-widest text-[10px]">PC BUILDER ENTHUSIAST</Chip>
                </div>
                <p className="text-gray-400 font-medium italic">"{userData.bio}"</p>
                <div className="flex justify-center md:justify-start gap-6 mt-2 text-sm text-gray-500 font-bold uppercase tracking-tighter">
                  <span><strong>0</strong> Builds</span>
                  <span><strong>0</strong> Posts</span>
                  <span><strong>0</strong> Comments</span>
                </div>
              </div>
              <Button 
                onPress={handleOpenEdit}
                color="primary" 
                variant="bordered" 
                className="font-bold border-white/10 text-white hover:bg-white/5 transition-all uppercase tracking-widest text-[10px] px-8"
              >
                Edit Profile
              </Button>
            </CardBody>
          </Card>
        </section>

        {/* 2. Content Tabs */}
        <section>
          <Tabs 
            aria-label="User Profile Sections" 
            color="primary" 
            variant="underlined"
            classNames={{
              tabList: "gap-8 border-b border-white/5 w-full",
              tab: "h-12 font-bold px-0",
              cursor: "bg-blue-500",
              panel: "pt-8 text-center"
            }}
          >
            <Tab key="builds" title="MY BUILDS"><MyBuilds /></Tab>
            <Tab key="forum" title="MY FORUM"><MyForum /></Tab>
            <Tab key="activity" title="MY ACTIVITY"><MyActivity /></Tab>
          </Tabs>
        </section>

        {/* 3. Edit Profile Modal */}
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          backdrop="blur"
          size="5xl" 
          placement="center"
          classNames={{
            base: "bg-slate-950 border border-white/10 text-white max-h-[90vh]",
            header: "border-b border-white/5 p-8",
            footer: "border-t border-white/5 p-6"
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold uppercase tracking-tight">Edit Your Profile</h2>
                  <p className="text-xs text-gray-500 font-normal">ปรับแต่งข้อมูลส่วนตัวของคุณให้โดดเด่นในชุมชน</p>
                </ModalHeader>
                
                <ModalBody className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
                    <div className="bg-black/20 p-8 flex flex-col items-center justify-center gap-6 border-r border-white/5">
                      <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest italic self-start">Profile Image</h4>
                      <Avatar src={tempData.avatar} className="w-40 h-40 border-4 border-white/5 shadow-2xl" />
                      <p className="text-[10px] text-gray-500 text-center font-medium leading-relaxed">รูปภาพดึงมาจากบัญชีของคุณ</p>
                      <Button size="sm" variant="flat" color="primary" isDisabled className="w-full font-bold uppercase text-[10px]">Change Photo (Soon)</Button>
                    </div>

                    <div className="lg:col-span-2 p-8 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
                      <Input 
                        label="Username" 
                        value={tempData.username}
                        onValueChange={(val) => setTempData({...tempData, username: val})}
                        variant="bordered"
                        labelPlacement="outside"
                        classNames={{
                          label: "text-gray-300 font-bold uppercase tracking-wider text-[10px] mb-2",
                          inputWrapper: "border-white/10 hover:border-blue-500/50 h-12"
                        }}
                      />
                      <Textarea 
                        label="Biography" 
                        value={tempData.bio}
                        onValueChange={(val) => setTempData({...tempData, bio: val})}
                        variant="bordered"
                        labelPlacement="outside"
                        minRows={4}
                        classNames={{
                          label: "text-gray-300 font-bold uppercase tracking-wider text-[10px] mb-2",
                          inputWrapper: "border-white/10 hover:border-blue-500/50"
                        }}
                      />
                    </div>
                  </div>
                </ModalBody>

                <ModalFooter>
                  <Button variant="light" color="danger" onPress={onClose} className="font-bold uppercase text-[10px] tracking-widest">Discard</Button>
                  <Button 
                    color="primary" 
                    isLoading={isUpdating}
                    onPress={() => handleUpdateProfile(onClose)}
                    className="font-bold px-10 bg-blue-600 shadow-xl shadow-blue-500/20 uppercase text-[10px] tracking-widest"
                  >
                    Save Profile
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