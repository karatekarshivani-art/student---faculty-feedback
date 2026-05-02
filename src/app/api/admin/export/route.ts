import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.user.role !== 'HOD' && session.user.role !== 'PRINCIPAL')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const departmentId = session.user.role === 'HOD' ? session.user.departmentId : searchParams.get('dept');

    // Fetch feedback data
    const feedbackWhere: any = {};
    if (departmentId) {
      feedbackWhere.faculty = { departmentId };
    }

    const feedbacks = await prisma.feedback.findMany({
      where: feedbackWhere,
      include: {
        faculty: true,
        subject: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    // Create CSV Header
    let csv = 'Faculty,Subject,Department,Month,Year,Teaching Clarity,Engagement,Punctuality,Knowledge,Sentiment,Comments\n';

    // Add Data Rows
    feedbacks.forEach(f => {
      const row = [
        f.faculty.name,
        f.subject.name,
        f.faculty.departmentId || 'N/A', // Simplified for CSV
        f.month,
        f.year,
        f.teachingClarity,
        f.engagement,
        f.punctuality,
        f.subjectKnowledge,
        f.sentiment,
        `"${(f.comments || '').replace(/"/g, '""')}"`
      ].join(',');
      csv += row + '\n';
    });

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="feedback_report_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
