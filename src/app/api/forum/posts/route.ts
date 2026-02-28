import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
// แก้ให้ไปดึง authOptions จากไฟล์ auth route โดยตรง
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET: ดึงรายการกระทู้ทั้งหมด
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: { name: true, image: true }
        },
        _count: {
          select: { comments: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET Posts Error:", error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
// POST: สร้างกระทู้ใหม่โดยใช้ User ID จาก Session
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !(session.user as any)?.id) { 
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, category } = body;

    if (!title || !content || !category) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const newPost = await prisma.post.create({
    data: {
        title,
        content,
        category, 
        authorId: (session.user as any).id, // ใส่ (session.user as any) ตรงนี้ด้วย
    },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("POST API Error:", error);
    // ✅ ต้องมี return ใน catch ด้วย เพื่อไม่ให้ Request ค้าง
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}