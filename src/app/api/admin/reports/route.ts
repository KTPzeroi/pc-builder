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

        const reports = await prisma.report.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                reporter: {
                    select: { name: true, image: true, username: true }
                }
            }
        });

        return NextResponse.json({ success: true, reports });

    } catch (error) {
        console.error("Fetch Reports Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
