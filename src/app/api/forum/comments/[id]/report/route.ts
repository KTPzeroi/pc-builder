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

    return NextResponse.json({ success: true, report });

  } catch (error) {
    console.error("Report Comment Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
