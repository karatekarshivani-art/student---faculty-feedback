import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'PRINCIPAL') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [users, depts, subjects] = await Promise.all([
      prisma.user.findMany({
        include: { department: true },
        orderBy: { name: 'asc' }
      }),
      prisma.department.findMany({
        include: { 
          _count: {
            select: { users: true, subjects: true }
          }
        },
        orderBy: { name: 'asc' }
      }),
      prisma.subject.findMany({
        include: { department: true },
        orderBy: { name: 'asc' }
      })
    ]);

    return NextResponse.json({ users, depts, subjects });
  } catch (error) {
    console.error('Management fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
