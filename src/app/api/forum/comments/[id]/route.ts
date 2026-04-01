import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// DELETE: ลบคอมเมนต์ (เฉพาะเจ้าของคอมเมนต์)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const commentId = parseInt(id);
    if (isNaN(commentId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true }
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const userId = (session.user as any).id;
    if (comment.authorId !== userId) {
      return NextResponse.json({ error: "Forbidden: You can only delete your own comments" }, { status: 403 });
    }

    await prisma.comment.delete({ where: { id: commentId } });

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("DELETE Comment Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
