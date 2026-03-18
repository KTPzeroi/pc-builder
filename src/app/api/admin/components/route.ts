import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { syncSeedFile } from "@/utils/syncSeed";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // Destructure only the necessary fields
        const {
            name, type, brand, price, image, description,
            socket, ramType, formFactor, capacity,
            cpuSingleScore, cpuMultiScore, gpuScore,
            vramGb, ramSpeed, readWriteSpeed
        } = body;

        // Basic validation
        if (!name || !type || !brand || price === undefined) {
            return NextResponse.json({ error: "Missing required fields (name, type, brand, price)" }, { status: 400 });
        }

        // @ts-ignore : description will be valid after prisma client re-generates
        const component = await (prisma.component as any).create({
            data: {
                name,
                type,
                brand,
                price: parseFloat(price.toString()),
                image: image || null,
                description: description || null,
                socket: socket || null,
                ramType: ramType || null,
                formFactor: formFactor || null,
                capacity: capacity ? parseInt(capacity.toString()) : null,
                cpuSingleScore: cpuSingleScore ? parseInt(cpuSingleScore.toString()) : null,
                cpuMultiScore: cpuMultiScore ? parseInt(cpuMultiScore.toString()) : null,
                gpuScore: gpuScore ? parseInt(gpuScore.toString()) : null,
                vramGb: vramGb ? parseInt(vramGb.toString()) : null,
                ramSpeed: ramSpeed ? parseInt(ramSpeed.toString()) : null,
                readWriteSpeed: readWriteSpeed ? parseInt(readWriteSpeed.toString()) : null,
            }
        });

        // Sync to seed.ts asynchronously so it does not block the response
        syncSeedFile().catch(console.error);

        return NextResponse.json(component, { status: 201 });
    } catch (error) {
        console.error("Error creating component:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
