const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  const defaultPassword = await bcrypt.hash('password123', 10);

  // ── Departments ──────────────────────────────────────────────────────────
  const deptCS = await prisma.department.upsert({
    where: { name: 'Computer Science' },
    update: {},
    create: { name: 'Computer Science' }
  });
  const deptEC = await prisma.department.upsert({
    where: { name: 'Electronics & Communication' },
    update: {},
    create: { name: 'Electronics & Communication' }
  });
  const deptME = await prisma.department.upsert({
    where: { name: 'Mechanical Engineering' },
    update: {},
    create: { name: 'Mechanical Engineering' }
  });

  // ── Subjects ─────────────────────────────────────────────────────────────
  const subjectDB  = await prisma.subject.upsert({ where: { name: 'Database Management Systems' }, update: {}, create: { name: 'Database Management Systems', departmentId: deptCS.id } });
  const subjectOS  = await prisma.subject.upsert({ where: { name: 'Operating Systems' },           update: {}, create: { name: 'Operating Systems',           departmentId: deptCS.id } });
  const subjectCN  = await prisma.subject.upsert({ where: { name: 'Computer Networks' },           update: {}, create: { name: 'Computer Networks',           departmentId: deptCS.id } });
  const subjectDS  = await prisma.subject.upsert({ where: { name: 'Data Structures' },             update: {}, create: { name: 'Data Structures',             departmentId: deptCS.id } });
  const subjectEC1 = await prisma.subject.upsert({ where: { name: 'Analog Electronics' },          update: {}, create: { name: 'Analog Electronics',          departmentId: deptEC.id } });
  const subjectEC2 = await prisma.subject.upsert({ where: { name: 'Digital Signal Processing' },   update: {}, create: { name: 'Digital Signal Processing',   departmentId: deptEC.id } });
  const subjectME1 = await prisma.subject.upsert({ where: { name: 'Thermodynamics' },              update: {}, create: { name: 'Thermodynamics',              departmentId: deptME.id } });

  // ── Principal ─────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'principal@college.edu' },
    update: {},
    create: { email: 'principal@college.edu', passwordHash: defaultPassword, role: 'PRINCIPAL', name: 'Dr. Anita Sharma' }
  });

  // ── HODs ─────────────────────────────────────────────────────────────────
  await prisma.user.upsert({ where: { email: 'hod.cs@college.edu' }, update: {}, create: { email: 'hod.cs@college.edu', passwordHash: defaultPassword, role: 'HOD', name: 'Dr. Rajesh Kumar', departmentId: deptCS.id } });
  await prisma.user.upsert({ where: { email: 'hod.ec@college.edu' }, update: {}, create: { email: 'hod.ec@college.edu', passwordHash: defaultPassword, role: 'HOD', name: 'Dr. Priya Nair', departmentId: deptEC.id } });
  await prisma.user.upsert({ where: { email: 'hod.me@college.edu' }, update: {}, create: { email: 'hod.me@college.edu', passwordHash: defaultPassword, role: 'HOD', name: 'Dr. Suresh Patel', departmentId: deptME.id } });

  // ── Faculty ──────────────────────────────────────────────────────────────
  const faculty1 = await prisma.user.upsert({ where: { email: 'faculty1@college.edu' }, update: {}, create: { email: 'faculty1@college.edu', passwordHash: defaultPassword, role: 'FACULTY', name: 'Prof. Ramesh Iyer', departmentId: deptCS.id } });
  const faculty2 = await prisma.user.upsert({ where: { email: 'faculty2@college.edu' }, update: {}, create: { email: 'faculty2@college.edu', passwordHash: defaultPassword, role: 'FACULTY', name: 'Prof. Meena Joshi', departmentId: deptCS.id } });
  const faculty3 = await prisma.user.upsert({ where: { email: 'faculty3@college.edu' }, update: {}, create: { email: 'faculty3@college.edu', passwordHash: defaultPassword, role: 'FACULTY', name: 'Prof. Vivek Mishra', departmentId: deptEC.id } });
  const faculty4 = await prisma.user.upsert({ where: { email: 'faculty4@college.edu' }, update: {}, create: { email: 'faculty4@college.edu', passwordHash: defaultPassword, role: 'FACULTY', name: 'Prof. Kavitha Rao', departmentId: deptME.id } });

  // Faculty ↔ Subject assignments
  const fsSeed = [
    { facultyId: faculty1.id, subjectId: subjectDB.id },
    { facultyId: faculty1.id, subjectId: subjectCN.id },
    { facultyId: faculty2.id, subjectId: subjectOS.id },
    { facultyId: faculty2.id, subjectId: subjectDS.id },
    { facultyId: faculty3.id, subjectId: subjectEC1.id },
    { facultyId: faculty3.id, subjectId: subjectEC2.id },
    { facultyId: faculty4.id, subjectId: subjectME1.id },
  ];
  for (const fs of fsSeed) {
    await prisma.facultySubject.upsert({ where: { facultyId_subjectId: fs }, update: {}, create: fs });
  }

  // ── Students ─────────────────────────────────────────────────────────────
  const student1 = await prisma.user.upsert({ where: { email: 'student1@college.edu' }, update: {}, create: { email: 'student1@college.edu', passwordHash: defaultPassword, role: 'STUDENT', name: 'Arjun Mehta', departmentId: deptCS.id } });
  const student2 = await prisma.user.upsert({ where: { email: 'student2@college.edu' }, update: {}, create: { email: 'student2@college.edu', passwordHash: defaultPassword, role: 'STUDENT', name: 'Sneha Desai', departmentId: deptCS.id } });
  const student3 = await prisma.user.upsert({ where: { email: 'student3@college.edu' }, update: {}, create: { email: 'student3@college.edu', passwordHash: defaultPassword, role: 'STUDENT', name: 'Rohit Verma', departmentId: deptEC.id } });

  // Student ↔ Subject enrollments
  const ssSeed = [
    { studentId: student1.id, subjectId: subjectDB.id },
    { studentId: student1.id, subjectId: subjectOS.id },
    { studentId: student1.id, subjectId: subjectCN.id },
    { studentId: student2.id, subjectId: subjectDB.id },
    { studentId: student2.id, subjectId: subjectDS.id },
    { studentId: student3.id, subjectId: subjectEC1.id },
    { studentId: student3.id, subjectId: subjectEC2.id },
  ];
  for (const ss of ssSeed) {
    await prisma.studentSubject.upsert({ where: { studentId_subjectId: ss }, update: {}, create: ss });
  }

  // ── System Settings ───────────────────────────────────────────────────────
  const now = new Date();
  await prisma.systemSettings.upsert({
    where: { id: 'GLOBAL' },
    update: {},
    create: { id: 'GLOBAL', feedbackEnabled: true, currentMonth: now.getMonth() + 1, currentYear: now.getFullYear() }
  });

  // ── Sample Feedback ───────────────────────────────────────────────────────
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();
  const sampleFeedbacks = [
    { subjectId: subjectDB.id,  facultyId: faculty1.id, teachingClarity: 5, engagement: 4, punctuality: 5, subjectKnowledge: 5, comments: 'Excellent explanations! Really understood SQL joins.', sentiment: 'POSITIVE' },
    { subjectId: subjectDB.id,  facultyId: faculty1.id, teachingClarity: 4, engagement: 4, punctuality: 4, subjectKnowledge: 5, comments: 'Good coverage of normalization topics.', sentiment: 'POSITIVE' },
    { subjectId: subjectCN.id,  facultyId: faculty1.id, teachingClarity: 3, engagement: 3, punctuality: 4, subjectKnowledge: 4, comments: 'Networking concepts need more real-world examples.', sentiment: 'NEUTRAL' },
    { subjectId: subjectOS.id,  facultyId: faculty2.id, teachingClarity: 4, engagement: 5, punctuality: 5, subjectKnowledge: 4, comments: 'Very engaging and interactive sessions!', sentiment: 'POSITIVE' },
    { subjectId: subjectDS.id,  facultyId: faculty2.id, teachingClarity: 2, engagement: 2, punctuality: 3, subjectKnowledge: 3, comments: 'Lectures are too fast, hard to keep up.', sentiment: 'NEGATIVE' },
    { subjectId: subjectEC1.id, facultyId: faculty3.id, teachingClarity: 5, engagement: 5, punctuality: 5, subjectKnowledge: 5, comments: 'Best professor in the department!', sentiment: 'POSITIVE' },
    { subjectId: subjectME1.id, facultyId: faculty4.id, teachingClarity: 4, engagement: 3, punctuality: 4, subjectKnowledge: 4, comments: 'Good fundamentals coverage.', sentiment: 'POSITIVE' },
  ];

  for (const fb of sampleFeedbacks) {
    await prisma.feedback.create({ data: { ...fb, month, year } });
  }

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Demo Credentials (all passwords: password123)');
  console.log('  Principal : principal@college.edu');
  console.log('  HOD (CS)  : hod.cs@college.edu');
  console.log('  HOD (EC)  : hod.ec@college.edu');
  console.log('  Faculty 1 : faculty1@college.edu');
  console.log('  Faculty 2 : faculty2@college.edu');
  console.log('  Student 1 : student1@college.edu');
  console.log('  Student 2 : student2@college.edu');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
