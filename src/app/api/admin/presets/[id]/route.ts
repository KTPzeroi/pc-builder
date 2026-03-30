import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PUT: อัปเดต Preset
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { name, usage, budget, description, components, totalPrice, isActive } = body;

        const preset = await prisma.presetBuild.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(usage !== undefined && { usage }),
                ...(budget !== undefined && { budget }),
                ...(description !== undefined && { description }),
                ...(components !== undefined && { components }),
                ...(totalPrice !== undefined && { totalPrice: parseInt(totalPrice) || 0 }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        return NextResponse.json(preset);
    } catch (error) {
        console.error("Error updating preset:", error);
        return NextResponse.json({ error: "Failed to update preset" }, { status: 500 });
    }
}

// DELETE: ลบ Preset
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.presetBuild.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Error deleting preset:", error);
        return NextResponse.json({ error: "Failed to delete preset" }, { status: 500 });
    }
}
