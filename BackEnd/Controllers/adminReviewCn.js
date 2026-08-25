import catchAsync from '../Utils/catchAsync.js';
import prisma from '../Utils/prisma.js';
import HandleERROR from '../Utils/handleError.js';
import { updateUserScore } from "../Utils/UpdateScore.js";

export const getStudentActivityStatsForAdmin = catchAsync(async (req, res, next) => {
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
        prisma.studentActivity.count({ where: { status: 'pending' } }),
        prisma.studentActivity.count({ where: { status: 'approved' } }),
        prisma.studentActivity.count({ where: { status: 'rejected' } })
    ]);

    const totalRequests = pendingCount + approvedCount + rejectedCount;

    res.status(200).json({
        success: true,
        data: {
            pendingCount,
            approvedCount,
            totalRequests
        }
    });
});

export const getAllStudentActivitiesForReview = catchAsync(async (req, res, next) => {
    const {
        status, activityParent, activityName, studentName,
        sortBy = 'createdAt', order = 'desc', page = 1, limit = 10
    } = req.query;

    const where = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        where.status = status;
    }
    if (activityParent || activityName) {
        where.activity = {};
        if (activityParent) where.activity.parent = activityParent;
        if (activityName) where.activity.name = { contains: activityName, mode: 'insensitive' };
    }
    if (studentName) {
        where.user = { fullName: { contains: studentName, mode: 'insensitive' } };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [totalActivities, activities] = await Promise.all([
        prisma.studentActivity.count({ where }),
        prisma.studentActivity.findMany({
            where,
            include: {
                user: { select: { id: true, fullName: true, grade: true, class: true, idCode: true } },
                activity: true
            },
            orderBy: { createdAt: order === 'asc' ? 'asc' : 'desc' },
            skip,
            take: limitNum
        })
    ]);

    const formatted = activities.map(item => ({
        _id: item.id,
        id: item.id,
        activityId: item.activityId,
        details: item.details,
        status: item.status,
        scoreAwarded: item.scoreAwarded,
        adminComment: item.adminComment,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        submissionDate: item.createdAt,
        activityName: item.activity?.name,
        activityTitle: item.activity?.name,
        activityParent: item.activity?.parent,
        activityDefinition: item.activity,
        studentName: item.user?.fullName,
        studentIdCode: item.user?.idCode,
        studentGrade: item.user?.grade,
        studentClass: item.user?.class,
        userId: item.user?.id
    }));

    res.status(200).json({
        success: true,
        results: formatted.length,
        totalCount: totalActivities,
        currentPage: pageNum,
        totalPages: Math.ceil(totalActivities / limitNum),
        data: formatted
    });
});

export const approveStudentActivity = catchAsync(async (req, res, next) => {
    const { studentActivityId, id } = req.params;
    const targetId = studentActivityId || id;
    const { adminComment, scoreAwarded } = req.body;

    const currentRecord = await prisma.studentActivity.findUnique({
        where: { id: targetId },
        include: { activity: true, user: true }
    });

    if (!currentRecord) {
        return next(new HandleERROR("رکورد فعالیت یافت نشد.", 404));
    }

    let finalScore = currentRecord.scoreAwarded;
    if (scoreAwarded !== undefined) {
        finalScore = parseFloat(scoreAwarded);
    } else {
        const scoreDef = currentRecord.activity?.scoreDefinition || {};
        if (scoreDef.inputType === 'select_from_enum' && Array.isArray(scoreDef.enumOptions)) {
            const matched = scoreDef.enumOptions.find(o => o.label === currentRecord.details);
            if (matched) finalScore = matched.value;
        } else if (scoreDef.inputType === 'calculated_from_value') {
            const num = parseFloat(currentRecord.details);
            if (!isNaN(num)) finalScore = num * (scoreDef.multiplier || 1);
        }
    }

    const updated = await prisma.studentActivity.update({
        where: { id: targetId },
        data: {
            status: 'approved',
            adminComment: adminComment || '',
            scoreAwarded: finalScore
        }
    });

    await updateUserScore(currentRecord.userId);

    try {
        await prisma.notification.create({
            data: {
                userId: currentRecord.userId,
                activityId: currentRecord.id,
                title: 'تایید فعالیت',
                message: `فعالیت "${currentRecord.activity?.name}" تایید شد و ${finalScore} امتیاز دریافت کردید.`,
                type: 'activity_status',
                relatedLink: '/activities',
                relatedDocId: currentRecord.id
            }
        });
    } catch (notifErr) {
        console.error('Error creating student notification:', notifErr);
    }

    res.status(200).json({
        success: true,
        message: "فعالیت با موفقیت تایید شد.",
        data: updated
    });
});

export const rejectStudentActivity = catchAsync(async (req, res, next) => {
    const { studentActivityId, id } = req.params;
    const targetId = studentActivityId || id;
    const { adminComment } = req.body;

    const currentRecord = await prisma.studentActivity.findUnique({
        where: { id: targetId },
        include: { activity: true }
    });

    if (!currentRecord) {
        return next(new HandleERROR("رکورد فعالیت یافت نشد.", 404));
    }

    const updated = await prisma.studentActivity.update({
        where: { id: targetId },
        data: {
            status: 'rejected',
            adminComment: adminComment || '',
            scoreAwarded: 0
        }
    });

    await updateUserScore(currentRecord.userId);

    try {
        await prisma.notification.create({
            data: {
                userId: currentRecord.userId,
                activityId: currentRecord.id,
                title: 'رد درخواست فعالیت',
                message: `درخواست فعالیت "${currentRecord.activity?.name}" رد شد. توضیح: ${adminComment || 'ندارد'}`,
                type: 'activity_status',
                relatedLink: '/activities',
                relatedDocId: currentRecord.id
            }
        });
    } catch (notifErr) {
        console.error('Error creating student notification:', notifErr);
    }

    res.status(200).json({
        success: true,
        message: "فعالیت رد شد.",
        data: updated
    });
});