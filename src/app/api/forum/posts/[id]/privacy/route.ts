import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // ตรวจสอบว่าผู้ที่แก้ไขเป็นเจ้าของกระทู้หรือไม่
    if (post.authorId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ห้ามแก้ถ้าโพสต์ถูกแบน/ซ่อนโดย Admin
    if (post.status === "Hidden") {
      return NextResponse.json({ error: 'Cannot change privacy for hidden post' }, { status: 403 });
    }

    const newStatus = post.status === "Private" ? "Public" : "Private";

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { status: newStatus }
    });

    return NextResponse.json({ status: updatedPost.status });
  } catch (error) {
    console.error("PUT Privacy API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
