/**
 * Created by Dell on 2016/3/25.
 */

var db = require('../utils/msdb');
var fs = require("fs");

var sqlData = {
    statement: "select 工号,姓名,密码,部门名称 from AuSp120.tb_MrUser where 工号=@userId",
    params: [{"name":"userId","value":"99"}]
};


db.select(sqlData, function (error, results) {
    if (error) {
       console.log('查询失败');
    } else {
        console.log(results[0]);
        for(var i=0;i<results.length;i++){
            console.log(results[i][0].value+'\n');
        }
    }
});
