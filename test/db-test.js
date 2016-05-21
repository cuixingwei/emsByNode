/**
 * Created by Administrator on 15-7-20.
 */
var db = require('../utils/database');

var sqlData = [{
    statement: "select * from ambulance ",
    params: []
}
];

db.select(sqlData, function (error, results) {
    if (error) {
        res.json({
            msg: "查询失败"
        })
    } else {
        console.log(results);
    }
});