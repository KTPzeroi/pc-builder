"use client";

import React, { useState, useRef, MouseEvent, TouchEvent } from "react";
// import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react"; // ถ้าไม่ได้ใช้ นำออกได้ครับเพื่อลดขนาดไฟล์
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
// DATA: ข้อมูลสำหรับส่วน PC Components
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
    desc: "CPU คือหน่วยประมวลผลหลักของคอมพิวเตอร์ ทำหน้าที่คำนวณและสั่งงานทุกอย่างภายในระบบ",
    details: [
      "หน้าที่หลัก: ประมวลผลคำสั่งโปรแกรม",
      "ควบคุมการทำงานของอุปกรณ์ทั้งหมด",
      "คำนวณทางคณิตศาสตร์และตรรกะ",
      "ตัวอย่างยอดนิยม: Intel Core i5 / i7, AMD Ryzen 5 / 7",
    ],
    icon: <BsCpu style={{ width: "60%", height: "60%", color: "#ffffff" }} />,
  },
  {
    title: "Mainboard – Motherboard",
    desc: "เมนบอร์ดคือแผงวงจรหลักที่เชื่อมต่ออุปกรณ์ทุกชิ้นเข้าด้วยกัน",
    details: [
      "หน้าที่หลัก: เชื่อมต่ออุปกรณ์ทั้งหมด",
      "ควบคุมการส่งข้อมูลภายในเครื่อง",
      "จ่ายไฟให้กับอุปกรณ์",
    ],
    icon: <BsMotherboard style={{ width: "60%", height: "60%", color: "#ffffff" }} />,
  },
  {
    title: "GPU – Graphics Processing Unit",
    desc: "การ์ดจอทำหน้าที่ประมวลผลภาพ วิดีโอ และกราฟิก 3D",
    details: [
      "หน้าที่หลัก: ประมวลผลภาพ",
      "รองรับการเล่นเกมความละเอียดสูง",
      "เรนเดอร์วิดีโอ",
      "ตัวอย่าง: RTX 4060 / RX 7600",
    ],
    icon: <PiGraphicsCardBold style={{ width: "60%", height: "60%", color: "#ffffff" }} />,
  },
  {
    title: "RAM – Random Access Memory",
    desc: "RAM คือหน่วยความจำชั่วคราว ใช้เก็บข้อมูลขณะโปรแกรมกำลังทำงาน",
    details: [
      "หน้าที่หลัก: ทำให้เครื่องทำงานลื่นขึ้น",
      "รองรับการเปิดหลายโปรแกรมพร้อมกัน",
      "เพิ่มประสิทธิภาพเกมและงานหนัก",
      "ขนาดยอดนิยม: 16GB / 32GB",
    ],
    icon: <BsMemory style={{ width: "60%", height: "60%", color: "#ffffff" }} />,
  },
  {
    title: "SSD – Solid State Drive",
    desc: "SSD คืออุปกรณ์เก็บข้อมูลที่มีความเร็วสูงกว่า HDD มาก",
    details: [
      "ข้อดี: ความเร็วสูง",
      "ไม่มีเสียง",
      "ทนทานกว่า HDD",
    ],
    icon: <BsDeviceSsd style={{ width: "60%", height: "60%", color: "#ffffff" }} />,
  },
  {
    title: "HDD – Hard Disk Drive",
    desc: "HDD คืออุปกรณ์เก็บข้อมูลแบบจานหมุน เหมาะสำหรับเก็บไฟล์ขนาดใหญ่",
    details: ["ข้อดี: ราคาถูก", "ความจุสูง"],
    icon: <FaRegHdd style={{ width: "60%", height: "60%", color: "#ffffff" }} />,
  },
  {
    title: "Power Supply – PSU",
    desc: "PSU คืออุปกรณ์จ่ายไฟให้กับทุกชิ้นส่วนภายในคอมพิวเตอร์",
    details: [
      "หน้าที่หลัก: แปลงไฟบ้านเป็นไฟที่คอมใช้ได้",
      "ป้องกันไฟกระชาก",
      "ควบคุมแรงดันไฟให้เสถียร",
    ],
    icon: <BiTachometer style={{ width: "60%", height: "60%", color: "#ffffff" }} />,
  },
  {
    title: "Case – Computer Chassis",
    desc: "เคสคือโครงสร้างที่ใช้ติดตั้งอุปกรณ์ทั้งหมด พร้อมช่วยระบายความร้อน",
    details: ["หน้าที่: ป้องกันอุปกรณ์", "ระบายความร้อน", "เพิ่มความสวยงาม"],
    icon: <LuPcCase style={{ width: "60%", height: "60%", color: "#ffffff" }} />,
  },
  {
    title: "CPU Cooler – Cooling System",
    desc: "ชุดระบายความร้อน CPU ทำหน้าที่ลดอุณหภูมิของหน่วยประมวลผล",
    details: ["ประเภท: Air Cooler", "Liquid Cooling"],
    icon: <PiFan style={{ width: "60%", height: "60%", color: "#ffffff" }} />,
  },
];

