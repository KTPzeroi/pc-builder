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

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                image: true,
                role: true,
                status: true,
                reportCount: true,
                _count: {
                    select: {
                        posts: true,
                        comments: true
                    }
                }
            },
            orderBy: {
                reportCount: 'desc'
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Fetch Users API Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
