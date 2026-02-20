"use client";

import React, { useState, useRef, MouseEvent, TouchEvent } from "react";
// นำเข้า HeroUI Components ที่ช่วยเรื่องความสวยงาม
import { 
  Button, 
  Card, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Chip
} from "@heroui/react";

import { PiGraphicsCardBold } from "react-icons/pi";
import { BsCpu } from "react-icons/bs";
import { BsMotherboard } from "react-icons/bs";
import { BsDeviceSsd } from "react-icons/bs";
import { FaRegHdd } from "react-icons/fa";
import { BsMemory } from "react-icons/bs";
import { LuPcCase } from "react-icons/lu";
import { BiTachometer } from "react-icons/bi";
import { PiFan } from "react-icons/pi";

// ==========================================
// DATA: ข้อมูลสำหรับส่วน PC Components (ปรับปรุงเนื้อหาให้เข้าใจง่าย)
// ==========================================
interface ComponentDetail {
  title: string;
  desc: string;
  details: string[];
  icon: React.ReactNode;
}

const componentData: ComponentDetail[] = [
  {
    title: "CPU – Central Processing Unit",
    desc: "เปรียบเสมือน 'สมอง' ของคอมพิวเตอร์ ทำหน้าที่คิด คำนวณ และสั่งการทุกอย่าง ยิ่งสมองทำงานเร็วและมีหลายส่วน (Core) เครื่องก็จะยิ่งประมวลผลงานหนักๆ ได้ไวขึ้น",
    details: [
      "หน้าที่หลัก: ประมวลผลคำสั่งและรันโปรแกรม",
      "Core/Thread: ยิ่งเยอะ ยิ่งเปิดหลายโปรแกรมลื่น",
      "Clock Speed (GHz): ความเร็วในการคิดคำนวณ",
      "ค่ายยอดนิยม: Intel (Core i) และ AMD (Ryzen)",
    ],
    icon: <BsCpu style={{ width: "60%", height: "60%", color: "#ffffff" }} />,
  },
  {
    title: "Mainboard – Motherboard",
    desc: "เปรียบเสมือน 'กระดูกสันหลัง' หรือ 'โครงข่ายถนน' เป็นแผงวงจรแผ่นใหญ่ที่อุปกรณ์ทุกชิ้นต้องมาเสียบเพื่อเชื่อมต่อและพูดคุยกัน",
    details: [
      "หน้าที่หลัก: ทางผ่านข้อมูลของอุปกรณ์ทุกชิ้น",
      "Socket: ต้องเลือกรุ่นที่เสียบกับ CPU ได้พอดี",
      "Chipset: ตัวกำหนดฟีเจอร์แฝง เช่น การ Overclock",
      "ขนาด (Form Factor): ATX (ใหญ่), mATX, ITX (เล็ก)",
    ],
    icon: <BsMotherboard style={{ width: "60%", height: "60%", color: "#ffffff" }} />,
  },
  {
    title: "GPU – Graphics Processing Unit",
    desc: "เปรียบเสมือน 'ศิลปินนักวาดภาพ' ทำหน้าที่รับข้อมูลมาแปลงเป็นภาพสวยๆ บนจอ ยิ่งศิลปินเก่ง ภาพในเกมก็จะยิ่งสวย ลื่นไหล และทำงานกราฟิก 3D ได้ดี",
    details: [
      "หน้าที่หลัก: ประมวลผลภาพ, กราฟิก 3D และวิดีโอ",
      "VRAM: แรมการ์ดจอ ยิ่งเยอะยิ่งปรับภาพชัดได้สูง",
      "ความสำคัญ: ชิ้นส่วนที่สำคัญที่สุดสำหรับสายเกมเมอร์",
      "ค่ายยอดนิยม: NVIDIA (GeForce) และ AMD (Radeon)",
    ],
    icon: <PiGraphicsCardBold style={{ width: "60%", height: "60%", color: "#ffffff" }} />,
  },
  {
    title: "RAM – Random Access Memory",
    desc: "เปรียบเสมือน 'โต๊ะทำงาน' ยิ่งโต๊ะใหญ่ ก็ยิ่งวางเอกสาร (เปิดโปรแกรม) หลายๆ อย่างพร้อมกันได้โดยไม่ต้องจัดเก็บใหม่ ทำให้สลับหน้าต่างไปมาได้ลื่นไหล",
    details: [
      "หน้าที่หลัก: หน่วยความจำชั่วคราว พักข้อมูลรอประมวลผล",
      "ความจุ: ขั้นต่ำยุคนี้ 16GB (แนะนำ 32GB สำหรับทำงาน/เกม)",
      "Bus Speed: ความเร็วในการส่งข้อมูล (ยิ่งสูงยิ่งดี)",
      "ประเภท: DDR4 (มาตรฐาน) และ DDR5 (รุ่นใหม่ล่าสุด)",
    ],
    icon: <BsMemory style={{ width: "60%", height: "60%", color: "#ffffff" }} />,
  },
  {
    title: "SSD – Solid State Drive",
    desc: "เปรียบเสมือน 'ตู้เก็บเอกสารความเร็วสูง' เป็นที่เก็บข้อมูลถาวร (วินโดวส์, เกม, รูป) ใช้ชิปดิจิทัล ทำให้เปิดเครื่องและโหลดเกมเสร็จในไม่กี่วินาที",
    details: [
      "หน้าที่หลัก: แหล่งเก็บข้อมูลหลักที่อ่าน/เขียนไวมาก",
      "ประเภท M.2 NVMe: เป็นแท่งเล็ก เสียบติดบอร์ด เร็วที่สุด",
      "ประเภท SATA: ทรงสี่เหลี่ยม ความเร็วรองลงมา ราคาถูกกว่า",
      "ข้อดี: ไม่มีจานหมุน ทนทาน และเงียบสนิท",
    ],
    icon: <BsDeviceSsd style={{ width: "60%", height: "60%", color: "#ffffff" }} />,
  },
  {
    title: "HDD – Hard Disk Drive",
    desc: "เปรียบเสมือน 'โกดังเก็บของขนาดใหญ่' เป็นเทคโนโลยีจานหมุนแบบเก่าที่ทำงานช้ากว่า SSD แต่ได้ความจุที่เยอะมากในราคาที่ถูกกว่า เหมาะสำหรับเก็บไฟล์สำรอง",
    details: [
      "หน้าที่หลัก: เก็บข้อมูลขนาดใหญ่ (รูป, หนัง, ไฟล์งานเก่า)",
      "ข้อดี: ราคาถูกเมื่อเทียบกับปริมาณความจุ (TB)",
      "ข้อเสีย: ทำงานช้า มีเสียงจานหมุน และบอบบางต่อแรงกระแทก",
      "ความเร็วรอบ: 5400 RPM และ 7200 RPM (ยิ่งเยอะยิ่งดี)",
    ],
    icon: <FaRegHdd style={{ width: "60%", height: "60%", color: "#ffffff" }} />,
  },
  {
    title: "Power Supply – PSU",
    desc: "เปรียบเสมือน 'หัวใจผลิตเลือด' ทำหน้าที่รับไฟบ้าน (กระแสสลับ) มาแปลงเป็นไฟเลี้ยง (กระแสตรง) แล้วสูบฉีดไปให้ทุกชิ้นส่วน หากจ่ายไฟไม่นิ่ง เครื่องอาจรวนหรือพังได้",
    details: [
      "หน้าที่หลัก: จ่ายกระแสไฟฟ้าให้คอมพิวเตอร์ทั้งระบบ",
      "Watt (W): ต้องคำนวณให้พอดีกับที่ระบบต้องการใช้งาน",
      "80 Plus: มาตรฐานรับรองประสิทธิภาพการแปลงไฟ (Bronze ถึง Titanium)",
      "ประเภท: Modular (ถอดสายได้) และ Non-Modular (ถอดสายไม่ได้)",
    ],
    icon: <BiTachometer style={{ width: "60%", height: "60%", color: "#ffffff" }} />,
  },
  {
    title: "Case – Computer Chassis",
    desc: "เปรียบเสมือน 'บ้าน' ของชิ้นส่วนทั้งหมด ทำหน้าที่ปกป้องอุปกรณ์จากฝุ่นหรือการกระแทก และช่วยจัดทิศทางลมเพื่อระบายความร้อนออกไปนอกเครื่อง",
    details: [
      "หน้าที่หลัก: เป็นโครงสร้างยึดอุปกรณ์ และจัดการ Airflow",
      "ขนาด: ต้องสัมพันธ์กับขนาดของ Mainboard (ATX, mATX)",
      "การระบายลม: เคสหน้าตะแกรง (Mesh) จะระบายความร้อนได้ดีที่สุด",
      "ความสวยงาม: ฝาข้างกระจกใส (Tempered Glass) โชว์ไฟ RGB",
    ],
    icon: <LuPcCase style={{ width: "60%", height: "60%", color: "#ffffff" }} />,
  },
  {
    title: "CPU Cooler – Cooling System",
    desc: "เปรียบเสมือน 'แอร์หรือพัดลม' ของสมอง (CPU) เพราะเวลา CPU คิดคำนวณจะเกิดความร้อนสูงมาก หากไม่ระบายออก เครื่องจะช้าลงหรือดับเพื่อป้องกันตัวเอง",
    details: [
      "หน้าที่หลัก: รักษาอุณหภูมิ CPU ให้อยู่ในระดับที่ปลอดภัย",
      "Air Cooling: ชุดซิงค์ลม ทนทาน ดูแลง่าย ราคาประหยัด",
      "Liquid Cooling: ชุดน้ำปิด ระบายความร้อนดีเยี่ยม สวยงาม",
      "Thermal Paste: ต้องมี 'ซิลิโคน' เป็นตัวผสานความร้อนระหว่าง CPU กับซิงค์",
    ],
    icon: <PiFan style={{ width: "60%", height: "60%", color: "#ffffff" }} />,
  },
];

