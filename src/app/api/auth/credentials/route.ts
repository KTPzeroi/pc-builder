import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, password, username, identifier } = body;

    // --- 1. REGISTER LOGIC ---
    if (action === "register") {
      const userExists = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });

      if (userExists) {
        return NextResponse.json({ message: "Email หรือ Username นี้ถูกใช้ไปแล้ว" }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: { 
          email, 
          username, 
          password: hashedPassword 
          // id จะถูกเจนอัตโนมัติเป็น String (cuid) ตาม Schema ใหม่ครับ
        },
      });

      return NextResponse.json({ message: "สมัครสมาชิกสำเร็จ!", userId: newUser.id }, { status: 201 });
    }

    // --- 2. LOGIN LOGIC ---
    if (action === "login") {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier },
            { username: identifier }
          ]
        },
      });

      if (!user) {
        return NextResponse.json({ message: "ไม่พบชื่อผู้ใช้หรืออีเมลนี้" }, { status: 404 });
      }

      // 🟢 เพิ่มการตรวจสอบ: ถ้าสมัครผ่าน Google จะไม่มี Password ให้เช็ค
      if (!user.password) {
        return NextResponse.json({ 
          message: "บัญชีนี้เชื่อมต่อกับ Google โปรดลงชื่อเข้าใช้ด้วย Google" 
        }, { status: 400 });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ message: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
      }

      return NextResponse.json({
        id: user.id, // ส่ง ID กลับไปด้วยเพราะเป็น String แล้ว
        name: user.username,
        email: user.email,
        image: user.image, // 🟢 เปลี่ยนจาก avatar เป็น image ให้ตรง Schema
      }, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid Action" }, { status: 400 });

  } catch (error) {
    console.error("Auth Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}