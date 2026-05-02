import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    // Get subjects the student is enrolled in
    const enrolledSubjects = await prisma.studentSubject.findMany({
      where: { studentId: session.user.id },
      include: {
        subject: {
          include: {
            faculty: {
              include: { user: true }
            }
          }
        }
      }
    });

    // Check which subjects they have already claimed a token for this month
    const claims = await prisma.studentTokenClaim.findMany({
      where: { 
        studentId: session.user.id,
        month,
        year
      }
    });

    const claimedSubjectIds = claims.map(c => c.subjectId);

    const subjects = enrolledSubjects.map(es => {
      return {
        id: es.subject.id,
        name: es.subject.name,
        faculty: es.subject.faculty.map(f => ({ id: f.facultyId, name: f.user.name })),
        canProvideFeedback: !claimedSubjectIds.includes(es.subject.id)
      };
    });

    return NextResponse.json({ subjects });

  } catch (error) {
    console.error('Fetch subjects error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
