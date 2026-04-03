import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY || "missing_key");

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "กรุณาระบุอีเมล" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    // สำคัญ: เราไม่ให้แฮกเกอร์รู้ว่ามีเมลนี้อยู่ในระบบหรือไม่ เพื่อความปลอดภัย
    if (!user) {
      return NextResponse.json({ message: "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณเรียบร้อยแล้ว หากอีเมลดังกล่าวอยู่ในระบบ" }, { status: 200 });
    }

    // สร้าง Token แบบสุ่ม 64 ตัวอักษร
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // มีอายุ 15 นาที

    // ลบ Token เก่าทิ้งเผื่อผู้ใช้กดย้ำๆ
    await prisma.passwordResetToken.deleteMany({
      where: { email }
    });

    // บันทึก Token ลงฐานข้อมูล
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires
      }
    });

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    await resend.emails.send({
      from: 'PC Builder <onboarding@resend.dev>', 
      to: email, 
      subject: '🔑 รีเซ็ตรหัสผ่านสำหรับเว็บ PC Builder',
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #0f172a; border-radius: 12px; color: #f8fafc; border: 1px solid #1e293b;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #60a5fa; font-size: 28px; margin: 0; letter-spacing: 2px;">PC BUILDER</h1>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 5px;">Your Ultimate Custom PC Platform</p>
          </div>
          
          <div style="background-color: #1e293b; padding: 30px; border-radius: 8px;">
            <h2 style="color: #f1f5f9; font-size: 20px; margin-top: 0;">เรียนผู้ใช้งาน,</h2>
            <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6;">
              เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชีของคุณบน <strong>PC Builder</strong> หากคุณเป็นผู้ร้องขอ กรุณาคลิกที่ปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetLink}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">
                ตั้งรหัสผ่านใหม่ (Reset Password)
              </a>
            </div>
            
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.5; text-align: center;">
              ลิงก์นี้จะมีอายุการใช้งาน <strong>15 นาที</strong> เพื่อความปลอดภัยของบัญชีคุณ<br/>
              หากคุณไม่ได้ทำรายการนี้ กรุณาละเว้นอีเมลฉบับนี้ รหัสผ่านของคุณจะไม่มีการเปลี่ยนแปลงใดๆ
            </p>
          </div>

          <div style="margin-top: 30px; text-align: center; color: #64748b; font-size: 12px;">
            <p>หากปุ่มกดไม่ได้ กรุณาคัดลอกลิงก์ด้านล่างไปวางในเบราว์เซอร์:</p>
            <p style="word-break: break-all; color: #3b82f6;">${resetLink}</p>
            <hr style="border-color: #334155; margin: 20px 0;">
            <p>&copy; ${new Date().getFullYear()} PC Builder Team. All rights reserved.</p>
          </div>
        </div>
      `
    });

    return NextResponse.json({ message: "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณเรียบร้อยแล้ว หากอีเมลดังกล่าวอยู่ในระบบ" }, { status: 200 });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการส่งอีเมล" }, { status: 500 });
  }
}
