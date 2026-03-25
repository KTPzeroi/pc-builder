import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        // @ts-ignore
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { action } = body; // "resolve", "ignore", "hide_target"

        // หา Report
        const report = await prisma.report.findUnique({
            where: { id }
        });

        if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        let reportedUserId = "";
        let targetTitle = "เนื้อหาของคุณ";

        if (report.type === "POST") {
            const post = await prisma.post.findUnique({ where: { id: parseInt(report.targetId) }, select: { authorId: true, title: true } });
            if (post) {
                reportedUserId = post.authorId;
                targetTitle = `โพสต์ "${post.title}"`;
            }
        } else if (report.type === "COMMENT") {
            const comment = await prisma.comment.findUnique({ where: { id: parseInt(report.targetId) }, select: { authorId: true } });
            if (comment) {
                reportedUserId = comment.authorId;
                targetTitle = `คอมเมนต์ของคุณ`;
            }
        }

        if (action === "ignore") {
            const updatedReport = await prisma.report.update({
                where: { id },
                data: { status: "IGNORED" }
            });
            return NextResponse.json({ success: true, report: updatedReport });
        }

        if (action === "resolve") {
            const updatedReport = await prisma.report.update({
                where: { id },
                data: { status: "RESOLVED" }
            });

            if (reportedUserId) {
                // @ts-ignore
                await prisma.notification.create({
                    data: {
                        userId: reportedUserId,
                        type: 'WARNING',
                        message: `⚠️ System Warning: ${targetTitle} ถูกรายงานเนื่องจาก ${report.reason}. การกระทำนี้เป็นการตักเตือน โปรดตรวจสอบ`,
                        link: report.targetUrl || '#'
                    }
                });
            }

            return NextResponse.json({ success: true, report: updatedReport });
        }

        if (action === "hide_target") {
            // ซ่อนโพสต์เป้าหมาย
            if (report.type === "POST") {
                const targetPostId = parseInt(report.targetId);
                if (!isNaN(targetPostId)) {
                    await prisma.post.update({
                        where: { id: targetPostId },
                        data: { status: "Hidden" }
                    });
                }
            } else if (report.type === "COMMENT") {
                const targetCommentId = parseInt(report.targetId);
                if (!isNaN(targetCommentId)) {
                    await prisma.comment.delete({
                        where: { id: targetCommentId }
                    });
                }
            }

            const updatedReport = await prisma.report.update({
                where: { id },
                data: { status: "RESOLVED" }
            });
            
            if (reportedUserId) {
                // @ts-ignore
                await prisma.notification.create({
                    data: {
                        userId: reportedUserId,
                        type: 'WARNING',
                        message: `❌ System Action: ${targetTitle} ของคุณถูกซ่อนจากระบบเนื่องจากละเมิดกฎ: ${report.reason}`,
                        link: '#'
                    }
                });
            }

            return NextResponse.json({ success: true, report: updatedReport });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Update Report Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
