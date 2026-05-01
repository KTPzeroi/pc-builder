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
    const { reason, description } = await request.json();

    if (isNaN(commentId) || !reason) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // @ts-ignore
    const reporterId = String(session.user.id);

    const report = await prisma.report.create({
      data: {
        type: "COMMENT",
        targetId: String(commentId),
        targetUrl: `/forum/${comment.postId}#comment-${comment.id}`,
        reason: reason,
        description: description || "",
        reporterId: reporterId,
        status: "PENDING",
      }
    });

    // Increment reportCount ของเจ้าของ Comment
    await prisma.user.update({
      where: { id: comment.authorId },
      data: { reportCount: { increment: 1 } }
    });

    // ดึงรายชื่อ Admin ทั้งหมดเพื่อส่งแจ้งเตือน
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    if (admins.length > 0) {
        const notifications = admins.map(admin => ({
            userId: admin.id,
            type: "REPORT",
            message: `มีรายงานคอมเมนต์ใหม่ (เหตุผล: ${reason})`,
            link: `/admin/reports`
        }));
        await prisma.notification.createMany({ data: notifications });
    }

    return NextResponse.json({ success: true, report });

  } catch (error) {
    console.error("Report Comment Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
