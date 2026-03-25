import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        // @ts-ignore
        if (!session || session.user?.role !== "ADMIN") {
            return new Response("Unauthorized", { status: 401 });
        }

        const reportsData = await prisma.report.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Get unique target IDs per type
        const postIds = reportsData.filter(r => r.type === "POST").map(r => r.targetId);
        const commentIds = reportsData.filter(r => r.type === "COMMENT").map(r => r.targetId);

        // Fetch targets in batch to get the offending content AND author context
        const [posts, comments] = await Promise.all([
            prisma.post.findMany({
              where: { id: { in: postIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id)) } },
              include: { author: { select: { username: true, name: true, email: true } } }
            }),
            prisma.comment.findMany({
              where: { id: { in: commentIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id)) } },
              include: { author: { select: { username: true, name: true, email: true } } }
            })
        ]);

        const postMap = new Map(posts.map(p => [p.id.toString(), p]));
        const commentMap = new Map(comments.map(c => [c.id.toString(), c]));

        // สร้าง Header ของไฟล์ CSV (รองรับภาษาไทยด้วย BOM \uFEFF)
        let csvContent = "\uFEFF" + "No.,Type,Reason,Reported Content,Status,Reported User Name,Reported User Email,Date\n";

        // ลูบข้อมูลมาใส่ในแต่ละแถว
        reportsData.forEach((report, index) => {
            const no = index + 1; // ลำดับที่อ่านง่ายขึ้น แทนที่จะเป็น CUID ยาวๆ
            const type = report.type;
            const reason = `"${report.reason.replace(/"/g, '""')}"`; 
            const status = report.status;
            
            let reportedContent = "";
            let reportedName = "Unknown";
            let reportedEmail = "No Email";
            
            // หาข้อมูลเนื้อหาและผู้ที่โดนรายงาน
            if (report.type === "POST") {
                const p = postMap.get(report.targetId);
                if (p) {
                    reportedContent = (p.title + " - " + p.content).substring(0, 200).replace(/"/g, '""').replace(/\n/g, ' ');
                    reportedName = p.author?.username || p.author?.name || "Unknown";
                    reportedEmail = p.author?.email || "No Email";
                } else {
                    reportedContent = "[Post Deleted]";
                }
            } else if (report.type === "COMMENT") {
                const c = commentMap.get(report.targetId);
                if (c) {
                    reportedContent = (c.content).substring(0, 200).replace(/"/g, '""').replace(/\n/g, ' ');
                    reportedName = c.author?.username || c.author?.name || "Unknown";
                    reportedEmail = c.author?.email || "No Email";
                } else {
                    reportedContent = "[Comment Deleted]";
                }
            }

            const safeReportedContent = `"${reportedContent}"`;
            const safeReportedName = `"${reportedName}"`;
            const date = new Date(report.createdAt).toLocaleString('th-TH');

            const row = `${no},${type},${reason},${safeReportedContent},${status},${safeReportedName},${reportedEmail},"${date}"\n`;
            csvContent += row;
        });

        // ส่งกลับมาเป็นไฟล์ CSV ให้เบราว์เซอร์จัดการดาวน์โหลด
        return new Response(csvContent, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": 'attachment; filename="system_reports.csv"'
            }
        });

    } catch (error) {
        console.error("Export Reports Error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
