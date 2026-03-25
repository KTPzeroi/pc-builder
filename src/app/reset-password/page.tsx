"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardBody, Input, Button } from "@heroui/react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      setError("กรุณากรอกรหัสผ่านให้ครบทั้ง 2 ช่อง");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("เปลี่ยนรหัสผ่านสำเร็จ! ระบบกำลังพาคุณกลับหน้าหลัก...");
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        setError(data.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  // ดักเอาไว้ว่าถ้าหน้าเว็บถูกโหลดขึ้นมาแล้วไม่มี ?token=... ไม่ต้องโชว์ฟอร์ม
  if (!token) {
    return (
      <Card className="bg-black/40 backdrop-blur-md border border-white/10 w-full max-w-md mx-auto shadow-2xl">
        <CardBody className="p-8 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-danger/10 text-danger flex items-center justify-center mb-2">
            <IoEyeOffOutline className="text-3xl" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-widest uppercase">Invalid Request</h2>
          <p className="text-sm text-gray-400 font-medium">
            ไม่พบข้อมูล Token สำหรับรีเซ็ตรหัสผ่าน<br/>
            กรุณาคลิกที่ลิงก์จากอีเมลของคุณเท่านั้น
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 backdrop-blur-xl border border-white/10 w-full max-w-md mx-auto shadow-2xl overflow-visible">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <CardBody className="p-8 flex flex-col gap-6 relative z-10">
        <div className="text-center mb-2">
          <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-2">Reset<span className="text-blue-500">_</span>Password</h1>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Create your new secure password</p>
        </div>
        
        {error && <div className="text-danger text-[11px] uppercase tracking-widest font-bold bg-danger/10 border border-danger/20 p-3 rounded-lg text-center backdrop-blur-md">{error}</div>}
        {message && <div className="text-success text-[11px] uppercase tracking-widest font-bold bg-success/10 border border-success/20 p-3 rounded-lg text-center backdrop-blur-md">{message}</div>}

        <div className="space-y-5 mt-2">
          <Input 
            label="New Password" 
            type={isVisible ? "text" : "password"} 
            variant="faded" 
            labelPlacement="outside" 
            placeholder="ตั้งรหัสผ่านใหม่" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            classNames={{
              label: "text-gray-300 font-bold uppercase tracking-wider text-[10px] mb-2",
              inputWrapper: "bg-black/40 border-white/10 hover:border-blue-500/50 transition-colors h-14"
            }}
            endContent={
              <button className="focus:outline-none" type="button" onClick={() => setIsVisible(!isVisible)}>
                {isVisible ? <IoEyeOffOutline className="text-xl text-gray-500 hover:text-white transition-colors" /> : <IoEyeOutline className="text-xl text-gray-500 hover:text-white transition-colors" />}
              </button>
            }
          />
          
          <Input 
            label="Confirm Password" 
            type={isVisible ? "text" : "password"} 
            variant="faded" 
            labelPlacement="outside" 
            placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)}
            classNames={{
              label: "text-gray-300 font-bold uppercase tracking-wider text-[10px] mb-2",
              inputWrapper: "bg-black/40 border-white/10 hover:border-blue-500/50 transition-colors h-14"
            }}
          />
        </div>

        <Button 
          color="primary" 
          size="lg"
          className="font-bold uppercase tracking-widest text-xs mt-4 bg-blue-600 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:bg-blue-500 transition-all" 
          isLoading={isLoading} 
          onPress={handleSubmit}
        >
          Secure My Account
        </Button>
      </CardBody>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 font-sans relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full z-10 relative">
        <Suspense fallback={<div className="text-blue-500 font-bold animate-pulse text-center uppercase tracking-widest text-sm">Initializing Form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
