import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { syncSeedFile } from "@/utils/syncSeed";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function PUT(req: Request, context: any) {
    try {
        // Handle both Next.js 14 and 15 parameter resolution
        const params = await Promise.resolve(context.params);
        const { id } = params;
        
        if (!id) return NextResponse.json({ error: "No component ID provided" }, { status: 400 });

        const body = await req.json();

        // Check if component exists
        const existingComponent = await prisma.component.findUnique({ where: { id } });
        if (!existingComponent) return NextResponse.json({ error: "Component not found" }, { status: 404 });

        const {
            name, type, brand, price, image, description,
            socket, ramType, formFactor, capacity,
            tdp, lengthMm, maxGpuLength, maxCoolerHeight, supportedMobo, psuFormFactor,
            cpuSingleScore, cpuMultiScore, gpuScore,
            vramGb, ramSpeed, readWriteSpeed,
            chipset
        } = body;

        // @ts-ignore : description will be valid after prisma client re-generates
        const updatedComponent = await (prisma.component as any).update({
            where: { id },
            data: {
                name: name !== undefined ? name : existingComponent.name,
                type: type !== undefined ? type : existingComponent.type,
                brand: brand !== undefined ? brand : existingComponent.brand,
                price: price !== undefined ? parseFloat(price.toString()) : existingComponent.price,
                image: image !== undefined ? image : existingComponent.image,
                description: description !== undefined ? description : (existingComponent as any).description,
                socket: socket !== undefined ? socket : existingComponent.socket,
                ramType: ramType !== undefined ? ramType : existingComponent.ramType,
                formFactor: formFactor !== undefined ? formFactor : existingComponent.formFactor,
                capacity: capacity === undefined ? existingComponent.capacity : (capacity ? parseInt(capacity.toString()) : null),
                tdp: tdp === undefined ? (existingComponent as any).tdp : (tdp ? parseInt(tdp.toString()) : null),
                lengthMm: lengthMm === undefined ? (existingComponent as any).lengthMm : (lengthMm ? parseInt(lengthMm.toString()) : null),
                maxGpuLength: maxGpuLength === undefined ? (existingComponent as any).maxGpuLength : (maxGpuLength ? parseInt(maxGpuLength.toString()) : null),
                maxCoolerHeight: maxCoolerHeight === undefined ? (existingComponent as any).maxCoolerHeight : (maxCoolerHeight ? parseInt(maxCoolerHeight.toString()) : null),
                supportedMobo: supportedMobo !== undefined ? (supportedMobo || null) : (existingComponent as any).supportedMobo,
                psuFormFactor: psuFormFactor !== undefined ? (psuFormFactor || null) : (existingComponent as any).psuFormFactor,
                cpuSingleScore: cpuSingleScore === undefined ? existingComponent.cpuSingleScore : (cpuSingleScore ? parseInt(cpuSingleScore.toString()) : null),
                cpuMultiScore: cpuMultiScore === undefined ? existingComponent.cpuMultiScore : (cpuMultiScore ? parseInt(cpuMultiScore.toString()) : null),
                gpuScore: gpuScore === undefined ? existingComponent.gpuScore : (gpuScore ? parseInt(gpuScore.toString()) : null),
                vramGb: vramGb === undefined ? existingComponent.vramGb : (vramGb ? parseInt(vramGb.toString()) : null),
                ramSpeed: ramSpeed === undefined ? existingComponent.ramSpeed : (ramSpeed ? parseInt(ramSpeed.toString()) : null),
                readWriteSpeed: readWriteSpeed === undefined ? existingComponent.readWriteSpeed : (readWriteSpeed ? parseInt(readWriteSpeed.toString()) : null),
                chipset: chipset !== undefined ? (chipset || null) : (existingComponent as any).chipset,
            }
        });

        syncSeedFile().catch(console.error);

        return NextResponse.json(updatedComponent, { status: 200 });
    } catch (error) {
        console.error("Error updating component:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, context: any) {
    try {
        // Handle both Next.js 14 and 15 parameter resolution
        const params = await Promise.resolve(context.params);
        const { id } = params;
        
        if (!id) return NextResponse.json({ error: "No component ID provided" }, { status: 400 });

        const existingComponent = await prisma.component.findUnique({ where: { id } });
        if (!existingComponent) return NextResponse.json({ error: "Component not found" }, { status: 404 });

        await prisma.component.delete({ where: { id } });

        syncSeedFile().catch(console.error);

        return NextResponse.json({ message: "Component deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting component:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
