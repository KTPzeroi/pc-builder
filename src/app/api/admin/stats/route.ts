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

        let dbStatus = "Connected";
        let totalUsers = 0;
        let totalBuilds = 0;
        let activityData: any[] = [];
        let categoriesData: any[] = [];
        let activeReports = 0;
        let urgentReports: any[] = [];

        try {
            // 1. Total Users
            totalUsers = await prisma.user.count();

            // 2. Total Builds
            totalBuilds = await prisma.pCBuild.count();

            // 3. Community Engagement (Posts & Comments last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            // Create an array of the last 7 days with 0 counts
            const activityMap: Record<string, { name: string; posts: number; comments: number }> = {};
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateName = d.toLocaleDateString('en-US', { weekday: 'short' });
                const dateKey = d.toISOString().split('T')[0];
                activityMap[dateKey] = { name: dateName, posts: 0, comments: 0 };
            }

            const recentPosts = await prisma.post.findMany({
                where: { createdAt: { gte: sevenDaysAgo } },
                select: { createdAt: true }
            });

            const recentComments = await prisma.comment.findMany({
                where: { createdAt: { gte: sevenDaysAgo } },
                select: { createdAt: true }
            });

            recentPosts.forEach(p => {
                const dateKey = p.createdAt.toISOString().split('T')[0];
                if (activityMap[dateKey]) activityMap[dateKey].posts++;
            });

            recentComments.forEach(c => {
                const dateKey = c.createdAt.toISOString().split('T')[0];
                if (activityMap[dateKey]) activityMap[dateKey].comments++;
            });

            activityData = Object.values(activityMap);

            // 4. User Budget Tiers (งบประมาณแยกตามระดับ)
            const builds = await prisma.pCBuild.findMany({
                select: { totalPrice: true }
            });

            let entryCount = 0;
            let midCount = 0;
            let highCount = 0;

            builds.forEach(b => {
                const price = b.totalPrice || 0;
                if (price >= 50000) {
                    highCount++;
                } else if (price >= 25000) {
                    midCount++;
                } else {
                    // <= 24999
                    entryCount++;
                }
            });

            categoriesData = [
                { category: "Entry (<25k)", count: entryCount },
                { category: "Mid (25k-50k)", count: midCount },
                { category: "Hi-End (>50k)", count: highCount }
            ];

            // 5. Active Reports (Pending reports)
            // เช็คก่อนว่ามีโมเดล Report ใน Schema หรือไม่ (อาจจะยังไม่ได้สร้าง)
            if ((prisma as any).report) {
                activeReports = await (prisma as any).report.count({
                    where: { status: "PENDING" }
                });

                // 6. Urgent Reports (High/Urgent severity and pending)
                const getUrgentReports = await (prisma as any).report.findMany({
                    where: {
                        status: "PENDING",
                        severity: { in: ["HIGH", "URGENT"] }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 3,
                });
                urgentReports = getUrgentReports;
            }

        } catch (dbErr) {
            console.error("Database Connection Error:", dbErr);
            dbStatus = "Disconnected";
        }

        // เช็ค Cloudinary เบื้องต้น
        let cloudinaryStatus = "Operational";
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            cloudinaryStatus = "Missing Config";
        }

        return NextResponse.json({
            dbStatus,
            cloudinaryStatus,
            totalUsers,
            totalBuilds,
            activeReports,
            urgentReports,
            activityData,
            categoriesData
        });
    } catch (error) {
        console.error("Stats API Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
