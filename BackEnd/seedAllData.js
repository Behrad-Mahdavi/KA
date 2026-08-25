import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import { __dirname } from './app.js';
import User from './Models/UserMd.js';
import Activity from './Models/ActivityMd.js';
import Reward from './Models/RewardMd.js';
import StudentActivity from './Models/StudentActivityMd.js';
import StudentReward from './Models/StudentRewardMd.js';
import Notification from './Models/NotificationMd.js';
import updateStudentRankings from './Utils/updateRanks.js';

dotenv.configDotenv({ path: __dirname + '/config.env' });

const seedAll = async () => {
  try {
    await mongoose.connect(process.env.DATA_BASE);
    console.log('Connected to MongoDB.');

    // 1. پاکسازی داده‌های قبلی
    await User.deleteMany({});
    await Activity.deleteMany({});
    await Reward.deleteMany({});
    await StudentActivity.deleteMany({});
    await StudentReward.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing database data.');

    // 2. درج فعالیت‌ها (Activities)
    const activitiesData = [
      // فعالیت‌های آموزشی
      {
        parent: 'فعالیت‌های آموزشی',
        name: 'معدل نوبت اول',
        order: 1,
        description: 'معدل کل کارنامه نوبت اول × ۵',
        valueInput: { type: 'number', label: 'معدل کل نوبت اول (۰-۲۰)', required: true, numberMin: 0, numberMax: 20 },
        scoreDefinition: { inputType: 'calculated_from_value', multiplier: 5, min: 0, max: 100 }
      },
      {
        parent: 'فعالیت‌های آموزشی',
        name: 'معدل نوبت دوم',
        order: 2,
        description: 'معدل کل کارنامه نوبت دوم × ۱۰',
        valueInput: { type: 'number', label: 'معدل کل نوبت دوم (۰-۲۰)', required: true, numberMin: 0, numberMax: 20 },
        scoreDefinition: { inputType: 'calculated_from_value', multiplier: 10, min: 0, max: 200 }
      },
      {
        parent: 'فعالیت‌های آموزشی',
        name: 'سطح مهارت ۱',
        order: 3,
        description: 'نمره کسب‌شده در آزمون تعیین سطح مهارتی مقدماتی',
        valueInput: { type: 'number', label: 'نمره چالش مهارتی ۱', required: true, numberMin: 0, numberMax: 100 },
        scoreDefinition: { inputType: 'calculated_from_value', multiplier: 1, min: 0, max: 100 }
      },
      {
        parent: 'فعالیت‌های آموزشی',
        name: 'رتبه برتر المپیاد و مسابقات علمی',
        order: 4,
        description: 'کسب رتبه اول تا سوم در مسابقات علمی منطقه‌ای و استانی',
        valueInput: { type: 'select', label: 'سطح مسابقه', required: true },
        scoreDefinition: {
          inputType: 'select_from_enum',
          enumOptions: [
            { label: 'رتبه اول استانی', value: 80 },
            { label: 'رتبه دوم استانی', value: 60 },
            { label: 'رتبه سوم استانی', value: 40 },
            { label: 'رتبه منطقه‌ای', value: 25 }
          ]
        }
      },
      // فعالیت‌های شغلی
      {
        parent: 'فعالیت‌های شغلی',
        name: 'کارآموزی و کارورزی در شرکت‌ها',
        order: 1,
        description: 'گذراندن دوره کارآموزی تابستانه یا حین تحصیل در شرکت‌های معتبر',
        valueInput: { type: 'select', label: 'سطح شرکت کارآموزی', required: true },
        scoreDefinition: {
          inputType: 'select_from_enum',
          enumOptions: [
            { label: 'شرکت سطح A+ (دانش‌بنیان / بین‌المللی)', value: 50 },
            { label: 'شرکت سطح B (تخصصی داخلی)', value: 30 }
          ]
        }
      },
      {
        parent: 'فعالیت‌های شغلی',
        name: 'انجام پروژه واقعی برای کارفرما',
        order: 2,
        description: 'طراحی وب‌سایت یا تولید محتوای چندرسانه‌ای تجاری',
        valueInput: { type: 'number', label: 'ارزش پروژه (ساعت کار مفید)', required: true, numberMin: 1, numberMax: 50 },
        scoreDefinition: { inputType: 'calculated_from_value', multiplier: 2, min: 2, max: 100 }
      },
      // فعالیت‌های داوطلبانه و توسعه فردی
      {
        parent: 'فعالیت‌های داوطلبانه و توسعه فردی',
        name: 'همکاری در رویدادها و برگزاری کارگاه‌ها',
        order: 1,
        description: 'عضویت در کادر اجرایی همایش‌ها یا ارائه سخنرانی و ورکشاپ',
        valueInput: { type: 'select', label: 'نوع مشارکت', required: true },
        scoreDefinition: {
          inputType: 'select_from_enum',
          enumOptions: [
            { label: 'ارائه کارگاه آموزشی', value: 35 },
            { label: 'عضو تیم اجرایی رویداد', value: 20 },
            { label: 'تولید مستندات رویداد', value: 15 }
          ]
        }
      },
      {
        parent: 'فعالیت‌های داوطلبانه و توسعه فردی',
        name: 'کتابخوانی و خلاصه نویسی تخصصی',
        order: 2,
        description: 'مطالعه و ثبت خلاصه کتاب‌های فنی و انگیزشی',
        valueInput: { type: 'select', label: 'تعداد صفحات کتاب', required: true },
        scoreDefinition: {
          inputType: 'select_from_enum',
          enumOptions: [
            { label: 'بیش از ۲۰۰ صفحه', value: 20 },
            { label: 'بین ۱۰۰ تا ۲۰۰ صفحه', value: 10 }
          ]
        }
      },
      // موارد کسر امتیاز
      {
        parent: 'موارد کسر امتیاز',
        name: 'تاخیر غیرموجه در ورود به کلاس',
        order: 1,
        description: 'تاخیر بیش از ۱۵ دقیقه در کلاس‌های صبحگاهی یا کارگاه',
        valueInput: { type: 'select', label: 'مرتبه تاخیر', required: true },
        scoreDefinition: {
          inputType: 'select_from_enum',
          enumOptions: [
            { label: 'تاخیر اول و دوم (تذکر)', value: -5 },
            { label: 'تاخیر سوم به بعد', value: -15 }
          ]
        }
      },
      {
        parent: 'موارد کسر امتیاز',
        name: 'عدم تحویل به موقع پروژه کارگاهی',
        order: 2,
        description: 'تاخیر در ددلاین تعیین‌شده برای پروژه‌های عملی',
        valueInput: { type: 'select', label: 'مدت تاخیر', required: true },
        scoreDefinition: {
          inputType: 'select_from_enum',
          enumOptions: [
            { label: 'تا یک هفته تاخیر', value: -10 },
            { label: 'بیش از یک هفته تاخیر', value: -25 }
          ]
        }
      }
    ];

    const insertedActivities = await Activity.insertMany(activitiesData);
    console.log(`Inserted ${insertedActivities.length} activities.`);

    // 3. درج جوایز (Rewards)
    const rewardsData = [
      {
        parent: 'پاداش‌های عمومی',
        name: 'فلش مموری ۶۴ گیگابایت USB 3.2',
        description: 'فلش پرسرعت سن‌دیسک مناسب پروژه‌ها و ذخیره‌سازی داده‌های کلاسی',
        minToken: 80,
        maxToken: 80,
        icon: 'flash-drive',
        color: '#3B82F6',
        hide: 'false'
      },
      {
        parent: 'پاداش‌های عمومی',
        name: 'ماگ حرارتی اختصاصی هنرستان',
        description: 'ماگ سرامیکی حرارتی با چاپ اختصاصی نام و عنوان رتبه دانش‌آموز',
        minToken: 40,
        maxToken: 40,
        icon: 'cup',
        color: '#10B981',
        hide: 'false'
      },
      {
        parent: 'پاداش‌های عمومی',
        name: 'بن خرید کتاب تخصصی و عمومی (۳۰۰ هزار تومان)',
        description: 'کارت هدیه خرید کتاب از شهرکتاب و فیدیبو',
        minToken: 60,
        maxToken: 60,
        icon: 'book',
        color: '#F59E0B',
        hide: 'false'
      },
      {
        parent: 'پاداش‌های اختصاصی',
        name: 'هدفون بی‌سیم بلوتوثی هایلو',
        description: 'هدفون ارگونومیک با نویزکنسلینگ مناسب کدنویسی و جلسات آنلاین',
        minToken: 150,
        maxToken: 150,
        icon: 'headphones',
        color: '#8B5CF6',
        hide: 'false'
      },
      {
        parent: 'پاداش‌های اختصاصی',
        name: 'دوره پیشرفته React و Node.js (کامل)',
        description: 'اکانت دسترسی رایگان به دوره‌های پریمیوم برنامه‌نویسی',
        minToken: 120,
        maxToken: 120,
        icon: 'code',
        color: '#EC4899',
        hide: 'false'
      },
      {
        parent: 'پاداش‌های اختصاصی',
        name: 'یک روز تفریحی اختصاصی (کارتینگ / پینت‌بال)',
        description: 'بلیط ورود به همراه تیم منتخبان مدرسه',
        minToken: 90,
        maxToken: 90,
        icon: 'ticket',
        color: '#06B6D4',
        hide: 'false'
      },
      {
        parent: 'پاداش نیکوکارانه',
        name: 'کمک به تجهیز کتابخانه و کارگاه هنرستان',
        description: 'اهدای توکن‌ها جهت خرید قطعات الکترونیک و کتاب برای دوستان',
        minToken: 20,
        maxToken: 100,
        icon: 'heart',
        color: '#EF4444',
        hide: 'false'
      }
    ];

    const insertedRewards = await Reward.insertMany(rewardsData);
    console.log(`Inserted ${insertedRewards.length} rewards.`);

    // 4. درج کاربران (Users)
    const superAdminUser = {
      fullName: 'مهندس حسینی (مدیر کل)',
      idCode: '0000000000',
      role: 'superAdmin',
      password: bcryptjs.hashSync('sa0000000000', 10)
    };

    const adminUsers = [
      {
        fullName: 'استاد رضایی (معاونت آموزشی)',
        idCode: '1111111111',
        role: 'admin',
        password: bcryptjs.hashSync('a1111111111', 10)
      },
      {
        fullName: 'استاد کاظمی (مدیر کارگاه وب)',
        idCode: '1111111112',
        role: 'admin',
        password: bcryptjs.hashSync('a1111111112', 10)
      }
    ];

    const studentsData = [
      {
        fullName: 'علی محمدی',
        idCode: '2222222222',
        role: 'student',
        grade: 'دهم',
        class: 101,
        fieldOfStudy: 'تولید و توسعه پایگاه اینترنتی',
        password: bcryptjs.hashSync('s2222222222', 10),
        score: 180,
        token: Math.floor(180 * 0.95)
      },
      {
        fullName: 'سارا احمدی',
        idCode: '2222222223',
        role: 'student',
        grade: 'دهم',
        class: 101,
        fieldOfStudy: 'تولید و توسعه پایگاه اینترنتی',
        password: bcryptjs.hashSync('s2222222223', 10),
        score: 220,
        token: Math.floor(220 * 0.95)
      },
      {
        fullName: 'امیرحسین رضایی',
        idCode: '2222222224',
        role: 'student',
        grade: 'دهم',
        class: 102,
        fieldOfStudy: 'تولیدکننده چندرسانه‌ای',
        password: bcryptjs.hashSync('s2222222224', 10),
        score: 140,
        token: Math.floor(140 * 0.95)
      },
      {
        fullName: 'نرگس کریمی',
        idCode: '2222222225',
        role: 'student',
        grade: 'یازدهم',
        class: 201,
        fieldOfStudy: 'تولید و توسعه پایگاه اینترنتی',
        password: bcryptjs.hashSync('s2222222225', 10),
        score: 290,
        token: Math.floor(290 * 0.95)
      },
      {
        fullName: 'محمد موسوی',
        idCode: '2222222226',
        role: 'student',
        grade: 'یازدهم',
        class: 201,
        fieldOfStudy: 'تولید و توسعه پایگاه اینترنتی',
        password: bcryptjs.hashSync('s2222222226', 10),
        score: 195,
        token: Math.floor(195 * 0.95)
      },
      {
        fullName: 'مهدی تقوی',
        idCode: '2222222227',
        role: 'student',
        grade: 'یازدهم',
        class: 202,
        fieldOfStudy: 'تولیدکننده چندرسانه‌ای',
        password: bcryptjs.hashSync('s2222222227', 10),
        score: 160,
        token: Math.floor(160 * 0.95)
      },
      {
        fullName: 'پویا صادقی',
        idCode: '2222222228',
        role: 'student',
        grade: 'دوازدهم',
        class: 301,
        fieldOfStudy: 'تولید و توسعه پایگاه اینترنتی',
        password: bcryptjs.hashSync('s2222222228', 10),
        score: 340,
        token: Math.floor(340 * 0.95)
      },
      {
        fullName: 'فاطمه ابراهیمی',
        idCode: '2222222229',
        role: 'student',
        grade: 'دوازدهم',
        class: 301,
        fieldOfStudy: 'تولید و توسعه پایگاه اینترنتی',
        password: bcryptjs.hashSync('s2222222229', 10),
        score: 310,
        token: Math.floor(310 * 0.95)
      },
      {
        fullName: 'کیان نوری',
        idCode: '2222222230',
        role: 'student',
        grade: 'دوازدهم',
        class: 302,
        fieldOfStudy: 'تولیدکننده چندرسانه‌ای',
        password: bcryptjs.hashSync('s2222222230', 10),
        score: 210,
        token: Math.floor(210 * 0.95)
      }
    ];

    const allUsersToInsert = [superAdminUser, ...adminUsers, ...studentsData];
    const insertedUsers = await User.insertMany(allUsersToInsert);
    console.log(`Inserted ${insertedUsers.length} users.`);

    const students = insertedUsers.filter(u => u.role === 'student');
    const studentAli = students.find(s => s.idCode === '2222222222');
    const studentSara = students.find(s => s.idCode === '2222222223');
    const studentNarges = students.find(s => s.idCode === '2222222225');
    const studentPouya = students.find(s => s.idCode === '2222222228');

    // 5. درج فعالیت‌های ارسالی دانش‌آموزان (StudentActivity)
    const actMoadel1 = insertedActivities.find(a => a.name === 'معدل نوبت اول');
    const actKarAmoozi = insertedActivities.find(a => a.name === 'کارآموزی و کارورزی در شرکت‌ها');
    const actKargah = insertedActivities.find(a => a.name === 'همکاری در رویدادها و برگزاری کارگاه‌ها');
    const actProject = insertedActivities.find(a => a.name === 'انجام پروژه واقعی برای کارفرما');

    const sampleStudentActivities = [
      {
        userId: studentAli._id,
        activityId: actMoadel1._id,
        details: 'معدل نوبت اول: ۱۸.۵',
        status: 'approved',
        scoreAwarded: 92.5,
        adminComment: 'کارنامه بررسی و تایید شد.'
      },
      {
        userId: studentAli._id,
        activityId: actKarAmoozi._id,
        details: 'شرکت فناوری داده‌پردازان عصر نوین (سطح B+)',
        status: 'approved',
        scoreAwarded: 30,
        adminComment: 'گواهی پایان دوره دریافت شد.'
      },
      {
        userId: studentAli._id,
        activityId: actKargah._id,
        details: 'ارائه کارگاه آموزشی TailwindCSS برای پایه‌های دهم',
        status: 'pending',
        scoreAwarded: 0,
        adminComment: ''
      },
      {
        userId: studentSara._id,
        activityId: actMoadel1._id,
        details: 'معدل نوبت اول: ۱۹.۷۵',
        status: 'approved',
        scoreAwarded: 98.75,
        adminComment: 'معدل عالی.'
      },
      {
        userId: studentSara._id,
        activityId: actProject._id,
        details: 'طراحی سایت شرکتی با React و اتصال به درگاه پرداخت',
        status: 'approved',
        scoreAwarded: 80,
        adminComment: 'پروژه تست شد و کارفرما رضایت داشت.'
      },
      {
        userId: studentNarges._id,
        activityId: actKarAmoozi._id,
        details: 'کارآموزی شرکت اسنپ در بخش فرانت‌اند (سطح A+)',
        status: 'approved',
        scoreAwarded: 50,
        adminComment: 'تایید با امتیاز کامل.'
      },
      {
        userId: studentNarges._id,
        activityId: actProject._id,
        details: 'پروژه اپلیکیشن فروشگاهی موبایل',
        status: 'pending',
        scoreAwarded: 0,
        adminComment: ''
      },
      {
        userId: studentPouya._id,
        activityId: actProject._id,
        details: 'توسعه بک‌اند سامانه نوبت‌دهی آنلاین',
        status: 'approved',
        scoreAwarded: 100,
        adminComment: 'کیفیت کدنویسی عالی.'
      }
    ];

    const insertedStudentActivities = await StudentActivity.insertMany(sampleStudentActivities);
    console.log(`Inserted ${insertedStudentActivities.length} student activity records.`);

    // ارجاع فعالیت‌ها در داکیومنت User
    for (const sa of insertedStudentActivities) {
      await User.findByIdAndUpdate(sa.userId, {
        $push: { activities: sa._id }
      });
    }

    // 6. درج درخواست‌های پاداش (StudentReward)
    const rewardFlash = insertedRewards.find(r => r.name.includes('فلش'));
    const rewardMug = insertedRewards.find(r => r.name.includes('ماگ'));
    const rewardBook = insertedRewards.find(r => r.name.includes('کتاب'));

    const sampleStudentRewards = [
      {
        userId: studentAli._id,
        rewardId: rewardMug._id,
        token: 40,
        status: 'approved'
      },
      {
        userId: studentSara._id,
        rewardId: rewardFlash._id,
        token: 80,
        status: 'approved'
      },
      {
        userId: studentSara._id,
        rewardId: rewardBook._id,
        token: 60,
        status: 'pending'
      },
      {
        userId: studentPouya._id,
        rewardId: rewardFlash._id,
        token: 80,
        status: 'pending'
      }
    ];

    const insertedStudentRewards = await StudentReward.insertMany(sampleStudentRewards);
    console.log(`Inserted ${insertedStudentRewards.length} student reward requests.`);

    for (const sr of insertedStudentRewards) {
      await User.findByIdAndUpdate(sr.userId, {
        $push: { rewards: sr._id }
      });
    }

    // 7. درج اعلان‌ها (Notifications)
    const adminUser1 = insertedUsers.find(u => u.idCode === '1111111111');
    const sampleNotifications = [
      {
        userId: studentAli._id,
        title: 'تایید فعالیت',
        message: 'فعالیت کارآموزی شما با موفقیت تایید شد و ۳۰ امتیاز به شما تعلق گرفت.',
        type: 'activity_status',
        relatedLink: '/activities',
        isRead: false
      },
      {
        userId: studentAli._id,
        title: 'پاداش تحویل شد',
        message: 'ماگ اختصاصی شما آماده تحویل در دفتر مدیریت است.',
        type: 'reward_status',
        relatedLink: '/rewards',
        isRead: true
      },
      {
        userId: studentSara._id,
        title: 'کسب رتبه ۱ پایه دهم',
        message: 'تبریک! شما در رتبه‌بندی آزمایشی پایه دهم در جایگاه اول قرار گرفتید.',
        type: 'achievement',
        relatedLink: '/results',
        isRead: false
      },
      {
        userId: adminUser1._id,
        title: 'درخواست جدید فعالیت',
        message: 'دانش‌آموز علی محمدی یک فعالیت جدید جهت بررسی ثبت کرد.',
        type: 'new_activity_submission',
        relatedLink: '/requests',
        isRead: false
      }
    ];

    await Notification.insertMany(sampleNotifications);
    console.log('Inserted sample notifications.');

    // 8. به‌روزرسانی رتبه‌بندی‌ها (Rank Calculation)
    await updateStudentRankings();
    console.log('Updated student rankings successfully!');

    console.log('All seed data inserted and prepared successfully!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected.');
  }
};

seedAll();
