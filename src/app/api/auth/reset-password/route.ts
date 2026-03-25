import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!resetToken) {
      return NextResponse.json({ message: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง หรือถูกใช้งานไปแล้ว" }, { status: 400 });
    }

    // ตรวจสอบวันหมดอายุ (15 นาที)
    if (new Date() > new Date(resetToken.expires)) {
       // ถ้าหมดอายุก็ลบทิ้งซะ
       await prisma.passwordResetToken.delete({ where: { token } });
       return NextResponse.json({ message: "ลิงก์รีเซ็ตรหัสผ่านหมดอายุแล้ว กรุณาขอลิงก์ใหม่" }, { status: 400 });
    }

    // Hash รหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // อัปเดตรหัสผ่านใหม่ให้กับ User
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword }
    });

    // 💥 ลบ Token ทิ้งทันทีหลังจากถูกใช้งาน (ลิงก์จะใช้ซ้ำไม่ได้อีก)
    await prisma.passwordResetToken.delete({
      where: { token }
    });

    return NextResponse.json({ message: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว" }, { status: 200 });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน" }, { status: 500 });
  }
}
