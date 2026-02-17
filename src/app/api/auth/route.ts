import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, password, username } = body;

    // --- 1. LOGIC สำหรับการสมัครสมาชิก (REGISTER) ---
    if (action === "register") {
      const userExists = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });

      if (userExists) {
        return NextResponse.json({ message: "Email หรือ Username นี้ถูกใช้ไปแล้ว" }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: { email, username, password: hashedPassword },
      });

      return NextResponse.json({ message: "สมัครสมาชิกสำเร็จ!", userId: newUser.id }, { status: 201 });
    }

    // --- 2. LOGIC สำหรับการเข้าสู่ระบบ (LOGIN) ---
    // --- ภายในไฟล์ src/app/api/auth/route.ts ---

    if (action === "login") {
    // รับค่าเป็น identifier (ซึ่งอาจจะเป็น email หรือ username ก็ได้)
    const { identifier, password } = body; 

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

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return NextResponse.json({ message: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    return NextResponse.json({
        name: user.username,
        email: user.email,
        image: user.avatar,
    }, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid Action" }, { status: 400 });

  } catch (error) {
    console.error("Auth Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}