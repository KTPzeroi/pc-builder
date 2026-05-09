import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY || "missing_key");

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "กรุณาระบุอีเมล" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // สำคัญ: ไม่เปิดเผยว่ามีอีเมลนี้ในระบบหรือไม่ เพื่อความปลอดภัย
    if (!user) {
      return NextResponse.json(
        { message: "หากอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้คุณทันที" },
        { status: 200 }
      );
    }

    // สร้าง Token แบบสุ่ม 64 hex characters
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // หมดอายุใน 15 นาที

    // ลบ Token เก่าก่อน (กรณีผู้ใช้กดขอใหม่ซ้ำ)
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    // บันทึก Token ใหม่ลงฐานข้อมูล
    await prisma.passwordResetToken.create({
      data: { email, token, expires }
    });

    // ใช้ NEXTAUTH_URL จาก env แทนการ hardcode localhost
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;
    const year = new Date().getFullYear();

    await resend.emails.send({
      from: 'SnapBuild <onboarding@resend.dev>',
      to: email,
      subject: '🔑 SnapBuild — Reset Your Password',
      html: `
<!DOCTYPE html>
<html lang="th" translate="no">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="google" content="notranslate" />
  <title>SnapBuild Password Reset</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;" class="notranslate">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#ffffff;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">

          <!-- ===== CARD ===== -->
          <tr>
            <td style="background-color:#0f172a;border-radius:16px;border:1px solid #1e293b;overflow:hidden;">

              <!-- Top accent bar -->
              <div style="height:4px;background:linear-gradient(90deg,#2563eb,#7c3aed,#2563eb);"></div>

              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:40px 40px 32px;">

                    <!-- ===== HEADER / LOGO (Moved inside Card) ===== -->
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                      <tr>
                        <td style="text-align:center;">
                          <img src="https://img1.pic.in.th/images/SnapBuildEmail.png" alt="SnapBuild Logo" width="160" style="display:block; margin:0 auto; border:none; outline:none; text-decoration:none;" />
                        </td>
                      </tr>
                    </table>

                    <!-- Icon circle -->
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                      <tr>
                        <td style="width:64px;height:64px;background-color:#1e3a5f;border:2px solid #2563eb;border-radius:50%;text-align:center;vertical-align:middle;">
                          <img src="https://img.icons8.com/ios/100/60a5fa/key.png" alt="Key" width="32" height="32" style="display:inline-block; vertical-align:middle; border:none; outline:none; text-decoration:none;" />
                        </td>
                      </tr>
                    </table>

                    <!-- Title -->
                    <h1 style="color:#f1f5f9;font-size:22px;font-weight:800;text-align:center;margin:0 0 8px;letter-spacing:1px;">
                      Password Reset Request
                    </h1>
                    <p style="color:#64748b;font-size:13px;text-align:center;margin:0 0 32px;letter-spacing:1px;text-transform:uppercase;">
                      คำขอรีเซ็ตรหัสผ่าน
                    </p>

                    <!-- Divider -->
                    <div style="height:1px;background-color:#1e293b;margin:0 0 28px;"></div>

                    <!-- Body text -->
                    <p style="color:#cbd5e1;font-size:15px;line-height:1.8;margin:0 0 12px;">
                      สวัสดีคุณ <strong style="color:#93c5fd;">${user.name || email.split('@')[0]}</strong>,
                    </p>
                    <p style="color:#94a3b8;font-size:14px;line-height:1.8;margin:0 0 28px;">
                      เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชี <strong style="color:#e2e8f0;">${email}</strong>
                      บน <strong style="color:#93c5fd;">SnapBuild</strong>
                      กรุณาคลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่
                    </p>

                    <!-- CTA Button -->
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                      <tr>
                        <td style="border-radius:10px;background:linear-gradient(135deg,#2563eb,#7c3aed);box-shadow:0 4px 24px rgba(37,99,235,0.4);">
                          <a href="${resetLink}"
                             style="display:inline-block;padding:16px 44px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;letter-spacing:2px;text-transform:uppercase;border-radius:10px;">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Expiry note -->
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                           style="background-color:#1e293b;border:1px solid #334155;border-radius:8px;margin-bottom:24px;">
                      <tr>
                        <td style="padding:14px 18px;text-align:center;">
                          <p style="color:#94a3b8;font-size:13px;margin:0;line-height:1.6;">
                            ลิงก์นี้จะหมดอายุภายใน
                            <strong style="color:#fbbf24;">15 นาที</strong>
                            หลังจากส่งอีเมล
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Not requested note -->
                    <p style="color:#475569;font-size:12px;text-align:center;line-height:1.7;margin:0;">
                      หากคุณไม่ได้ทำรายการนี้ กรุณาละเว้นอีเมลฉบับนี้<br/>
                      รหัสผ่านของคุณ <strong style="color:#64748b;">จะไม่มีการเปลี่ยนแปลงใดๆ</strong>
                    </p>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== FALLBACK LINK ===== -->
          <tr>
            <td style="padding:24px 8px 4px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                     style="background-color:#0f172a;border:1px solid #1e293b;border-radius:10px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="color:#475569;font-size:11px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;">
                      หากปุ่มกดไม่ได้ คัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:
                    </p>
                    <p style="word-break:break-all;color:#3b82f6;font-size:11px;margin:0;">
                      ${resetLink}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== FOOTER ===== -->
          <tr>
            <td style="padding:24px 8px 8px;text-align:center;">
              <p style="color:#334155;font-size:11px;margin:0 0 4px;letter-spacing:2px;text-transform:uppercase;">
                Snap<span style="color:#3b82f6;">Build</span>
              </p>
              <p style="color:#1e293b;font-size:11px;margin:0;">
                &copy; ${year} SnapBuild. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    });

    return NextResponse.json(
      { message: "หากอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้คุณทันที" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการส่งอีเมล" }, { status: 500 });
  }
}
