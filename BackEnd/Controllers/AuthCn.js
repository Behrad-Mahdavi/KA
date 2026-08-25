import catchAsync from "../Utils/catchAsync.js";
import prisma from "../Utils/prisma.js";
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import HandleERROR from "../Utils/handleError.js";

const normalizeDigits = (str) => {
  if (!str) return '';
  return String(str)
    .trim()
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
};

export const register = catchAsync(async (req, res, next) => {
    let { idCode = '', role = 'student', fullName = '', grade = null, fieldOfStudy = null, class: classNum = null, ...others } = req.body;
    
    if (role !== "superAdmin" && (!req.role || req.role !== "superAdmin")) {
        return next(new HandleERROR("شما دسترسی لازم برای ثبت‌نام کاربر را ندارید", 403));
    }

    idCode = normalizeDigits(idCode);
    if (!idCode || !fullName) {
        return next(new HandleERROR("کد ملی و نام کامل الزامی است", 400));
    }

    const existingUser = await prisma.user.findUnique({ where: { idCode } });
    if (existingUser) {
        return next(new HandleERROR("این کد ملی قبلاً ثبت شده است", 400));
    }

    let pass;
    if (role === 'student') {
        pass = `s${idCode}`;
    } else if (role === 'admin') {
        pass = `a${idCode}`;
    } else {
        pass = `sa${idCode}`;
    }
    const hashPass = bcryptjs.hashSync(pass, 10);

    const newUser = await prisma.user.create({
        data: {
            fullName,
            idCode,
            role,
            password: hashPass,
            grade: grade || null,
            fieldOfStudy: fieldOfStudy || null,
            class: classNum ? parseInt(classNum, 10) : null,
            ...others
        }
    });

    return res.status(201).json({
        message: 'ثبت‌نام با موفقیت انجام شد',
        success: true,
        data: {
            id: newUser.id,
            fullName: newUser.fullName,
            idCode: newUser.idCode,
            role: newUser.role
        }
    });
});

export const login = catchAsync(async (req, res, next) => {
    let { idCode = null, password = null } = req.body;
    if (!password || !idCode) {
        return next(new HandleERROR('کد ملی و رمز عبور الزامی است', 400));
    }

    idCode = normalizeDigits(idCode);
    password = String(password).trim();

    const user = await prisma.user.findUnique({ where: { idCode } });
    if (!user) {
        return next(new HandleERROR('کاربری با این مشخصات یافت نشد', 404));
    }

    const checkPassword = bcryptjs.compareSync(password, user.password);
    if (!checkPassword) {
        return next(new HandleERROR('کد ملی یا رمز عبور اشتباه است', 400));
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    return res.status(200).json({
        message: "ورود با موفقیت انجام شد",
        success: true,
        data: {
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                role: user.role,
                idcode: user.idCode,
                grade: user.grade,
                fieldOfStudy: user.fieldOfStudy
            }
        }
    });
});
