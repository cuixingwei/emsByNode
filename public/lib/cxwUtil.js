/* 本月第一天 */
function firstOfMouth() {
    var curr_time = new Date();
    var y = curr_time.getFullYear();
    var m = curr_time.getMonth() + 1;
    return y + '-' + (m < 10 ? ('0' + m) : m) + "-01 " + "08:00:00";
}
/* 当前日期 */
function getCurrentTime() {
    var curr_time = new Date();
    var y = curr_time.getFullYear();
    var m = curr_time.getMonth() + 1;
    var d = curr_time.getDate();
    var hh = curr_time.getHours();
    var mm = curr_time.getMinutes();
    var ss = curr_time.getSeconds();
    return y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d)
        + ' ' + (hh < 10 ? ('0' + hh) : hh) + ':'
        + (mm < 10 ? ('0' + mm) : mm) + ':' + (ss < 10 ? ('0' + ss) : ss);
}

/**
 * 获取当前日期前后AddDayCount天
 * @param AddDayCount
 * @returns {string}
 * @constructor
 */
function GetDateStr(AddDayCount) {
    var dd = new Date();
    dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;//获取当前月份的日期
    var d = dd.getDate();
    return y + "-" + m + "-" + d + " 08:00:00";
}

/**
 * 获取当前日期前后AddMonthCount月
 * @param AddMonthCount
 * @returns {string}
 * @constructor
 */
function GetDateMonthStr(AddMonthCount) {
    var dd = new Date();
    var months = dd.getMonth() + AddMonthCount;
    var y;
    var m;//获取当前月份的日期
    if (months > 11) {
        y = dd.getFullYear() + 1;
        m = months % 11;
    } else if (months < 0) {
        y = dd.getFullYear() - 1;
        m = (11 + months) + 1;
    } else {
        y = dd.getFullYear();
        m = months + 1;
    }
    return y + "-" + (m < 10 ? ('0' + m) : m) + "-01" + " 08:00:00";
}