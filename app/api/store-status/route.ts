import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

// GET /api/store-status
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('myDatabase');
    const status = await db.collection('storeStatus').findOne({});
    return NextResponse.json({ isOnline: status?.isOnline ?? true });
  } catch (error) {
    console.error('Failed to fetch store status:', error);
    return NextResponse.json({ error: 'Failed to fetch store status' }, { status: 500 });
  }
}

// POST /api/store-status
export async function POST(req: NextRequest) {
  try {
    const { isOnline } = await req.json();

    const client = await clientPromise;
    const db = client.db('myDatabase');
    await db.collection('storeStatus').updateOne({}, { $set: { isOnline } }, { upsert: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update store status:', error);
    return NextResponse.json({ error: 'Failed to update store status' }, { status: 500 });
  }
}
