/**
 * Created by Dell on 2015/10/17.
 */

/**
 * 判断字符串是否为空
 * @param data
 */
exports.isBlankOrEmpty = function (data) {
    if (data == '' || data == undefined || data == null || data == 'undefined') {
        return true;
    } else {
        return false;
    }
}
/**
 * 判断两个字符串是否相等
 * @param str1
 * @param str2
 * @returns {boolean}
 */
exports.isEquals = function equals(str1, str2) {
    if (str1 == str2) {
        return true;
    }
    return false;
}