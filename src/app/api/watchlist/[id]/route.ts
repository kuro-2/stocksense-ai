import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.watchlistItem.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ message: 'Removed from watchlist' });
  } catch (error) {
    console.error('Watchlist DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove from watchlist', code: 'DB_ERROR' }, { status: 500 });
  }
}
