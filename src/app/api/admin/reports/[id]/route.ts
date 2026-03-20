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
            }
            // สามารถเพิ่มเงื่อนไขสำหรับ "COMMENT" หรือ "USER" ได้ในอนาคต

            const updatedReport = await prisma.report.update({
                where: { id },
                data: { status: "RESOLVED" }
            });
            
            return NextResponse.json({ success: true, report: updatedReport });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Update Report Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
