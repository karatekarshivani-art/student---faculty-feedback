import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const facultyId = session.user.id;

    // Get all feedback for this faculty
    const feedbacks = await prisma.feedback.findMany({
      where: { facultyId },
      include: {
        subject: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (feedbacks.length === 0) {
      return NextResponse.json({
        totalFeedbacks: 0,
        averages: null,
        comments: [],
        trends: []
      });
    }

    // Calculate Averages
    const total = feedbacks.length;
    const sums = feedbacks.reduce((acc, f) => ({
      teachingClarity: acc.teachingClarity + f.teachingClarity,
      engagement: acc.engagement + f.engagement,
      punctuality: acc.punctuality + f.punctuality,
      subjectKnowledge: acc.subjectKnowledge + f.subjectKnowledge
    }), { teachingClarity: 0, engagement: 0, punctuality: 0, subjectKnowledge: 0 });

    const averages = {
      teachingClarity: (sums.teachingClarity / total).toFixed(2),
      engagement: (sums.engagement / total).toFixed(2),
      punctuality: (sums.punctuality / total).toFixed(2),
      subjectKnowledge: (sums.subjectKnowledge / total).toFixed(2),
      overall: ((sums.teachingClarity + sums.engagement + sums.punctuality + sums.subjectKnowledge) / (total * 4)).toFixed(2)
    };

    // Performance Trends (Group by Month)
    const trendsMap = new Map();
    feedbacks.forEach(f => {
      const key = `${f.year}-${f.month}`;
      if (!trendsMap.has(key)) {
        trendsMap.set(key, { month: f.month, year: f.year, sum: 0, count: 0 });
      }
      const entry = trendsMap.get(key);
      entry.sum += (f.teachingClarity + f.engagement + f.punctuality + f.subjectKnowledge) / 4;
      entry.count += 1;
    });

    const trends = Array.from(trendsMap.values())
      .map(t => ({ label: `${t.month}/${t.year}`, rating: (t.sum / t.count).toFixed(2) }))
      .sort((a, b) => a.label.localeCompare(b.label));

    // Mock AI Insights
    const positiveComments = feedbacks.filter(f => f.sentiment === 'POSITIVE').length;
    const negativeComments = feedbacks.filter(f => f.sentiment === 'NEGATIVE').length;
    
    let aiSummary = "Based on recent feedback, students generally find your teaching clarity to be ";
    if (parseFloat(averages.teachingClarity) > 4) aiSummary += "excellent and highly effective. ";
    else if (parseFloat(averages.teachingClarity) > 3) aiSummary += "good, though there is room for improvement in making concepts simpler. ";
    else aiSummary += "an area that needs significant attention. ";

    if (negativeComments > positiveComments) {
      aiSummary += "There are some concerns regarding student engagement that should be addressed.";
    } else {
      aiSummary += "The overall sentiment is positive, with many students appreciating your subject depth.";
    }

    const aiSuggestions = [
      parseFloat(averages.engagement) < 3.5 ? "Try incorporating more interactive polls or group discussions." : "Maintain the current level of interactive sessions.",
      parseFloat(averages.punctuality) < 4 ? "Try to ensure classes start and end strictly on time." : "Excellent punctuality noted by students.",
      "Consider using more real-world examples to explain theoretical concepts."
    ];

    // Achievement Badges
    const badges = [];
    if (parseFloat(averages.overall) >= 4.5) badges.push({ name: 'Excellence Star', icon: '⭐', desc: 'Maintained an overall rating above 4.5' });
    if (parseFloat(averages.punctuality) >= 4.8) badges.push({ name: 'Time Master', icon: '🕒', desc: 'Exceptional punctuality record' });
    if (parseFloat(averages.engagement) >= 4.5) badges.push({ name: 'Student Magnet', icon: '🧲', desc: 'Highest level of student engagement' });
    if (total >= 10) badges.push({ name: 'Community Favorite', icon: '❤️', desc: 'High volume of student feedback' });

    // Subject-wise Breakdown
    const subjects = await prisma.subject.findMany({
      where: { facultySubjects: { some: { facultyId: session.user.id } } }
    });

    const subjectStats = await Promise.all(subjects.map(async (s) => {
      const fb = feedbacks.filter(f => f.subjectId === s.id);
      const avg = fb.length > 0 
        ? fb.reduce((acc, f) => acc + (f.teachingClarity + f.engagement + f.punctuality + f.subjectKnowledge) / 4, 0) / fb.length 
        : 0;
      return { name: s.name, rating: avg.toFixed(2), count: fb.length };
    }));

    return NextResponse.json({
      totalFeedbacks: total,
      averages,
      trends,
      aiInsights: {
        summary: aiSummary,
        suggestions: aiSuggestions
      },
      badges,
      subjectStats,
      comments: feedbacks.map(f => ({
        id: f.id,
        subject: f.subject.name,
        date: f.createdAt,
        text: f.comments,
        sentiment: f.sentiment,
        ratings: {
          clarity: f.teachingClarity,
          engagement: f.engagement,
          punctuality: f.punctuality,
          knowledge: f.subjectKnowledge
        }
      }))
    });

  } catch (error) {
    console.error('Faculty analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
