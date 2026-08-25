import catchAsync from "../Utils/catchAsync.js";
import prisma from "../Utils/prisma.js";

export const getRecentPendingRequests = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit, 10) || 10;

    const [pendingActivities, pendingRewards] = await Promise.all([
        prisma.studentActivity.findMany({
            where: { status: 'pending' },
            include: {
                user: { select: { id: true, fullName: true } },
                activity: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        }),
        prisma.studentReward.findMany({
            where: { status: 'pending' },
            include: {
                user: { select: { id: true, fullName: true } },
                reward: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        })
    ]);

    const formattedActivities = pendingActivities.map(a => ({
        _id: a.id,
        id: a.id,
        requestType: 'activity',
        entityId: a.activityId,
        entityName: a.activity?.name,
        userId: a.userId,
        userFullName: a.user?.fullName,
        createdAt: a.createdAt
    }));

    const formattedRewards = pendingRewards.map(r => ({
        _id: r.id,
        id: r.id,
        requestType: 'reward',
        entityId: r.rewardId,
        entityName: r.reward?.name,
        userId: r.userId,
        userFullName: r.user?.fullName,
        createdAt: r.createdAt
    }));

    const combined = [...formattedActivities, ...formattedRewards];
    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const finalResults = combined.slice(0, limit);

    res.status(200).json({
        success: true,
        data: finalResults
    });
});

export const getDashboardSummary = catchAsync(async (req, res, next) => {
    const [
        totalStudents,
        userStats,
        gradeAverages,
        approvedActivitiesCount,
        pendingActivitiesCount,
        rewardApprovedStats,
        pendingRewardsCount
    ] = await Promise.all([
        prisma.user.count({ where: { role: 'student' } }),
        prisma.user.aggregate({
            where: { role: 'student' },
            _sum: { score: true, token: true }
        }),
        prisma.user.groupBy({
            by: ['grade'],
            where: { role: 'student', grade: { not: null } },
            _avg: { score: true },
            _count: { id: true }
        }),
        prisma.studentActivity.count({ where: { status: 'approved' } }),
        prisma.studentActivity.count({ where: { status: 'pending' } }),
        prisma.studentReward.aggregate({
            where: { status: 'approved' },
            _sum: { token: true },
            _count: { id: true }
        }),
        prisma.studentReward.count({ where: { status: 'pending' } })
    ]);

    const averageScoresMap = {};
    gradeAverages.forEach(g => {
        if (g.grade) {
            averageScoresMap[`avgScore${g.grade}`] = Math.round((g._avg.score || 0) * 10) / 10;
        }
    });

    const summaryData = {
        totalScore: userStats._sum.score || 0,
        availableTokens: userStats._sum.token || 0,
        totalStudents: totalStudents || 0,
        approvedRequestsCount: approvedActivitiesCount,
        pendingRequestsCount: pendingActivitiesCount + pendingRewardsCount,
        usedTokens: rewardApprovedStats._sum.token || 0,
        paidRewardsCount: rewardApprovedStats._count.id || 0,
        ...averageScoresMap
    };

    res.status(200).json({
        success: true,
        data: summaryData
    });
});