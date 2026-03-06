"use client";

import React, { useEffect, useState } from "react";
import { Avatar, Card, CardBody, Spinner, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@heroui/react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function PublicProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [selectedBuild, setSelectedBuild] = useState<any>(null);
  const [isBuildLoading, setIsBuildLoading] = useState(false);

  // Fetch build detail for modal
  const handleOpenBuildModal = async (buildId: string) => {
    setIsBuildLoading(true);
    onOpen();
    try {
      const res = await fetch(`/api/builds/${buildId}`);
      if (res.ok) {
         const data = await res.json();
         setSelectedBuild(data);
      } else {
         console.error("Failed to fetch build");
         setSelectedBuild(null);
      }
    } catch (error) {
       console.error("Error fetching build", error);
       setSelectedBuild(null);
    } finally {
      setIsBuildLoading(false);
    }
  };

  // Redirect to own profile page if visiting own public profile
  useEffect(() => {
    if (session?.user?.id && session.user.id === id) {
       router.replace("/profile");
    }
  }, [session, id, router]);

  useEffect(() => {
    if (!id) return;
    
    // หากเป็นการดูโปรไฟล์ตัวเอง รอให้ useEffect ด้านบนทำงานก่อนเพื่อจะได้ไม่ซ่อนโหลด
    if (session?.user?.id === id) return;

    fetch(`/api/user/public/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setUser(data);
        }
      })
      .catch((err) => console.error("Error fetching user profile:", err))
      .finally(() => setIsLoading(false));
  }, [id, session]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 pt-28 pb-12 flex justify-center items-center">
        <Spinner size="lg" color="primary" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 pt-28 pb-12 flex justify-center items-center">
        <div className="text-gray-500 font-bold p-10 bg-black/40 border border-white/5 rounded-2xl">
          User not found
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-12">
      {/* 🔴 พื้นหลัง Header แบบเบลอ */}
      <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-b from-blue-900/40 via-blue-900/10 to-slate-950 pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-full h-[350px] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none z-0 mix-blend-overlay" />

      <div className="max-w-6xl mx-auto px-4 lg:px-6 relative z-10">
        
        {/* --- Profile Header Section --- */}
        <Card className="bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl mb-12 p-8 md:p-12 overflow-visible relative mt-16 rounded-[2rem]">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10">
            {/* 🟢 Avatar วงกลมขนาดใหญ่ ยื่นออกมา */}
            <div className="relative -mt-24 md:-mt-28">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
              <Avatar
                src={user.image || undefined}
                name={(user.name || user.username || "U").charAt(0).toUpperCase()}
                className="w-40 h-40 md:w-52 md:h-52 text-5xl md:text-7xl ring-8 ring-slate-950 shadow-2xl border-4 border-white/5 object-cover bg-slate-800 text-white font-bold"
                showFallback
              />
            </div>
            
            {/* 🟢 ข้อมูลชื่อและ Bio */}
            <div className="flex-1 text-center md:text-left flex flex-col gap-2 relative z-10 w-full pb-4">
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tight drop-shadow-md">
                {user.name || user.username || "Unknown"}
              </h1>
              {user.bio ? (
                <p className="text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed italic border-l-2 border-blue-500/50 pl-4 py-1">
                  "{user.bio}"
                </p>
              ) : (
                <p className="text-gray-600 text-sm md:text-base italic">"ยังไม่มีคำอธิบาย..."</p>
              )}
            </div>
          </div>
        </Card>

        {/* --- Activity Summary Section --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-black/30 border border-white/5 p-6 backdrop-blur-xl">
            <h3 className="text-gray-400 font-medium mb-4">สถิติการใช้งาน</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-3xl font-bold text-white">{user._count?.posts || 0}</p>
                <p className="text-xs text-gray-500 uppercase mt-1">กระทู้ที่ตั้ง</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-3xl font-bold text-white">{user._count?.comments || 0}</p>
                <p className="text-xs text-gray-500 uppercase mt-1">คอมเมนต์</p>
              </div>
            </div>
          </Card>

          {/* --- Recent Posts Section --- */}
          <Card className="bg-black/30 border border-white/5 p-6 backdrop-blur-xl md:col-span-2">
            <h3 className="text-gray-400 font-medium mb-4 text-left">ประวัติการตั้งกระทู้ล่าสุด</h3>
            {user.posts && user.posts.length > 0 ? (
              <div className="flex flex-col gap-3">
                {user.posts.map((post: any) => (
                  <div key={post.id} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 flex justify-between items-center group cursor-pointer" onClick={() => window.location.href = `/forum/${post.id}`}>
                    <div className="flex flex-col text-left">
                       <p className="text-white font-medium group-hover:text-blue-400 transition-colors line-clamp-1">{post.title}</p>
                       <p className="text-xs text-gray-500 mt-1">{new Date(post.createdAt).toLocaleDateString('th-TH')}</p>
                    </div>
                    <div className="text-xs text-gray-400 bg-black/40 px-2 py-1 rounded-md shrink-0">
                       💬 {post._count?.comments || 0}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600 italic">
                ผู้ใช้นี้ยังไม่เคยตั้งกระทู้
              </div>
            )}
          </Card>
        </div>

        {/* --- PC Builds Showcase Section --- */}
        <Card className="bg-black/30 border border-white/5 p-6 backdrop-blur-xl mt-6 mb-12 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          
          <h3 className="text-gray-400 font-medium mb-6 text-left flex items-center gap-2 relative z-10">
            <span className="text-blue-400">⚡</span> สเปคคอมที่จัดไว้ (My PC Builds)
          </h3>
          
          {user.pcBuilds && user.pcBuilds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
              {user.pcBuilds.map((build: any) => (
                <div 
                  key={build.id} 
                  className="bg-slate-900/80 border border-white/10 rounded-xl p-4 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all cursor-pointer flex flex-col gap-3 group"
                  onClick={() => handleOpenBuildModal(build.id)}
                >
                  <h4 className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors line-clamp-1">{build.name}</h4>
                  
                  <div className="flex justify-between items-end mt-auto pt-2 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">ราคารวมโดยประมาณ</span>
                      <span className="text-lg font-mono text-green-400 font-bold">
                        ฿{build.totalPrice?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                  
                  {/* Scores (ถ้ามี) */}
                  {(build.gamingScore || build.workingScore || build.renderScore) && (
                    <div className="flex gap-2 mt-2">
                       {build.gamingScore && <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-1 rounded">Gaming {Math.round(build.gamingScore)}%</span>}
                       {build.workingScore && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Work {Math.round(build.workingScore)}%</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5 relative z-10">
              <p className="text-gray-500 italic mb-2">คอมเซ็ตนี้แอบซ่อนความแรงเอาไว้ หรือยังไม่ได้จัดสเปคกันแน่นะ?</p>
              <p className="text-sm text-gray-600">ผู้ใช้นี้ยังไม่มีสเปคคอมพิวเตอร์ที่บันทึกไว้</p>
            </div>
          )}
        </Card>

      </div>

      {/* --- PC Build Modal --- */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" classNames={{
        base: "bg-slate-900 border border-white/10 text-white",
        header: "border-b border-white/5",
        footer: "border-t border-white/5",
        closeButton: "hover:bg-white/10 active:bg-white/20",
      }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">รายละเอียดสเปคคอม</ModalHeader>
              <ModalBody className="py-6">
                 {isBuildLoading ? (
                    <div className="flex justify-center items-center py-10">
                       <Spinner color="primary" />
                    </div>
                 ) : selectedBuild ? (
                    <div className="flex flex-col gap-6">
                       <h2 className="text-2xl font-bold text-blue-400">{selectedBuild.name}</h2>
                       
                       <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                          {/* ตัวอย่างรายชื่ออุปกรณ์ (เนื่องจากเราเก็บแค่ ID ในเบื้องต้น ตอนนี้อาจจะโชว์แค่โครงสร้างไปก่อน) */}
                          <div className="grid grid-cols-[120px_1fr] gap-4 items-center py-3 border-b border-white/5">
                             <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">PROCESSOR</span>
                             <span className="font-medium">{selectedBuild.cpuId ? `CPU ID: ${selectedBuild.cpuId}` : "-"}</span>
                          </div>
                          <div className="grid grid-cols-[120px_1fr] gap-4 items-center py-3 border-b border-white/5">
                             <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">GRAPHICS CARD</span>
                             <span className="font-medium">{selectedBuild.gpuId ? `GPU ID: ${selectedBuild.gpuId}` : "-"}</span>
                          </div>
                          <div className="grid grid-cols-[120px_1fr] gap-4 items-center py-3 border-b border-white/5">
                             <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">MEMORY</span>
                             <span className="font-medium">{selectedBuild.ramId ? `RAM ID: ${selectedBuild.ramId}` : "-"}</span>
                          </div>
                          <div className="grid grid-cols-[120px_1fr] gap-4 items-center py-3 border-b border-white/5">
                             <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">MOTHERBOARD</span>
                             <span className="font-medium">{selectedBuild.motherboardId ? `MB ID: ${selectedBuild.motherboardId}` : "-"}</span>
                          </div>
                          <div className="grid grid-cols-[120px_1fr] gap-4 items-center py-3 border-b border-white/5">
                             <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">STORAGE</span>
                             <span className="font-medium">{selectedBuild.storageId ? `Storage ID: ${selectedBuild.storageId}` : "-"}</span>
                          </div>
                          <div className="grid grid-cols-[120px_1fr] gap-4 items-center py-3 border-b border-white/5">
                             <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">POWER SUPPLY</span>
                             <span className="font-medium">{selectedBuild.psuId ? `PSU ID: ${selectedBuild.psuId}` : "-"}</span>
                          </div>
                          <div className="grid grid-cols-[120px_1fr] gap-4 items-center py-3">
                             <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">CASE</span>
                             <span className="font-medium">{selectedBuild.caseId ? `Case ID: ${selectedBuild.caseId}` : "-"}</span>
                          </div>
                       </div>
                       
                       <div className="flex justify-between items-end">
                         <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">TOTAL PRICE</span>
                         <span className="text-3xl font-bold text-blue-500">฿{selectedBuild.totalPrice?.toLocaleString() || 0}</span>
                       </div>
                    </div>
                 ) : (
                    <div className="text-center py-10 text-gray-400">
                       ไม่พบข้อมูลสเปคคอม
                    </div>
                 )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose} className="font-medium">
                  ปิดหน้าต่าง
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

    </main>
  );
}
