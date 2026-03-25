"use client";

import React, { useState, useEffect } from "react";
import {
  Card, CardBody, Avatar, Chip, Button, Divider, Textarea,
  Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, RadioGroup, Radio, Spinner
} from "@heroui/react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast, Toaster } from "react-hot-toast";
import { IoWarningOutline, IoHeartOutline, IoHeart } from "react-icons/io5";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  images?: string[];
  author: {
    id: string;
    name: string | null;
    image: string | null;
    username?: string | null;
  };
  isExpert?: boolean;
  likedBy?: { id: string }[];
}

interface PostDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    username?: string | null;
  };
  comments: Comment[];
  images?: string[];
  likedBy?: { id: string }[];
  _count: {
    comments: number;
    likedBy: number;
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
  
  // สำหรับ Modal รายงาน
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportTarget, setReportTarget] = useState<{type: 'POST' | 'COMMENT', id: string}>({ type: 'POST', id: "" });

  const fetchPostDetail = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/forum/posts/${params.id}`, { cache: 'no-store' });
      if (!res.ok) throw new Error("Post not found");
      const data = await res.json();
      setPost(data);
      setReportTarget({ type: 'POST', id: data.id });
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

  const handleSendReport = async (onClose: () => void) => {
    if (!session) {
      toast.error("กรุณาเข้าสู่ระบบก่อนรายงาน");
      return;
    }
    if (!reportReason) {
      toast.error("กรุณาเลือกเหตุผลในการรายงาน");
      return;
    }

    try {
        setIsReporting(true);
        const endpoint = reportTarget.type === 'POST' 
            ? `/api/forum/posts/${reportTarget.id}/report` 
            : `/api/forum/comments/${reportTarget.id}/report`;

        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason: reportReason, description: reportDescription }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "ส่งรายงานไม่สำเร็จ");
        }
        
        toast.success("ส่งรายงานสำเร็จ ทีมงานจะรีบตรวจสอบ");
        setReportReason("");
        setReportDescription("");
        onClose();
    } catch (error) {
        // @ts-ignore
        toast.error(error.message || "เกิดข้อผิดพลาด");
    } finally {
        setIsReporting(false);
    }
  };

  const handleLikePost = async () => {
    if (!session) { toast.error("กรุณาเข้าสู่ระบบก่อนกดถูกใจ"); return; }
    try {
      const res = await fetch(`/api/forum/posts/${params.id}/like`, { method: "POST" });
      if (res.ok) {
        setPost(prev => {
          if (!prev) return prev;
          // @ts-ignore
          const userId = session.user.id;
          const isLiked = prev.likedBy?.some(u => u.id === userId);
          return {
            ...prev,
            likedBy: isLiked ? prev.likedBy?.filter(u => u.id !== userId) : [...(prev.likedBy || []), { id: userId }],
            _count: { ...prev._count, likedBy: isLiked ? prev._count.likedBy - 1 : prev._count.likedBy + 1 }
          };
        });
      }
    } catch(e) {}
  };

  const handleLikeComment = async (commentId: string) => {
    if (!session) { toast.error("กรุณาเข้าสู่ระบบก่อนกดถูกใจ"); return; }
    try {
      const res = await fetch(`/api/forum/comments/${commentId}/like`, { method: "POST" });
      if (res.ok) {
        setPost(prev => {
          if (!prev) return prev;
          // @ts-ignore
          const userId = session.user.id;
          return {
            ...prev,
            comments: prev.comments.map(c => {
              if (String(c.id) === String(commentId)) {
                const isLiked = c.likedBy?.some(u => u.id === userId);
                return {
                  ...c,
                  likedBy: isLiked ? c.likedBy?.filter(u => u.id !== userId) : [...(c.likedBy || []), { id: userId }]
                };
              }
              return c;
            })
          };
        });
      }
    } catch(e) {}
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
                <Link href={`/profile/${post.author.id}`} className="shrink-0 relative group/avatar z-10 hover:opacity-80 transition-opacity">
                  <Avatar size="sm" src={post.author.image || ""} name={post.author.name || post.author.username || "User"} className="border border-white/10 group-hover/avatar:border-blue-500 transition-colors" />
                </Link>
                <p className="text-xs md:text-sm text-gray-400 font-medium">
                  โพสต์โดย <Link href={`/profile/${post.author.id}`} className="text-white font-bold hover:text-blue-400 hover:underline transition-colors z-10 relative">{post.author.name || post.author.username || "Unknown"}</Link> • {new Date(post.createdAt).toLocaleDateString('th-TH')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="light" 
                // @ts-ignore
                color={post.likedBy?.some(u => u.id === session?.user?.id) ? "danger" : "default"}
                // @ts-ignore
                className={post.likedBy?.some(u => u.id === session?.user?.id) ? "text-danger" : "text-gray-400"}
                onPress={handleLikePost}
                startContent={
                  // @ts-ignore
                  post.likedBy?.some(u => u.id === session?.user?.id) ? <IoHeart className="text-xl" /> : <IoHeartOutline className="text-xl" />
                }
              >
                {post._count?.likedBy || 0}
              </Button>
              <Chip color="primary" variant="flat" size="sm" className="font-bold">
                {post.category?.replace('_', ' ') || "BUILD ADVICE"}
              </Chip>
              <Dropdown className="bg-slate-900 border border-white/10 text-white">
                <DropdownTrigger>
                  <Button isIconOnly variant="light" className="text-gray-400">•••</Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Post actions">
                  <DropdownItem key="share" onPress={handleShare}>คัดลอกลิงก์โพสต์</DropdownItem>
                  <DropdownItem key="report" className="text-danger" color="danger" onPress={() => {
                    setReportTarget({ type: 'POST', id: post.id });
                    onOpen();
                  }}>
                    รายงานกระทู้
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>

          <Divider className="bg-white/5" />

          <div className="text-gray-300 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
            <p className="mb-6">{post.content}</p>

            {post.specs && post.specs.length > 0 && (
              <Card className="bg-blue-600/5 border border-blue-500/20 my-8">
                <CardBody className="p-6">
                  <h3 className="text-blue-400 font-bold mb-4 uppercase tracking-wider text-sm text-center md:text-left">Attached PC Build</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-6 text-sm">
                    {post.specs.map((item, idx) => (
                      <div key={idx} className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-500 uppercase text-[10px]">{item.label}</span>
                        <span className="text-white font-medium">{item.val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-lg text-white">ราคารวมโดยประมาณ: <span className="text-blue-500 font-bold">฿{post.price || "0"}</span></p>
                    <Button color="primary" size="sm" className="font-bold px-8 shadow-lg shadow-blue-500/20" onPress={handleShare}>
                      Copy this Build
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}

            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {post.images.map((imgUrl, idx) => (
                  <div key={idx} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
                    <img src={imgUrl} alt={`Attached ${idx + 1}`} className="w-full h-auto max-h-[500px] object-contain hover:scale-105 transition-transform cursor-pointer" />
                  </div>
                ))}
              </div>
            )}
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
                  <Link href={`/profile/${comment.author.id}`} className="shrink-0 relative group/avatar z-10 hover:opacity-80 transition-opacity">
                    <Avatar src={comment.author.image || ""} name={comment.author.name || comment.author.username || "User"} size="sm" className="border border-white/10 group-hover/avatar:border-blue-500 transition-colors" />
                  </Link>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Link href={`/profile/${comment.author.id}`} className="font-bold text-white text-sm hover:text-blue-400 hover:underline transition-colors z-10 relative">
                          {comment.author.name || comment.author.username || "Unknown"}
                        </Link>
                        {(comment.author.name === "HardwareExpert" || comment.author.username === "HardwareExpert") && (
                          <Chip size="sm" color="warning" variant="flat" className="h-4 text-[9px]">Expert</Chip>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500 uppercase">{new Date(comment.createdAt).toLocaleDateString('th-TH')}</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                      <Button 
                        size="sm" 
                        variant="light" 
                        // @ts-ignore
                        color={comment.likedBy?.some(u => u.id === session?.user?.id) ? "danger" : "default"}
                        className={`min-w-0 px-2 h-8 ${
                          // @ts-ignore
                          comment.likedBy?.some(u => u.id === session?.user?.id) ? "text-danger" : "text-gray-400"
                        }`}
                        onPress={() => handleLikeComment(comment.id)}
                        startContent={
                          // @ts-ignore
                          comment.likedBy?.some(u => u.id === session?.user?.id) ? <IoHeart /> : <IoHeartOutline />
                        }
                      >
                        {comment.likedBy?.length || 0}
                      </Button>
                      <Button 
                        size="sm" 
                        isIconOnly 
                        variant="light" 
                        className="text-gray-500 hover:text-danger min-w-0 h-8 px-2"
                        onPress={() => {
                          setReportTarget({ type: 'COMMENT', id: comment.id });
                          onOpen();
                        }}
                      >
                        <IoWarningOutline />
                      </Button>
                    </div>
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
                <RadioGroup color="danger" value={reportReason} onValueChange={setReportReason}>
                  <Radio value="harassment">เนื้อหาหยาบคาย หรือคุกคาม</Radio>
                  <Radio value="spam">สแปม หรือข้อมูลเท็จ</Radio>
                  <Radio value="misplaced">โพสต์ผิดหมวดหมู่</Radio>
                  <Radio value="sexual">เนื้อหาลามกอนาจาร</Radio>
                </RadioGroup>
                <Textarea 
                  label="รายละเอียดเพิ่มเติม" 
                  variant="bordered" 
                  className="mt-4" 
                  value={reportDescription}
                  onValueChange={setReportDescription}
                />
              </ModalBody>
              <ModalFooter className="border-t border-white/5">
                <Button variant="light" onPress={onClose}>ยกเลิก</Button>
                <Button color="danger" onPress={() => handleSendReport(onClose)} isLoading={isReporting}>
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