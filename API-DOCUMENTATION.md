# مستندات جامع وب‌سرویس‌ها و APIهای سامانه KA-Platform
## Comprehensive API Specification & Integration Guide

این مستند برای اتصال و یکپارچه‌سازی پلتفرم‌های بیرونی (از جمله سامانه راکد / Rokad و سایر اپلیکیشن‌ها) با وب‌سرویس‌های سامانه **KA-Platform** تهیه شده است.

---

## ۱. اطلاعات کلی و آدرس سرورها (Base URLs)

| محیط | آدرس Base URL | توضیحات |
| :--- | :--- | :--- |
| **تولید (Production)** | `https://ka-backend-nu.vercel.app` | سرور آنلاین بک‌اند در ورسل |
| **توسعه محلی (Localhost)** | `http://localhost:5005` | سرور لوکال متصل به پایگاه‌داده PostgreSQL |

### استانداردهای ارتباطی:
- **فرمت ارسال و دریافت داده:** `application/json` (یا `multipart/form-data` برای فایل‌ها)
- **پروتکل ارتباطی:** HTTPS / RESTful API
- **کدگذاری متون:** UTF-8 با پشتیبانی کامل از زبان فارسی و اعداد فارسی/انگلیسی

---

## ۲. احراز هویت و سطوح دسترسی (Authentication & Roles)

سامانه از استاندارد **JSON Web Token (JWT)** استفاده می‌کند. برای کلیه درخواست‌هایی که نیاز به لاگین دارند، توکن دریافتی در هدر زیر قرار داده می‌شود:

```http
Authorization: Bearer <YOUR_JWT_TOKEN>
```

### نقش‌های کاربری (User Roles):
1. **`student` (دانش‌آموز):**
   - مشاهده کارنامه، رتبه‌ها و توکن‌های قابل خرج
   - ثبت فعالیت‌های آموزشی، مهارتی، شغلی و داوطلبانه
   - سفارش و درخواست جوایز از کاتالوگ پاداش‌ها
2. **`admin` (مدیر / معاون / ناظر مدرسه):**
   - بررسی و تایید/رد درخواست‌های فعالیت دانش‌آموزان
   - تایید و ثبت تحویل جوایز فیزیکی و دیجیتال
   - ثبت مستقیم تشویق یا کسر امتیاز برای دانش‌آموزان
3. **`superAdmin` (مدیر ارشد سامانه):**
   - دسترسی کامل به تعریف فعالیت‌ها، پاداش‌ها، کاربران و محاسبات کلان

---

## ۳. قوانین تجاری سیستم (Core Business Rules)

1. **قانون توکن‌های قابل استفاده (۹۵٪):**
   - کل امتیاز کسب‌شده دانش‌آموز در فیلد `score` ذخیره می‌شود.
   - طبق قانون سیستم، توکن‌های قابل استفاده برابر با **۹۵٪ کل امتیاز** است:
   $$\text{Spendable Tokens} = \lfloor \text{score} \times 0.95 \rfloor$$
   - این مقدار در پاسخ تمام APIها به عنوان `token` و `spendableTokens` محاسبه و ارسال می‌گردد.
2. **تفکیک شعب (Branches):**
   - شعبه پسرانه: `پسرانه` (`male`)
   - شعبه دخترانه: `دخترانه` (`female`)
3. **پایه‌ها و کلاس‌ها:**
   - پایه‌ها: `دهم`, `یازدهم`, `دوازدهم`
   - کلاس‌ها: اعداد سه رقمی مانند `101`, `102`, `201`, `202`, `301`, `302`

---

## ۴. احراز هویت (Authentication Endpoints)

### ۴.۱. ورود کاربر (Login)
پشتیبانی از هر دو نقش دانش‌آموز و ادمین با اعتبارسنجی خودکار.

- **مسیر:** `POST /api/auth/login` یا `POST /api/auth`
- **سطح دسترسی:** عمومی (Public)
- **بدنه درخواست (Request Body):**
```json
{
  "idCode": "2222222222",
  "password": "s2222222222"
}
```
> **نکته رمزهای پیش‌فرض:**
> - دانش‌آموز: `s` + کد ملی (مثال: `s2222222222`)
> - مدیر / ادمین: `a` + کد ملی (مثال: `a1111111111`)

- **پاسخ نمونه (Response 200 OK):**
```json
{
  "message": "ورود با موفقیت انجام شد",
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "c1f7dfa4-6518-498b-b8f2-bb44390623a0",
      "fullName": "علی محمدی",
      "role": "student",
      "idcode": "2222222222",
      "grade": "دهم",
      "fieldOfStudy": "تولید و توسعه پایگاه اینترنتی"
    }
  }
}
```

