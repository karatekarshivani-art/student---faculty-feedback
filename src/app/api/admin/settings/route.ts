import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await verifyAuth();
    if (!session || session.user.role !== 'PRINCIPAL') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = await prisma.systemSettings.findUnique({
      where: { id: 'GLOBAL' }
    });

    if (!settings) {
      const now = new Date();
      settings = await prisma.systemSettings.create({
        data: {
          id: 'GLOBAL',
          feedbackEnabled: true,
          currentMonth: now.getMonth() + 1,
          currentYear: now.getFullYear()
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await verifyAuth();
    if (!session || session.user.role !== 'PRINCIPAL') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { feedbackEnabled, currentMonth, currentYear } = await req.json();

    const settings = await prisma.systemSettings.upsert({
      where: { id: 'GLOBAL' },
      update: { feedbackEnabled, currentMonth, currentYear },
      create: { id: 'GLOBAL', feedbackEnabled, currentMonth, currentYear }
    });

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
