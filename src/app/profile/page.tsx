"use client";

import React, { useState, useEffect } from "react";
import {
  Card, CardBody, Avatar, Button, Tabs, Tab, 
  Divider, Modal, ModalContent, ModalHeader, 
  ModalBody, ModalFooter, useDisclosure, Input, Textarea, Spinner
} from "@heroui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// --- 🟢 ส่วนประกอบย่อย (Internal Components) ---
function MyBuilds() {
  return <div className="text-gray-500 py-10">ยังไม่มีข้อมูลสเปกที่บันทึกไว้</div>;
}

function MyForum({ posts }: { posts: any[] }) {
  if (!posts || posts.length === 0) {
    return <div className="text-gray-500 py-10">ยังไม่มีกระทู้ที่คุณสร้าง</div>;
  }
  return (
    <div className="flex flex-col gap-4 text-left mt-4">
      {posts.map((post) => (
        <Card key={post.id} className="bg-black/40 border border-white/10 hover:border-blue-500/50 transition-colors">
          <CardBody>
            <Link href={`/forum/${post.id}`}>
              <h3 className="text-lg font-bold text-white hover:text-blue-400">{post.title}</h3>
            </Link>
            <p className="text-sm text-gray-400 mb-2 truncate max-w-3xl">{post.content}</p>
            <div className="flex gap-4 text-xs text-gray-500">
              <span>{new Date(post.createdAt).toLocaleDateString("th-TH", { year: 'numeric', month: 'short', day: 'numeric'})}</span>
              <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md font-medium">{post.category}</span>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function MyActivity({ comments }: { comments: any[] }) {
  if (!comments || comments.length === 0) {
    return <div className="text-gray-500 py-10">ยังไม่มีกิจกรรมล่าสุด</div>;
  }
  return (
    <div className="flex flex-col gap-4 text-left mt-4">
      {comments.map((comment) => (
        <Card key={comment.id} className="bg-black/40 border border-white/10 hover:border-blue-500/50 transition-colors">
          <CardBody>
            <p className="text-sm text-gray-400 mb-2">
              คุณได้แสดงความคิดเห็นในกระทู้{" "}
              {comment.post ? (
                <Link href={`/forum/${comment.post.id}`} className="text-blue-400 font-bold hover:underline">
                  {comment.post.title}
                </Link>
              ) : (
                <span className="text-gray-500 italic">กระทู้ที่ถูกลบไปแล้ว</span>
              )}
            </p>
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <p className="text-white text-sm">"{comment.content}"</p>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString("th-TH", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
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
    avatar: "",
    posts: [] as any[],
    comments: [] as any[]
  });

  // 2. State สำหรับเก็บค่าชั่วขณะที่พิมพ์ใน Modal
  const [tempData, setTempData] = useState({ ...userData });

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        router.push("/");
        return;
      }

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
              avatar: data.image || session.user.image || "",
              posts: data.posts || [],
              comments: data.comments || []
            };
            setUserData(newUserData);
            setTempData(newUserData);
          } else {
            const fallbackData = {
              id: userId,
              username: session.user.name || "User",
              bio: "ยังไม่มีคำอธิบาย...",
              avatar: session.user.image || "",
              posts: [],
              comments: []
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

  const handleOpenEdit = () => {
    setTempData({ ...userData });
    onOpen();
  };

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
              {/* 🟢 Avatar พร้อม Fallback เป็นตัวอักษร */}
              <Avatar 
                src={userData.avatar}
                name={userData.username.charAt(0).toUpperCase()}
                showFallback
                className="w-32 h-32 text-large border-4 border-blue-500/20 shadow-blue-500/10 shadow-2xl" 
                classNames={{
                  base: "bg-slate-800",
                  name: "text-white font-bold text-3xl"
                }}
              />
              <div className="flex flex-col gap-2 text-center md:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-3xl font-bold text-white">{userData.username}</h1>
                  {/* 🟢 Chip ถูกเอาออกแล้ว */}
                </div>
                <p className="text-gray-400 font-medium italic">"{userData.bio}"</p>
                <div className="flex justify-center md:justify-start gap-6 mt-2 text-sm text-gray-500 font-bold uppercase tracking-tighter">
                  <span><strong>0</strong> Builds</span>
                  <span><strong>{userData.posts.length}</strong> Posts</span>
                  <span><strong>{userData.comments.length}</strong> Comments</span>
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
            <Tab key="forum" title="MY FORUM"><MyForum posts={userData.posts} /></Tab>
            <Tab key="activity" title="MY ACTIVITY"><MyActivity comments={userData.comments} /></Tab>
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
                      {/* 🟢 Avatar ใน Modal พร้อม Fallback */}
                      <Avatar 
                        src={tempData.avatar} 
                        name={tempData.username.charAt(0).toUpperCase()}
                        showFallback
                        className="w-40 h-40 border-4 border-white/5 shadow-2xl" 
                        classNames={{
                          base: "bg-slate-800",
                          name: "text-white font-bold text-4xl"
                        }}
                      />
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