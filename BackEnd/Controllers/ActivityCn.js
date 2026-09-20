import catchAsync from "../Utils/catchAsync.js";
import prisma from "../Utils/prisma.js";
import HandleERROR from "../Utils/handleError.js";

export const createActivity = catchAsync(async (req, res, next) => {
    const activity = await prisma.activity.create({
        data: req.body
    });
    return res.status(201).json({
        success: true,
        message: "activity created successfully",
        data: activity
    });
});

export const getAllActivities = catchAsync(async (req, res, next) => {
    const { parent } = req.query;
    const where = {};
    if (parent) where.parent = parent;

    const activities = await prisma.activity.findMany({
        where,
        orderBy: [
            { order: 'asc' },
            { name: 'asc' }
        ]
    });
    const formatted = activities.map(a => ({ ...a, _id: a.id }));
    return res.status(200).json({
        success: true,
        data: formatted
    });
});

export const getOneActivity = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const activity = await prisma.activity.findUnique({
        where: { id }
    });
    if (!activity) {
        return next(new HandleERROR("فعالیت یافت نشد", 404));
    }
    return res.status(200).json({
        data: { ...activity, _id: activity.id },
        success: true
    });
});

export const removeActivity = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await prisma.activity.delete({
        where: { id }
    });
    return res.status(200).json({
        success: true,
        message: "activity removed successfully"
    });
});

export const findActivityByDetails = catchAsync(async (req, res, next) => {
    const { parent, name } = req.query;
    if (!parent || !name) {
        return next(new HandleERROR('دسته‌بندی و عنوان فعالیت الزامی است.', 400));
    }
    const activity = await prisma.activity.findFirst({
        where: {
            parent: parent,
            name: {
                equals: name.trim(),
                mode: 'insensitive'
            }
        },
        select: {
            id: true,
            name: true,
            parent: true
        }
    });

    if (!activity) {
        return next(new HandleERROR('فعالیتی با این مشخصات یافت نشد.', 404));
    }
    res.status(200).json({ success: true, data: activity });
});

export const getActivitiesByParent = catchAsync(async (req, res, next) => {
    const parentCategory = req.query.parent || req.params.parentCategory || req.params.parent;

    if (!parentCategory) {
        return res.status(400).json({ success: false, message: 'دسته بندی والد فعالیت الزامی است.' });
    }

    const activities = await prisma.activity.findMany({
        where: { parent: parentCategory },
        orderBy: [
            { order: 'asc' },
            { name: 'asc' }
        ]
    });

    const formatted = activities.map(a => ({ ...a, _id: a.id }));

    res.status(200).json({
        success: true,
        data: formatted,
    });
});