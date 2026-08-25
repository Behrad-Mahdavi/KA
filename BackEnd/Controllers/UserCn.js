import catchAsync from '../Utils/catchAsync.js';
import prisma from '../Utils/prisma.js';
import HandleERROR from '../Utils/handleError.js';

export const getUserSummaryStats = catchAsync(async (req, res, next) => {
  const stats = await prisma.user.aggregate({
    where: { role: 'student' },
    _sum: { score: true }
  });
  res.status(200).json({ success: true, data: { totalScore: stats._sum.score || 0 } });
});

export const getAllStudentsForSelection = catchAsync(async (req, res, next) => {
  const { grade } = req.query;
  const where = { role: 'student' };
  if (grade && ['دهم', 'یازدهم', 'دوازدهم'].includes(grade)) {
    where.grade = grade;
  }

  const students = await prisma.user.findMany({
    where,
    select: {
      id: true,
      fullName: true,
      grade: true,
      class: true
    },
    orderBy: { fullName: 'asc' }
  });

  const studentsForDropdown = students.map(student => ({
    value: student.id,
    label: `${student.fullName} - پایه ${student.grade || ''} - کلاس ${student.class || 'نامشخص'}`,
    rawData: student
  }));

  res.status(200).json({
    success: true,
    results: students.length,
    data: studentsForDropdown
  });
});

