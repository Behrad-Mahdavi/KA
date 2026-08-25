import XLSX from 'xlsx';
import prisma from '../Utils/prisma.js';
import bcryptjs from 'bcryptjs';
import HandleERROR from '../Utils/handleError.js';
import catchAsync from '../Utils/catchAsync.js';

export const registerFromExcel = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new HandleERROR("لطفا فایل اکسل را ارسال کنید", 400));
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const errors = [];
    let insertedCount = 0;

    for (const [index, row] of data.entries()) {
        try {
            const idCode = String(row.idCode || row['کد ملی'] || '').trim();
            const fullName = String(row.fullName || row['نام و نام خانوادگی'] || row['نام کامل'] || '').trim();
            const role = String(row.role || row['نقش'] || 'student').trim();
            const grade = row.grade || row['پایه'] || null;
            const fieldOfStudy = row.fieldOfStudy || row['رشته'] || null;
            const classNum = row.class || row['کلاس'] ? parseInt(row.class || row['کلاس'], 10) : null;
            const score = parseFloat(row.score || row['امتیاز'] || 0);

            if (!idCode || !fullName) {
                errors.push(`سطر ${index + 2}: کد ملی یا نام خالی است.`);
                continue;
            }

            const existing = await prisma.user.findUnique({ where: { idCode } });
            if (existing) {
                errors.push(`سطر ${index + 2}: کد ملی ${idCode} قبلاً ثبت شده است.`);
                continue;
            }

            let pass;
            if (role === 'student') pass = `s${idCode}`;
            else if (role === 'admin') pass = `a${idCode}`;
            else pass = `sa${idCode}`;

            const hashPass = bcryptjs.hashSync(pass, 10);
            const token = Math.floor(score * 0.95);

            await prisma.user.create({
                data: {
                    idCode,
                    fullName,
                    role,
                    password: hashPass,
                    grade,
                    fieldOfStudy,
                    class: classNum,
                    score,
                    token
                }
            });
            insertedCount++;
        } catch (rowErr) {
            errors.push(`سطر ${index + 2}: خطا در ذخیره - ${rowErr.message}`);
        }
    }

    res.status(200).json({
        success: true,
        message: `${insertedCount} کاربر با موفقیت ثبت شد.`,
        insertedCount,
        errorCount: errors.length,
        errors
    });
});

export const bulkActivityRegistration = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new HandleERROR("لطفا فایل اکسل فعالیت‌ها را ارسال کنید", 400));
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let insertedCount = 0;
    const errors = [];

    for (const [index, row] of data.entries()) {
        try {
            const name = String(row.name || row['نام فعالیت'] || '').trim();
            const parent = String(row.parent || row['دسته بندی'] || row['دسته'] || '').trim();
            const description = row.description || row['توضیحات'] || '';
            const order = parseInt(row.order || row['ترتیب'] || 0, 10);

            if (!name || !parent) {
                errors.push(`سطر ${index + 2}: نام یا دسته‌بندی خالی است.`);
                continue;
            }

            const valueInput = { type: 'text', label: 'جزئیات/مقدار', required: false };
            const scoreDefinition = { inputType: 'manual_number_entry' };

            await prisma.activity.upsert({
                where: { parent_name: { parent, name } },
                update: { description, order },
                create: {
                    parent,
                    name,
                    description,
                    order,
                    valueInput,
                    scoreDefinition
                }
            });
            insertedCount++;
        } catch (err) {
            errors.push(`سطر ${index + 2}: ${err.message}`);
        }
    }

    res.status(200).json({
        success: true,
        message: `${insertedCount} فعالیت ثبت/بروزرسانی شد.`,
        insertedCount,
        errorCount: errors.length,
        errors
    });
});

export const bulkRewardRegistration = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new HandleERROR("لطفا فایل اکسل پاداش‌ها را ارسال کنید", 400));
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let insertedCount = 0;
    const errors = [];

    for (const [index, row] of data.entries()) {
        try {
            const name = String(row.name || row['نام پاداش'] || '').trim();
            const parent = String(row.parent || row['دسته بندی'] || 'پاداش‌های عمومی').trim();
            const description = row.description || row['توضیحات'] || '';
            const minToken = parseInt(row.minToken || row['حداقل توکن'] || row['توکن'] || 50, 10);
            const maxToken = parseInt(row.maxToken || row['حداکثر توکن'] || minToken, 10);

            if (!name) {
                errors.push(`سطر ${index + 2}: نام پاداش خالی است.`);
                continue;
            }

            await prisma.reward.create({
                data: {
                    parent,
                    name,
                    description,
                    minToken,
                    maxToken,
                    icon: 'gift',
                    color: '#10B981',
                    hide: 'false'
                }
            });
            insertedCount++;
        } catch (err) {
            errors.push(`سطر ${index + 2}: ${err.message}`);
        }
    }

    res.status(200).json({
        success: true,
        message: `${insertedCount} پاداش با موفقیت ثبت شد.`,
        insertedCount,
        errorCount: errors.length,
        errors
    });
});

export const createActivitiesFromExcel = bulkActivityRegistration;
export const createRewardsFromExcel = bulkRewardRegistration;