"use client";

import React, { useState, useRef, MouseEvent, TouchEvent } from "react";

// ==========================================
// DATA: ข้อมูลสำหรับส่วน PC Components
// ==========================================
interface ComponentDetail {
  title: string;
  desc: string;
  details: string[];
  image: string;
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
    image: "/images/CPU.png",
  },
  {
    title: "Mainboard – Motherboard",
    desc: "เมนบอร์ดคือแผงวงจรหลักที่เชื่อมต่ออุปกรณ์ทุกชิ้นเข้าด้วยกัน",
    details: [
      "หน้าที่หลัก: เชื่อมต่ออุปกรณ์ทั้งหมด",
      "ควบคุมการส่งข้อมูลภายในเครื่อง",
      "จ่ายไฟให้กับอุปกรณ์",
    ],
    image: "/images/MAINBOARD.png",
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
    image: "/images/GPU.png",
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
    image: "/images/MEMORY.png",
  },
  {
    title: "SSD – Solid State Drive",
    desc: "SSD คืออุปกรณ์เก็บข้อมูลที่มีความเร็วสูงกว่า HDD มาก",
    details: [
      "ข้อดี: ความเร็วสูง",
      "ไม่มีเสียง",
      "ทนทานกว่า HDD",
    ],
    image: "/images/SDD.png",
  },
  {
    title: "HDD – Hard Disk Drive",
    desc: "HDD คืออุปกรณ์เก็บข้อมูลแบบจานหมุน เหมาะสำหรับเก็บไฟล์ขนาดใหญ่",
    details: ["ข้อดี: ราคาถูก", "ความจุสูง"],
    image: "/images/HDD.png",
  },
  {
    title: "Power Supply – PSU",
    desc: "PSU คืออุปกรณ์จ่ายไฟให้กับทุกชิ้นส่วนภายในคอมพิวเตอร์",
    details: [
      "หน้าที่หลัก: แปลงไฟบ้านเป็นไฟที่คอมใช้ได้",
      "ป้องกันไฟกระชาก",
      "ควบคุมแรงดันไฟให้เสถียร",
    ],
    image: "/images/POWER.png",
  },
  {
    title: "Case – Computer Chassis",
    desc: "เคสคือโครงสร้างที่ใช้ติดตั้งอุปกรณ์ทั้งหมด พร้อมช่วยระบายความร้อน",
    details: ["หน้าที่: ป้องกันอุปกรณ์", "ระบายความร้อน", "เพิ่มความสวยงาม"],
    image: "/images/CASE.png",
  },
  {
    title: "CPU Cooler – Cooling System",
    desc: "ชุดระบายความร้อน CPU ทำหน้าที่ลดอุณหภูมิของหน่วยประมวลผล",
    details: ["ประเภท: Air Cooler", "Liquid Cooling"],
    image: "/images/COOLER.png",
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

  // 1. Start Drag
  const startDrag = (clientX: number) => {
    mouseDownAt.current = clientX;
    // ยังไม่เปลี่ยน cursor ทันที จนกว่าจะมีการขยับจริง (เพื่อแก้เรื่อง Click)
  };

  // 2. End Drag
  const endDrag = () => {
    mouseDownAt.current = 0;
    if (sliderRef.current && formRef.current) {
      sliderRef.current.style.userSelect = "unset";
      sliderRef.current.style.cursor = "unset";
      
      // สำคัญ: คืนค่า pointerEvents ให้กดปุ่มได้
      formRef.current.style.pointerEvents = "unset"; 
      
      formRef.current.classList.remove("left");
      formRef.current.classList.remove("right");
    }
  };

  // 3. Move Drag (แก้ไขเพิ่ม Threshold)
  const moveDrag = (clientX: number) => {
    if (mouseDownAt.current === 0) return;

    // คำนวณระยะที่ขยับ
    const mouseDelta = clientX - mouseDownAt.current;

    // === FIX START ===
    // ถ้าขยับน้อยกว่า 10px ให้ถือว่าเป็น "การกด" ไม่ใช่ "การลาก"
    // (ช่วยแก้ปัญหาแตะปุ่มแล้วกลายเป็นการลาก)
    if (Math.abs(mouseDelta) < 10) return; 
    // === FIX END ===

    if (!sliderRef.current || !formRef.current) return;

    // เริ่มโหมดการลากจริงๆ
    sliderRef.current.style.userSelect = "none";
    sliderRef.current.style.cursor = "grab";
    formRef.current.style.pointerEvents = "none"; // ปิดการกดปุ่มชั่วคราวขณะลาก

    // Logic เอียงภาพ 3D
    if (clientX > mouseDownAt.current) {
      formRef.current.classList.add("left");
      formRef.current.classList.remove("right");
    } else {
      formRef.current.classList.add("right");
      formRef.current.classList.remove("left");
    }

    // Logic เลื่อน Slider
    const speed = 3; 
    const leftTemporary = left.current + mouseDelta / speed;
    const containerWidth = sliderRef.current.offsetWidth;
    const contentWidth = formRef.current.scrollWidth;
    const leftLimit = contentWidth - containerWidth;

    if (leftTemporary <= 0 && Math.abs(leftTemporary) < leftLimit + 100) {
      formRef.current.style.setProperty("--left", leftTemporary + "px");
      left.current = leftTemporary;
      mouseDownAt.current = clientX;
    }
  };

  // Handlers Wrappers
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
          <div className="banner-item" style={{ ["--position" as any]: 1 }}><img src="/images/CPU.png" alt="" /></div>
          <div className="banner-item" style={{ ["--position" as any]: 2 }}><img src="/images/MAINBOARD.png" alt="" /></div>
          <div className="banner-item" style={{ ["--position" as any]: 3 }}><img src="/images/GPU.png" alt="" /></div>
          <div className="banner-item" style={{ ["--position" as any]: 4 }}><img src="/images/MEMORY.png" alt="" /></div>
          <div className="banner-item" style={{ ["--position" as any]: 5 }}><img src="/images/SDD.png" alt="" /></div>
          <div className="banner-item" style={{ ["--position" as any]: 6 }}><img src="/images/HDD.png" alt="" /></div>
          <div className="banner-item" style={{ ["--position" as any]: 7 }}><img src="/images/POWER.png" alt="" /></div>
          <div className="banner-item" style={{ ["--position" as any]: 8 }}><img src="/images/CASE.png" alt="" /></div>
          <div className="banner-item" style={{ ["--position" as any]: 9 }}><img src="/images/COOLER.png" alt="" /></div>
        </div>

        <div className="banner-content">
          <h1 data-content="PC BUILDER">PC BUILDER</h1>
          {/* --- ส่วนที่เพิ่มใหม่: ปุ่ม PLAN YOUR BUILD --- */}
          <div className="cta-container">
           {/*Link กุลิ้งไม่ได้ลองทำลิ้งให้หน่อยของปุ่ม plan your build*/}
              <button className="plan-build-btn">
                PLAN YOUR BUILD
              </button>
           {/*Link กุลิ้งไม่ได้ลองทำลิ้งให้หน่อยของปุ่ม plan your build*/}
          </div>
          {/* -------------------------------------- */}
          <div className="author">
            <h2>PC Idea</h2>
            <p><b>Get compatible recommendations</b></p>
            <p>Pick your ideal PC components</p>
          </div>
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

          <div className="form" ref={formRef}>
            {componentData.map((item, index) => (
              <div className="item" key={index}>
                <div className="content">
                  <img src={item.image} alt={item.title} draggable="false" />
                  <div className="des">
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100px" }}>
                      {item.title.split("–")[0]}
                    </div>
                    {/* ปุ่ม See more แก้ไขให้ใช้ onClick ปกติ เพราะเราแก้ Logic การลากแล้ว */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // หยุดไม่ให้ event ทะลุไปที่ slider
                        setSelectedItem(item);
                      }}
                      // ลบ onTouchEnd ออก เพื่อให้ browser จัดการ click event ตามปกติ
                      // การใช้ทั้งสองอย่างอาจทำให้เกิด double trigger หรือ bug
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
            <img src={selectedItem.image} alt={selectedItem.title} />
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
        /* 1. เปลี่ยน Import เป็น Kanit */
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
          top: 10%;
          left: calc(50% - 100px);
          transform-style: preserve-3d;
          transform: perspective(1000px);
          animation: autoRun 20s linear infinite;
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
        }
        .banner .banner-slider .banner-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .banner .banner-content {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: min(1400px, 100vw);
          height: max-content;
          padding-bottom: 100px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          z-index: 1;
        }
        .banner .banner-content h1 {
          /* 2. แก้ฟอนต์หัวข้อใหญ่ */
          font-family: 'Kanit', sans-serif;
          font-weight: 900; /* หนาพิเศษเพื่อให้ดูแน่นเหมือนรูปต้นฉบับ */
          font-size: 16em;
          line-height: 1em;
          color: #25283b;
          position: relative;
          margin: 0;
        }
        @media (max-width: 768px) {
            .banner .banner-content h1 { font-size: 8em; }
            .banner .banner-content { justify-content: center; text-align: center; }
            .banner .banner-content .author { text-align: center; margin-top: 20px; width: 100%; }
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
          /* 3. แก้ฟอนต์คำอธิบาย */
          font-family: 'Kanit', sans-serif;
          font-weight: 400;
          text-align: right;
          max-width: 200px;
        }
        .banner .banner-content h2 { font-size: 3em; margin: 0; font-weight: 600; }
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
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            position: relative;
            z-index: 5;
        }
            /* --- CSS สำหรับปุ่ม PLAN YOUR BUILD --- */
        .banner .banner-content .cta-container {
            position: absolute;
            top: 94%; 
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10;
            width: 100%;
            text-align: center;
        }

        .plan-build-btn {
            background-color: transparent; 
            color: #00d2ff; 
            border: 2px solid #00d2ff; 
            padding: 15px 50px;
            font-size: 1.5rem;
            font-weight: 600; /* ปรับความหนา */
            
            /* 4. แก้ฟอนต์ปุ่ม */
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
            color: #000; 
            box-shadow: 0 0 20px #00d2ff, 0 0 40px #00d2ff; 
            transform: scale(1.05); 
        }

        @media (max-width: 768px) {
            .banner .banner-content .cta-container {
                top: 65%;
            }
            .plan-build-btn {
                padding: 12px 35px;
                font-size: 1rem;
            }
        }
      `}</style>

      <style jsx global>{`
        /* 5. บังคับใช้ Kanit ทั้งเว็บที่ body */
        body { 
            margin: 0; 
            font-family: 'Kanit', sans-serif; /* เปลี่ยนจาก sans-serif ธรรมดา */
            overflow-x: hidden; 
        }
        
        .slider {
            width: 70vw;
            overflow: hidden;
            padding: 100px 0;
            box-sizing: border-box;
            backdrop-filter: blur(10px);
            background-color: #0B0F19;
            border-radius: 20px;
            position: relative;
            user-select: none; 
            -webkit-user-select: none;
            touch-action: pan-y; 
        }
        @media (max-width: 768px) {
            .slider { width: 90vw; padding: 50px 0; }
        }
        .title {
            padding: 20px 0;
            text-align: center;
            color: #fff;
            text-shadow: 0 0 10px #0007;
            font-weight: 600; /* หนาขึ้นนิดหน่อย */
            font-size: 2rem;
            font-family: 'Kanit', sans-serif;
        }
        .slider .form {
            width: max-content;
            --left: 0;
            transform: translateX(var(--left));
            margin: 0 10px;
            display: flex;
            gap: 20px;
            will-change: transform; 
        }
        .form .item {
            width: 200px;
            height: 300px;
            display: inline-block;
            transform: perspective(1000px);
            transform-style: preserve-3d;
        }
        .slider .form .item .content {
            width: 100%;
            height: 100%;
            position: relative;
            border-radius: 10px;
            overflow: hidden;
            transition: transform .4s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .slider .form .item .content .des {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 50px;
            backdrop-filter: blur(10px);
            background: rgba(0,0,0,0.3);
            color: #fff;
            
            /* 6. แก้ฟอนต์ชื่ออุปกรณ์ใน Slider */
            font-family: 'Kanit', sans-serif;
            font-weight: 300;
            
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            box-sizing: border-box;
        }
        .slider .form .item .content .des button {
            background-color: #102C57;
            border: #3b82f6;
            border-radius: 10px;
            font-size: small;
            padding: 5px 10px;
            cursor: pointer;
            color: #60a5fa;
            pointer-events: auto; 
            z-index: 10;
            font-family: 'Kanit', sans-serif;
            font-weight: 500;
        }
        .slider .form .item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            pointer-events: none;
        }
        .slider .form.left .item .content { transform: rotateY(-5deg) scale(0.95); }
        .slider .form.right .item .content { transform: rotateY(5deg) scale(0.95); }
        .popup-modal {
            position: fixed; inset: 0; display: flex; justify-content: center; align-items: center;
            background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); z-index: 999999; animation: fadeIn 0.3s;
        }
        .popup-box {
            width: 750px; max-width: 95%; max-height: 85vh; overflow-y: auto;
            background: linear-gradient(145deg, #4B5563, #0B0F19); color: #ffffff;
            border-radius: 25px; padding: 40px; box-shadow: 0 30px 60px rgba(0,0,0,0.6);
            display: flex; flex-direction: column; gap: 25px; animation: popupShow .3s ease; position: relative;
            
            /* 7. แก้ฟอนต์ใน Popup */
            font-family: 'Kanit', sans-serif;
        }
        @media (max-width: 768px) {
            .popup-box { padding: 20px; gap: 15px; }
            .popup-box img { width: 150px; height: 150px; }
        }
        .popup-box img {
            width: 200px; height: 200px; object-fit: contain; border-radius: 20px;
            background: #0F1115; padding: 20px; align-self: center;
        }
        .popup-close {
            position: absolute; top: 20px; right: 25px; font-size: 26px; cursor: pointer; transition: .2s;
        }
        .popup-close:hover { transform: scale(1.2); color: #ff4c4c; }
        @keyframes popupShow { from { transform: translateY(40px) scale(.9); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </main>
  );
}