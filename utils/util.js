/**
 * Created by Dell on 2015/11/21.
 */
/**
 * 把秒格式化成几时几分几秒
 * @param second
 * @returns {string}
 */
exports.formatSecond = function (second) {
    var ss = '0秒';
    if (!isNaN(second)) {
        var hours = Math.floor(second / (60 * 60));
        var minutes = Math.floor(second / 60) - hours * 60;
        var seconds = second - minutes * 60 - hours * 60 * 60;
        if (hours > 0) {
            ss = hours + '时' + minutes + '分' + seconds + '秒';
        } else if (minutes > 0) {
            ss = minutes + '分' + seconds + '秒';
        } else {
            ss = seconds + '秒';
        }
    }
    return ss;
};
/**
 * 计算百分比
 * @param total
 * @param portion
 * @returns {string}
 */
exports.calculateRate = function (total, portion) {
    portion = parseFloat(portion);
    total = parseFloat(total);
    if (isNaN(portion) || isNaN(total)) {
        return "-";
    }
    return total <= 0 ? "0%" : (Math.round(portion / total * 10000) / 100.00 + "%");// 小数点后两位百分比
};
