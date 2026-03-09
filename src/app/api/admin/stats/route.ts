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

            // 4. Popular Build Categories
            // Estimate by comparing highest score (gamingScore, workingScore, renderScore)
            const builds = await prisma.pCBuild.findMany({
                select: { gamingScore: true, workingScore: true, renderScore: true }
            });

            let gamingCount = 0;
            let workingCount = 0;
            let renderCount = 0;

            builds.forEach(b => {
                const g = b.gamingScore || 0;
                const w = b.workingScore || 0;
                const r = b.renderScore || 0;

                if (g >= w && g >= r && g > 0) {
                    gamingCount++;
                } else if (w >= g && w >= r && w > 0) {
                    workingCount++;
                } else if (r >= g && r >= w && r > 0) {
                    renderCount++;
                } else {
                    // default to gaming if all 0 or empty
                    gamingCount++;
                }
            });

            categoriesData = [
                { category: "Gaming", count: gamingCount },
                { category: "Working", count: workingCount },
                { category: "3D/Render", count: renderCount }
            ];

            // 5. Active Reports (Mock 0 for now)
            activeReports = 0;

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
            activityData,
            categoriesData
        });
    } catch (error) {
        console.error("Stats API Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