### ۴.۲. دریافت پروفایل کاربر لاگین شده
- **مسیر:** `GET /api/users/my-profile` یا `GET /api/users/me`
- **سطح دسترسی:** کاربر لاگین شده (`Bearer Token`)

---

## ۵. لیدربورد و رتبه‌بندی (Leaderboard & Rankings API)

این بخش ویژه یکپارچه‌سازی با پلتفرم‌های بیرونی طراحی شده و قابلیت فیلتر هم‌زمان یا مجزا بر اساس **شعبه (پسرانه/دخترانه)**، **پایه** و **کلاس** را فراهم می‌کند.

### ۵.۱. وب‌سرویس جامع لیدربورد (Unified Leaderboard)
- **مسیر:** `GET /api/leaderboard`
- **سطح دسترسی:** عمومی / احراز هویت شده

#### پارامترهای ارسالی در Query String:
| پارامتر | نوع | پیش‌فرض | مقادیر معتبر / توضیحات |
| :--- | :--- | :--- | :--- |
| `branch` | string | `all` | `'پسرانه'`, `'دخترانه'` یا `'all'` |
| `grade` | string | `all` | `'دهم'`, `'یازدهم'`, `'دوازدهم'` یا `'all'` |
| `class` | number | `all` | شماره کلاس (مثلاً `101`, `102`, `201`, `301`) |
| `search` | string | - | جستجو در نام دانش‌آموز یا کدملی |
| `page` | number | `1` | شماره صفحه |
| `limit` | number | `50` | تعداد در صفحه (عدد `0` یا `'all'` برای دریافت همه) |
| `sortBy` | string | `score` | فیلد مرتب‌سازی (`score` یا `rank`) |
| `order` | string | `desc` | جهت مرتب‌سازی (`desc` یا `asc`) |

#### نمونه درخواست‌ها:
1. **کل هنرستان (بدون فیلتر):**
   `GET /api/leaderboard`
2. **فقط شعبه پسرانه:**
   `GET /api/leaderboard?branch=پسرانه`
3. **فقط شعبه دخترانه:**
   `GET /api/leaderboard?branch=دخترانه`
4. **رتبه‌بندی پایه دهم کل مدرسه:**
   `GET /api/leaderboard?grade=دهم`
5. **رتبه‌بندی پایه دهم شعبه دخترانه:**
   `GET /api/leaderboard?branch=دخترانه&grade=دهم`
6. **رتبه‌بندی کلاس ۱۰۱ در شعبه پسرانه:**
   `GET /api/leaderboard?branch=پسرانه&grade=دهم&class=101`

#### نمونه پاسخ کامل (JSON Response):
```json
{
  "success": true,
  "filters": {
    "branch": "پسرانه",
    "grade": "دهم",
    "class": 101,
    "search": null
  },
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  },
  "data": [
    {
      "id": "31f47f2b-8a8b-40fa-8a19-bf39a1fbbd02",
      "rank": 1,
      "fullName": "علی محمدی",
      "image": null,
      "gender": "male",
      "branch": "پسرانه",
      "grade": "دهم",
      "class": 101,
      "fieldOfStudy": "تولید و توسعه پایگاه اینترنتی",
      "score": 180,
      "token": 171,
      "spendableTokens": 171,
      "rawToken": 171,
      "rankInSchool": 7,
      "rankInBranch": 4,
      "rankInGrade": 3,
      "rankInClass": 1,
      "approvedActivitiesCount": 2,
      "breakdown": {
        "educational": 92.5,
        "voluntary": 0,
        "job": 30,
        "deductions": 0
      }
    }
  ]
}
```

---

### ۵.۲. آمار و متادیتای ساختاری لیدربورد (Leaderboard Summary & Meta)
این وب‌سرویس لیست شعب، پایه‌ها و کلاس‌های موجود به همراه نفرات برتر هر بخش را برای ساخت تب‌ها و فیلترهای گرافیکی برمی‌گرداند.

- **مسیر:** `GET /api/leaderboard/summary` یا `GET /api/leaderboard/meta`
- **سطح دسترسی:** عمومی

