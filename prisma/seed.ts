const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = await bcrypt.hash('password123', 10);

  // Departments
  const deptCS = await prisma.department.create({
    data: { name: 'Computer Science' }
  });

  // Subjects
  const subjectDB = await prisma.subject.create({
    data: { name: 'Database Management Systems', departmentId: deptCS.id }
  });
  
  const subjectOS = await prisma.subject.create({
    data: { name: 'Operating Systems', departmentId: deptCS.id }
  });

  // Principal
  await prisma.user.create({
    data: {
      email: 'principal@college.edu',
      passwordHash: defaultPassword,
      role: 'PRINCIPAL',
      name: 'Dr. Principal',
    }
  });

  // HOD
  const hodCS = await prisma.user.create({
    data: {
      email: 'hod.cs@college.edu',
      passwordHash: defaultPassword,
      role: 'HOD',
      name: 'Dr. HOD CS',
      departmentId: deptCS.id
    }
  });

  // Faculty
  const faculty1 = await prisma.user.create({
    data: {
      email: 'faculty1@college.edu',
      passwordHash: defaultPassword,
      role: 'FACULTY',
      name: 'Prof. Faculty One',
      departmentId: deptCS.id
    }
  });

  await prisma.facultySubject.create({
    data: { facultyId: faculty1.id, subjectId: subjectDB.id }
  });

  // Student
  const student1 = await prisma.user.create({
    data: {
      email: 'student1@college.edu',
      passwordHash: defaultPassword,
      role: 'STUDENT',
      name: 'Student One',
      departmentId: deptCS.id
    }
  });

  await prisma.studentSubject.create({
    data: { studentId: student1.id, subjectId: subjectDB.id }
  });
  
  await prisma.studentSubject.create({
    data: { studentId: student1.id, subjectId: subjectOS.id }
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
