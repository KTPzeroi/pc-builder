import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        // @ts-ignore
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const postId = parseInt(id);
        if (isNaN(postId)) {
            return NextResponse.json({ error: "Invalid Post ID" }, { status: 400 });
        }

        // Parse Request Body
        const { reason, description } = await req.json();

        if (!reason) {
            return NextResponse.json({ error: "Reason is required" }, { status: 400 });
        }

        // ตรวจสอบความรุนแรง (severity) ตามเหตุผล
        let severity = "LOW";
        if (reason === "spam") severity = "MEDIUM";
        if (reason === "harassment" || reason === "sexual") severity = "URGENT";

        // สร้าง Report ลงในฐานข้อมูล
        const newReport = await prisma.report.create({
            data: {
                type: "POST",
                reason: reason,
                description: description || "",
                severity: severity,
                status: "PENDING",
                // @ts-ignore
                reporterId: session.user.id,
                targetId: String(postId),
                targetUrl: `/forum/${postId}`
            }
        });

        // อัปเดต reportCount ในตาราง User ของเจ้าของกระทู้ (ถ้าต้องการ)
        // const post = await prisma.post.findUnique({ where: { id: postId } });
        // if (post) {
        //     await prisma.user.update({
        //         where: { id: post.authorId },
        //         data: { reportCount: { increment: 1 } }
        //     });
        // }

        return NextResponse.json({ success: true, report: newReport }, { status: 201 });

    } catch (error) {
        console.error("Report Post Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
