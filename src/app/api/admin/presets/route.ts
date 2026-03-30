import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: ดึง Presets ที่ Active (สำหรับ User ทั่วไป) หรือทั้งหมด (สำหรับ Admin)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const usage = searchParams.get("usage");
    const budget = searchParams.get("budget");
    const all = searchParams.get("all"); // admin mode

    const where: any = {};
    if (!all) where.isActive = true;
    if (usage) where.usage = usage;
    if (budget) where.budget = budget;

    const presets = await prisma.presetBuild.findMany({
        where,
        orderBy: { totalPrice: "asc" },
    });

    return NextResponse.json(presets);
}

// POST: สร้าง Preset ใหม่ (Admin only)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, usage, budget, description, components, totalPrice } = body;

        if (!name || !usage || !budget || !components) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const preset = await prisma.presetBuild.create({
            data: {
                name,
                usage,
                budget,
                description: description || null,
                components,
                totalPrice: parseInt(totalPrice) || 0,
            },
        });

        return NextResponse.json(preset);
    } catch (error) {
        console.error("Error creating preset:", error);
        return NextResponse.json({ error: "Failed to create preset" }, { status: 500 });
    }
}
