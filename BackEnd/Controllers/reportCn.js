import ExcelJS from 'exceljs';
import catchAsync from '../Utils/catchAsync.js';
import prisma from '../Utils/prisma.js';

const createAndSendExcelReport = async (res, options) => {
    const { reportData, reportTitle } = options;

    if (!reportData || reportData.length === 0) {
        return res.status(404).json({ success: false, message: "هیچ داده‌ای با این فیلترها برای گزارش یافت نشد." });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(reportTitle, { views: [{ rightToLeft: true }] });

    worksheet.columns = [
        { header: 'کد ملی', key: 'idCode', width: 15 },
        { header: 'نام دانش‌آموز', key: 'studentName', width: 25 },
        { header: 'پایه', key: 'studentGrade', width: 10 },
        { header: 'رشته', key: 'fieldOfStudy', width: 20 },
        { header: 'کلاس', key: 'studentClass', width: 10 },
        { header: 'عنوان رکورد', key: 'recordName', width: 30 },
        { header: 'دسته', key: 'recordParent', width: 25 },
        { header: 'توکن/امتیاز', key: 'points', width: 15 },
        { header: 'وضعیت', key: 'status', width: 15 },
        { header: 'تاریخ ثبت', key: 'submissionDate', width: 20 },
        { header: 'نوع رکورد', key: 'recordType', width: 15 },
        { header: 'جزئیات', key: 'details', width: 40 },
        { header: 'توضیحات', key: 'description', width: 40 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E295A' } };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    reportData.forEach(item => {
        worksheet.addRow({
            ...item,
            status: item.status === 'approved' ? 'تایید شده' : (item.status === 'pending' ? 'در انتظار' : 'رد شده'),
            submissionDate: item.submissionDate ? new Date(item.submissionDate).toLocaleDateString('fa-IR') : 'نامشخص'
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(reportTitle)}.xlsx`);
    return res.send(buffer);
};

export const generateActivityExcelReport = catchAsync(async (req, res, next) => {
    const { grade, class: classNum, fieldOfStudy, status, parent } = req.query;

    const userWhere = {};
    if (grade) userWhere.grade = grade;
    if (classNum) userWhere.class = parseInt(classNum, 10);
    if (fieldOfStudy) userWhere.fieldOfStudy = fieldOfStudy;

    const actWhere = {};
    if (parent) actWhere.parent = parent;

    const studentActivities = await prisma.studentActivity.findMany({
        where: {
            status: status || undefined,
            user: userWhere,
            activity: actWhere
        },
        include: {
            user: true,
            activity: true
        }
    });

    const reportData = studentActivities.map(sa => ({
        idCode: sa.user?.idCode,
        studentName: sa.user?.fullName,
        studentGrade: sa.user?.grade,
        fieldOfStudy: sa.user?.fieldOfStudy,
        studentClass: sa.user?.class,
        recordName: sa.activity?.name,
        recordParent: sa.activity?.parent,
        points: sa.scoreAwarded,
        status: sa.status,
        submissionDate: sa.createdAt,
        recordType: 'فعالیت دانش‌آموزی',
        details: sa.details || '',
        description: sa.adminComment || ''
    }));

    await createAndSendExcelReport(res, {
        reportData,
        reportTitle: 'گزارش_فعالیت‌های_دانش‌آموزی'
    });
});

export const generateRewardExcelReport = catchAsync(async (req, res, next) => {
    const { grade, class: classNum, fieldOfStudy, status } = req.query;

    const userWhere = {};
    if (grade) userWhere.grade = grade;
    if (classNum) userWhere.class = parseInt(classNum, 10);
    if (fieldOfStudy) userWhere.fieldOfStudy = fieldOfStudy;

    const studentRewards = await prisma.studentReward.findMany({
        where: {
            status: status || undefined,
            user: userWhere
        },
        include: {
            user: true,
            reward: true
        }
    });

    const reportData = studentRewards.map(sr => ({
        idCode: sr.user?.idCode,
        studentName: sr.user?.fullName,
        studentGrade: sr.user?.grade,
        fieldOfStudy: sr.user?.fieldOfStudy,
        studentClass: sr.user?.class,
        recordName: sr.reward?.name,
        recordParent: sr.reward?.parent,
        points: sr.token,
        status: sr.status,
        submissionDate: sr.createdAt,
        recordType: 'درخواست پاداش',
        details: '',
        description: ''
    }));

    await createAndSendExcelReport(res, {
        reportData,
        reportTitle: 'گزارش_پاداش‌های_دانش‌آموزی'
    });
});

export const generateGeneralExcelReport = catchAsync(async (req, res, next) => {
    const students = await prisma.user.findMany({
        where: { role: 'student' },
        orderBy: { score: 'desc' }
    });

    const reportData = students.map(s => ({
        idCode: s.idCode,
        studentName: s.fullName,
        studentGrade: s.grade,
        fieldOfStudy: s.fieldOfStudy,
        studentClass: s.class,
        recordName: 'وضعیت کلی دانش‌آموز',
        recordParent: `رتبه مدرسه: ${s.rankInSchool || 'N/A'}`,
        points: s.score,
        status: 'approved',
        submissionDate: s.createdAt,
        recordType: `توکن: ${s.token}`,
        details: `رتبه پایه: ${s.rankInGrade || 'N/A'} | رتبه کلاس: ${s.rankInClass || 'N/A'}`,
        description: ''
    }));

    await createAndSendExcelReport(res, {
        reportData,
        reportTitle: 'گزارش_جامع_رتبه‌بندی_دانش‌آموزان'
    });
});

export const generateStudentOverallReport = catchAsync(async (req, res, next) => {
    return generateGeneralExcelReport(req, res, next);
});

export const createStudentActivitiesReport = generateActivityExcelReport;
export const generateGeneralReport = generateGeneralExcelReport;

export const getStudentActivityParents = catchAsync(async (req, res, next) => {
    const { studentId } = req.params;
    const activities = await prisma.studentActivity.findMany({
        where: { userId: studentId },
        include: { activity: { select: { parent: true } } }
    });

    const parents = [...new Set(activities.map(a => a.activity?.parent).filter(Boolean))];
    res.status(200).json({ success: true, data: parents });
});