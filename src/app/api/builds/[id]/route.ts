import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: buildId } = await params;

        const build = await prisma.pCBuild.findUnique({
            where: { id: buildId },
            include: {
                user: { select: { id: true, name: true, image: true, username: true } }
                // ถ้าในอนาคตมี Relation ไปที่ Component ก็ include ตรงนี้เพิ่มได้
            }
        });

        if (!build) {
            return NextResponse.json({ error: 'Build not found' }, { status: 404 });
        }

        return NextResponse.json(build);
    } catch (error) {
        console.error('Error fetching PC build:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
