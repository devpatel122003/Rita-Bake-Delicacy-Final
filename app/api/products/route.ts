
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('myDatabase');
    const products = await db.collection('products').find({}).toArray();

    // Generate signed URLs for each product image
    const productsWithSignedUrls = await Promise.all(
      products.map(async (product) => {
        if (product.image?.includes('amazonaws.com')) {
          const key = product.image.split('.amazonaws.com/')[1];
          const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
          });
          const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
          return { ...product, image: signedUrl };
        }
        return product;
      })
    );

    return NextResponse.json(productsWithSignedUrls);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db('myDatabase');
    const body = await request.json();

    // This now expects an S3 URL in the image field
    const productData = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('products').insertOne(productData);
    return NextResponse.json({ success: true, _id: result.insertedId });
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}