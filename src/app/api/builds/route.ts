import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET: ดึงรายการสเปกคอมของ User ที่ล็อกอิน
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const builds = await prisma.pCBuild.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        const componentIds = Array.from(new Set(
            builds.flatMap(b => [b.cpuId, b.gpuId, b.ramId, b.motherboardId, b.storageId, b.psuId, b.caseId])
        )).filter(Boolean) as string[];

        const components = await prisma.component.findMany({
            where: { id: { in: componentIds } }
        });

        const compMap = Object.fromEntries(components.map(c => [c.id, c]));

        const enrichedBuilds = builds.map(b => ({
            ...b,
            specs: {
                "Processor": compMap[b.cpuId || ""]?.name || "-",
                "Graphics Card": compMap[b.gpuId || ""]?.name || "-",
                "Memory": compMap[b.ramId || ""]?.name || "-",
                "Motherboard": compMap[b.motherboardId || ""]?.name || "-",
                "Storage": compMap[b.storageId || ""]?.name || "-",
                "Power Supply": compMap[b.psuId || ""]?.name || "-",
                "Case": compMap[b.caseId || ""]?.name || "-"
            }
        }));

        return NextResponse.json(enrichedBuilds);
    } catch (error) {
        console.error("GET Builds Error:", error);
        return NextResponse.json({ error: 'Failed to fetch builds' }, { status: 500 });
    }
}

// POST: บันทึกสเปกคอมของ User ที่ล็อกอิน
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            name,
            cpuId,
            gpuId,
            ramId,
            motherboardId,
            storageId,
            psuId,
            caseId,
            totalPrice,
            gamingScore,
            workingScore,
            renderScore
        } = body;

        if (!name) {
            return NextResponse.json({ error: 'Build name is required' }, { status: 400 });
        }

        const userId = (session.user as any).id;

        const newBuild = await prisma.pCBuild.create({
            data: {
                name,
                userId,
                cpuId,
                gpuId,
                ramId,
                motherboardId,
                storageId,
                psuId,
                caseId,
                totalPrice: totalPrice || 0,
                gamingScore,
                workingScore,
                renderScore
            },
        });

        return NextResponse.json(newBuild, { status: 201 });
    } catch (error) {
        console.error("POST API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
