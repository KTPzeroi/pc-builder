"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardBody, Input, Button, Alert } from "@heroui/react";
import { IoEyeOffOutline, IoEyeOutline, IoLockClosedOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import Image from "next/image";

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

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
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

  // ดักกรณีไม่มี ?token=...
  if (!token) {
    return (
      <Card className="bg-black/40 backdrop-blur-md border border-white/10 w-full max-w-md mx-auto shadow-2xl">
        <CardBody className="p-10 text-center flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-danger/10 border border-danger/20 text-danger flex items-center justify-center">
            <IoEyeOffOutline className="text-3xl" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-widest uppercase mb-2">Invalid Link</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              ไม่พบ Token สำหรับรีเซ็ตรหัสผ่าน<br />
              กรุณาคลิกที่ลิงก์จากอีเมลของคุณเท่านั้น
            </p>
          </div>
          <Button
            variant="flat"
            color="primary"
            size="sm"
            className="font-bold"
            onPress={() => router.push("/")}
          >
            กลับหน้าหลัก
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 backdrop-blur-xl border border-white/10 w-full max-w-md mx-auto shadow-2xl overflow-visible">
      {/* Glow decorators */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <CardBody className="p-8 flex flex-col gap-5 relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-1">
          <Image
            src="/logo.png"
            alt="SnapBuild Logo"
            width={160}
            height={46}
            className="object-contain"
            priority
          />
          <p className="text-[10px] text-gray-500 uppercase tracking-[4px] font-medium">
            Account Security
          </p>
        </div>

        {/* Title */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 mb-3">
            <IoLockClosedOutline className="text-blue-400 text-xl" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">Reset Password</h1>
          <p className="text-xs text-gray-500 mt-1">สร้างรหัสผ่านใหม่ที่ปลอดภัยสำหรับบัญชีของคุณ</p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert color="danger" title={error} variant="flat" className="py-2 text-sm" />
        )}
        {message && (
          <Alert color="success" title={message} variant="flat" className="py-2 text-sm" />
        )}

        {/* Inputs */}
        <div className="space-y-4">
          <Input
            label="New Password"
            type={isVisible ? "text" : "password"}
            variant="bordered"
            labelPlacement="outside"
            placeholder="ตั้งรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            classNames={{
              label: "text-gray-300 font-semibold text-xs uppercase tracking-wider",
              inputWrapper: "bg-black/30 border-white/10 hover:border-blue-500/50 transition-colors"
            }}
            endContent={
              <button className="focus:outline-none" type="button" onClick={() => setIsVisible(!isVisible)}>
                {isVisible
                  ? <IoEyeOffOutline className="text-xl text-gray-500 hover:text-white transition-colors" />
                  : <IoEyeOutline className="text-xl text-gray-500 hover:text-white transition-colors" />
                }
              </button>
            }
          />

          <Input
            label="Confirm Password"
            type={isVisible ? "text" : "password"}
            variant="bordered"
            labelPlacement="outside"
            placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            classNames={{
              label: "text-gray-300 font-semibold text-xs uppercase tracking-wider",
              inputWrapper: "bg-black/30 border-white/10 hover:border-blue-500/50 transition-colors"
            }}
            endContent={
              <button className="focus:outline-none" type="button" onClick={() => setIsVisible(!isVisible)}>
                {isVisible
                  ? <IoEyeOffOutline className="text-xl text-gray-500 hover:text-white transition-colors" />
                  : <IoEyeOutline className="text-xl text-gray-500 hover:text-white transition-colors" />
                }
              </button>
            }
          />
        </div>

        <Button
          color="primary"
          size="lg"
          className="font-bold uppercase tracking-widest text-xs bg-blue-600 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:bg-blue-500 transition-all"
          isLoading={isLoading}
          startContent={!isLoading && <IoCheckmarkCircleOutline className="text-lg" />}
          onPress={handleSubmit}
        >
          Confirm New Password
        </Button>

        <p className="text-center text-xs text-gray-600">
          ลิงก์รีเซ็ตรหัสผ่านมีอายุ <span className="text-yellow-500 font-bold">15 นาที</span> นับจากเวลาที่ส่งอีเมล
        </p>
      </CardBody>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background decorators */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />

      <div className="w-full z-10 relative">
        <Suspense
          fallback={
            <div className="text-blue-500 font-bold animate-pulse text-center uppercase tracking-widest text-sm">
              Loading...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
