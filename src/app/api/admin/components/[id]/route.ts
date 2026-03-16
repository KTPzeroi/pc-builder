import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function PUT(req: Request, context: any) {
    try {
        const { id } = await context.params;
        if (!id) return NextResponse.json({ error: "No component ID provided" }, { status: 400 });

        const body = await req.json();

        // Check if component exists
        const existingComponent = await prisma.component.findUnique({ where: { id } });
        if (!existingComponent) return NextResponse.json({ error: "Component not found" }, { status: 404 });

        const {
            name, type, brand, price, image, description,
            socket, ramType, formFactor, capacity,
            cpuSingleScore, cpuMultiScore, gpuScore,
            vramGb, ramSpeed, readWriteSpeed
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
                capacity: capacity !== undefined ? parseInt(capacity.toString()) : existingComponent.capacity,
                cpuSingleScore: cpuSingleScore !== undefined ? parseInt(cpuSingleScore.toString()) : existingComponent.cpuSingleScore,
                cpuMultiScore: cpuMultiScore !== undefined ? parseInt(cpuMultiScore.toString()) : existingComponent.cpuMultiScore,
                gpuScore: gpuScore !== undefined ? parseInt(gpuScore.toString()) : existingComponent.gpuScore,
                vramGb: vramGb !== undefined ? parseInt(vramGb.toString()) : existingComponent.vramGb,
                ramSpeed: ramSpeed !== undefined ? parseInt(ramSpeed.toString()) : existingComponent.ramSpeed,
                readWriteSpeed: readWriteSpeed !== undefined ? parseInt(readWriteSpeed.toString()) : existingComponent.readWriteSpeed,
            }
        });

        return NextResponse.json(updatedComponent, { status: 200 });
    } catch (error) {
        console.error("Error updating component:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, context: any) {
    try {
        const { id } = await context.params;
        if (!id) return NextResponse.json({ error: "No component ID provided" }, { status: 400 });

        const existingComponent = await prisma.component.findUnique({ where: { id } });
        if (!existingComponent) return NextResponse.json({ error: "Component not found" }, { status: 404 });

        await prisma.component.delete({ where: { id } });

        return NextResponse.json({ message: "Component deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting component:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
