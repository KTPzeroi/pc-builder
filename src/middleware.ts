import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    // `withAuth` augments your `Request` with the user's token.
    function middleware(req) {
        // 🟢 ถ้า User อยู่หน้า /admin แต่ Role ใน Token ไม่ใช่ ADMIN ให้เตะกลับหน้าแรก
        if (
            req.nextUrl.pathname.startsWith("/admin") &&
            req.nextauth.token?.role !== "ADMIN"
        ) {
            return NextResponse.redirect(new URL("/", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token, // ต้องล็อกอินก่อนถึงจะผ่านไปรันฟังก์ชันข้างบน
        },
    }
);

// 🟢 ระบุ Path ที่เจาะจงให้ Middleware ทำงานเพื่อไม่ให้กินทรัพยากร
export const config = { matcher: ["/admin/:path*"] };
