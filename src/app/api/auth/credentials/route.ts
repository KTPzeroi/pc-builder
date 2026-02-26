import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// 🟢 ส่วนที่ 1: POST สำหรับ Register และ Login (โค้ดเดิมของคุณถูกต้องแล้ว)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, password, username, identifier } = body;

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

    if (action === "login") {
      const user = await prisma.user.findFirst({
        where: { OR: [{ email: identifier }, { username: identifier }] },
      });
      if (!user) return NextResponse.json({ message: "ไม่พบชื่อผู้ใช้หรืออีเมลนี้" }, { status: 404 });
      if (!user.password) return NextResponse.json({ message: "โปรดลงชื่อเข้าใช้ด้วย Google" }, { status: 400 });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return NextResponse.json({ message: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });

      return NextResponse.json({
        id: user.id,
        name: user.username,
        email: user.email,
        image: user.image,
      }, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid Action" }, { status: 400 });
  } catch (error) {
    console.error("Auth Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// 🟢 ส่วนที่ 2: PATCH สำหรับ Update Profile (เพิ่มการดัก Error และตรวจสอบ Username)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, username, bio } = body;

    if (!id) return NextResponse.json({ message: "ไม่พบ User ID" }, { status: 400 });

    // ตรวจสอบ Username ซ้ำ (ถ้ามีการส่ง username มา)
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: username,
          NOT: { id: id }, // ต้องไม่ใช่ของตัวเอง
        },
      });
      if (existingUser) return NextResponse.json({ message: "Username นี้ถูกใช้งานแล้ว" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        username: username,
        bio: bio,
      },
    });

    // ส่งข้อมูลที่อัปเดตแล้วกลับไปเพื่อให้หน้า Profile อัปเดต UI ทันที
    return NextResponse.json({
      id: updatedUser.id,
      username: updatedUser.username,
      bio: updatedUser.bio,
      image: updatedUser.image,
      email: updatedUser.email
    }, { status: 200 });

  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" }, { status: 500 });
  }
}