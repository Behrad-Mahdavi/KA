// myActivitiesRouter.js (مثال)
import express from 'express';
import isLogin from '../Middlewares/isLogin.js';
import { getMyActivitiesList, getMyActivityStats } from '../Controllers/StudentActivityCn.js';

const myActivitiesRouter = express.Router();

// اندپوینت برای آمار کارت ها
myActivitiesRouter.get('/my-stats', isLogin, getMyActivityStats);
myActivitiesRouter.get('/stats', isLogin, getMyActivityStats);

// اندپوینت برای لیست فعالیت ها با فیلتر و صفحه بندی
myActivitiesRouter.get('/my-list', isLogin, getMyActivitiesList);
myActivitiesRouter.get('/list', isLogin, getMyActivitiesList);
myActivitiesRouter.get('/', isLogin, getMyActivitiesList);

export default myActivitiesRouter