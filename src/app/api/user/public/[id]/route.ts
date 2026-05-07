import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: userId } = await params;
        const session = await getServerSession(authOptions);
        const userRole = (session?.user as any)?.role;

        const postWhereClause: any = { status: { not: "Hidden" } };
        if (userRole !== "ADMIN") {
            postWhereClause.status = { notIn: ["Hidden", "Private"] };
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                username: true,
                image: true,
                bio: true,
                _count: {
                    select: {
                        posts: true,
                        comments: true,
                    }
                },
                posts: {
                    where: postWhereClause,
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    select: {
                        id: true,
                        title: true,
                        category: true,
                        createdAt: true,
                        _count: {
                            select: { comments: true }
                        }
                    }
                },
                pcBuilds: {
                    orderBy: { updatedAt: 'desc' },
                    select: {
                        id: true,
                        name: true,
                        totalPrice: true,
                        gamingScore: true,
                        workingScore: true,
                        renderScore: true,
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);

    } catch (error) {
        console.error('Error fetching public user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
