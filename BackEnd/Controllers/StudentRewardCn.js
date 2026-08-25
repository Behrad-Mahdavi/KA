import catchAsync from "../Utils/catchAsync.js";
import prisma from "../Utils/prisma.js";
import HandleERROR from "../Utils/handleError.js";

export const createStudentReward = catchAsync(async (req, res, next) => {
    const { rewardId, token: requestedToken } = req.body;
    const userId = req.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return next(new HandleERROR("کاربر یافت نشد", 404));

    const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
    if (!reward) return next(new HandleERROR("پاداش یافت نشد", 404));

    const tokenCost = parseInt(requestedToken || reward.minToken, 10);
    if (user.token < tokenCost) {
        return next(new HandleERROR("موجودی توکن شما برای این پاداش کافی نیست.", 400));
    }

    const result = await prisma.$transaction(async (tx) => {
        const studentReward = await tx.studentReward.create({
            data: {
                userId,
                rewardId,
                token: tokenCost,
                status: 'pending'
            }
        });

        await tx.user.update({
            where: { id: userId },
            data: { token: { decrement: tokenCost } }
        });

        return studentReward;
    });

    try {
        const admins = await prisma.user.findMany({
            where: { role: { in: ['admin', 'superAdmin'] } },
            select: { id: true }
        });

        if (admins.length > 0) {
            await prisma.notification.createMany({
                data: admins.map(admin => ({
                    userId: admin.id,
                    rewardId: result.id,
                    title: `درخواست پاداش جدید از ${user.fullName}`,
                    message: `درخواست دریافت "${reward.name}" به ارزش ${tokenCost} توکن ثبت شد.`,
                    type: 'new_reward_request',
                    relatedLink: `/rewards`,
                    relatedDocId: result.id,
                    iconBgColor: 'bg-emerald-500'
                }))
            });
        }
    } catch (err) {
        console.error('Error creating reward notification:', err);
    }

    res.status(201).json({
        success: true,
        message: "درخواست پاداش شما با موفقیت ثبت شد و توکن کسر گردید.",
        data: result
    });
});

export const changeStatusRe = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    const currentReq = await prisma.studentReward.findUnique({
        where: { id },
        include: { user: true, reward: true }
    });

    if (!currentReq) return next(new HandleERROR("درخواست پاداش یافت نشد.", 404));

    await prisma.$transaction(async (tx) => {
        if (status === 'rejected' && currentReq.status === 'pending') {
            await tx.user.update({
                where: { id: currentReq.userId },
                data: { token: { increment: currentReq.token } }
            });
        }

        await tx.studentReward.update({
            where: { id },
            data: { status }
        });
    });

    try {
        await prisma.notification.create({
            data: {
                userId: currentReq.userId,
                rewardId: currentReq.id,
                title: status === 'approved' ? 'پاداش تایید شد' : 'رد درخواست پاداش',
                message: status === 'approved'
                    ? `درخواست پاداش "${currentReq.reward?.name}" تایید شد و آماده تحویل است.`
                    : `درخواست پاداش "${currentReq.reward?.name}" رد شد و ${currentReq.token} توکن به حساب شما برگشت.`,
                type: 'reward_status',
                relatedLink: '/rewards',
                relatedDocId: currentReq.id
            }
        });
    } catch (err) {
        console.error('Error in student notification:', err);
    }

    res.status(200).json({
        success: true,
        message: status === 'approved' ? "پاداش تایید شد." : "درخواست رد و توکن برگشت داده شد."
    });
});

export const getOneStudentReward = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const studentReward = await prisma.studentReward.findUnique({
        where: { id },
        include: { user: true, reward: true }
    });
    return res.status(200).json({
        data: studentReward,
        success: true
    });
});

export const getMyStudentRewards = catchAsync(async (req, res, next) => {
    const userId = req.userId;
    const rewards = await prisma.studentReward.findMany({
        where: { userId },
        include: { reward: true },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({
        success: true,
        data: rewards
    });
});

export const getMyRewardStats = catchAsync(async (req, res, next) => {
    const userId = req.userId;
    const [pendingCount, approvedCount, approvedTokens] = await Promise.all([
        prisma.studentReward.count({ where: { userId, status: 'pending' } }),
        prisma.studentReward.count({ where: { userId, status: 'approved' } }),
        prisma.studentReward.aggregate({
            where: { userId, status: 'approved' },
            _sum: { token: true }
        })
    ]);

    res.status(200).json({
        success: true,
        data: {
            pendingCount,
            approvedCount,
            totalTokensSpent: approvedTokens._sum.token || 0
        }
    });
});

export const getMyRewardsListPaginated = catchAsync(async (req, res, next) => {
    const userId = req.userId;
    const { page = 1, limit = 10, status } = req.query;

    const where = { userId };
    if (status) where.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [totalCount, rewards] = await Promise.all([
        prisma.studentReward.count({ where }),
        prisma.studentReward.findMany({
            where,
            include: { reward: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limitNum
        })
    ]);

    res.status(200).json({
        success: true,
        results: rewards.length,
        totalCount,
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        data: rewards
    });
});

export const getAllStudentRewardsForAdmin = catchAsync(async (req, res, next) => {
    const { status, studentName, page = 1, limit = 10 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (studentName) where.user = { fullName: { contains: studentName, mode: 'insensitive' } };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [totalCount, rewards] = await Promise.all([
        prisma.studentReward.count({ where }),
        prisma.studentReward.findMany({
            where,
            include: {
                user: { select: { id: true, fullName: true, idCode: true, grade: true, class: true } },
                reward: true
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limitNum
        })
    ]);

    const formatted = rewards.map(r => ({
        _id: r.id,
        id: r.id,
        token: r.token,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        studentName: r.user?.fullName,
        studentIdCode: r.user?.idCode,
        studentGrade: r.user?.grade,
        studentClass: r.user?.class,
        rewardName: r.reward?.name,
        rewardParent: r.reward?.parent,
        userId: r.user?.id
    }));

    res.status(200).json({
        success: true,
        results: formatted.length,
        totalCount,
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        data: formatted
    });
});

export const getStudentRewardsForAdminList = catchAsync(async (req, res, next) => {
    return getAllStudentRewardsForAdmin(req, res, next);
});

export const getAdminRewardStats = catchAsync(async (req, res, next) => {
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
        prisma.studentReward.count({ where: { status: 'pending' } }),
        prisma.studentReward.count({ where: { status: 'approved' } }),
        prisma.studentReward.count({ where: { status: 'rejected' } })
    ]);

    res.status(200).json({
        success: true,
        data: {
            pendingCount,
            approvedCount,
            rejectedCount,
            totalRequests: pendingCount + approvedCount + rejectedCount
        }
    });
});