import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        // @ts-ignore
        if (!session?.user?.id) {
            return NextResponse.json({ notifications: [], unreadCount: 0 });
        }

        // @ts-ignore
        const userId = session.user.id;
        
        // ดึง Notification ตามไอดีของคนล็อกอิน 10 รายการล่าสุด
        // @ts-ignore
        const notifs = await prisma.notification.findMany({
            where: { userId, isRead: false },
            orderBy: { createdAt: "desc" },
            take: 10
        });

        // @ts-ignore
        const unreadCount = await prisma.notification.count({
            where: { userId, isRead: false }
        });

        return NextResponse.json({ 
            notifications: notifs.map((n: any) => ({
                id: n.id,
                type: n.type,
                message: n.message,
                link: n.link,
                date: n.createdAt,
                isRead: n.isRead
            })),
            unreadCount
        });

    } catch (error) {
        console.error("Notifications API Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

// สำหรับการ Mark as Read
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        // @ts-ignore
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { notifId } = body;

        // @ts-ignore
        await prisma.notification.update({
            where: { id: String(notifId) },
            data: { isRead: true }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