#### نمونه پاسخ (JSON Response):
```json
{
  "success": true,
  "totalStudents": 12,
  "structure": {
    "branches": ["پسرانه", "دخترانه"],
    "grades": ["دهم", "یازدهم", "دوازدهم"],
    "classesByGrade": {
      "دهم": [101, 102],
      "یازدهم": [201, 202],
      "دوازدهم": [301, 302]
    }
  },
  "topPerformers": {
    "overall": [
      {
        "id": "uuid-1",
        "rank": 1,
        "fullName": "پویا صادقی",
        "branch": "پسرانه",
        "grade": "دوازدهم",
        "class": 301,
        "score": 340,
        "spendableTokens": 323
      }
    ],
    "boys": [
      {
        "id": "uuid-1",
        "rank": 1,
        "fullName": "پویا صادقی",
        "branch": "پسرانه",
        "grade": "دوازدهم",
        "class": 301,
        "score": 340,
        "spendableTokens": 323
      }
    ],
    "girls": [
      {
        "id": "uuid-2",
        "rank": 1,
        "fullName": "فاطمه ابراهیمی",
        "branch": "دخترانه",
        "grade": "دوازدهم",
        "class": 301,
        "score": 310,
        "spendableTokens": 294
      }
    ],
    "byGrade": {
      "دهم": [...],
      "یازدهم": [...],
      "دوازدهم": [...]
    }
  }
}
```

---

## ۶. گردش کار نقش دانش‌آموز (Student Workflows)

### ۶.۱. دریافت کاتالوگ فعالیت‌های مجاز
- **مسیر:** `GET /api/activity`
- **سطح دسترسی:** عمومی / لاگین
- **پاسخ:** آرایه‌ای از دسته‌های `فعالیت‌های آموزشی`, `فعالیت‌های شغلی`, `فعالیت‌های داوطلبانه و توسعه فردی`, `موارد کسر امتیاز` به همراه ضریب و ورودی مورد نیاز.

### ۶.۲. ثبت درخواست فعالیت توسط دانش‌آموز
- **مسیر:** `POST /api/student-activity`
- **سطح دسترسی:** فقط دانش‌آموز (`Bearer Token`)
- **بدنه درخواست:**
```json
{
  "activityId": "48c26fbb-4ec5-4ee4-a82a-e15264b38bf2",
  "details": "کسب رتبه دوم در مسابقات برنامه‌نویسی وب استانی",
  "scoreAwarded": 40
}
```
- **وضعیت ثبت اولیه:** وضعیت درخواست به صورت خودکار `pending` قرار گرفته و یک نوتیفیکیشن برای تمام مدیران ارسال می‌شود.

### ۶.۳. پیگیری و مشاهده سوابق فعالیت‌های دانش‌آموز
- **مسیر:** `GET /api/my-activities/my-list`
- **پارامترهای Query:**
  - `status`: `'pending'`, `'approved'`, `'rejected'`
  - `page`: شماره صفحه
  - `limit`: تعداد آیتم در صفحه
- **پاسخ:** تاریخچه کامل فعالیت‌ها به تفکیک تایید شده، در انتظار بررسی و ثبت‌شده توسط مدرسه.

### ۶.۴. دریافت آمار وضعیت فعالیت‌های دانش‌آموز
- **مسیر:** `GET /api/my-activities/my-stats`
- **پاسخ:**
```json
{
  "success": true,
  "data": {
    "pendingStudentActivities": 1,
    "approvedStudentActivities": 4,
    "totalStudentSubmitted": 5,
    "totalAdminAssigned": 2,
    "totalAllActivities": 7
  }
}
```

### ۶.۵. کاتالوگ و ثبت سفارش پاداش (Rewards)
1. **مشاهده جوایز موجود:**
   - **مسیر:** `GET /api/reward`
2. **ثبت درخواست دریافت پاداش:**
   - **مسیر:** `POST /api/student-reward`
   - **بدنه درخواست:** `{ "rewardId": "uuid-of-reward" }`
3. **مشاهده سوابق جوایز دانش‌آموز:**
   - **مسیر:** `GET /api/student-reward/my-rewards`

---

## ۷. گردش کار نقش مدیر / ناظر (Admin Workflows)

