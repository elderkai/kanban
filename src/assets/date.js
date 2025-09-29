//日期工具类
//局部导入dayjs
import dayjs from 'dayjs';

/**
 * 校检日期格式是否为YYYY-MM-DD这种格式
 * @param date
 * @returns {boolean}
 */
export function isValidDate(date: any) {
    return dayjs(date, 'YYYY-MM-DD', true).isValid();
}

/**
 * 校检日期格式是否为YYYY-MM-DD HH:mm:ss这种格式
 * @param date
 * @returns {boolean}
 */
export function isValidDateTime(date: any) {
    return dayjs(date, 'YYYY-MM-DD HH:mm:ss', true).isValid();
}

/**
 * 获取当前日期年月日,时间格式为YYYY-MM-DD
 * @returns {string}
 */
export function getCurrentDate() {
    return dayjs(new Date()).format('YYYY-MM-DD');
}

/**
 * 获取当前日期年月日时分秒,时间格式为YYYY-MM-DD HH:mm:ss(24小时制,如果hh为小写表示为12小时制)
 * @returns {string}
 */
export function getCurrentDateTime() {
    return dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 将传过来的日期转换为YYYY-MM-DD这种格式
 * @param date:为传过来的日期
 * @returns {string}
 */
export function getConvertDate(date: any) {
    return dayjs(date).format('YYYY-MM-DD');
}

/**
 * 将传过来的日期转换为YYYY-MM-DD HH:mm:ss这种格式
 * @param date:为传过来的日期
 * @returns {string}
 */
export function getConvertDateTime(date: any) {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 将传过来的日期加X日期且时间格式为YYYY-MM-DD这种格式,如:getXAfterDate('2023-11-11',1,'day'),结果为2023-11-12
 * @param date:为传过来的日期
 * @param num:在当前日期加num,类型为int
 * @param dateType:为要加的日期类型,有如下类型:'minute','hour','day','week','month','year'这六种类型
 * @returns {string}
 */
export function getXAfterDate(date: any, num: any, dateType: any) {
    return dayjs(date).add(num, dateType).format('YYYY-MM-DD');
}

/**
 * 将传过来的日期加X日期且时间格式为YYYY-MM-DD HH:mm:ss这种格式,如:getXAfterDateTime('2023-11-11 10:23:45',1,'day'),结果为2023-11-12 10:23:45
 * @param date:为传过来的日期
 * @param num:在当前日期加num,类型为int
 * @param dateType:为要加的日期类型,有如下类型:'minute','hour','day','week','month','year'这六种类型
 * @returns {string}
 */
export function getXAfterDateTime(date: any, num: any, dateType: any) {
    return dayjs(date).add(num, dateType).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 将传过来的日期减去X日期且时间格式为YYYY-MM-DD这种格式,如:getXBeforeDate('2023-11-11',1,'day'),结果为2023-11-10
 * @param date:为传过来的日期
 * @param num:在当前日期加num,类型为int
 * @param dateType:为要加的日期类型,有如下类型:'minute','hour','day','week','month','year'这六种类型
 * @returns {string}
 */
export function getXBeforeDate(date: any, num: any, dateType: any) {
    return dayjs(date).subtract(num, dateType).format('YYYY-MM-DD');
}

/**
 * 将传过来的日期减去X日期且时间格式为YYYY-MM-DD HH:mm:ss这种格式,如:getXBeforeDateTime('2023-11-11 10:23:45',1,'day'),结果为2023-11-10 10:23:45
 * @param date:为传过来的日期
 * @param num:在当前日期加day,类型为int
 * @param dateType:为要加的日期类型,有如下类型:'minute','hour','day','week','month','year'这六种类型
 * @returns {string}
 */
export function getXBeforeDateTime(date: any, num: any, dateType: any) {
    return dayjs(date).subtract(num, dateType).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 计算2个日期之间的差值
 * @param startDate:开始日期
 * @param endDate:结束日期,结束日期要比开始日期大
 * @param dateType:日期类型,有如下类型:'minute','hour','day','week','month','year'这六种类型
 * @returns {number}