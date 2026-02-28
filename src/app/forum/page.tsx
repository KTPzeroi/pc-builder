"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Card, CardBody, Button, Input, Chip, Tabs, Tab, Avatar,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, Select, SelectItem, Textarea, Divider, Spinner
} from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// --- Types ---
interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  author: {
    name: string | null;
    image: string | null;
  };
  _count: {
    comments: number;
  };
}

// --- Helper Functions ---
const getCategoryColor = (category: string) => {
  switch (category) {
    case "BUILD_GUIDE": return "primary";
    case "SHOWCASE": return "success";
    case "TROUBLESHOOTING": return "danger";
    default: return "default";
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "เมื่อสักครู่";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  return `${days} วันที่แล้ว`;
};

const categories = [
  { label: "Build Advice", value: "BUILD_GUIDE", color: "primary" },
  { label: "Troubleshoot", value: "TROUBLESHOOTING", color: "danger" },
  { label: "Showcase", value: "SHOWCASE", color: "success" },
  { label: "General", value: "GENERAL", color: "default" },
];

export default function ForumPage() {
  const { data: session } = useSession();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const router = useRouter();

  // State เดิม
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 🟢 เพิ่ม State สำหรับรูปภาพ (ส่วนที่แก้ไขเพิ่ม)
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
  });

  // 🟢 เพิ่มฟังก์ชันจัดการรูปภาพ (ส่วนที่แก้ไขเพิ่ม)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]); // คืนค่าหน่วยความจำ
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 🟢 1. Fetch Posts from API
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/forum/posts', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 🟢 2. Handle Create Post
  const handleCreatePost = async () => {
    if (!session) return alert("กรุณาเข้าสู่ระบบก่อนสร้างกระทู้");
    if (!formData.title || !formData.content || !formData.category) {
      return alert("กรุณากรอกข้อมูลให้ครบ");
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
      };

      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFormData({ title: "", content: "", category: "" });
        setPreviews([]); // ล้างรูปภาพหลังโพสต์
        setSelectedFiles([]);
        onClose();
        fetchPosts(); 
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || "เกิดข้อผิดพลาดในการสร้างโพสต์"}`);
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🟢 3. Filter Logic
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesTab = selectedTab === "all" || post.category === selectedTab;
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [selectedTab, searchQuery, posts]);

  return (
    <main className="min-h-screen bg-slate-950 pt-20 md:pt-28 pb-12">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 uppercase tracking-tight">COMMUNITY FORUM</h1>
          <p className="text-sm md:text-base text-gray-400 font-medium">พูดคุย สอบถาม และแชร์สเปกคอมพิวเตอร์ของคุณ</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Section */}
          <aside className="lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1 w-full">
            <Card className="bg-black/40 border border-white/5 p-5 shadow-xl sticky top-28 w-full">
              <div className="flex flex-col gap-8">
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1">ค้นหากระทู้</p>
                  <Input 
                    placeholder="ค้นหา..." 
                    variant="bordered" 
                    className="text-white" 
                    fullWidth 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    startContent={<span className="text-gray-500">🔍</span>}
                  />
                </div>

                <Divider className="bg-white/5" />

                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1">หมวดหมู่</p>
                  <Tabs 
                    aria-label="Categories" 
                    color="primary" 
                    variant="underlined" 
                    isVertical 
                    className="w-full"
                    selectedKey={selectedTab}
                    onSelectionChange={(key) => setSelectedTab(key as string)}
                    classNames={{
                      tabList: "w-full gap-2 border-l-2 border-white/5",
                      tab: "justify-start h-11 font-bold px-4",
                      cursor: "w-full bg-blue-500/20"
                    }}
                  >
                    <Tab key="all" title="All Posts" />
                    {categories.map(cat => (
                         <Tab key={cat.value} title={cat.label} />
                    ))}
                  </Tabs>
                </div>
              </div>
            </Card>

            <Card className="bg-blue-600/5 border border-blue-500/10 p-5 hidden lg:block">
                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 italic">Guidelines</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">โปรดรักษามารยาทในการพูดคุยเพื่อให้สังคมน่าอยู่ครับ</p>
            </Card>
          </aside>

          {/* Main Content Section */}
          <div className="lg:col-span-9 space-y-4 order-1 lg:order-2 flex flex-col w-full">
            <div className="flex flex-col gap-3 w-full">
              
              {isLoading ? (
                 <div className="flex justify-center items-center py-20">
                    <Spinner size="lg" color="primary" />
                 </div>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <Link href={`/forum/${post.id}`} key={post.id} className="w-full block group">
                    <Card 
                      isPressable 
                      className="bg-black/40 border border-white/5 hover:border-blue-500/40 transition-all shadow-lg w-full"
                    >
                      <CardBody className="p-5 md:p-6 text-left w-full">
                        <div className="flex items-center justify-between gap-4 w-full">
                          <div className="flex items-center gap-4 overflow-hidden flex-1">
                            <Avatar src={post.author.image || ""} name={post.author.name || "User"} className="hidden sm:flex shrink-0 border border-white/10" size="sm" />
                            <div className="flex flex-col gap-1.5 overflow-hidden flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <Chip size="sm" color={getCategoryColor(post.category) as any} variant="flat" className="h-5 text-[10px] font-bold uppercase p-0 px-2">
                                  {post.category.replace('_', ' ')}
                                </Chip>
                                <h3 className="text-base md:text-lg font-bold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                                  {post.title}
                                </h3>
                              </div>
                              <p className="text-xs text-gray-500 font-medium">
                                โดย <span className="text-gray-300 font-semibold">{post.author.name || "Unknown"}</span> • {formatTimeAgo(post.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end shrink-0 min-w-[60px]">
                            <span className="text-blue-500 font-bold text-sm md:text-base leading-none">
                                {post._count.comments}
                            </span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Replies</span>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Link>
                ))
              ) : (
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

        {/* Floating Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <Button 
            onPress={session ? onOpen : () => alert("กรุณาเข้าสู่ระบบก่อนครับ")}
            color={session ? "primary" : "default"}
            size="lg"
            className="shadow-2xl font-bold rounded-full h-14 md:h-16 px-8 hover:scale-105 active:scale-95 transition-all"
          >
            <span className="text-xl mr-2">+</span> {session ? "NEW POST" : "LOGIN TO POST"}
          </Button>
        </div>

      </div>

      {/* New Post Modal */}
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
                      
                      <Select 
                        label="Category" 
                        placeholder="Select a category" 
                        variant="bordered" 
                        labelPlacement="outside"
                        selectedKeys={formData.category ? [formData.category] : []}
                        onSelectionChange={(keys) => {
                          const selectedValue = Array.from(keys)[0] as string;
                          setFormData({...formData, category: selectedValue});
                        }}
                      >
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} textValue={cat.label}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </Select>

                      <Input 
                        label="Topic Title" 
                        placeholder="ระบุหัวข้อที่ต้องการพูดคุย..." 
                        variant="bordered" 
                        labelPlacement="outside" 
                        value={formData.title}
                        onValueChange={(val) => setFormData({...formData, title: val})}
                      />

                      <Textarea 
                        label="Content Description" 
                        placeholder="รายละเอียดเนื้อหา..." 
                        variant="bordered" 
                        labelPlacement="outside" 
                        minRows={6} 
                        value={formData.content}
                        onValueChange={(val) => setFormData({...formData, content: val})}
                      />

                      <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-white/70">Upload Images</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          
                          {/* 🟢 ส่วนแสดงรูปภาพ Preview ที่เพิ่มเข้าไป */}
                          {previews.map((url, index) => (
                            <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                              <img src={url} alt="preview" className="w-full h-full object-cover" />
                              <button 
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-danger/80 hover:bg-danger text-white rounded-full w-5 h-5 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                              >
                                ✕
                              </button>
                            </div>
                          ))}

                          <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/5 hover:border-blue-500/50 transition-all group">
                            <span className="text-2xl group-hover:scale-110 transition-transform">📸</span>
                            <span className="text-[10px] text-gray-500 mt-1 font-bold">Add Photo</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              multiple 
                              onChange={handleFileChange} 
                            />
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
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" color="danger" onPress={onClose} className="font-bold uppercase">Discard</Button>
                <Button 
                    color="primary" 
                    onPress={handleCreatePost} 
                    isLoading={isSubmitting}
                    className="px-10 font-bold bg-blue-600 shadow-lg shadow-blue-500/20 uppercase"
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