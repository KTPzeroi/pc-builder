import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const id = searchParams.get("id"); // 🟢 เพิ่มการรับ ID

    if (!email && !id) {
      return NextResponse.json({ message: "No identifier provided" }, { status: 400 });
    }

    // ค้นหาโดยใช้ ID เป็นหลัก ถ้าไม่มีค่อยใช้ Email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: id || undefined },
          { email: email || undefined }
        ]
      },
      include: {
        posts: {
          orderBy: { createdAt: 'desc' }
        },
        comments: {
          include: {
            post: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 200 });

  } catch (error) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}