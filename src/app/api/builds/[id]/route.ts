import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

        const componentIds = Array.from(new Set([
            build.cpuId, build.gpuId, build.ramId, build.motherboardId, build.storageId, build.psuId, build.caseId
        ])).filter(Boolean) as string[];

        const components = await prisma.component.findMany({
            where: { id: { in: componentIds } }
        });

        const compMap = Object.fromEntries(components.map(c => [c.id, c]));

        const enrichedBuild = {
            ...build,
            specs: {
                "Processor": compMap[build.cpuId || ""]?.name || "-",
                "Graphics Card": compMap[build.gpuId || ""]?.name || "-",
                "Memory": compMap[build.ramId || ""]?.name || "-",
                "Motherboard": compMap[build.motherboardId || ""]?.name || "-",
                "Storage": compMap[build.storageId || ""]?.name || "-",
                "Power Supply": compMap[build.psuId || ""]?.name || "-",
                "Case": compMap[build.caseId || ""]?.name || "-"
            }
        };

        return NextResponse.json(enrichedBuild);
    } catch (error) {
        console.error('Error fetching PC build:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { id: buildId } = await params;

        const build = await prisma.pCBuild.findUnique({
            where: { id: buildId }
        });

        if (!build) {
            return NextResponse.json({ error: 'Build not found' }, { status: 404 });
        }

        if (build.userId !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.pCBuild.delete({
            where: { id: buildId }
        });

        return NextResponse.json({ message: 'Build deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting PC build:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