export default function Page() {
  // ==========================================
  // LOGIC: ส่วน PC Components (Slider & Drag)
  // (เก็บไว้เหมือนเดิม 100%)
  // ==========================================
  const sliderRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  
  const mouseDownAt = useRef<number>(0);
  const left = useRef<number>(0);
  const [selectedItem, setSelectedItem] = useState<ComponentDetail | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const startDrag = (clientX: number) => {
    mouseDownAt.current = clientX;
    setIsDragging(true);
  };

  const endDrag = () => {
    mouseDownAt.current = 0;
    setIsDragging(false);
    if (sliderRef.current && formRef.current) {
      sliderRef.current.style.userSelect = "unset";
      sliderRef.current.style.cursor = "grab";
      formRef.current.style.pointerEvents = "unset"; 
      
      formRef.current.classList.remove("left");
      formRef.current.classList.remove("right");
    }
  };

  const moveDrag = (clientX: number) => {
    if (mouseDownAt.current === 0) return;

    const mouseDelta = clientX - mouseDownAt.current;
    if (Math.abs(mouseDelta) < 10) return; 
    if (!sliderRef.current || !formRef.current) return;

    sliderRef.current.style.userSelect = "none";
    sliderRef.current.style.cursor = "grabbing"; 
    formRef.current.style.pointerEvents = "none"; 

    if (clientX > mouseDownAt.current) {
      formRef.current.classList.add("left");
      formRef.current.classList.remove("right");
    } else {
      formRef.current.classList.add("right");
      formRef.current.classList.remove("left");
    }

    const speed = 1.2; 
    const leftTemporary = left.current + mouseDelta / speed;
    const containerWidth = sliderRef.current.offsetWidth;
    const contentWidth = formRef.current.scrollWidth;
    const leftLimit = contentWidth - containerWidth;

    if (leftTemporary <= 50 && Math.abs(leftTemporary) < leftLimit + 50) {
      formRef.current.style.setProperty("--left", leftTemporary + "px");
      left.current = leftTemporary;
      mouseDownAt.current = clientX;
    }
  };

  const handleMouseDown = (e: MouseEvent) => startDrag(e.clientX);
  const handleMouseUp = () => endDrag();
  const handleMouseMove = (e: MouseEvent) => moveDrag(e.clientX);
  const handleTouchStart = (e: TouchEvent) => startDrag(e.touches[0].clientX);
  const handleTouchEnd = () => endDrag();
  const handleTouchMove = (e: TouchEvent) => moveDrag(e.touches[0].clientX);

  return (
    <main className="font-kanit">
      {/* SECTION 1: HERO BANNER */}
      <section className="banner">
        <div className="banner-slider" style={{ ["--quantity" as any]: 9 }}>
          <div className="banner-item" style={{ ["--position" as any]: 1 }}><BsCpu style={{ width: "75%", height: "100%", color: "#f6f6f7" }} /></div>
          <div className="banner-item" style={{ ["--position" as any]: 2 }}><PiGraphicsCardBold style={{ width: "75%", height: "100%", color: "#f6f6f7" }} /></div>
          <div className="banner-item" style={{ ["--position" as any]: 3 }}><BsMotherboard style={{ width: "75%", height: "100%", color: "#f6f6f7" }} /></div>
          <div className="banner-item" style={{ ["--position" as any]: 4 }}><BsDeviceSsd style={{ width: "75%", height: "100%", color: "#f6f6f7" }} /></div>
          <div className="banner-item" style={{ ["--position" as any]: 5 }}><BsMemory style={{ width: "75%", height: "100%", color: "#f6f6f7" }} /></div>
          <div className="banner-item" style={{ ["--position" as any]: 6 }}><FaRegHdd style={{ width: "75%", height: "100%", color: "#f6f6f7" }} /></div>
          <div className="banner-item" style={{ ["--position" as any]: 7 }}><BiTachometer style={{ width: "75%", height: "100%", color: "#f6f6f7" }} /></div>
          <div className="banner-item" style={{ ["--position" as any]: 8 }}><LuPcCase style={{ width: "75%", height: "100%", color: "#f6f6f7" }} /></div>
          <div className="banner-item" style={{ ["--position" as any]: 9 }}><PiFan style={{ width: "75%", height: "100%", color: "#f6f6f7" }} /></div>
        </div>

        <div className="banner-content">
          <h1 data-content="PC BUILDER" style={{ fontFamily: 'Kanit' }}>PC <br></br>BUILDER</h1>
          <div className="cta-container">
            <a href="#plan" style={{ textDecoration: 'none' }}>
              {/* เปลี่ยนเป็น HeroUI Button ตำแหน่งเดิมเป๊ะ */}
              <Button 
                color="primary" 
                variant="shadow" 
                radius="full"
                size="lg"
                className="px-10 py-6 text-[1.3rem] font-semibold tracking-wider font-kanit shadow-[0_0_20px_rgba(0,210,255,0.4)] bg-[#00d2ff] text-[#fffff]"
              >
                PLAN YOUR BUILD
              </Button>
            </a>
          </div>
          <div className="model"></div>
        </div>
      </section>

      {/* SECTION 1.5: STEP-BY-STEP SEQUENCE */}
      <section className="build-sequence-section">
        <div className="sequence-container">
          <div className="sequence-track">
            
            <div className="seq-item">
              <div className="seq-icon"><BsCpu /></div>
              <p>1. CPU</p>
            </div>
            <div className="seq-arrow">→</div>

            <div className="seq-item">
              <div className="seq-icon"><BsMotherboard /></div>
              <p>2. Mainboard</p>
            </div>
            <div className="seq-arrow">→</div>

            <div className="seq-item">
              <div className="seq-icon"><BsMemory /></div>
              <p>3. RAM</p>
            </div>
            <div className="seq-arrow">→</div>

            <div className="seq-item">
              <div className="seq-icon"><PiGraphicsCardBold /></div>
              <p>4. Graphic Card</p>
            </div>
            <div className="seq-arrow">→</div>

            <div className="seq-item">
              <div className="seq-icon"><BsDeviceSsd /></div>
              <p>5. SSD</p>
            </div>
            <div className="seq-arrow">→</div>

            <div className="seq-item">
              <div className="seq-icon"><BiTachometer /></div>
              <p>6. Power Supply</p>
            </div>
            <div className="seq-arrow">→</div>

            <div className="seq-item">
              <div className="seq-icon"><PiFan /></div>
              <p>7. CPU Cooler</p>
            </div>
            <div className="seq-arrow">→</div>

            <div className="seq-item">
              <div className="seq-icon"><LuPcCase /></div>
              <p>8. Case</p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: PC COMPONENTS */}
      <section className="components-section">
        <div
          className="slider"
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
        >
          <div className="title" style={{ fontFamily: 'Kanit' }}>PC Component Guide</div>

          <div className={`form ${isDragging ? "dragging" : "sliding"}`} ref={formRef}>
            {componentData.map((item, index) => (
              <div className="item" key={index}>
                {/* รักษาโครงสร้าง .content เดิมไว้ให้ทำงานร่วมกับ CSS ของคุณได้ 
                  แต่ครอบด้วย <Card> ของ HeroUI เพื่อความสวยงามตอน hover และแสงเงา 
                */}
                <Card 
                  isHoverable
                  radius="lg"
                  className="content !bg-[#0f172a] border-none shadow-[0_10px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(0,210,255,0.2)] transition-shadow duration-300"
                >
                  <div className="icon-wrapper">
                    {item.icon}
                  </div>
                  
                  <div className="des bg-black/60 backdrop-blur-sm border-t border-white/10">
                    <div className="text-ellipsis font-kanit">
                      {item.title.split("–")[0]}
                    </div>
                    {/* ปุ่ม See more เป็น HeroUI */}
                    <Button
                      size="sm"
                      color="primary"
                      variant="solid"
                      radius="sm"
                      className="font-semibold font-kanit bg-[#00d2ff] text-black"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        setSelectedItem(item);
                      }}
                    >
                      See more
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HERO UI: POPUP MODAL (มาแทนที่ div โครงสร้างเก่า เพื่อความลื่นไหลและสวยล้ำ) */}
      <Modal 
        isOpen={!!selectedItem} 
        onOpenChange={(isOpen) => !isOpen && setSelectedItem(null)}
        backdrop="blur" 
        size="2xl"
        classNames={{
          base: "bg-gradient-to-br from-[#1e293b] to-[#0B0F19] text-white border border-white/10 shadow-2xl font-kanit",
          header: "border-b border-white/5",
          footer: "border-t border-white/5",
          closeButton: "hover:bg-white/10 active:bg-white/20 text-white/70 hover:text-white transition-colors",
        }}
        motionProps={{
          variants: {
            enter: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
            exit: { y: -20, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
          }
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-[1.6rem] font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                {selectedItem?.title}
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* กรอบไอคอน */}
                  <div className="flex-shrink-0 w-[150px] h-[150px] rounded-2xl bg-black/40 flex justify-center items-center shadow-[inset_0_0_20px_rgba(0,210,255,0.05)] border border-white/5 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-[#00d2ff]/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="scale-[1.5] drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] relative z-10">
                      {selectedItem?.icon}
                    </div>
                  </div>
                  {/* รายละเอียด */}
                  <div className="flex flex-col gap-4 w-full">
                    <p className="text-white/80 text-[1.05rem] leading-relaxed font-light">
                      {selectedItem?.desc}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedItem?.details.map((line, idx) => (
                        <Chip 
                          key={idx} 
                          variant="flat" 
                          color="primary" 
                          className="bg-[#00d2ff]/10 border-none text-white/90 font-kanit"
                        >
                          {line}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose} className="font-kanit">
                  Close
                </Button>
                <Button color="primary" variant="shadow" onPress={onClose} className="font-kanit font-semibold bg-[#00d2ff] text-black">
                  Got it
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* STYLES (โครงสร้างเดิมของคุณทั้งหมด ไม่มีการลบออก!) */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;900&display=swap');

        .font-kanit {
          font-family: 'Kanit', sans-serif !important;
        }

        .banner {
          width: 100%;
          height: 100vh;
          text-align: center;
          overflow: hidden;
          position: relative;
          background-color: #020617;
        }
        .banner .banner-slider {
          position: absolute;
          width: 200px;
          height: 250px;
          top: 15%; 
          left: calc(50% - 100px);
          transform-style: preserve-3d;
          transform: perspective(1000px);
          animation: autoRun 25s linear infinite; 
          z-index: 2;
        }
        @keyframes autoRun {
          from { transform: perspective(1000px) rotateX(-16deg) rotateY(0deg); }
          to { transform: perspective(1000px) rotateX(-16deg) rotateY(360deg); }
        }
        .banner .banner-slider .banner-item {
          position: absolute;
          inset: 0;
          transform: rotateY(calc((var(--position) - 1) * (360 / var(--quantity)) * 1deg)) translateZ(550px);
          display: flex;
          justify-content: center;
          align-items: center;
        }
          
        .banner .banner-content {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: min(1400px, 100vw);
          height: 100vh; 
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 1;
          pointer-events: none; 
        }
        
        .banner .banner-content h1 {
          font-weight: 900;
          font-size: clamp(4rem, 12vw, 16rem);
          line-height: 1em;
          color: #25283b;
          position: relative;
          margin: 0;
          text-align: center;
          pointer-events: auto;
        }
        
        .banner .banner-content h1:after {
          position: absolute;
          inset: 0;
          content: attr(data-content);
          z-index: 2;
          -webkit-text-stroke: 2px #d2d2d2;
          color: transparent;
        }
        
        .banner .banner-content .author {
          font-weight: 400;
          text-align: center; 
          margin-top: 20px;
          color: #fff;
          opacity: 0.8;
          pointer-events: auto;
        }
        .banner .banner-content h2 { font-size: clamp(2rem, 5vw, 3em); margin: 0; font-weight: 600; }
        
        .banner .banner-content .model {
          background-image: url("/images/model.png");
          width: 100%;
          height: 75vh;
          position: absolute;
          bottom: 0;
          left: 0;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: bottom center;
          z-index: 1;
        }

        /* --- สไตล์ของ SECTION 1.5 (Responsive แบบ PC และ Mobile) --- */
        .build-sequence-section {
          width: 100%;
          background-color: #020617; 
          padding: 130px 0 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          z-index: 5;
          font-family: 'Kanit', sans-serif;
        }

        .sequence-container {
          width: 100%;
          max-width: 1200px;
        }

        .sequence-track {
          display: flex;
          flex-wrap: wrap; 
          justify-content: center;
          align-items: flex-start; 
          gap: 15px;
        }

        .seq-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #fff;
          gap: 15px;
          width: 90px; 
          flex-shrink: 0; 
        }

        .seq-icon {
          font-size: 3.5rem; 
          color: #ffffff;
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
          transition: transform 0.3s ease, filter 0.3s ease;
          height: 3.5rem; 
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .seq-item:hover .seq-icon {
          transform: scale(1.1);
          filter: drop-shadow(0 0 15px rgba(0, 210, 255, 0.8));
          color: #00d2ff;
        }

        .seq-item p {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 400;
          text-align: center;
          opacity: 0.8;
          white-space: nowrap;
        }

        .seq-arrow {
          font-size: 1.5rem;
          color: rgba(255, 255, 255, 0.3);
          margin-top: calc(3.5rem / 2 - 0.75rem); 
          flex-shrink: 0; 
        }

        /* ---------------------------------- */

        .components-section {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #020617;
            position: relative;
            z-index: 5;
            padding: 50px 0;
        }

        .cta-container {
            position: absolute;
            bottom: 1%; 
            left: 50%;
            transform: translateX(-50%);
            z-index: 10;
            width: 100%;
            text-align: center;
            pointer-events: auto;
        }

        /* --- MEDIA QUERIES FOR RESPONSIVE DESIGN --- */
        @media (max-width: 1024px) {
          .banner .banner-slider {
            transform: perspective(1000px) scale(0.8); 
          }
        }

        @media (max-width: 768px) {
            .banner .banner-slider {
                transform: perspective(1000px) scale(0.5); 
                top: 20%;
            }
            .banner .banner-content h1:after {
                -webkit-text-stroke: 1px #d2d2d2; 
            }
            .cta-container {
                bottom: 1%;
            }
            .banner .banner-content .author { margin-top: 10px; }
            
            /* --- Responsive Horizontal Scroll บนมือถือ --- */
            .build-sequence-section {
                padding: 80px 0 20px; 
            }
            .sequence-container {
                padding: 70px 0px 0px;
            }
            .sequence-track {
                flex-wrap: nowrap; 
                justify-content: flex-start;
                overflow-x: auto; 
                padding: 10px 20px 20px; 
                gap: 10px;
                scroll-snap-type: x mandatory; 
                -webkit-overflow-scrolling: touch; 
                scrollbar-width: none; 
                -ms-overflow-style: none;
            }
            .sequence-track::-webkit-scrollbar {
                display: none; 
            }
            .seq-item {
                width: 75px;
                scroll-snap-align: center; 
            }
            .seq-icon {
                font-size: 2.5rem;
                height: 2.5rem;
            }
            .seq-item p {
                font-size: 0.75rem;
            }
            .seq-arrow {
                font-size: 1.2rem;
                margin-top: calc(2.5rem / 2 - 0.6rem); 
            }
        }
      `}</style>

      <style jsx global>{`
        body { 
            margin: 0; 
            font-family: 'Kanit', sans-serif; 
            overflow-x: hidden; 
            background-color: #020617; 
        }
        
        .slider {
            width: 85vw; 
            max-width: 1200px;
            overflow: hidden;
            padding: 50px 0;
            box-sizing: border-box;
            background-color: #0B0F19;
            border-radius: 20px;
            position: relative;
            user-select: none; 
            -webkit-user-select: none;
            touch-action: pan-y; 
            cursor: grab;
        }
        @media (max-width: 768px) {
            .slider { 
              width: 95vw; 
              padding: 40px 0; 
              border-radius: 15px;
            }
        }
        .title {
            padding-bottom: 30px;
            text-align: center;
            color: #fff;
            text-shadow: 0 0 10px #0007;
            font-weight: 600; 
            font-size: clamp(1.5rem, 4vw, 2rem);
            font-family: 'Kanit', sans-serif;
        }
        
        .slider .form {
            width: max-content;
            --left: 0;
            transform: translateX(var(--left));
            margin: 0 15px;
            display: flex;
            gap: 20px;
            will-change: transform; 
        }
        
        .slider .form.sliding {
            transition: transform 0.3s ease-out; 
        }
        .slider .form.dragging {
            transition: none; 
        }

        .form .item {
            width: 220px; 
            height: 320px;
            display: inline-block;
            transform: perspective(1000px);
            transform-style: preserve-3d;
        }
        
        /* สไตล์ .content ถูกคุมด้วย HeroUI Card แล้ว แต่ยังต้องมี transform */
        .slider .form .item .content {
            width: 100%;
            height: 100%;
            position: relative;
            border-radius: 15px;
            overflow: hidden;
            transition: transform .4s ease;
        }
        
        .slider .form .item .icon-wrapper {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            pointer-events: none;
            padding-bottom: 40px; 
        }

        .slider .form .item .content .des {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 60px;
            color: #fff;
            font-family: 'Kanit', sans-serif;
            font-weight: 300;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 15px;
            box-sizing: border-box;
        }
        
        .text-ellipsis {
          overflow: hidden; 
          text-overflow: ellipsis; 
          white-space: nowrap; 
          max-width: 110px;
          font-weight: 500;
        }

        /* 3D Tilt Effect เดิม (ทำงานปกติ) */
        .slider .form.left .item .content { transform: rotateY(-8deg) scale(0.95); }
        .slider .form.right .item .content { transform: rotateY(8deg) scale(0.95); }
      `}</style>
      
    </main>
  );
}