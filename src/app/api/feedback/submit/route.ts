import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import Sentiment from 'sentiment';

const sentiment = new Sentiment();

export async function POST(request: Request) {
  try {
    const { 
      token, 
      facultyId, 
      teachingClarity, 
      engagement, 
      punctuality, 
      subjectKnowledge, 
      comments 
    } = await request.json();

    if (!token || !facultyId || !teachingClarity || !engagement || !punctuality || !subjectKnowledge) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find and validate the token
    const dbToken = await prisma.feedbackToken.findUnique({
      where: { tokenHash }
    });

    if (!dbToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    if (dbToken.isUsed) {
      return NextResponse.json({ error: 'Token has already been used' }, { status: 400 });
    }

    // Verify faculty teaches this subject
    const facultySubject = await prisma.facultySubject.findFirst({
      where: { facultyId, subjectId: dbToken.subjectId }
    });

    if (!facultySubject) {
      return NextResponse.json({ error: 'Invalid faculty for this subject token' }, { status: 400 });
    }

    // Analyze Sentiment
    let sentimentCategory = 'NEUTRAL';
    if (comments) {
      const result = sentiment.analyze(comments);
      if (result.score > 2) sentimentCategory = 'POSITIVE';
      else if (result.score < -2) sentimentCategory = 'NEGATIVE';
    }

    // Save feedback and mark token as used
    await prisma.$transaction([
      prisma.feedback.create({
        data: {
          subjectId: dbToken.subjectId,
          facultyId,
          month: dbToken.month,
          year: dbToken.year,
          teachingClarity,
          engagement,
          punctuality,
          subjectKnowledge,
          comments,
          sentiment: sentimentCategory
        }
      }),
      prisma.feedbackToken.update({
        where: { id: dbToken.id },
        data: { isUsed: true }
      })
    ]);

    return NextResponse.json({ success: true, message: 'Feedback submitted successfully anonymously!' });

  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
