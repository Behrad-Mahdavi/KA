import catchAsync from "../Utils/catchAsync.js";
import prisma from "../Utils/prisma.js";
import { updateUserScore } from "../Utils/UpdateScore.js";
import HandleERROR from "../Utils/handleError.js";

export const getMyActivitiesList = catchAsync(async (req, res, next) => {
    const userId = req.userId;
    const { status, activityTitle, sortBy = 'submissionDate', order = 'desc', page = 1, limit = 10, entryType } = req.query;

    let studentActivities = [];
    let adminActivities = [];

    if (!entryType || entryType === 'student') {
        const where = { userId };
        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            where.status = status;
        }
        if (activityTitle) {
            where.activity = { name: { contains: activityTitle, mode: 'insensitive' } };
        }

        const rawStudentActs = await prisma.studentActivity.findMany({
            where,
            include: { activity: true },
            orderBy: { createdAt: order === 'asc' ? 'asc' : 'desc' }
        });

        studentActivities = rawStudentActs.map(sa => ({
            _id: sa.id,
            id: sa.id,
            activityName: sa.activity?.name || 'نامشخص',
            details: sa.details,
            submissionDate: sa.createdAt,
            reviewDate: sa.updatedAt,
            status: sa.status,
            scoreAwarded: sa.scoreAwarded,
            adminComment: sa.adminComment,
            type: 'ثبت توسط دانش‌آموز',
            sortDate: sa.createdAt
        }));
    }

    if (!entryType || entryType === 'admin') {
        const where = { userId };
        if (activityTitle) {
            where.activity = { name: { contains: activityTitle, mode: 'insensitive' } };
        }

        const rawAdminActs = await prisma.adminActivity.findMany({
            where,
            include: { activity: true },
            orderBy: { createdAt: order === 'asc' ? 'asc' : 'desc' }
        });

        adminActivities = rawAdminActs.map(aa => ({
            _id: aa.id,
            id: aa.id,
            activityName: aa.activity?.name || 'نامشخص',
            details: aa.details,
            submissionDate: aa.createdAt,
            reviewDate: aa.updatedAt,
            status: 'ثبت توسط ادمین',
            scoreAwarded: aa.scoreAwarded,
            type: 'ثبت توسط ادمین',
            sortDate: aa.createdAt
        }));
    }

    let combined = [...studentActivities, ...adminActivities];
    combined.sort((a, b) => {
        const fieldA = sortBy === 'activityName' ? a.activityName : a.sortDate;
        const fieldB = sortBy === 'activityName' ? b.activityName : b.sortDate;
        if (order === 'asc') return fieldA > fieldB ? 1 : -1;
        return fieldA < fieldB ? 1 : -1;
    });

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = combined.slice(startIndex, startIndex + limitNum);
    const totalCount = combined.length;

    res.status(200).json({
        success: true,
        results: paginated.length,
        totalCount: totalCount,
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        data: paginated
    });
});

export const getMyActivityStats = catchAsync(async (req, res, next) => {
    const userId = req.userId;

    const [pendingCount, approvedCount, rejectedCount, adminTotal] = await Promise.all([
        prisma.studentActivity.count({ where: { userId, status: 'pending' } }),
        prisma.studentActivity.count({ where: { userId, status: 'approved' } }),
        prisma.studentActivity.count({ where: { userId, status: 'rejected' } }),
        prisma.adminActivity.count({ where: { userId } })
    ]);

    const totalStudentSubmitted = pendingCount + approvedCount + rejectedCount;

    res.status(200).json({
        success: true,
        data: {
            pendingStudentActivities: pendingCount,
            approvedStudentActivities: approvedCount,
            totalStudentSubmitted,
            totalAdminAssigned: adminTotal,
            totalAllActivities: totalStudentSubmitted + adminTotal
        }
    });
});

export const changeStatusAc = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status, adminComment = "Your Request Seen" } = req.body;

    const studentActivity = await prisma.studentActivity.update({
        where: { id },
        data: {
            status,
            adminComment
        }
    });

    await updateUserScore(studentActivity.userId);

    return res.status(200).json({
        data: studentActivity,
        success: true,
        message: "change status Successfully"
    });
});

export const createStudentActivity = catchAsync(async (req, res, next) => {
    const { activityId, details, scoreAwarded = 0 } = req.body;

    if (!activityId) {
        return next(new HandleERROR("شناسه فعالیت الزامی است.", 400));
    }

    const activityExists = await prisma.activity.findUnique({
        where: { id: activityId }
    });
    
    if (!activityExists) {
        return next(new HandleERROR("فعالیت مورد نظر یافت نشد.", 404));
    }

    const newStudentActivity = await prisma.studentActivity.create({
        data: {
            userId: req.userId,
            activityId,
            details: details !== undefined ? String(details) : '',
            scoreAwarded: parseFloat(scoreAwarded) || 0,
            status: 'pending'
        }
    });

    try {
        const admins = await prisma.user.findMany({
            where: { role: { in: ['admin', 'superAdmin'] } },
            select: { id: true }
        });

        const student = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { fullName: true }
        });

        const activityDef = await prisma.activity.findUnique({
            where: { id: activityId },
            select: { name: true }
        });

        const studentName = student ? student.fullName : 'یک دانش‌آموز';
        const activityName = activityDef ? activityDef.name : 'یک فعالیت';

        if (admins.length > 0) {
            await prisma.notification.createMany({
                data: admins.map(admin => ({
                    userId: admin.id,
                    activityId: newStudentActivity.id,
                    title: `درخواست فعالیت جدید از ${studentName}`,
                    message: `فعالیت "${activityName}" برای بررسی ثبت شده است.`,
                    type: 'new_activity_submission',
                    relatedLink: `/activities`,
                    relatedDocId: newStudentActivity.id,
                    iconBgColor: 'bg-blue-500'
                }))
            });
        }
    } catch (notificationError) {
        console.error('خطا در ایجاد اعلان فعالیت برای ادمین‌ها:', notificationError);
    }

    res.status(201).json({
        success: true,
        message: "فعالیت شما با موفقیت ثبت و برای بررسی ارسال شد.",
        data: newStudentActivity
    });
});

export const getAllStudentActivities = catchAsync(async (req, res, next) => {
    const { status, userId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const studentActivities = await prisma.studentActivity.findMany({
        where,
        include: {
            user: { select: { id: true, fullName: true, grade: true, class: true } },
            activity: true
        },
        orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
        success: true,
        data: studentActivities
    });
});

export const getOneStudentActivity = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const studentActivity = await prisma.studentActivity.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, fullName: true, grade: true, class: true } },
            activity: true
        }
    });
    return res.status(200).json({
        data: studentActivity,
        success: true
    });
});

export const getPendingStudentActivitiesAggregated = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit, 10) || 6;

    const pendingActivities = await prisma.studentActivity.findMany({
        where: { status: 'pending' },
        include: {
            user: { select: { id: true, fullName: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
    });

    const formatted = pendingActivities.map(pa => ({
        _id: pa.id,
        id: pa.id,
        activityId: pa.activityId,
        details: pa.details,
        status: pa.status,
        scoreAwarded: pa.scoreAwarded,
        adminComment: pa.adminComment,
        createdAt: pa.createdAt,
        updatedAt: pa.updatedAt,
        userFullName: pa.user?.fullName,
        userId: pa.user?.id
    }));

    res.status(200).json({
        success: true,
        results: formatted.length,
        data: formatted
    });
});
