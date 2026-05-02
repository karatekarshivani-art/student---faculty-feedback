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

    // Fetch faculty members
    const facultyWhere: any = { role: 'FACULTY' };
    if (departmentId) facultyWhere.departmentId = departmentId;

    const facultyList = await prisma.user.findMany({
      where: facultyWhere,
      include: {
        department: true
      }
    });

    // Aggregate feedback for each faculty
    const analytics = await Promise.all(facultyList.map(async (faculty) => {
      const feedback = await prisma.feedback.findMany({
        where: { facultyId: faculty.id }
      });

      if (feedback.length === 0) return { 
        id: faculty.id, 
        name: faculty.name, 
        dept: faculty.department?.name,
        rating: 0, 
        count: 0 
      };

      const avg = feedback.reduce((acc, f) => 
        acc + (f.teachingClarity + f.engagement + f.punctuality + f.subjectKnowledge) / 4, 0
      ) / feedback.length;

      return {
        id: faculty.id,
        name: faculty.name,
        dept: faculty.department?.name,
        rating: avg.toFixed(2),
        count: feedback.length,
        sentiment: {
          positive: feedback.filter(f => f.sentiment === 'POSITIVE').length,
          neutral: feedback.filter(f => f.sentiment === 'NEUTRAL').length,
          negative: feedback.filter(f => f.sentiment === 'NEGATIVE').length,
        }
      };
    }));

    // Department comparison (only for Principal)
    let deptStats: any[] = [];
    if (session.user.role === 'PRINCIPAL') {
      const depts = await prisma.department.findMany();
      deptStats = await Promise.all(depts.map(async (d) => {
        const feedback = await prisma.feedback.findMany({
          where: { faculty: { departmentId: d.id } }
        });
        const avg = feedback.length > 0 
          ? feedback.reduce((acc, f) => acc + (f.teachingClarity + f.engagement + f.punctuality + f.subjectKnowledge) / 4, 0) / feedback.length 
          : 0;
        return { name: d.name, rating: avg.toFixed(2), count: feedback.length };
      }));
    }

    return NextResponse.json({
      role: session.user.role,
      facultyAnalytics: analytics.sort((a: any, b: any) => b.rating - a.rating),
      deptStats
    });

  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
