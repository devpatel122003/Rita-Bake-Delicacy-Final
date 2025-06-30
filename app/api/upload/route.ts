import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function POST(request: Request) {
    try {
        const { filename, filetype } = await request.json();
        const key = `uploads/${Date.now()}-${filename.replace(/\s+/g, '-')}`;

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: key,
            ContentType: filetype,
        };

        const command = new PutObjectCommand(params);
        const url = await getSignedUrl(s3Client, command, { expiresIn: 60 }); // URL expires in 60 seconds

        return NextResponse.json({ url, key });
    } catch (error) {
        console.error('S3 Upload Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate upload URL' },
            { status: 500 }
        );
    }
}