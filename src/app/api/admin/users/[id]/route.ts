import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // In Next 15 App router, params is awaitable but we'll adapt to how Next 14 does it. Wait, the project uses Next 16.1.6. params is a Promise. Let's await it.
) {
    try {
        const session = await getServerSession(authOptions);
        // @ts-ignore
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        const validFields: any = {};
        if (body.role && ["USER", "ADMIN"].includes(body.role)) validFields.role = body.role;

        // BAN: รับ bannedUntil + banReason
        if (body.bannedUntil !== undefined) {
            if (body.bannedUntil === null) {
                // UNBAN: ล้างค่าทั้งหมด
                validFields.bannedUntil = null;
                validFields.banReason = null;
                validFields.status = "ACTIVE";
            } else {
                // BAN: set วันหมดแบน, status และ reason
                validFields.bannedUntil = new Date(body.bannedUntil);
                validFields.status = "BANNED";
                validFields.banReason = body.banReason || "ละเมิดกฎชุมชน";
            }
        }

        if (Object.keys(validFields).length === 0) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: validFields
        });

        // ส่ง Notification ถึง user ที่ถูกแบน
        if (validFields.status === "BANNED" && validFields.bannedUntil) {
            const dateStr = new Date(validFields.bannedUntil).toLocaleDateString("th-TH", {
                day: "numeric", month: "long", year: "numeric"
            });
            await prisma.notification.create({
                data: {
                    userId: id,
                    type: "WARNING",
                    message: `บัญชีของคุณถูกระงับการใช้งาน Forum ถึงวันที่ ${dateStr} เหตุผล: ${validFields.banReason}`,
                    link: "/profile"
                }
            });
        }

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Update User API Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        // @ts-ignore
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete User API Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
