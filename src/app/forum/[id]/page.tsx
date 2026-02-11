"use client";

import React from "react";
import { 
  Card, CardBody, Avatar, Chip, Button, Divider, Textarea,
  Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, RadioGroup, Radio, addToast
} from "@heroui/react";
import { useRouter } from "next/navigation";

const comments = [
  { id: 1, author: "HardwareExpert", date: "1 ชั่วโมงที่แล้ว", content: "สเปกนี้ถือว่าคุ้มค่ามากครับสำหรับงบ 30k แต่แนะนำให้เพิ่ม PSU เป็น 750W เผื่ออัปเกรดในอนาคตด้วยจะดีมากครับ", isExpert: true },
  { id: 2, author: "GamerBoy99", date: "45 นาทีที่แล้ว", content: "RTX 4060 Ti เล่นเกม 1080p ปรับสุดได้ทุกเกมแน่นอนครับ ยืนยันอีกเสียง!", isExpert: false }
];

export default function PostDetailPage() {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // ✅ ฟังก์ชันสำหรับการแชร์โพสต์
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast({
      title: "คัดลอกลิงก์เรียบร้อย!",
      description: "URL ถูกบันทึกลงคลิปบอร์ดแล้ว",
      color: "success",
      variant: "flat",
    });
  };

  // ✅ ฟังก์ชันสำหรับการส่งรายงาน
  const handleSendReport = (onClose: () => void) => {
    // Logic การส่งข้อมูลไปยัง Backend สามารถใส่เพิ่มตรงนี้ได้
    addToast({
      title: "ส่งรายงานสำเร็จ",
      description: "ขอบคุณที่ช่วยแจ้งเบาะแส ทีมงานจะรีบตรวจสอบโดยเร็วที่สุด",
      color: "danger",
      variant: "flat",
    });
    onClose(); // ปิด Modal หลังจากส่งรายงานเสร็จ
  };

  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 max-w-5xl mx-auto">
      
      {/* ⬅️ ปุ่มย้อนกลับไปหน้า Forum */}
      <div className="mb-6">
        <Button 
          variant="light" 
          className="text-gray-400 hover:text-white"
          onPress={() => router.back()}
        >
          ← กลับสู่หน้าหลักฟอรั่ม
        </Button>
      </div>

      <Card className="bg-black/40 border border-white/10 p-4 md:p-8 mb-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">
                  ช่วยดูสเปกหน่อยครับ งบ 30,000 บาท รวมจอ เน้นเล่นเกม
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <Avatar size="sm" name="User01" className="border border-white/10" />
                  <p className="text-xs md:text-sm text-gray-400">
                    โพสต์โดย <span className="text-white">User01</span> • 2 ชั่วโมงที่แล้ว
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Chip color="primary" variant="flat" size="sm">Build Advice</Chip>
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
          </div>

          <Divider className="bg-white/5" />

          <div className="text-gray-300 leading-relaxed text-sm md:text-base">
            <p className="mb-6">
              สวัสดีครับเพื่อนๆ พอดีผมกำลังจะจัดคอมเครื่องแรกในชีวิต อยากจะเอามาเล่นเกมแนว FPS เป็นหลัก 
              ลองจัดสเปกคร่าวๆ มาได้ประมาณนี้ รบกวนช่วยเช็กความเข้ากันของอุปกรณ์ให้หน่อยครับ
            </p>

            <Card className="bg-blue-600/5 border border-blue-500/20 my-8">
              <CardBody className="p-6">
                <h3 className="text-blue-400 font-bold mb-4 uppercase tracking-wider text-sm">Attached PC Build</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-6 text-sm">
                  {[{ label: "CPU", val: "Intel Core i5-13400F" }, { label: "GPU", val: "NVIDIA RTX 4060 Ti" }, { label: "MB", val: "B760M DDR5" }, { label: "RAM", val: "16GB 5200MHz" }].map((item, idx) => (
                    <div key={idx} className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-500 uppercase text-[10px]">{item.label}</span>
                      <span className="text-white">{item.val}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-lg">ราคารวมโดยประมาณ: <span className="text-blue-500 font-bold">฿31,500</span></p>
                  <Button color="primary" size="sm" className="font-bold px-8">Copy this Build</Button>
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
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          Comments <span className="text-gray-500 text-sm font-normal">({comments.length})</span>
        </h3>
        <Card className="bg-black/40 border border-white/10 p-4">
          <div className="flex flex-col gap-4">
            <Textarea placeholder="เขียนความคิดเห็นของคุณที่นี่..." variant="bordered" classNames={{ input: "text-white" }} />
            <div className="flex justify-end">
              <Button color="primary" className="font-bold">Comment</Button>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <Card key={comment.id} className="bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
              <CardBody className="p-6">
                <div className="flex gap-4">
                  <Avatar name={comment.author} size="sm" className="shrink-0" />
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex justify-between items-center text-[10px] md:text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{comment.author}</span>
                        {comment.isExpert && <Chip size="sm" color="warning" variant="flat" className="h-4 text-[9px]">Expert</Chip>}
                      </div>
                      <span className="text-gray-500">{comment.date}</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* 🚩 Modal สำหรับรายงานกระทู้ */}
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
                <Button 
                  color="danger" 
                  onPress={() => handleSendReport(onClose)} // เรียกฟังก์ชันพร้อม Toast และปิด Modal
                >
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