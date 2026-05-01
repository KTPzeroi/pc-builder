import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth"; // เพิ่ม import ประเภท

// 1. แยกการตั้งค่าออกมาเป็นตัวแปร และใส่ export หน้า const
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username/Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.identifier },
              { username: credentials.identifier }
            ]
          }
        });

        if (!user || !user.password) return null;

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) return null;

        return {
          id: user.id,
          name: user.username,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as any).role || "USER";
      }
      // ให้ token อัปเดตเมื่อมีการส่ง `update()` จาก client
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image !== undefined) token.picture = session.image;
        if (session.user?.role) token.role = session.user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        try {
          // ดึงข้อมูลล่าสุดจากฐานข้อมูลเสมอ ป้องกันรูปหรือชื่อไม่ตรง
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string }
          });

          if (dbUser) {
            if (!session.user) {
              session.user = {};
            }
            // @ts-ignore
            session.user.id = dbUser.id;
            session.user.name = dbUser.name || dbUser.username || "";
            session.user.image = dbUser.image || "";
            session.user.email = dbUser.email || "";
            // @ts-ignore
            session.user.role = dbUser.role || token.role || "USER";
            // @ts-ignore
            session.user.status = dbUser.status || "ACTIVE";
            // @ts-ignore
            session.user.bannedUntil = dbUser.bannedUntil?.toISOString() || null;
            // @ts-ignore
            session.user.banReason = dbUser.banReason || null;
          }
        } catch (error) {
          console.error("Session fetch error:", error);
        }
      }
      return session;
    },
  },
};

// 2. ส่ง authOptions เข้าไปใน NextAuth handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };