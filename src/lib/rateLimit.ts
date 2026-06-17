import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

// Fixed-window rate limiter backed by Postgres so it works across serverless instances.
export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = new Date();
  const windowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs);

  const existing = await prisma.rateLimit.findUnique({ where: { key } });

  if (!existing || existing.windowStart.getTime() !== windowStart.getTime()) {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, windowStart, count: 1 },
      update: { windowStart, count: 1 },
    });
    return true;
  }

  if (existing.count >= limit) return false;

  await prisma.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
  return true;
}
