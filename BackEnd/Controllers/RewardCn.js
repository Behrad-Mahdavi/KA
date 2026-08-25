import catchAsync from "../Utils/catchAsync.js";
import prisma from "../Utils/prisma.js";
import HandleERROR from "../Utils/handleError.js";

export const createReward = catchAsync(async (req, res, next) => {
    const reward = await prisma.reward.create({
        data: {
            parent: req.body.parent,
            name: req.body.name,
            description: req.body.description,
            minToken: parseInt(req.body.minToken, 10),
            maxToken: parseInt(req.body.maxToken, 10),
            icon: req.body.icon,
            color: req.body.color,
            hide: req.body.hide || "false"
        }
    });
    return res.status(201).json({
        success: true,
        message: "reward created successfully",
        data: reward
    });
});

export const getAllRewards = catchAsync(async (req, res, next) => {
    const { parent } = req.query;
    const where = {};
    if (parent) where.parent = parent;

    const rewards = await prisma.reward.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({
        success: true,
        data: rewards
    });
});

export const getOneReward = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const reward = await prisma.reward.findUnique({
        where: { id }
    });
    if (!reward) {
        return next(new HandleERROR("پاداش یافت نشد", 404));
    }
    return res.status(200).json({
        data: reward,
        success: true
    });
});

export const removeReward = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await prisma.reward.delete({
        where: { id }
    });
    return res.status(200).json({
        success: true,
        message: "reward removed successfully"
    });
});