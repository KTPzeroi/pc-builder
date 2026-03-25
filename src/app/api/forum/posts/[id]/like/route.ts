import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // @ts-ignore
    const userId = session.user.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { likedBy: { select: { id: true } } }
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isLiked = post.likedBy.some(user => user.id === userId);

    if (isLiked) {
      // Unlike
      await prisma.post.update({
        where: { id: postId },
        data: { likedBy: { disconnect: { id: userId } } }
      });
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await prisma.post.update({
        where: { id: postId },
        data: { likedBy: { connect: { id: userId } } }
      });

      // 🔴 สร้างแจ่งเตือนถ้ากดถูกใจโพสต์ที่ไม่ใช่ของตัวเอง
      if (post.authorId !== userId) {
        // @ts-ignore
        await prisma.notification.create({
            data: {
                userId: post.authorId,
                type: 'LIKE',
                message: `${session.user?.name || "มีคน"} ถูกใจโพสต์ "${post.title.substring(0, 30)}${post.title.length > 30 ? '...' : ''}" ของคุณ`,
                link: `/forum/${post.id}`
            }
        });
      }

      return NextResponse.json({ liked: true });
    }

  } catch (error) {
    console.error("Like Post Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
