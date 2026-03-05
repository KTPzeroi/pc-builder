import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET() {
    try {
        const components = await prisma.component.findMany();
        return NextResponse.json(components, { status: 200 });
    } catch (error) {
        console.error("Error fetching components:", error);
        return NextResponse.json(
            { error: "Failed to fetch components" },
            { status: 500 }
        );
    }
}
