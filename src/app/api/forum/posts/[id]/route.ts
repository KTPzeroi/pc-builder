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

    const post = await prisma.post.findFirst({
      where: { 
        id: postId,
        status: { not: "Hidden" }
      },
      include: {
        author: { select: { id: true, name: true, image: true, username: true } },
        pcBuild: true,
        likedBy: { select: { id: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, image: true, username: true } },
            likedBy: { select: { id: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: { select: { comments: true, likedBy: true } }
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const userRole = (session?.user as any)?.role;

    // ถ้า post เป็น Private จะดูได้เฉพาะเจ้าของโพสต์ หรือ Admin เท่านั้น
    if (post.status === "Private" && post.author.id !== userId && userRole !== "ADMIN") {
      return NextResponse.json({ error: 'This post is private' }, { status: 403 });
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
    console.error("GET Post Error:", error);
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
        post: { connect: { id: parseInt(id) } },
        author: { connect: { email: session.user.email } },
      },
      include: {
        author: { select: { name: true, image: true, username: true, id: true } }
      }
    });

    // 🔴 สร้างการแจ้งเตือน (ถ้าคนคอมเมนต์ไม่ใช่เจ้าของโพสต์)
    const postData = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      select: { authorId: true, title: true }
    });

    if (postData && postData.authorId !== comment.author.id) {
        // @ts-ignore
        await prisma.notification.create({
            data: {
                userId: postData.authorId,
                type: 'COMMENT',
                message: `${comment.author.name || comment.author.username} ตอบกลับกระทู้ "${postData.title}"`,
                link: `/forum/${id}#comment-${comment.id}`
            }
        });
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Comment Post Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}