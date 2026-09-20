import catchAsync from "../Utils/catchAsync.js";
import prisma from "../Utils/prisma.js";
import updateStudentRankings from "../Utils/updateRanks.js";

/**
 * @desc Get Unified Leaderboard with Multi-dimensional Filters:
 *       - branch: 'پسرانه' | 'دخترانه'
 *       - grade: 'دهم' | 'یازدهم' | 'دوازدهم'
 *       - class: 101, 102, 201, etc.
 *       - search: search query by student fullName or idCode
 *       - page, limit
 */
export const getLeaderboard = catchAsync(async (req, res, next) => {
  const {
    branch,
    grade,
    class: classNum,
    classId,
    search,
    page = 1,
    limit = 50,
    sortBy = 'score',
    order = 'desc'
  } = req.query;

  const targetClass = classNum || classId;

  const where = {
    role: 'student'
  };

  if (branch && branch !== 'all') {
    where.branch = branch;
  }

  if (grade && grade !== 'all') {
    where.grade = grade;
  }

  if (targetClass && targetClass !== 'all') {
    const parsedClass = parseInt(targetClass, 10);
    if (!isNaN(parsedClass)) {
      where.class = parsedClass;
    }
  }

  if (search && search.trim() !== '') {
    where.OR = [
      { fullName: { contains: search.trim(), mode: 'insensitive' } },
      { idCode: { contains: search.trim() } }
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = parseInt(limit, 10);
  const isAll = limitNum === 0 || limit === 'all';

  const totalCount = await prisma.user.count({ where });

  const queryOptions = {
    where,
    select: {
      id: true,
      fullName: true,
      idCode: true,
      image: true,
      gender: true,
      branch: true,
      grade: true,
      class: true,
      fieldOfStudy: true,
      score: true,
      token: true,
      rankInSchool: true,
      rankInBranch: true,
      rankInGrade: true,
      rankInClass: true,
      studentActivities: {
        where: { status: 'approved' },
        select: {
          scoreAwarded: true,
          activity: { select: { parent: true } }
        }
      },
      adminActivities: {
        select: {
          scoreAwarded: true,
          activity: { select: { parent: true } }
        }
      }
    },
    orderBy: {
      [sortBy === 'rank' ? 'score' : sortBy]: order === 'asc' ? 'asc' : 'desc'
    }
  };

  if (!isAll && limitNum > 0) {
    queryOptions.skip = (pageNum - 1) * limitNum;
    queryOptions.take = limitNum;
  }

  const rawStudents = await prisma.user.findMany(queryOptions);

  const students = rawStudents.map((u, index) => {
    let educational = 0;
    let voluntary = 0;
    let job = 0;
    let deductions = 0;

    const addScore = (parent, scoreVal) => {
      const s = scoreVal || 0;
      if (parent === 'فعالیت‌های آموزشی') educational += s;
      else if (parent === 'فعالیت‌های داوطلبانه و توسعه فردی') voluntary += s;
      else if (parent === 'فعالیت‌های شغلی') job += s;
      else if (parent === 'موارد کسر امتیاز') deductions += s;
    };

    (u.studentActivities || []).forEach(sa => addScore(sa.activity?.parent, sa.scoreAwarded));
    (u.adminActivities || []).forEach(aa => addScore(aa.activity?.parent, aa.scoreAwarded));

    const filterRank = isAll ? index + 1 : (pageNum - 1) * (limitNum || 50) + index + 1;
    const spendableToken = Math.floor(u.score * 0.95);

    return {
      id: u.id,
      rank: filterRank,
      fullName: u.fullName,
      image: u.image,
      gender: u.gender || 'male',
      branch: u.branch || 'پسرانه',
      grade: u.grade,
      class: u.class,
      fieldOfStudy: u.fieldOfStudy,
      score: u.score,
      token: spendableToken,
      spendableTokens: spendableToken,
      rawToken: u.token,
      rankInSchool: u.rankInSchool || filterRank,
      rankInBranch: u.rankInBranch || filterRank,
      rankInGrade: u.rankInGrade,
      rankInClass: u.rankInClass,
      approvedActivitiesCount: (u.studentActivities?.length || 0) + (u.adminActivities?.length || 0),
      breakdown: {
        educational,
        voluntary,
        job,
        deductions
      }
    };
  });

  res.status(200).json({
    success: true,
    filters: {
      branch: branch || 'all',
      grade: grade || 'all',
      class: targetClass ? parseInt(targetClass, 10) : 'all',
      search: search || null
    },
    pagination: {
      total: totalCount,
      page: pageNum,
      limit: isAll ? totalCount : limitNum,
      totalPages: isAll ? 1 : Math.ceil(totalCount / (limitNum || 50))
    },
    data: students
  });
});

/**
 * @desc Summary & Metadata for Leaderboard tabs and quick views:
 *       - Branches, Grades, Classes breakdown
 *       - Top 3 Overall, Top 3 Boys, Top 3 Girls, Top 3 per Grade
 */
export const getLeaderboardSummary = catchAsync(async (req, res, next) => {
  const students = await prisma.user.findMany({
    where: { role: 'student' },
    select: {
      id: true,
      fullName: true,
      gender: true,
      branch: true,
      grade: true,
      class: true,
      score: true,
      rankInSchool: true,
      rankInBranch: true,
      rankInGrade: true,
      rankInClass: true
    },
    orderBy: { score: 'desc' }
  });

  const branches = ['پسرانه', 'دخترانه'];
  const grades = ['دهم', 'یازدهم', 'دوازدهم'];

  // Calculate classes dynamically
  const classesByGrade = {
    'دهم': [...new Set(students.filter(s => s.grade === 'دهم' && s.class).map(s => s.class))].sort((a, b) => a - b),
    'یازدهم': [...new Set(students.filter(s => s.grade === 'یازدهم' && s.class).map(s => s.class))].sort((a, b) => a - b),
    'دوازدهم': [...new Set(students.filter(s => s.grade === 'دوازدهم' && s.class).map(s => s.class))].sort((a, b) => a - b)
  };

  const formatStudent = (s, rank) => ({
    id: s.id,
    rank: rank || s.rankInSchool,
    fullName: s.fullName,
    branch: s.branch || 'پسرانه',
    grade: s.grade,
    class: s.class,
    score: s.score,
    spendableTokens: Math.floor(s.score * 0.95)
  });

  const topOverall = students.slice(0, 3).map((s, idx) => formatStudent(s, idx + 1));
  const topBoys = students.filter(s => s.branch === 'پسرانه').slice(0, 3).map((s, idx) => formatStudent(s, idx + 1));
  const topGirls = students.filter(s => s.branch === 'دخترانه').slice(0, 3).map((s, idx) => formatStudent(s, idx + 1));

  const topByGrade = {};
  grades.forEach(g => {
    topByGrade[g] = students.filter(s => s.grade === g).slice(0, 3).map((s, idx) => formatStudent(s, idx + 1));
  });

  res.status(200).json({
    success: true,
    totalStudents: students.length,
    structure: {
      branches,
      grades,
      classesByGrade
    },
    topPerformers: {
      overall: topOverall,
      boys: topBoys,
      girls: topGirls,
      byGrade: topByGrade
    }
  });
});

/**
 * @desc Recalculate all rankings in DB (Dense Rank across School, Branch, Grade, Class)
 */
export const triggerRecalculateRanks = catchAsync(async (req, res, next) => {
  await updateStudentRankings(prisma);
  res.status(200).json({
    success: true,
    message: "رتبه‌بندی تمام دانش‌آموزان بر اساس مدرسه، شعبه، پایه و کلاس با موفقیت به‌روزرسانی شد."
  });
});
