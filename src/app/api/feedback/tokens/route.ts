import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subjectId } = await request.json();

    if (!subjectId) {
      return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 });
    }

    // Verify student is enrolled in this subject
    const enrollment = await prisma.studentSubject.findFirst({
      where: { studentId: session.user.id, subjectId }
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled in this subject' }, { status: 403 });
    }

    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    
    // Check if within the last 5 days of the month (skipped in dev for testing)
    // const daysInMonth = new Date(year, month, 0).getDate();
    // if (currentDate.getDate() <= daysInMonth - 5) {
    //   return NextResponse.json({ error: 'Feedback is only open during the last 5 days of the month' }, { status: 403 });
    // }

    // Check if token already claimed
    const existingClaim = await prisma.studentTokenClaim.findFirst({
      where: { studentId: session.user.id, subjectId, month, year }
    });

    if (existingClaim) {
      return NextResponse.json({ error: 'Feedback already submitted for this subject this month' }, { status: 403 });
    }

    // Generate Token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Use transaction to ensure both claim and token are created safely
    await prisma.$transaction([
      prisma.studentTokenClaim.create({
        data: { studentId: session.user.id, subjectId, month, year }
      }),
      prisma.feedbackToken.create({
        data: { tokenHash, subjectId, month, year }
      })
    ]);

    // Return the rawToken to the student, this is the only time it's visible.
    // It's not linked to their ID anywhere.
    return NextResponse.json({ token: rawToken });

  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
