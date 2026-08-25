import prisma from './prisma.js';
import updateStudentRankings from './updateRanks.js';

export const updateUserScore = async (userId) => {
  try {
    const uId = typeof userId === 'object' && (userId.id || userId._id) ? String(userId.id || userId._id) : String(userId);
    if (!uId) return false;

    // 1. جمع امتیاز فعالیت‌های تایید شده دانش‌آموز
    const studentActAgg = await prisma.studentActivity.aggregate({
      where: { userId: uId, status: 'approved' },
      _sum: { scoreAwarded: true }
    });

    // 2. جمع امتیاز فعالیت‌های ثبت‌شده توسط ادمین
    const adminActAgg = await prisma.adminActivity.aggregate({
      where: { userId: uId },
      _sum: { scoreAwarded: true }
    });

    const totalScore = (studentActAgg._sum.scoreAwarded || 0) + (adminActAgg._sum.scoreAwarded || 0);
    const token = Math.floor(totalScore * 0.95);

    // 3. به‌روزرسانی امتیاز و توکن کاربر
    await prisma.user.update({
      where: { id: uId },
      data: {
        score: totalScore,
        token: token
      }
    });

    // 4. به‌روزرسانی رتبه‌ها
    await updateStudentRankings();
    return true;
  } catch (err) {
    console.error('Error in updateUserScore:', err);
    return false;
  }
};

export default updateUserScore;
