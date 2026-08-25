import catchAsync from '../Utils/catchAsync.js';
import prisma from '../Utils/prisma.js';
import HandleERROR from '../Utils/handleError.js';

export const getMyNotifications = catchAsync(async (req, res, next) => {
    const userId = req.userId;
    const { isRead, limit = 20, page = 1 } = req.query;

    const where = { userId };
    if (isRead !== undefined) {
        where.isRead = isRead === 'true';
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [totalCount, notifications] = await Promise.all([
        prisma.notification.count({ where }),
        prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limitNum
        })
    ]);

    res.status(200).json({
        success: true,
        results: notifications.length,
        totalCount,
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        data: notifications
    });
});

export const markAsRead = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.userId;

    const notification = await prisma.notification.findFirst({
        where: { id, userId }
    });

    if (!notification) {
        return next(new HandleERROR('اعلان یافت نشد.', 404));
    }

    const updated = await prisma.notification.update({
        where: { id },
        data: { isRead: true }
    });

    res.status(200).json({
        success: true,
        message: 'اعلان با موفقیت به عنوان خوانده شده علامت‌گذاری شد.',
        data: updated
    });
});

export const markAllAsRead = catchAsync(async (req, res, next) => {
    const userId = req.userId;

    await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
    });

    res.status(200).json({
        success: true,
        message: 'تمامی اعلان‌ها به عنوان خوانده شده علامت‌گذاری شدند.'
    });
});

export const getUnreadCount = catchAsync(async (req, res, next) => {
    const userId = req.userId;

    const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false }
    });

    res.status(200).json({
        success: true,
        unreadCount
    });
});

export const markOneAsRead = markAsRead;
export const markNotificationsAsRead = markAllAsRead;