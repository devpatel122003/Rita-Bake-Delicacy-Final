import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function uploadFileToS3(file: File): Promise<string> {
    const fileBuffer = await file.arrayBuffer();
    const fileName = `uploads/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fileName,
        Body: Buffer.from(fileBuffer),
        ContentType: file.type,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
}

export async function generatePresignedUrl(fileName: string, fileType: string) {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: `uploads/${Date.now()}-${fileName}`,
        ContentType: fileType,
    };

    const command = new PutObjectCommand(params);
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return {
        presignedUrl,
        fileUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`,
    };
}