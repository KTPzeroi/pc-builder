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
    const commentId = parseInt(id);

    if (isNaN(commentId)) {
      return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 });
    }

    // @ts-ignore
    const userId = session.user.id;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { likedBy: { select: { id: true } } }
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const isLiked = comment.likedBy.some(user => user.id === userId);

    if (isLiked) {
      // Unlike
      await prisma.comment.update({
        where: { id: commentId },
        data: { likedBy: { disconnect: { id: userId } } }
      });
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await prisma.comment.update({
        where: { id: commentId },
        data: { likedBy: { connect: { id: userId } } }
      });
      
      // 🔴 สร้างแจ่งเตือนถ้ากดถูกใจคอมเมนต์ที่ไม่ใช่ของตัวเอง
      if (comment.authorId !== userId) {
        // @ts-ignore
        await prisma.notification.create({
            data: {
                userId: comment.authorId,
                type: 'LIKE',
                message: `${session.user?.name || "มีคน"} ถูกใจคอมเมนต์ของคุณ`,
                link: `/forum/${comment.postId}#comment-${comment.id}`
            }
        });
      }

      return NextResponse.json({ liked: true });
    }

  } catch (error) {
    console.error("Like Comment Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