export const findStudentByDetails = catchAsync(async (req, res, next) => {
  const { grade, class: classNumber, fullName } = req.query;
  if (!grade || !classNumber || !fullName) {
    return next(new HandleERROR('پایه، کلاس و نام دانش‌آموز الزامی است.', 400));
  }

  const student = await prisma.user.findFirst({
    where: {
      role: 'student',
      grade: grade,
      class: parseInt(classNumber, 10),
      fullName: {
        contains: fullName.trim(),
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      fullName: true,
      idCode: true,
      grade: true,
      class: true
    }
  });

  if (!student) {
    return next(new HandleERROR('دانش‌آموزی با این مشخصات یافت نشد.', 404));
  }
  res.status(200).json({ success: true, data: student });
});

export const getTopStudentsByAllGrades = catchAsync(async (req, res, next) => {
  const limitPerGrade = parseInt(req.query.limit, 10) || 3;
  const grades = ['دهم', 'یازدهم', 'دوازدهم'];

  const results = await Promise.all(
    grades.map(async (grade) => {
      const topStudents = await prisma.user.findMany({
        where: { role: 'student', grade },
        select: {
          id: true,
          fullName: true,
          grade: true,
          class: true,
          score: true,
          rankInGrade: true,
          rankInSchool: true
        },
        orderBy: { score: 'desc' },
        take: limitPerGrade
      });
      return { grade, students: topStudents };
    })
  );

  const finalData = {};
  results.forEach(r => {
    finalData[r.grade] = r.students;
  });

  res.status(200).json({ success: true, data: finalData });
});

export const getStudentsByGradeAndClass = catchAsync(async (req, res, next) => {
  const { grade, class: classId, classNum } = req.query;
  const targetClass = classId || classNum;
  const where = { role: 'student' };
  if (grade) where.grade = grade;
  if (targetClass) where.class = parseInt(targetClass, 10);

  const students = await prisma.user.findMany({
    where,
    select: {
      id: true,
      fullName: true,
      grade: true,
      class: true,
      score: true,
      token: true,
      rankInClass: true,
      rankInGrade: true,
      rankInSchool: true
    },
    orderBy: { score: 'desc' }
  });

  res.status(200).json({
    success: true,
    results: students.length,
    data: students
  });
});

export const getOverallRankingTable = catchAsync(async (req, res, next) => {
  const students = await prisma.user.findMany({
    where: { role: 'student' },
    select: {
      id: true,
      fullName: true,
      grade: true,
      class: true,
      score: true,
      token: true,
      rankInSchool: true,
      rankInGrade: true,
      rankInClass: true,
      studentActivities: {
        where: { status: 'approved' },
        include: { activity: { select: { parent: true } } }
      },
      adminActivities: {
        include: { activity: { select: { parent: true } } }
      }
    },
    orderBy: { score: 'desc' }
  });

  const formattedData = students.map((u, idx) => {
    let educational = 0;
    let voluntary = 0;
    let job = 0;
    let deductions = 0;

    const addScore = (parent, score) => {
      if (parent === 'فعالیت‌های آموزشی') educational += score;
      else if (parent === 'فعالیت‌های داوطلبانه و توسعه فردی') voluntary += score;
      else if (parent === 'فعالیت‌های شغلی') job += score;
      else if (parent === 'موارد کسر امتیاز') deductions += score;
    };

    (u.studentActivities || []).forEach(sa => addScore(sa.activity?.parent, sa.scoreAwarded || 0));
    (u.adminActivities || []).forEach(aa => addScore(aa.activity?.parent, aa.scoreAwarded || 0));

    return {
      id: u.id,
      _id: u.id,
      userId: u.id,
      name: u.fullName,
      fullName: u.fullName,
      code: u.class || 'N/A',
      class: u.class || 'N/A',
      score: u.score,
      token: u.token,
      rank: u.rankInSchool || idx + 1,
      rankInSchool: u.rankInSchool || idx + 1,
      rankInGrade: u.rankInGrade,
      rankInClass: u.rankInClass,
      grade: u.grade,
      educationalActivities: educational,
      voluntaryActivities: voluntary,
      jobActivities: job,
      deductions: deductions
    };
  });

  res.status(200).json({ success: true, totalCount: formattedData.length, data: formattedData });
});

export const getSameGradeRankingTable = catchAsync(async (req, res, next) => {
  let { grade } = req.query;
  if (!grade && req.userId) {
    const me = await prisma.user.findUnique({ where: { id: req.userId } });
    if (me?.grade) grade = me.grade;
  }
  const where = { role: 'student' };
  if (grade) where.grade = grade;

  const students = await prisma.user.findMany({
    where,
    select: {
      id: true,
      fullName: true,
      grade: true,
      class: true,
      score: true,
      token: true,
      rankInGrade: true,
      rankInSchool: true,
      studentActivities: {
        where: { status: 'approved' },
        include: { activity: { select: { parent: true } } }
      },
      adminActivities: {
        include: { activity: { select: { parent: true } } }
      }
    },
    orderBy: { score: 'desc' }
  });

  const formattedData = students.map((u, idx) => {
    let educational = 0;
    let voluntary = 0;
    let job = 0;
    let deductions = 0;

    const addScore = (parent, score) => {
      if (parent === 'فعالیت‌های آموزشی') educational += score;
      else if (parent === 'فعالیت‌های داوطلبانه و توسعه فردی') voluntary += score;
      else if (parent === 'فعالیت‌های شغلی') job += score;
      else if (parent === 'موارد کسر امتیاز') deductions += score;
    };

    (u.studentActivities || []).forEach(sa => addScore(sa.activity?.parent, sa.scoreAwarded || 0));
    (u.adminActivities || []).forEach(aa => addScore(aa.activity?.parent, aa.scoreAwarded || 0));

    return {
      id: u.id,
      _id: u.id,
      userId: u.id,
      name: u.fullName,
      fullName: u.fullName,
      code: u.class || 'N/A',
      class: u.class || 'N/A',
      score: u.score,
      token: u.token,
      rank: u.rankInGrade || idx + 1,
      rankInGrade: u.rankInGrade || idx + 1,
      rankInSchool: u.rankInSchool || idx + 1,
      grade: u.grade,
      educationalActivities: educational,
      voluntaryActivities: voluntary,
      jobActivities: job,
      deductions: deductions
    };
  });

  res.status(200).json({ success: true, totalCount: formattedData.length, data: formattedData });
});


export const getGradeRankingTable = catchAsync(async (req, res, next) => {
  return getSameGradeRankingTable(req, res, next);
});

export const getStudentById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      idCode: true,
      role: true,
      grade: true,
      fieldOfStudy: true,
      class: true,
      score: true,
      token: true,
      rankInSchool: true,
      rankInGrade: true,
      rankInClass: true,
      createdAt: true
    }
  });

  if (!user) {
    return next(new HandleERROR('کاربر یافت نشد.', 404));
  }

  res.status(200).json({ success: true, data: user });
});

export const getStudentActivitiesByParent = catchAsync(async (req, res, next) => {
  const { id: userId } = req.params;
  const { parent } = req.query;

  const studentActivities = await prisma.studentActivity.findMany({
    where: {
      userId,
      activity: parent ? { parent } : undefined
    },
    include: {
      activity: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const adminActivities = await prisma.adminActivity.findMany({
    where: {
      userId,
      activity: parent ? { parent } : undefined
    },
    include: {
      activity: true
    },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({
    success: true,
    data: {
      studentActivities,
      adminActivities
    }
  });
});

export const getStudentActivitiesByCategory = catchAsync(async (req, res, next) => {
  return getStudentActivitiesByParent(req, res, next);
});