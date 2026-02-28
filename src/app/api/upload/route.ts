import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
        }

        const fileUrls: string[] = [];

        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // แปลง Buffer เป็น Base64 string เพื่อส่งขึ้น Cloudinary ผ่าน API
            const base64Data = buffer.toString('base64');
            const fileUri = `data:${file.type};base64,${base64Data}`;

            // อัปโหลดขึ้น Cloudinary
            const uploadResponse = await cloudinary.uploader.upload(fileUri, {
                folder: 'pc-builder-forum', // สร้างโฟลเดอร์ใน Cloudinary จัดเก็บให้เป็นระเบียบ
            });

            // นำ secure_url (HTTPS) ที่ได้จาก Cloudinary มาเก็บไว้
            fileUrls.push(uploadResponse.secure_url);
        }

        return NextResponse.json({ urls: fileUrls }, { status: 201 });
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        return NextResponse.json({ error: 'Failed to upload files to Cloudinary' }, { status: 500 });
    }
}
