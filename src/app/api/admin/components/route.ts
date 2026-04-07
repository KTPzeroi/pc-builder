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

        // === BULK INSERT MODE (CSV Import) ===
        if (body.bulk === true && Array.isArray(body.items)) {
            const items = body.items.map((item: any) => ({
                name: item.name,
                type: item.type,
                brand: item.brand,
                price: item.price ? parseFloat(item.price.toString()) : 0,
                image: item.image || null,
                description: item.description || null,
                socket: item.socket || null,
                ramType: item.ramType || null,
                formFactor: item.formFactor || null,
                capacity: item.capacity ? parseInt(item.capacity.toString()) : null,
                tdp: item.tdp ? parseInt(item.tdp.toString()) : null,
                lengthMm: item.lengthMm ? parseInt(item.lengthMm.toString()) : null,
                maxGpuLength: item.maxGpuLength ? parseInt(item.maxGpuLength.toString()) : null,
                maxCoolerHeight: item.maxCoolerHeight ? parseInt(item.maxCoolerHeight.toString()) : null,
                supportedMobo: item.supportedMobo || null,
                psuFormFactor: item.psuFormFactor || null,
                cpuSingleScore: item.cpuSingleScore ? parseInt(item.cpuSingleScore.toString()) : null,
                cpuMultiScore: item.cpuMultiScore ? parseInt(item.cpuMultiScore.toString()) : null,
                gpuScore: item.gpuScore ? parseInt(item.gpuScore.toString()) : null,
                vramGb: item.vramGb ? parseInt(item.vramGb.toString()) : null,
                ramSpeed: item.ramSpeed ? parseInt(item.ramSpeed.toString()) : null,
                readSpeed: item.readSpeed ? parseInt(item.readSpeed.toString()) : null,
                writeSpeed: item.writeSpeed ? parseInt(item.writeSpeed.toString()) : null,
                coolingType: item.coolingType || null,
                chipset: item.chipset || null,
            }));

            const result = await (prisma.component as any).createMany({ data: items });
            syncSeedFile().catch(console.error);
            return NextResponse.json({ count: result.count }, { status: 201 });
        }
        
        // === SINGLE INSERT MODE (existing behavior) ===
        const {
            name, type, brand, price, image, description,
            socket, ramType, formFactor, capacity,
            tdp, lengthMm, maxGpuLength, maxCoolerHeight, supportedMobo, psuFormFactor, coolingType,
            cpuSingleScore, cpuMultiScore, gpuScore,
            vramGb, ramSpeed, readSpeed, writeSpeed,
            chipset
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
                tdp: tdp ? parseInt(tdp.toString()) : null,
                lengthMm: lengthMm ? parseInt(lengthMm.toString()) : null,
                maxGpuLength: maxGpuLength ? parseInt(maxGpuLength.toString()) : null,
                maxCoolerHeight: maxCoolerHeight ? parseInt(maxCoolerHeight.toString()) : null,
                supportedMobo: supportedMobo || null,
                psuFormFactor: psuFormFactor || null,
                cpuSingleScore: cpuSingleScore ? parseInt(cpuSingleScore.toString()) : null,
                cpuMultiScore: cpuMultiScore ? parseInt(cpuMultiScore.toString()) : null,
                gpuScore: gpuScore ? parseInt(gpuScore.toString()) : null,
                vramGb: vramGb ? parseInt(vramGb.toString()) : null,
                ramSpeed: ramSpeed ? parseInt(ramSpeed.toString()) : null,
                readSpeed: readSpeed ? parseInt(readSpeed.toString()) : null,
                writeSpeed: writeSpeed ? parseInt(writeSpeed.toString()) : null,
                coolingType: coolingType || null,
                chipset: chipset || null,
            }
        });

        syncSeedFile().catch(console.error);
        return NextResponse.json(component, { status: 201 });
    } catch (error) {
        console.error("Error creating component:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
