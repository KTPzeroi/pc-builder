import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        // @ts-ignore
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const reportsData = await prisma.report.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                reporter: {
                    select: { name: true, image: true, username: true }
                }
            }
        });

        // Get unique target IDs per type
        const postIds = reportsData.filter(r => r.type === "POST").map(r => r.targetId);
        const commentIds = reportsData.filter(r => r.type === "COMMENT").map(r => r.targetId);

        // Fetch targets in batch
        const [posts, comments] = await Promise.all([
            prisma.post.findMany({
              where: { id: { in: postIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id)) } },
              include: { author: { select: { username: true, name: true } } }
            }),
            prisma.comment.findMany({
              where: { id: { in: commentIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id)) } },
              include: { author: { select: { username: true, name: true } } }
            })
        ]);

        const postMap = new Map(posts.map(p => [p.id.toString(), p]));
        const commentMap = new Map(comments.map(c => [c.id.toString(), c]));

        // Attach content and author to report items
        const reports = reportsData.map(report => {
            let targetContent = "";
            let targetAuthor = "Unknown";
            
            if (report.type === "POST") {
                const p = postMap.get(report.targetId);
                if (p) {
                    targetContent = (p.title + " - " + p.content).substring(0, 150);
                    targetAuthor = p.author?.username || p.author?.name || "Unknown User";
                } else {
                    targetContent = "[Post Deleted]";
                }
            } else if (report.type === "COMMENT") {
                const c = commentMap.get(report.targetId);
                if (c) {
                    targetContent = (c.content).substring(0, 150);
                    targetAuthor = c.author?.username || c.author?.name || "Unknown User";
                } else {
                    targetContent = "[Comment Deleted]";
                }
            }
            
            return {
                ...report,
                targetContent,
                targetAuthor
            };
        });

        return NextResponse.json({ success: true, reports });

    } catch (error) {
        console.error("Fetch Reports Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
