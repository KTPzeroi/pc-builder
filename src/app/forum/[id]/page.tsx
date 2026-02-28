"use client";

import React, { useState, useEffect } from "react";
import { 
  Card, CardBody, Avatar, Chip, Button, Divider, Textarea,
  Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, RadioGroup, Radio, Spinner
} from "@heroui/react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast, Toaster } from "react-hot-toast"; 

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  images?: string[];
  author: {
    name: string | null;
    image: string | null;
  };
  isExpert?: boolean; 
}

interface PostDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  author: {
    name: string | null;
    image: string | null;
  };
  comments: Comment[];
  _count: {
    comments: number;
  };
  specs?: { label: string; val: string }[]; 
  price?: string;
}

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentInput, setCommentInput] = useState("");
  // --- ส่วนที่เพิ่มเข้ามา ---
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPostDetail = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/forum/posts/${params.id}`, { cache: 'no-store' });
      if (!res.ok) throw new Error("Post not found");
      const data = await res.json();
      setPost(data);
    } catch (error) {
      console.error("Fetch Error:", error);
      setPost(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) fetchPostDetail();
  }, [params.id]);

  // --- ส่วนฟังก์ชันส่งคอมเมนต์ที่เพิ่มเข้ามา ---
  const handleSubmitComment = async () => {
    if (!commentInput.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/forum/posts/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentInput }),
      });

      if (!res.ok) throw new Error("ส่งคอมเมนต์ไม่สำเร็จ");

      const newComment = await res.json();

      // อัปเดต UI ทันทีโดยไม่ต้องโหลดหน้าใหม่
      setPost((prev) => prev ? {
        ...prev,
        comments: [newComment, ...prev.comments],
        _count: { ...prev._count, comments: prev._count.comments + 1 }
      } : null);

      setCommentInput(""); 
      toast.success("คอมเมนต์เรียบร้อย!");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการส่งคอมเมนต์");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("คัดลอกลิงก์เรียบร้อย!");
  };

  const handleSendReport = (onClose: () => void) => {
    toast.error("ส่งรายงานสำเร็จ ทีมงานจะรีบตรวจสอบ");
    onClose();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <Spinner size="lg" label="กำลังโหลดข้อมูล..." color="primary" />
      </div>
    );
  }

  if (!post) return <div className="text-white text-center pt-24 font-bold">ไม่พบกระทู้นี้</div>;

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 max-w-5xl mx-auto">
      <Toaster position="bottom-right" /> 
      
      <div className="mb-6">
        <Button 
          variant="light" 
          className="text-gray-400 hover:text-white font-bold" 
          onPress={() => router.back()}
        >
          ← กลับสู่หน้าหลักฟอรั่ม
        </Button>
      </div>

      <Card className="bg-black/40 border border-white/10 p-4 md:p-8 mb-8 shadow-2xl">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col gap-3 flex-1">
              <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                {post.title}
              </h1>
              <div className="flex items-center gap-3">
                <Avatar size="sm" src={post.author.image || ""} className="border border-white/10" />
                <p className="text-xs md:text-sm text-gray-400">
                  โพสต์โดย <span className="text-white font-medium">{post.author.name}</span> • {new Date(post.createdAt).toLocaleDateString('th-TH')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Chip color="primary" variant="flat" size="sm" className="font-bold">
                {post.category?.replace('_', ' ') || "BUILD ADVICE"}
              </Chip>
              <Dropdown className="bg-slate-900 border border-white/10 text-white">
                <DropdownTrigger>
                  <Button isIconOnly variant="light" className="text-gray-400">•••</Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Post actions">
                  <DropdownItem key="share" onPress={handleShare}>คัดลอกลิงก์โพสต์</DropdownItem>
                  <DropdownItem key="report" className="text-danger" color="danger" onPress={onOpen}>
                    รายงานกระทู้
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>

          <Divider className="bg-white/5" />

          <div className="text-gray-300 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
            <p className="mb-6">{post.content}</p>

            <Card className="bg-blue-600/5 border border-blue-500/20 my-8">
              <CardBody className="p-6">
                <h3 className="text-blue-400 font-bold mb-4 uppercase tracking-wider text-sm text-center md:text-left">Attached PC Build</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-6 text-sm">
                  {[
                    { label: "CPU", val: "Intel Core i5-13400F" },
                    { label: "GPU", val: "NVIDIA RTX 4060 Ti" },
                    { label: "MB", val: "B760M DDR5" },
                    { label: "RAM", val: "16GB 5200MHz" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-500 uppercase text-[10px]">{item.label}</span>
                      <span className="text-white font-medium">{item.val}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-lg text-white">ราคารวมโดยประมาณ: <span className="text-blue-500 font-bold">฿31,500</span></p>
                  <Button color="primary" size="sm" className="font-bold px-8 shadow-lg shadow-blue-500/20" onPress={handleShare}>
                    Copy this Build
                  </Button>
                </div>
              </CardBody>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="aspect-video bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-gray-600 text-xs italic">Photo 1</div>
              <div className="aspect-video bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-gray-600 text-xs italic">Photo 2</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          Comments <span className="text-gray-500 text-sm font-normal">({post._count.comments})</span>
        </h3>
        
        {session ? (
          <Card className="bg-black/40 border border-white/10 p-4">
            <div className="flex flex-col gap-4">
              <Textarea 
                placeholder="เขียนความคิดเห็นของคุณที่นี่..." 
                variant="bordered" 
                value={commentInput}
                onValueChange={setCommentInput}
                classNames={{ input: "text-white" }} 
              />
              <div className="flex justify-end">
                {/* เชื่อมต่อฟังก์ชันและสถานะ Loading */}
                <Button 
                  color="primary" 
                  className="font-bold px-6"
                  onPress={handleSubmitComment}
                  isLoading={isSubmitting}
                  isDisabled={!commentInput.trim()}
                >
                  Comment
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="bg-blue-600/5 border border-dashed border-blue-500/20 p-6 text-center">
            <p className="text-gray-400 text-sm">กรุณาเข้าสู่ระบบเพื่อร่วมแสดงความคิดเห็น</p>
          </Card>
        )}

        <div className="flex flex-col gap-4">
          {post.comments?.map((comment) => (
            <Card key={comment.id} className="bg-black/20 border border-white/5 hover:border-white/10 transition-colors shadow-sm">
              <CardBody className="p-6">
                <div className="flex gap-4">
                  <Avatar src={comment.author.image || ""} size="sm" className="shrink-0 border border-white/10" />
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{comment.author.name}</span>
                        {comment.author.name === "HardwareExpert" && (
                           <Chip size="sm" color="warning" variant="flat" className="h-4 text-[9px]">Expert</Chip>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500 uppercase">{new Date(comment.createdAt).toLocaleDateString('th-TH')}</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange} 
        backdrop="blur" 
        classNames={{ base: "bg-slate-900 border border-white/10 text-white" }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="border-b border-white/5">รายงานเนื้อหาที่ไม่เหมาะสม</ModalHeader>
              <ModalBody className="py-6">
                <p className="text-sm text-gray-400 mb-4">โปรดระบุเหตุผลในการรายงานกระทู้นี้:</p>
                <RadioGroup color="danger">
                  <Radio value="harassment">เนื้อหาหยาบคาย หรือคุกคาม</Radio>
                  <Radio value="spam">สแปม หรือข้อมูลเท็จ</Radio>
                  <Radio value="misplaced">โพสต์ผิดหมวดหมู่</Radio>
                  <Radio value="sexual">เนื้อหาลามกอนาจาร</Radio>
                </RadioGroup>
                <Textarea label="รายละเอียดเพิ่มเติม" variant="bordered" className="mt-4" />
              </ModalBody>
              <ModalFooter className="border-t border-white/5">
                <Button variant="light" onPress={onClose}>ยกเลิก</Button>
                <Button color="danger" onPress={() => handleSendReport(onClose)}>
                  ส่งรายงาน
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

    </main>
  );
}