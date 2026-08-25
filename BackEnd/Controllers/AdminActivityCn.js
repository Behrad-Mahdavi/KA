import catchAsync from "../Utils/catchAsync.js";
import prisma from "../Utils/prisma.js";
import { updateUserScore } from "../Utils/UpdateScore.js";
import HandleERROR from '../Utils/handleError.js';
import XLSX from 'xlsx';

export const createAdminActivity = catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    const { activityId, details, scoreAwarded: scoreFromRequest, description: adminDescription } = req.body;
    if (!userId || !activityId) {
        return next(new HandleERROR("شناسه کاربر و شناسه فعالیت الزامی است.", 400));
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        return next(new HandleERROR("کاربر یافت نشد.", 404));
    }

    const activityDefinition = await prisma.activity.findUnique({ where: { id: activityId } });
    if (!activityDefinition) {
        return next(new HandleERROR("تعریف فعالیت یافت نشد.", 404));
    }

    let finalScoreAwarded = 0;
    let finalDetailsForDb = details;

    const scoreDef = activityDefinition.scoreDefinition || {};
    const valueInDef = activityDefinition.valueInput || {};

    if (valueInDef?.type !== 'none' && valueInDef?.required && (details === undefined || String(details).trim() === '')) {
        return next(new HandleERROR(`فیلد '${valueInDef?.label || 'جزئیات/مقدار'}' برای این فعالیت الزامی است.`, 400));
    }

    switch (scoreDef.inputType) {
        case 'select_from_enum':
            if (!Array.isArray(scoreDef.enumOptions) || scoreDef.enumOptions.length === 0) {
                return next(new HandleERROR(`تعریف گزینه‌های شمارشی برای فعالیت '${activityDefinition.name}' ناقص است.`, 500));
            }
            const selectedOption = scoreDef.enumOptions.find(opt => opt.label === details);
            if (!selectedOption) {
                return next(new HandleERROR(`گزینه انتخابی '${details}' برای فعالیت '${activityDefinition.name}' معتبر نیست.`, 400));
            }
            finalScoreAwarded = selectedOption.value;
            break;

        case 'calculated_from_value':
            const numValue = parseFloat(details);
            if (isNaN(numValue)) {
                return next(new HandleERROR("مقدار وارد شده برای محاسبه امتیاز باید عددی باشد.", 400));
            }
            finalScoreAwarded = numValue * (scoreDef.multiplier || 1);
            if (scoreDef.max !== undefined) finalScoreAwarded = Math.min(finalScoreAwarded, scoreDef.max);
            if (scoreDef.min !== undefined) finalScoreAwarded = Math.max(finalScoreAwarded, scoreDef.min);
            break;

        case 'number_in_range':
        case 'manual_number_entry':
            const manualScore = parseFloat(scoreFromRequest !== undefined ? scoreFromRequest : details);
            if (isNaN(manualScore)) {
                return next(new HandleERROR("امتیاز وارد شده معتبر نیست.", 400));
            }
            finalScoreAwarded = manualScore;
            break;

        default:
            finalScoreAwarded = parseFloat(scoreFromRequest || 0);
    }

    const adminActivity = await prisma.adminActivity.create({
        data: {
            userId: user.id,
            activityId: activityDefinition.id,
            details: String(finalDetailsForDb || ''),
            scoreAwarded: finalScoreAwarded,
            type: 'فردی',
            description: adminDescription || ''
        }
    });

    await updateUserScore(user.id);

    res.status(201).json({
        success: true,
        message: "فعالیت با موفقیت توسط ادمین ثبت شد.",
        data: adminActivity
    });
});

export const getActivitiesByParent = catchAsync(async (req, res, next) => {
    const parentCategory = req.params.parentCategory || req.params.parent || req.query.parent || req.query.parentCategory;
    if (!parentCategory) {
        return res.status(400).json({ success: false, message: 'دسته‌بندی والد الزامی است.' });
    }

    const activities = await prisma.activity.findMany({
        where: { parent: decodeURIComponent(parentCategory) },
        orderBy: [{ order: 'asc' }, { name: 'asc' }]
    });

    const formatted = activities.map(a => ({
        ...a,
        _id: a.id
    }));

    res.status(200).json({
        success: true,
        data: formatted
    });
});

export const getAllAdminActivities = catchAsync(async (req, res, next) => {
    const { userId, activityId, studentName, category, page, limit } = req.query;
    const where = {};
    if (userId) where.userId = userId;
    if (activityId) where.activityId = activityId;
    if (studentName) {
        where.user = { fullName: { contains: studentName, mode: 'insensitive' } };
    }
    if (category) {
        where.activity = { parent: category };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [totalCount, activities] = await Promise.all([
        prisma.adminActivity.count({ where }),
        prisma.adminActivity.findMany({
            where,
            include: {
                user: { select: { id: true, fullName: true, grade: true, class: true } },
                activity: true
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limitNum
        })
    ]);

    res.status(200).json({
        success: true,
        results: activities.length,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        currentPage: pageNum,
        data: activities
    });
});

export const getAllAdminActivitiesForUser = catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    const activities = await prisma.adminActivity.findMany({
        where: { userId },
        include: { activity: true },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: activities });
});

export const getOneAdminActivity = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const activity = await prisma.adminActivity.findUnique({
        where: { id },
        include: { user: true, activity: true }
    });
    if (!activity) return next(new HandleERROR("فعالیت یافت نشد", 404));
    res.status(200).json({ success: true, data: activity });
});

export const getAdminActivitiesCount = catchAsync(async (req, res, next) => {
    const count = await prisma.adminActivity.count();
    res.status(200).json({ success: true, count, data: { count } });
});

export const getActivityParentCategories = catchAsync(async (req, res, next) => {
    const categories = ['موارد کسر امتیاز', 'فعالیت‌های آموزشی', 'فعالیت‌های شغلی', 'فعالیت‌های داوطلبانه و توسعه فردی'];
    res.status(200).json({ success: true, data: categories });
});

export const createBulkAdminActivitiesFromExcel = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new HandleERROR("لطفا فایل اکسل را آپلود کنید.", 400));
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const affectedUserIds = new Set();
    const createdActivities = [];

    for (const row of data) {
        const idCode = String(row.idCode || row['کد ملی'] || '').trim();
        const activityName = String(row.activityName || row['نام فعالیت'] || '').trim();
        const score = parseFloat(row.score || row['امتیاز'] || 0);
        const details = String(row.details || row['جزئیات'] || '');

        if (!idCode || !activityName) continue;

        const user = await prisma.user.findUnique({ where: { idCode } });
        const act = await prisma.activity.findFirst({ where: { name: activityName } });

        if (user && act) {
            const adminAct = await prisma.adminActivity.create({
                data: {
                    userId: user.id,
                    activityId: act.id,
                    details,
                    scoreAwarded: score,
                    type: 'گروهی-اکسل'
                }
            });
            createdActivities.push(adminAct);
            affectedUserIds.add(user.id);
        }
    }

    for (const uId of affectedUserIds) {
        await updateUserScore(uId);
    }

    res.status(200).json({
        success: true,
        message: `${createdActivities.length} فعالیت با موفقیت ثبت شد.`,
        data: createdActivities
    });
});
