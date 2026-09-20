import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as jalaali from "jalaali-js";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// تبدیل اعداد به ارقام فارسی
export function toPersianDigits(n) {
  if (n === null || n === undefined) return "";
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return n.toString().replace(/\d/g, (x) => persianDigits[parseInt(x, 10)]);
}

// نام ماه‌های فارسی
export const PERSIAN_MONTH_NAMES = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
];

// نام روزهای هفته فارسی
export const PERSIAN_WEEKDAY_NAMES = [
  "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"
];

// فرمت تاریخ به شمسی خوانا
export function formatToJalali(date, options = {}) {
  if (!date) return "-";
  let d;
  if (typeof date === "string") {
    const parts = date.split("T")[0].split("-");
    if (parts.length === 3) {
      d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
      d = new Date(date);
    }
  } else {
    d = date;
  }

  if (isNaN(d.getTime())) return "-";

  const j = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const dayStr = toPersianDigits(j.jd);
  const yearStr = toPersianDigits(j.jy);

  if (options?.showMonthName) {
    const monthName = PERSIAN_MONTH_NAMES[j.jm - 1];
    if (options.includeDayName) {
      const dayName = PERSIAN_WEEKDAY_NAMES[d.getDay()];
      return `${dayName} ${dayStr} ${monthName} ${yearStr}`;
    }
    return `${dayStr} ${monthName} ${yearStr}`;
  }

  const monthStr = toPersianDigits(j.jm.toString().padStart(2, "0"));
  return `${yearStr}/${monthStr}/${dayStr.padStart(2, "۰")}`;
}
