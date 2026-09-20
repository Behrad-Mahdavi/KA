import prisma from '../Utils/prisma.js';
import catchAsync from '../Utils/catchAsync.js';

const TARGET_SCORES_BY_PARENT = {
    'فعالیت‌های آموزشی': 1000,
    'فعالیت‌های داوطلبانه و توسعه فردی': 800,
    'فعالیت‌های شغلی': 500,
    'موارد کسر امتیاز': 0
};

const PARENT_COLORS = {
    'فعالیت‌های آموزشی': { text: "text-[#652D90]", rawHexColor: "#652D90" },
    'فعالیت‌های داوطلبانه و توسعه فردی': { text: "text-[#E0195B]", rawHexColor: "#E0195B" },
    'فعالیت‌های شغلی': { text: "text-[#F8A41D]", rawHexColor: "#F8A41D" },
    'موارد کسر امتیاز': { text: "text-[#787674]", rawHexColor: "#787674" },
    'default': { text: "text-gray-700", rawHexColor: "#A0AEC0" }
};

const DESIRED_PARENT_ORDER = [
    'فعالیت‌های آموزشی',
    'فعالیت‌های داوطلبانه و توسعه فردی',
    'فعالیت‌های شغلی',
    'موارد کسر امتیاز'
];

const calculateRank = async (userScore, filter = {}) => {
    if (userScore === null || typeof userScore === 'undefined') return null;
    return (await prisma.user.count({
        where: {
            role: 'student',
            score: { gt: userScore },
            ...filter
        }
    })) + 1;
};

export const getStudentDashboardData = catchAsync(async (req, res, next) => {
    if (!req.userId) return res.status(401).json({ success: false, message: "کاربر احراز هویت نشده است." });

    const currentUserData = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
            id: true,
            fullName: true,
            score: true,
            token: true,
            grade: true,
            class: true,
            rankInSchool: true,
            rankInGrade: true,
            rankInClass: true
        }
    });

    if (!currentUserData) return res.status(404).json({ success: false, message: "اطلاعات کاربر یافت نشد." });

    const [
        adminActivities,
        studentActivities,
        paidRewardsResult,
        topStudents,
        higherNeighbors,
        lowerNeighbors
    ] = await Promise.all([
        prisma.adminActivity.findMany({
            where: { userId: currentUserData.id },
            include: { activity: { select: { parent: true } } }
        }),
        prisma.studentActivity.findMany({
            where: { userId: currentUserData.id, status: 'approved' },
            include: { activity: { select: { parent: true } } }
        }),
        prisma.studentReward.aggregate({
            where: { userId: currentUserData.id, status: 'approved' },
            _sum: { token: true }
        }),
        currentUserData.grade ? prisma.user.findMany({
            where: { role: 'student', grade: currentUserData.grade },
            select: { id: true, fullName: true, class: true, score: true },
            orderBy: [{ score: 'desc' }, { fullName: 'asc' }],
            take: 5
        }) : Promise.resolve([]),
        prisma.user.findMany({
            where: { role: 'student', score: { gt: currentUserData.score } },
            select: { id: true, fullName: true, class: true, score: true },
            orderBy: { score: 'asc' },
            take: 2
        }),
        prisma.user.findMany({
            where: { role: 'student', score: { lt: currentUserData.score } },
            select: { id: true, fullName: true, class: true, score: true },
            orderBy: { score: 'desc' },
            take: 2
        })
    ]);

    const combinedScores = {};
    adminActivities.forEach(item => {
        const parent = item.activity?.parent;
        if (parent) combinedScores[parent] = (combinedScores[parent] || 0) + (item.scoreAwarded || 0);
    });
    studentActivities.forEach(item => {
        const parent = item.activity?.parent;
        if (parent) combinedScores[parent] = (combinedScores[parent] || 0) + (item.scoreAwarded || 0);
    });

    const activitySummary = Object.entries(combinedScores).map(([parentName, totalScore]) => {
        const colors = PARENT_COLORS[parentName] || PARENT_COLORS.default;
        const target = TARGET_SCORES_BY_PARENT[parentName] || 1;
        return {
            parentName,
            totalScore,
            progressPercentage: Math.min(Math.round((totalScore / target) * 100), 100),
            color: colors.text,
            rawHexColor: colors.rawHexColor
        };
    }).sort((a, b) => DESIRED_PARENT_ORDER.indexOf(a.parentName) - DESIRED_PARENT_ORDER.indexOf(b.parentName));

    const topStudentsInMyGrade = topStudents.map((s, i) => ({
        ...s,
        userId: s.id,
        _id: s.id,
        rank: i + 1
    }));

    const userRankInSchool = currentUserData.rankInSchool || await calculateRank(currentUserData.score);
    const userRankInGrade = currentUserData.rankInGrade || (currentUserData.grade ? await calculateRank(currentUserData.score, { grade: currentUserData.grade }) : null);
    const userRankInClass = currentUserData.rankInClass || (currentUserData.class ? await calculateRank(currentUserData.score, { grade: currentUserData.grade, class: currentUserData.class }) : null);

    let combinedRankingList = [...higherNeighbors.reverse(), { ...currentUserData, highlight: true }, ...lowerNeighbors];
    const rankingTableData = await Promise.all(combinedRankingList.map(async (s) => ({
        userId: s.id,
        _id: s.id,
        name: s.fullName,
        code: s.class || 'N/A',
        score: s.score,
        highlight: !!s.highlight,
        rank: await calculateRank(s.score)
    })));

    res.status(200).json({
        success: true,
        data: {
            headerInfo: {
                schoolName: "هنرستان استارتاپی رکاد",
                userFullName: currentUserData.fullName,
                grade: currentUserData.grade,
                unreadNotificationsCount: 0
            },
            totalUserScore: currentUserData.score,
            totalScore: currentUserData.score,
            totalTokens: currentUserData.score,
            availableTokens: currentUserData.token,
            spendableTokens: currentUserData.token,
            activitySummary,
            paidRewardsTokenValue: paidRewardsResult._sum.token || 0,
            topStudentsInMyGrade,
            userRankInSchool,
            userRankInGrade,
            userRankInClass,
            rankingTableData
        }
    });
});