export default function Page() {
  // ==========================================
  // LOGIC: ส่วน PC Components (Slider & Drag)
  // ==========================================
  const sliderRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  
  const mouseDownAt = useRef<number>(0);
  const left = useRef<number>(0);
  const [selectedItem, setSelectedItem] = useState<ComponentDetail | null>(null);
  const [isDragging, setIsDragging] = useState(false); // เพิ่ม State เช็คการลากเพื่อจัดการ Transition ความลื่น

  // 1. Start Drag
  const startDrag = (clientX: number) => {
    mouseDownAt.current = clientX;
    setIsDragging(true);
  };

  // 2. End Drag
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

  // 3. Move Drag
  const moveDrag = (clientX: number) => {
    if (mouseDownAt.current === 0) return;

    const mouseDelta = clientX - mouseDownAt.current;

    // Threshold ป้องกันการกดผิดเป็นลาก
    if (Math.abs(mouseDelta) < 10) return; 

    if (!sliderRef.current || !formRef.current) return;

    sliderRef.current.style.userSelect = "none";
    sliderRef.current.style.cursor = "grabbing"; // เปลี่ยนเป็น grabbing ตอนกำลังลาก
    formRef.current.style.pointerEvents = "none"; 

    // Logic เอียงภาพ 3D
    if (clientX > mouseDownAt.current) {
      formRef.current.classList.add("left");
      formRef.current.classList.remove("right");
    } else {
      formRef.current.classList.add("right");
      formRef.current.classList.remove("left");
    }

    // แก้ไข: ปรับ speed ให้ลื่นติดนิ้วมากขึ้น (จาก 3 เหลือ 1.2)
    const speed = 1.2; 
    const leftTemporary = left.current + mouseDelta / speed;
    const containerWidth = sliderRef.current.offsetWidth;
    const contentWidth = formRef.current.scrollWidth;
    const leftLimit = contentWidth - containerWidth;

    // ขอบเขตการลาก (เพิ่มระยะหยืดหยุ่นตอนสุดขอบนิดหน่อย)
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
    <main>
      {/* SECTION 1: HERO BANNER */}
      <section className="banner">
        <div className="banner-slider" style={{ ["--quantity" as any]: 9 }}>
          <div className="banner-item" style={{ ["--position" as any]: 1 }}>
            <BsCpu style={{ width: "75%", height: "100%", color: "#f6f6f7" }} /></div>
          <div className="banner-item" style={{ ["--position" as any]: 2 }}>
            <PiGraphicsCardBold style={{ width: "75%", height: "100%", color: "#f6f6f7" }} /></div>
          <div className="banner-item" style={{ ["--position" as any]: 3 }}>
            <BsMotherboard style={{ width: "75%", height: "100%", color: "#f6f6f7" }} /></div>
          <div className="banner-item" style={{ ["--position" as any]: 4 }}>
            <BsDeviceSsd style={{ width: "75%", height: "100%", color: "#f6f6f7" }} /></div>
          <div className="banner-item" style={{ ["--position" as any]: 5 }}>
            <BsMemory style={{ width: "75%", height: "100%", color: "#f6f6f7" }} /></div>
          <div className="banner-item" style={{ ["--position" as any]: 6 }}>
            <FaRegHdd style={{ width: "75%", height: "100%", color: "#f6f6f7" }} /></div>
          <div className="banner-item" style={{ ["--position" as any]: 7 }}>
            <BiTachometer style={{ width: "75%", height: "100%", color: "#f6f6f7" }} /></div>
          <div className="banner-item" style={{ ["--position" as any]: 8 }}>
            <LuPcCase style={{ width: "75%", height: "100%", color: "#f6f6f7" }} /></div>
          <div className="banner-item" style={{ ["--position" as any]: 9 }}>
            <PiFan style={{ width: "75%", height: "100%", color: "#f6f6f7" }} /></div>
        </div>

        <div className="banner-content">
          <h1 data-content="PC BUILDER">PC <br></br>BUILDER</h1>
          <div className="cta-container">
            {/* สามารถเปลี่ยนเป็น <a href="/plan"> ได้เลยครับ */}
            <a href="#plan" style={{ textDecoration: 'none' }}>
              <button className="plan-build-btn">
                PLAN YOUR BUILD
              </button>
            </a>
          </div>
          {/*<div className="author">
            <h2>PC Idea</h2>
            <p><b>Get compatible recommendations</b></p>
            <p>Pick your ideal PC components</p>
          </div>*/}
          <div className="model"></div>
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
          <div className="title">PC Component Guide</div>

          {/* ผูก Class แบบไดนามิกเพื่อให้มัน Smooth ตอนปล่อยมือ */}
          <div className={`form ${isDragging ? "dragging" : "sliding"}`} ref={formRef}>
            {componentData.map((item, index) => (
              <div className="item" key={index}>
                <div className="content">
                  {/* ห่อ Icon ด้วย div เพื่อจัดให้อยู่ตรงกลาง */}
                  <div className="icon-wrapper">
                    {item.icon}
                  </div>
                  <div className="des">
                    <div className="text-ellipsis">
                      {item.title.split("–")[0]}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); 
                        setSelectedItem(item);
                      }}
                    >
                      See more
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POPUP MODAL */}
      {selectedItem && (
        <div className="popup-modal" onClick={() => setSelectedItem(null)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <span className="popup-close" onClick={() => setSelectedItem(null)}>&times;</span>
            <div className="popup-icon-wrapper">
              {selectedItem.icon}
            </div>
            <h2>{selectedItem.title}</h2>
            <p>{selectedItem.desc}</p>
            <div className="popup-details">
              {selectedItem.details.map((line, idx) => (
                <p key={idx} style={{ margin: "5px 0", opacity: 0.8 }}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;900&display=swap');

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
          top: 15%; /* ปรับตำแหน่งบน Desktop เล็กน้อย */
          left: calc(50% - 100px);
          transform-style: preserve-3d;
          transform: perspective(1000px);
          animation: autoRun 25s linear infinite; /* หมุนช้าลงนิดนึงให้ดูพรีเมียม */
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
          height: 100vh; /* ให้กล่องคลุมเต็มจอเพื่อจัดเรียงง่ายขึ้น */
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 1;
          pointer-events: none; /* กันบังปุ่มด้านล่าง */
        }
        
        .banner .banner-content h1 {
          font-family: 'Kanit', sans-serif;
          font-weight: 900;
          /* RESPONSIVE FONT SIZE: ปรับให้ย่อขยายตามหน้าจออัตโนมัติ */
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
          font-family: 'Kanit', sans-serif;
          font-weight: 400;
          text-align: center; /* จับให้อยู่ตรงกลางแทนขวาบนมือถือ */
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
            bottom: 1%; /* เปลี่ยนจาก top: 94% เป็นอิงจากด้านล่าง */
            left: 50%;
            transform: translateX(-50%);
            z-index: 10;
            width: 100%;
            text-align: center;
            pointer-events: auto;
        }

        .plan-build-btn {
            background-color: rgba(0, 210, 255, 0.1); 
            color: #00d2ff; 
            border: 2px solid #00d2ff; 
            padding: 15px 50px;
            font-size: 1.5rem;
            font-weight: 600; 
            font-family: 'Kanit', sans-serif;
            border-radius: 50px; 
            cursor: pointer;
            letter-spacing: 1px;
            transition: all 0.3s ease;
            text-shadow: 0 0 10px rgba(0, 210, 255, 0.5);
            box-shadow: 0 0 10px rgba(0, 210, 255, 0.2), inset 0 0 10px rgba(0, 210, 255, 0.1);
            backdrop-filter: blur(4px); 
        }

        .plan-build-btn:hover {
            background-color: #00d2ff;
            color: #ffffff; 
            box-shadow: 0 0 20px #00d2ff, 0 0 40px #00d2ff; 
            transform: scale(1.05); 
        }

        /* --- MEDIA QUERIES FOR RESPONSIVE DESIGN --- */
        @media (max-width: 1024px) {
          .banner .banner-slider {
            transform: perspective(1000px) scale(0.8); /* ย่อวง 3D ลงในจอแท็บเล็ต */
          }
        }

        @media (max-width: 768px) {
            .banner .banner-slider {
                transform: perspective(1000px) scale(0.5); /* ย่อวง 3D ให้ไม่ล้นจอมือถือ */
                top: 20%;
            }
            .banner .banner-content h1:after {
                -webkit-text-stroke: 1px #d2d2d2; /* ลดความหนาเส้นขอบตัวอักษร */
            }
            .cta-container {
                bottom: 1%;
            }
            .plan-build-btn {
                padding: 12px 35px;
                font-size: 1.2rem;
            }
            .banner .banner-content .author { margin-top: 10px; }
        }
      `}</style>

      <style jsx global>{`
        body { 
            margin: 0; 
            font-family: 'Kanit', sans-serif; 
            overflow-x: hidden; 
            background-color: #020617; /* กันขอบขาวแว้บๆ */
        }
        
        .slider {
            width: 85vw; /* ขยายความกว้าง Slider บนจอทั่วไปให้กว้างขึ้น */
            max-width: 1200px;
            overflow: hidden;
            padding: 50px 0;
            box-sizing: border-box;
            background-color: #0B0F19;
            border-radius: 20px;
            position: relative;
            user-select: none; 
            -webkit-user-select: none;
            touch-action: pan-y; /* ให้สามารถไถจอขึ้นลงได้ปกติเวลาลาก Slider */
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
        
        /* เพิ่ม CSS ทำให้ตอนปล่อยนิ้ว/เมาส์ Slider จะมี Transition ไหลลื่นๆ (Momentum กึ่งๆ) */
        .slider .form.sliding {
            transition: transform 0.3s ease-out; 
        }
        .slider .form.dragging {
            transition: none; /* ปิด Transition ตอนลากให้ติดนิ้วทันที */
        }

        .form .item {
            width: 220px; /* ปรับขนาดการ์ดนิดหน่อยให้สวยขึ้น */
            height: 320px;
            display: inline-block;
            transform: perspective(1000px);
            transform-style: preserve-3d;
        }
        
        .slider .form .item .content {
            width: 100%;
            height: 100%;
            position: relative;
            border-radius: 15px;
            overflow: hidden;
            transition: transform .4s ease;
            box-shadow: 0 10px 20px rgba(0,0,0,0.4);
            background: #0f172a; /* พื้นหลังของการ์ด */
        }
        
        /* จัด Layout ให้ Icon ใน Slider อยู่กึ่งกลาง */
        .slider .form .item .icon-wrapper {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            pointer-events: none;
            padding-bottom: 40px; /* ดันไอคอนขึ้นนิดหน่อยไม่ให้บังข้อความ */
        }

        .slider .form .item .content .des {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 60px;
            backdrop-filter: blur(10px);
            background: rgba(0, 0, 0, 0.6);
            color: #fff;
            font-family: 'Kanit', sans-serif;
            font-weight: 300;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 15px;
            box-sizing: border-box;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        
        .text-ellipsis {
          overflow: hidden; 
          text-overflow: ellipsis; 
          white-space: nowrap; 
          max-width: 110px;
          font-weight: 500;
        }

        .slider .form .item .content .des button {
            background-color: #00d2ff;
            border: none;
            border-radius: 8px;
            font-size: 0.8rem;
            padding: 6px 12px;
            cursor: pointer;
            color: #020617;
            pointer-events: auto; 
            z-index: 10;
            font-family: 'Kanit', sans-serif;
            font-weight: 600;
            transition: 0.2s;
        }
        .slider .form .item .content .des button:hover {
            background-color: #fff;
            transform: scale(1.05);
        }

        .slider .form.left .item .content { transform: rotateY(-8deg) scale(0.95); }
        .slider .form.right .item .content { transform: rotateY(8deg) scale(0.95); }
        
        /* POPUP STYLES */
        .popup-modal {
            position: fixed; inset: 0; display: flex; justify-content: center; align-items: center;
            background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); z-index: 999999; animation: fadeIn 0.3s;
            padding: 20px; /* กันชนขอบจอ */
        }
        .popup-box {
            width: 700px; max-width: 100%; max-height: 85vh; overflow-y: auto;
            background: linear-gradient(145deg, #1e293b, #0B0F19); color: #ffffff;
            border-radius: 20px; padding: 40px; box-shadow: 0 30px 60px rgba(0,0,0,0.6);
            display: flex; flex-direction: column; gap: 20px; animation: popupShow .3s ease; position: relative;
            font-family: 'Kanit', sans-serif;
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        /* จัด Layout ให้ Icon ใน Popup */
        .popup-icon-wrapper {
            width: 180px; height: 180px; border-radius: 20px;
            background: rgba(0,0,0,0.3); align-self: center;
            display: flex; justify-content: center; align-items: center;
            box-shadow: inset 0 0 20px rgba(0,210,255,0.05);
            border: 1px solid rgba(255,255,255,0.05);
        }
        
        @media (max-width: 768px) {
            .popup-box { padding: 25px 20px; gap: 15px; border-radius: 15px; }
            .popup-icon-wrapper { width: 120px; height: 120px; }
            .popup-box h2 { font-size: 1.5rem; text-align: center; }
            .popup-box p { font-size: 0.95rem; }
        }
        
        .popup-close {
            position: absolute; top: 15px; right: 25px; font-size: 30px; cursor: pointer; transition: .2s;
            color: rgba(255,255,255,0.5);
        }
        .popup-close:hover { transform: scale(1.2); color: #ff4c4c; }
        
        /* SCROLLBAR สำหรับ Popup */
        .popup-box::-webkit-scrollbar { width: 8px; }
        .popup-box::-webkit-scrollbar-track { background: transparent; }
        .popup-box::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .popup-box::-webkit-scrollbar-thumb:hover { background: #475569; }

        @keyframes popupShow { from { transform: translateY(40px) scale(.9); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      
    </main>
  );
}