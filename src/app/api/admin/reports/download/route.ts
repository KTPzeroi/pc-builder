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

        const reports = await prisma.report.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                reporter: {
                    select: { name: true, email: true }
                }
            }
        });

        // สร้าง Header ของไฟล์ CSV (รองรับภาษาไทยด้วย BOM \uFEFF)
        let csvContent = "\uFEFF" + "ID,Type,Reason,Severity,Status,Reporter Name,Reporter Email,Target URL,Date\n";

        // ลูบข้อมูลมาใส่ในแต่ละแถว
        reports.forEach(report => {
            const id = report.id;
            const type = report.type;
            // เครื่องหมายคำพูดกันเวลามีคอมม่าข้างในจะได้ไม่มีปัญหา
            const reason = `"${report.reason.replace(/"/g, '""')}"`; 
            const severity = report.severity;
            const status = report.status;
            const reporterName = `"${report.reporter.name || 'Unknown'}"`;
            const reporterEmail = report.reporter.email || 'No Email';
            const targetUrl = report.targetUrl;
            const date = new Date(report.createdAt).toLocaleString('th-TH');

            const row = `${id},${type},${reason},${severity},${status},${reporterName},${reporterEmail},${targetUrl},"${date}"\n`;
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
