import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // ตรวจสอบ path นี้ตามโปรเจกต์คุณ

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: { select: { name: true, image: true, username: true } },
        pcBuild: true,
        comments: {
          include: {
            author: { select: { name: true, image: true, username: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: { select: { comments: true } }
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    let specs: { label: string, val: string }[] = [];
    let priceStr = undefined;

    if (post.pcBuild) {
      const componentIds = [
        post.pcBuild.cpuId,
        post.pcBuild.gpuId,
        post.pcBuild.motherboardId,
        post.pcBuild.ramId,
        post.pcBuild.storageId,
        post.pcBuild.psuId,
        post.pcBuild.caseId
      ].filter(Boolean) as string[];

      if (componentIds.length > 0) {
        const components = await prisma.component.findMany({
          where: { id: { in: componentIds } }
        });
        const compMap = Object.fromEntries(components.map(c => [c.id, c]));

        specs = [
          { label: "Processor", val: compMap[post.pcBuild.cpuId || ""]?.name || "-" },
          { label: "Graphics Card", val: compMap[post.pcBuild.gpuId || ""]?.name || "-" },
          { label: "Motherboard", val: compMap[post.pcBuild.motherboardId || ""]?.name || "-" },
          { label: "Memory", val: compMap[post.pcBuild.ramId || ""]?.name || "-" },
          { label: "Storage", val: compMap[post.pcBuild.storageId || ""]?.name || "-" },
          { label: "Power Supply", val: compMap[post.pcBuild.psuId || ""]?.name || "-" },
          { label: "Case", val: compMap[post.pcBuild.caseId || ""]?.name || "-" }
        ];
      }
      priceStr = post.pcBuild.totalPrice?.toLocaleString();
    }

    const finalPost = {
      ...post,
      specs: specs.length > 0 ? specs : undefined,
      price: priceStr
    };

    return NextResponse.json(finalPost);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// --- ส่วนที่เพิ่มเข้ามาสำหรับบันทึกคอมเมนต์ ---
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { content } = await request.json();

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content,
        // แทนที่จะใช้ postId: parseInt(id) ตรงๆ 
        // ให้ใช้การ connect ไปที่ post object แทน
        post: {
          connect: {
            id: parseInt(id)
          }
        },
        // การเชื่อมต่อ author ก็ใช้ email ตามเดิม (ตรวจสอบให้แน่ใจว่า email "test" มีอยู่ใน DB)
        author: {
          connect: {
            email: session.user.email
          }
        },
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
            username: true
          }
        }
      }
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Comment Post Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}