### ۷.۱. مشاهده لیست درخواست‌های فعالیت ارسالی
- **مسیر:** `GET /api/admin-review/student-activities-list`
- **پارامترهای اختیاری:** `?status=pending&page=1&limit=20`
- **سطح دسترسی:** ادمین (`role: admin` یا `superAdmin`)
- **پاسخ نمونه:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sa-uuid-123",
      "details": "معدل کارنامه ترم اول: ۱۹.۵",
      "status": "pending",
      "scoreAwarded": 97.5,
      "student": {
        "id": "st-uuid-456",
        "fullName": "علی محمدی",
        "branch": "پسرانه",
        "grade": "دهم",
        "class": 101
      },
      "activity": {
        "id": "act-uuid-789",
        "name": "معدل نوبت اول",
        "parent": "فعالیت‌های آموزشی"
      }
    }
  ]
}
```

### ۷.۲. تایید فعالیت دانش‌آموز (Approve)
با تایید مدیر، امتیاز محاسبه شده، رتبه‌های دانش‌آموز در سطح مدرسه، پایه، شعبه و کلاس به صورت آنی و خودکار مجدداً محاسبه و به‌روزرسانی می‌شود.

- **مسیر:** `PATCH /api/admin-review/student-activities/:studentActivityId/approve`
- **سطح دسترسی:** ادمین
- **بدنه درخواست:**
```json
{
  "scoreAwarded": 97.5,
  "adminComment": "کارنامه بررسی شد و نمره دقیقاً مطابق مدرک ثبت گردید."
}
```

### ۷.۳. رد فعالیت دانش‌آموز (Reject)
- **مسیر:** `PATCH /api/admin-review/student-activities/:studentActivityId/reject`
- **سطح دسترسی:** ادمین
- **بدنه درخواست:**
```json
{
  "rejectReason": "مدرک ارسالی ناخوانا است. لطفاً فایل باکیفیت‌تری بارگذاری نمایید."
}
```

### ۷.۴. بررسی و تایید تحویل پاداش‌ها (Reward Management)
1. **لیست کل درخواست‌های پاداش:**
   - **مسیر:** `GET /api/student-reward/rewards-list`
2. **تغییر وضعیت پاداش (تحویل داده شد / تایید شد / رد شد):**
   - **مسیر:** `PATCH /api/student-reward/:id` یا `PATCH /api/student-reward/status/:id`
   - **بدنه درخواست:**
   ```json
   {
     "status": "delivered"
   }
   ```
   > مقادیر مجاز برای وضعیت: `"pending"`, `"approved"`, `"delivered"`, `"rejected"`

### ۷.۵. ثبت مستقیم فعالیت یا کسر امتیاز توسط مدیر (Admin Direct Activity)
- **مسیر:** `POST /api/admin-activity`
- **سطح دسترسی:** ادمین
- **بدنه درخواست:**
```json
{
  "userId": "student-uuid",
  "activityId": "activity-uuid",
  "scoreAwarded": 20,
  "details": "کسب مقام اول در مسابقات اذان هنرستان"
}
```

---

## ۸. فرمت خطاهای استاندارد (Error Handling)

تمامی خطاهای ارسالی دارای ساختار زیر می‌باشند:

```json
{
  "status": "fail",
  "message": "کد ملی یا رمز عبور اشتباه است"
}
```

### کدهای وضعیت مرسوم:
- `200 OK`: درخواست موفق.
- `201 Created`: رکورد جدید (فعالیت، پاداش، کاربر) با موفقیت ایجاد شد.
- `400 Bad Request`: ورودی نامعتبر یا ناقص بودن پارامترهای ضروری.
- `401 Unauthorized`: نیاز به لاگین و ارسال توکن معتبر.
- `403 Forbidden`: کاربر لاگین شده به این منبع یا متد دسترسی ندارد (عدم دسترسی نقش).
- `404 Not Found`: شناسه کاربر، فعالیت یا پاداش پیدا نشد.
- `500 Internal Server Error`: خطای داخلی سرور.

---

## ۹. نمونه کد اتصال با JavaScript / Fetch

```javascript
// ۱. ورود به سامانه و دریافت توکن
async function login(idCode, password) {
  const response = await fetch('https://ka-backend-nu.vercel.app/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idCode, password })
  });
  const data = await response.json();
  return data.data.token;
}

// ۲. دریافت لیدربورد شعبه دخترانه پایه دهم
async function getGirlsGrade10Leaderboard() {
  const url = 'https://ka-backend-nu.vercel.app/api/leaderboard?branch=دخترانه&grade=دهم';
  const response = await fetch(url);
  const result = await response.json();
  console.log('دانش‌آموزان برتر دهم دخترانه:', result.data);
  return result.data;
}

// ۳. ثبت فعالیت جدید توسط دانش‌آموز
async function submitStudentActivity(token, activityId, details, score) {
  const response = await fetch('https://ka-backend-nu.vercel.app/api/student-activity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      activityId,
      details,
      scoreAwarded: score
    })
  });
  return await response.json();
}
```
