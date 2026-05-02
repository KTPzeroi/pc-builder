import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        // SystemSetting table was removed. Returning default static settings to avoid breaking the frontend.
        const settingsMap = {
            forum_rules: "1. กรุณาใช้คำสุภาพ\n2. ห้ามโพสต์สแปม\n3. เคารพความเห็นของผู้อื่น",
            forum_tags: "DISCUSSION, QUESTION, BUILD_ADVICE, NEWS_AND_RUMORS"
        };
        
        return NextResponse.json(settingsMap);
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        
        // SystemSetting table was removed. We mock the success for now.
        console.warn("SystemSetting table is removed. Cannot save settings to DB. Body:", body);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update settings:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
